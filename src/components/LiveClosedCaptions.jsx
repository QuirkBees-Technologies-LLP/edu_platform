import React, { useState, useCallback, useEffect, useRef } from 'react';
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

const LiveClosedCaptions = () => {
  const { useCallClosedCaptions, useIsCallLive } = useCallStateHooks();
  const closedCaptions = useCallClosedCaptions();
  const isLive = useIsCallLive();
  const [showCaptions, setShowCaptions] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [portalTarget, setPortalTarget] = useState(null);
  const [supportedLanguages, setSupportedLanguages] = useState([{ code: 'en', label: 'English' }]);
  const langMenuRef = useRef(null);

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

  // Close language menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (langMenuRef?.current && !langMenuRef.current.contains(e?.target)) {
        setShowLangMenu(false);
      }
    };
    if (showLangMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showLangMenu]);

  // Track fullscreen changes
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

  // Inject global CSS for fullscreen captions overlay
  useEffect(() => {
    const styleId = 'live-captions-fullscreen-style';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        .captions-overlay-root {
          position: absolute !important;
          top: 0 !important;
          left: 0 !important;
          right: 0 !important;
          bottom: 0 !important;
          pointer-events: none !important;
          z-index: 99999 !important;
        }
        .captions-cc-btn,
        .captions-lang-btn,
        .captions-lang-menu {
          pointer-events: auto !important;
          z-index: 100000 !important;
        }
        .captions-lang-menu::-webkit-scrollbar {
          width: 4px;
        }
        .captions-lang-menu::-webkit-scrollbar-track {
          background: transparent;
        }
        .captions-lang-menu::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 2px;
        }
      `;
      document.head.appendChild(style);
    }
    return () => {
      const el = document.getElementById(styleId);
      if (el) el.remove();
    };
  }, []);



  const selectedLangLabel =
    supportedLanguages?.find((l) => l?.code === selectedLanguage)?.label || 'English';

  // Don't render anything if stream is not live
  if (!isLive) return null;

  const content = (
    <div className="captions-overlay-root">
      {/* CC Toggle Button */}
      <button
        className="captions-cc-btn"
        onClick={(e) => {
          e?.preventDefault();
          e?.stopPropagation();
          toggleCaptions();
        }}
        style={{
          position: 'absolute',
          bottom: '20px',
          right: '60px',
          backgroundColor: showCaptions
            ? 'rgba(255, 255, 255, 0.25)'
            : 'rgba(255, 255, 255, 0.08)',
          color: showCaptions ? '#fff' : 'rgba(255, 255, 255, 0.4)',
          border: showCaptions
            ? '1px solid rgba(255, 255, 255, 0.5)'
            : '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: '4px',
          padding: '3px 6px',
          fontSize: '12px',
          fontWeight: 700,
          cursor: 'pointer',
          letterSpacing: '0.5px',
          lineHeight: '1',
          transition: 'all 0.2s ease',
        }}
        title={showCaptions ? 'Hide Captions' : 'Show Captions'}
      >
        CC
      </button>

      {/* Language Selector Button */}
      {showCaptions && (
        <div
          ref={langMenuRef}
          style={{ position: 'absolute', bottom: '20px', right: '95px' }}
        >
          <button
            className="captions-lang-btn"
            onClick={(e) => {
              e?.preventDefault();
              e?.stopPropagation();
              setShowLangMenu((prev) => !prev);
            }}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              color: '#fff',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '4px',
              padding: '3px 8px',
              fontSize: '10px',
              fontWeight: 600,
              cursor: 'pointer',
              letterSpacing: '0.3px',
              lineHeight: '1',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
            title="Change caption language"
          >
            🌐 {selectedLangLabel}
            <span style={{ fontSize: '8px', opacity: 0.7 }}>
              {showLangMenu ? '▲' : '▼'}
            </span>
          </button>

          {/* Language Dropdown Menu */}
          {showLangMenu && (
            <div
              className="captions-lang-menu"
              style={{
                position: 'absolute',
                bottom: '22px',
                right: '0',
                backgroundColor: 'rgba(0, 0, 0, 0.92)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                padding: '4px 0',
                minWidth: '140px',
                maxHeight: '220px',
                overflowY: 'auto',
                backdropFilter: 'blur(12px)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
              }}
            >
              {supportedLanguages?.map((lang) => (
                <button
                  key={lang?.code}
                  onClick={(e) => {
                    e?.preventDefault();
                    e?.stopPropagation();
                    handleLanguageSelect(lang?.code);
                  }}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '6px 14px',
                    border: 'none',
                    background:
                      selectedLanguage === lang?.code
                        ? 'rgba(255, 255, 255, 0.15)'
                        : 'transparent',
                    color:
                      selectedLanguage === lang?.code
                        ? '#fff'
                        : 'rgba(255, 255, 255, 0.75)',
                    fontSize: '12px',
                    fontWeight: selectedLanguage === lang?.code ? 600 : 400,
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'background 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (selectedLanguage !== lang?.code) {
                      e.target.style.background = 'rgba(255, 255, 255, 0.08)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedLanguage !== lang?.code) {
                      e.target.style.background = 'transparent';
                    }
                  }}
                >
                  {selectedLanguage === lang?.code && '✓ '}
                  {lang?.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Captions Text — auto-hides 4s after last speech, smooth fade */}
      {showCaptions && currentCaptionText && (
        <div
          style={{
            position: 'absolute',
            bottom: '60px',
            left: 0,
            right: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 16px',
            pointerEvents: 'none',
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
      )}

    </div>
  );

  // Fullscreen: portal into fullscreen element
  if (portalTarget) {
    return createPortal(content, portalTarget);
  }

  // Normal mode
  return content;
};

export default LiveClosedCaptions;
