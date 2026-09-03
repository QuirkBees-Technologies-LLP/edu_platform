import React, { useState, useCallback, useEffect, useLayoutEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useCallStateHooks, useCall } from '@stream-io/video-react-sdk';
import { useGetLanguageQuery } from '../store/api/client/clientLanguageApiSlice';

// GetStream supported translation codes (source of truth from API docs)
const GETSTREAM_SUPPORTED_CODES = new Set([
  'en', 'fr', 'es', 'de', 'it', 'nl', 'pt', 'pl', 'ca', 'cs',
  'da', 'el', 'fi', 'id', 'ja', 'ru', 'sv', 'ta', 'th', 'tr',
  'hu', 'ro', 'zh', 'ar', 'tl', 'he', 'hi', 'hr', 'ko', 'ms', 'no', 'uk'
]);

// Map language names (from DB) to GetStream language codes
const LANGUAGE_NAME_TO_CODE = {
  english: 'en', japanese: 'ja', spanish: 'es', polish: 'pl', german: 'de',
  french: 'fr', italian: 'it', dutch: 'nl', portuguese: 'pt', korean: 'ko',
  chinese: 'zh', arabic: 'ar', hindi: 'hi', russian: 'ru', turkish: 'tr',
  swedish: 'sv', danish: 'da', finnish: 'fi', greek: 'el', hungarian: 'hu',
  romanian: 'ro', czech: 'cs', catalan: 'ca', indonesian: 'id', thai: 'th',
  tagalog: 'tl', hebrew: 'he', croatian: 'hr', malay: 'ms', norwegian: 'no',
  ukrainian: 'uk', tamil: 'ta',
  // slovakian/slovak/serbian/armenian/bulgarian/estonian/slovenian
  // are NOT supported by GetStream translation API — omitted intentionally
};

/**
 * All closed-captions data/state logic, shared between the inline toggle
 * control (rendered inside the player's control bar) and the floating
 * caption text overlay (rendered over the video).
 */
export const useLiveCaptions = () => {
  const { useCallClosedCaptions, useIsCallLive } = useCallStateHooks();
  useCallClosedCaptions();
  const isLive = useIsCallLive();
  const [showCaptions, setShowCaptions] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [portalTarget, setPortalTarget] = useState(null);
  const [supportedLanguages, setSupportedLanguages] = useState([{ code: 'en', label: 'English' }]);
  const langMenuRef = useRef(null);
  const langMenuPortalRef = useRef(null);

  // Fetch languages using RTK Query (clientLanguageApiSlice)
  const { data: languageData } = useGetLanguageQuery();
  useEffect(() => {
    if (!languageData?.data) return;
    const langs = [{ code: 'en', label: 'English' }];
    languageData.data.forEach((lang) => {
      const name = lang?.name;
      if (!name) return;
      const code = LANGUAGE_NAME_TO_CODE[name.toLowerCase()];
      if (code && code !== 'en' && GETSTREAM_SUPPORTED_CODES.has(code)) {
        langs.push({ code, label: name });
      }
    });
    setSupportedLanguages(langs);
  }, [languageData]);

  // FIX: React 18 batches rapid state updates, so closedCaptions hook misses
  // intermediate events (e.g. Spanish arrives then gets overwritten by Dutch).
  // Solution: listen to the RAW 'call.closed_caption' event — fires per-event,
  // before React batching — and store each language's latest caption in a ref.
  // Structure: translationStoreRef.current = { en: text, es: text, nl: text, ... }
  const call = useCall();
  const translationStoreRef = useRef({ en: '' });
  const [displayText, setDisplayText] = useState({ en: '' });
  const [captionVisible, setCaptionVisible] = useState(false);
  const hideTimerRef = useRef(null);

  // Caption auto-hide: after 4s of no new caption, fade out
  const resetHideTimer = useCallback(() => {
    setCaptionVisible(true);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => {
      setCaptionVisible(false);
    }, 4000);
  }, []);

  // Cleanup timer on unmount
  useEffect(() => () => { if (hideTimerRef.current) clearTimeout(hideTimerRef.current); }, []);

  useEffect(() => {
    if (!call) return;
    const unsubscribe = call.on('call.closed_caption', (event) => {
      const caption = event?.closed_caption
        || event?.closedCaption
        || (event?.text ? event : null);
      if (!caption?.text) return;
      const lang = caption.language || 'en';
      const isTranslated = caption.translated === true;
      if (!isTranslated && lang === 'en') {
        translationStoreRef.current['en'] = caption.text;
        setDisplayText(prev => ({ ...prev, en: caption.text }));
        resetHideTimer();
      } else if (isTranslated) {
        translationStoreRef.current[lang] = caption.text;
        setDisplayText(prev => ({ ...prev, [lang]: caption.text }));
        resetHideTimer();
      }
    });
    return () => { if (typeof unsubscribe === 'function') unsubscribe(); };
  }, [call, resetHideTimer]);

  // Inject smooth caption CSS animation
  useEffect(() => {
    const styleId = 'cc-caption-animation';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        @keyframes cc-slide-in {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0);   }
        }
        @keyframes cc-fade-out {
          from { opacity: 1; }
          to   { opacity: 0; }
        }
        .cc-caption-box {
          animation: cc-slide-in 0.25s ease forwards;
          transition: opacity 0.4s ease;
        }
        .cc-caption-box.hiding {
          animation: cc-fade-out 0.5s ease forwards;
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  // Get caption text for selected language from accumulated store
  const currentCaptionText = React.useMemo(() => {
    if (selectedLanguage === 'en') {
      return displayText['en'] || '';
    }
    // Return translated if available, else fallback to English
    return displayText[selectedLanguage] || displayText['en'] || '';
  }, [selectedLanguage, displayText]);

  const toggleCaptions = useCallback(() => {
    setShowCaptions((prev) => !prev);
  }, []);

  const handleLanguageSelect = useCallback((langCode) => {
    setSelectedLanguage(langCode);
    setShowLangMenu(false);
  }, []);

  // Close language menu when clicking outside (checks both the trigger button
  // and the portaled dropdown, since the dropdown no longer lives inside langMenuRef's DOM subtree)
  useEffect(() => {
    const handleClickOutside = (e) => {
      const insideTrigger = langMenuRef?.current?.contains(e?.target);
      const insidePortal = langMenuPortalRef?.current?.contains(e?.target);
      if (!insideTrigger && !insidePortal) {
        setShowLangMenu(false);
      }
    };
    if (showLangMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showLangMenu]);

  // Track fullscreen changes (used to portal the floating caption text into the fullscreen element)
  useEffect(() => {
    const onFullscreenChange = () => {
      const fsEl = document?.fullscreenElement || document?.webkitFullscreenElement;
      if (fsEl) {
        fsEl.style.position = 'relative';
        setPortalTarget(fsEl);
      } else {
        setPortalTarget(null);
      }
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    document.addEventListener('webkitfullscreenchange', onFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', onFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', onFullscreenChange);
    };
  }, []);

  const selectedLangLabel =
    supportedLanguages?.find((l) => l?.code === selectedLanguage)?.label || 'English';

  return {
    isLive,
    showCaptions,
    toggleCaptions,
    selectedLanguage,
    selectedLangLabel,
    supportedLanguages,
    showLangMenu,
    setShowLangMenu,
    handleLanguageSelect,
    langMenuRef,
    langMenuPortalRef,
    currentCaptionText,
    captionVisible,
    portalTarget,
  };
};

/**
 * Compact CC toggle + language dropdown, styled to sit as a regular flex
 * item inside the player's control bar (no absolute positioning, so it can
 * never collide with neighboring controls again).
 */
export const CaptionsInlineControl = ({ captions, iconButtonClassName }) => {
  const {
    isLive,
    showCaptions,
    toggleCaptions,
    selectedLangLabel,
    supportedLanguages,
    showLangMenu,
    setShowLangMenu,
    handleLanguageSelect,
    langMenuRef,
    langMenuPortalRef,
    selectedLanguage,
    portalTarget,
  } = captions;

  const langBtnRef = useRef(null);
  const [menuStyle, setMenuStyle] = useState(null);

  // Position the dropdown against the trigger button's real viewport position,
  // since it's portaled out of the player's clipped (overflow:hidden) DOM subtree.
  useLayoutEffect(() => {
    if (!showLangMenu) return;

    const MENU_WIDTH = 150;
    const MENU_MAX_HEIGHT = 220;
    const GAP = 8;
    const EDGE_PADDING = 8;

    const reposition = () => {
      const btn = langBtnRef.current;
      if (!btn) return;
      const rect = btn.getBoundingClientRect();

      const spaceAbove = rect.top;
      const spaceBelow = window.innerHeight - rect.bottom;
      const openUpward = spaceAbove >= spaceBelow;

      const maxHeight = Math.min(MENU_MAX_HEIGHT, (openUpward ? spaceAbove : spaceBelow) - GAP - EDGE_PADDING);

      let left = rect.right - MENU_WIDTH;
      left = Math.max(EDGE_PADDING, Math.min(left, window.innerWidth - MENU_WIDTH - EDGE_PADDING));

      setMenuStyle({
        position: 'fixed',
        left,
        [openUpward ? 'bottom' : 'top']: openUpward
          ? window.innerHeight - rect.top + GAP
          : rect.bottom + GAP,
        width: MENU_WIDTH,
        maxHeight: Math.max(maxHeight, 100),
      });
    };

    reposition();
    window.addEventListener('resize', reposition);
    window.addEventListener('scroll', reposition, true);
    return () => {
      window.removeEventListener('resize', reposition);
      window.removeEventListener('scroll', reposition, true);
    };
  }, [showLangMenu]);

  if (!isLive) return null;

  const menu = showCaptions && showLangMenu && menuStyle && (
    <div
      ref={langMenuPortalRef}
      className="iq-live-lang-menu overflow-y-auto rounded-lg border border-white/15 bg-black/90 backdrop-blur-md py-1 shadow-xl"
      style={{ ...menuStyle, zIndex: 100000 }}
    >
      {supportedLanguages?.map((lang) => (
        <button
          key={lang?.code}
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleLanguageSelect(lang?.code);
          }}
          className={`block w-full text-left px-3.5 py-1.5 text-xs transition-colors ${selectedLanguage === lang?.code
            ? 'bg-white/15 text-white font-semibold'
            : 'text-white/75 hover:bg-white/10'
            }`}
        >
          {selectedLanguage === lang?.code && '✓ '}
          {lang?.label}
        </button>
      ))}
    </div>
  );

  return (
    <div className="relative flex items-center" ref={langMenuRef}>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleCaptions();
        }}
        className={`${iconButtonClassName} ${showCaptions ? 'iq-live-icon-btn--active' : ''
          } text-[10px] font-bold tracking-wide`}
        title={showCaptions ? 'Hide captions' : 'Show captions'}
        aria-label={showCaptions ? 'Hide captions' : 'Show captions'}
      >
        CC
      </button>

      {showCaptions && (
        <button
          ref={langBtnRef}
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setShowLangMenu((prev) => !prev);
          }}
          className="iq-live-lang-btn flex items-center gap-1 h-[26px] px-1.5 rounded-md text-[10px] font-medium text-white/90 hover:bg-white/10 transition-colors"
          title="Change caption language"
        >
          <span className="max-w-[48px] truncate">{selectedLangLabel}</span>
          <svg width="8" height="8" viewBox="0 0 10 6" fill="none">
            <path
              d={showLangMenu ? 'M1 5L5 1L9 5' : 'M1 1L5 5L9 1'}
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      )}

      {menu && createPortal(menu, portalTarget || document.body)}
    </div>
  );
};

/**
 * Floating caption text bubble, centered over the video. Kept independently
 * positioned (not part of the control bar flex row) since it doesn't sit
 * near any other controls, and portals into the real fullscreen element
 * when active so it stays visible in fullscreen.
 */
export const CaptionsTextOverlay = ({ captions }) => {
  const { isLive, showCaptions, currentCaptionText, captionVisible, portalTarget } = captions;

  if (!isLive || !showCaptions || !currentCaptionText) return null;

  const content = (
    <div
      style={{
        position: 'absolute',
        bottom: '76px',
        left: 0,
        right: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 16px',
        pointerEvents: 'none',
        zIndex: 99999,
      }}
    >
      <div
        className={`cc-caption-box${captionVisible ? '' : ' hiding'}`}
        style={{
          backgroundColor: 'rgba(38, 29, 29, 0.14)',
          color: '#ffffff',
          padding: '7px 18px',
          borderRadius: '8px',
          textAlign: 'center',
          backdropFilter: 'blur(6px)',
          fontSize: '12px',
          fontWeight: 500,
          lineHeight: '1.5',
          maxWidth: '75%',
          letterSpacing: '0.01em',
          boxShadow: '0 2px 12px rgba(0,0,0,0.4)',
        }}
      >
        {currentCaptionText}
      </div>
    </div>
  );

  return portalTarget ? createPortal(content, portalTarget) : content;
};

/**
 * @deprecated kept only so nothing breaks if imported elsewhere; new code
 * should use `useLiveCaptions` + `CaptionsInlineControl` + `CaptionsTextOverlay`
 * so the toggle button can live inside the control bar's flex layout.
 */
const LiveClosedCaptions = () => {
  const captions = useLiveCaptions();
  return <CaptionsTextOverlay captions={captions} />;
};

export default LiveClosedCaptions;
