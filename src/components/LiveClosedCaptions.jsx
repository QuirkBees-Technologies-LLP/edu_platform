import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useCallStateHooks } from '@stream-io/video-react-sdk';

// Map language names (from DB) to GetStream language codes
const LANGUAGE_NAME_TO_CODE = {
  english: 'en', japanese: 'ja', spanish: 'es', polish: 'pl', german: 'de',
  french: 'fr', italian: 'it', dutch: 'nl', portuguese: 'pt', korean: 'ko',
  chinese: 'zh', arabic: 'ar', hindi: 'hi', russian: 'ru', turkish: 'tr',
  swedish: 'sv', danish: 'da', finnish: 'fi', greek: 'el', hungarian: 'hu',
  romanian: 'ro', czech: 'cs', catalan: 'ca', indonesian: 'id', thai: 'th',
  tagalog: 'tl', hebrew: 'he', croatian: 'hr', malay: 'ms', norwegian: 'no',
  ukrainian: 'uk', tamil: 'ta', slovakian: 'sk', slovak: 'sk', serbian: 'sr',
  armenian: 'hy', bulgarian: 'bg', estonian: 'et', slovenian: 'sl',
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

  // Fetch active languages from API on mount
  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const baseUrl = import.meta.env?.VITE_BASE_URL || '';
        const token = localStorage.getItem('token');
        const res = await fetch(`${baseUrl}/users/language/`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res?.ok) return;
        const data = await res.json();
        if (data?.success && Array.isArray(data?.data)) {
          const langs = [{ code: 'en', label: 'English' }];
          data.data.forEach((lang) => {
            const name = lang?.name;
            if (!name) return;
            const code = LANGUAGE_NAME_TO_CODE[name.toLowerCase()];
            if (code && code !== 'en') {
              langs.push({ code, label: name });
            }
          });
          setSupportedLanguages(langs);
        }
      } catch (err) {
        console.error('Failed to fetch languages:', err);
      }
    };
    fetchLanguages();
  }, []);

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

  // Get the caption text in the selected language
  const getCaptionText = useCallback(
    (caption) => {
      if (!caption) return '';
      if (selectedLanguage === 'en') {
        return caption?.text || '';
      }
      // GetStream sends translations as caption.translations = { es: "...", hi: "...", ... }
      if (caption?.translations?.[selectedLanguage]) {
        return caption.translations[selectedLanguage];
      }
      // Fallback to original text if translation not available
      return caption?.text || '';
    },
    [selectedLanguage]
  );

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
          fontSize: '10px',
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

      {/* Captions Text */}
      {showCaptions && closedCaptions?.length > 0 && (
        <div
          style={{
            position: 'absolute',
            bottom: '40px',
            left: 0,
            right: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-end',
            padding: '16px',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              maxWidth: '80%',
              maxHeight: '120px',
              overflow: 'hidden',
            }}
          >
            {closedCaptions?.slice(-2)?.map((caption, index) => (
              <div
                key={`${caption?.startTime || index}-${index}`}
                style={{
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  color: '#ffffff',
                  padding: '6px 14px',
                  borderRadius: '6px',
                  textAlign: 'center',
                  marginTop: '4px',
                  backdropFilter: 'blur(4px)',
                  fontSize: '14px',
                  lineHeight: '1.4',
                }}
              >
                {getCaptionText(caption)}
              </div>
            ))}
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
