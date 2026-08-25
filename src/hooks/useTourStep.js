/**
 * useTourStep — Centralized hook for the multi-page product tour.
 *
 * Handles all the boilerplate that was duplicated across 11+ tour pages:
 *  - Checking shouldStart / hasSeenTour / ref guard
 *  - Waiting for a readiness condition
 *  - Building & starting the tour with consistent options
 *  - onComplete → navigate to next page (or markTourComplete if final)
 *  - onExit (skip/esc) → markTourComplete immediately
 *  - Detecting the Skip button via capture-phase click listener
 *  - Idempotent finish API calls (markTourComplete is safe to call multiple times)
 *
 * Usage:
 *   useTourStep({
 *     shouldStart: location?.state?.continueTour === true,
 *     isReady: !isLoading && data?.items?.length > 0,
 *     getSteps: () => [...],           // return array of intro.js steps
 *     onDone: () => navigate('/next', { state: { continueTour: true } }),
 *     onSkip: markTourComplete,        // called when user clicks Skip / Esc
 *     isFinalStep: false,              // set true on CommunityFeed (last page)
 *     delay: 800,                      // ms before tour.start() — default 800
 *   });
 */

import { useEffect, useRef } from 'react';
import introJs from 'intro.js';
import 'intro.js/introjs.css';
import { useAuthContext } from '@/auth';
import { useCompleteTourMutation } from '../store/api/client/clientProfileApiSlice';
import { useNavigate } from 'react-router-dom';
import { useCallback } from 'react';

/**
 * Shared hook — call once per page that participates in the tour chain.
 *
 * @param {object} options
 * @param {boolean}  options.shouldStart   — true when location.state.continueTour OR this page starts the tour
 * @param {boolean}  options.isReady       — true when DOM content is rendered and ready for intro.js
 * @param {function} options.getSteps      — returns intro.js steps array (called inside setTimeout)
 * @param {function} [options.onDone]      — called if user completes all steps (navigate to next page)
 * @param {boolean}  [options.isFinalStep] — if true, onDone is ignored and markTourComplete is called instead
 * @param {number}   [options.delay]       — delay before starting tour in ms (default 800)
 * @param {string}   [options.doneLabel]   — label for the final "done" button (default 'Next →')
 */
export function useTourStep({
  shouldStart,
  isReady,
  getSteps,
  onDone,
  isFinalStep = false,
  delay = 800,
  doneLabel,
}) {
  const tourStartedRef = useRef(false);
  const { auth, saveAuth } = useAuthContext();
  const [completeTour] = useCompleteTourMutation();

  // Stable markTourComplete — idempotent, safe to call multiple times
  const markTourComplete = useCallback(async () => {
    try {
      await completeTour().unwrap();
      if (auth) {
        saveAuth({ ...auth, user: { ...auth.user, hasSeenTour: true } });
      }
    } catch (err) {
      console.error('[useTourStep] Failed to mark tour complete:', err);
    }
  }, [completeTour, auth, saveAuth]);

  useEffect(() => {
    // ── Guard 1: Only run when this step is active ──
    if (!shouldStart) return;

    // ── Guard 2: If tour was already completed, never show again ──
    if (auth?.user?.hasSeenTour === true) return;

    // ── Guard 3: Data not ready yet — wait for next render ──
    if (!isReady) return;

    // ── Guard 4: Prevent double-start (StrictMode / re-renders) ──
    if (tourStartedRef.current) return;
    tourStartedRef.current = true;

    // ── Detect Skip button via capture-phase click ──
    let completedNaturally = false;
    let skipClicked = false;

    const handleSkipClick = (e) => {
      if (e.target.closest?.('.introjs-skipbutton')) {
        skipClicked = true;
      }
    };
    document.addEventListener('click', handleSkipClick, true);

    const timer = setTimeout(() => {
      const steps = getSteps();

      // If no DOM elements found for any step, gracefully finish/advance
      if (!steps || steps.length === 0) {
        document.removeEventListener('click', handleSkipClick, true);
        tourStartedRef.current = false;
        if (isFinalStep) {
          markTourComplete();
        } else if (onDone) {
          onDone();
        }
        return;
      }

      const tour = introJs.tour().setOptions({
        steps,
        hidePrev: true,
        nextLabel: 'Next →',
        prevLabel: '← Back',
        skipLabel: 'Skip',
        doneLabel: doneLabel ?? (isFinalStep ? 'Finish Tour ✓' : 'Next →'),
        showProgress: true,
        showBullets: false,
        overlayOpacity: 0.8,
        exitOnOverlayClick: false,
        exitOnEsc: true,
        scrollToElement: true,
        tooltipClass: 'custom-intro-tooltip',
      });

      // Custom smooth scroll to center the highlighted element
      tour.onchange(function (targetElement) {
        if (this._currentStep === 0 || !targetElement) {
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return;
        }
        const rect = targetElement.getBoundingClientRect();
        const absoluteTop = rect.top + window.pageYOffset;
        const middle = absoluteTop - window.innerHeight / 2 + rect.height / 2;
        window.scrollTo({ top: middle, behavior: 'smooth' });
      });

      // oncomplete fires when user clicks the final Next/Done button
      tour.oncomplete(() => {
        document.removeEventListener('click', handleSkipClick, true);
        if (!skipClicked) {
          completedNaturally = true;
        }
        tourStartedRef.current = false;
        // Navigation happens in onexit (which always fires after oncomplete too)
      });

      // onexit fires: after oncomplete AND on Skip/Esc
      tour.onexit(() => {
        document.removeEventListener('click', handleSkipClick, true);
        tourStartedRef.current = false;

        if (completedNaturally) {
          // ── User finished all steps ──
          if (isFinalStep) {
            markTourComplete(); // Last page: tell backend tour is done
          } else if (onDone) {
            onDone(); // Navigate to next tour page
          }
        } else {
          // ── User clicked Skip or pressed Esc → end entire tour chain ──
          markTourComplete();
        }
      });

      tour.start();
    }, delay);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('click', handleSkipClick, true);
      // ❌ Do NOT reset tourStartedRef here — StrictMode double-invoke
      // would re-trigger the tour. The ref is reset inside onexit above.
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldStart, isReady]);
}
