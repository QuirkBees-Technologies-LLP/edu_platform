/* eslint-disable no-unused-vars */
import { throttle } from '@/utils';
import * as React from 'react';
import { useEffect, useRef, useCallback } from 'react';
const Scrollspy = ({
  children,
  targetRef,
  onUpdate,
  className,
  offset = 0,
  smooth = true,
  dataAttribute = 'scrollspy',
  activeClass = 'active',
  history = true,
  throttleTime = 200
}) => {
  const selfRef = useRef(null);
  const anchorElementsRef = useRef(null);
  const prevIdTracker = useRef(null);

  const isVisible = element => {
    if (!element || element.getClientRects().length === 0) {
      return false;
    }
    return getComputedStyle(element).getPropertyValue('visibility') === 'visible';
  };

  const replaceHash = useCallback(throttle(sectionId => {
    window.history.replaceState({}, '', `#${sectionId}`);
  }, throttleTime), [throttleTime]);

  const updateAnchor = anchorElement => {
    const sectionId = anchorElement.getAttribute(`data-${dataAttribute}-anchor`);
    const sectionElement = document.getElementById(sectionId);
    if (!sectionElement || !isVisible(sectionElement)) return;
    const scrollPosition = targetRef?.current === document ? window.scrollY || document.documentElement.scrollTop : (targetRef?.current).scrollTop;
    let customOffset = offset;
    const dataOffset = anchorElement.getAttribute(`data-${dataAttribute}-offset`);
    if (dataOffset) {
      customOffset = parseInt(dataOffset, 10);
    }
    const offsetTop = sectionElement.offsetTop;
    if (scrollPosition + customOffset >= offsetTop) {
      anchorElementsRef.current?.forEach(item => {
        item.classList.remove(activeClass);
      });
      anchorElement.classList.add(activeClass);
      if (onUpdate && sectionId) {
        onUpdate(sectionId);
      }
      prevIdTracker.current = sectionId;
      if (history) {
        replaceHash(sectionId);
      }
      const parentAnchorElements = anchorElement.closest(`[data-${dataAttribute}-group`);
      if (parentAnchorElements) {
        parentAnchorElements.querySelector(`[data-${dataAttribute}]`)?.classList.add(activeClass);
      }
    }
  };

  const handleScroll = useCallback(() => {
    anchorElementsRef.current?.forEach(element => {
      updateAnchor(element);
    });
  }, [anchorElementsRef]);

  const scrollTo = useCallback(anchorElement => event => {
    if (event) event.preventDefault();
    const sectionId = anchorElement.getAttribute(`data-${dataAttribute}-anchor`)?.replace('#', '');
    const sectionElement = document.getElementById(sectionId);
    if (!sectionElement) return;
    const scrollToElement = targetRef?.current === document ? window : targetRef?.current;
    let customOffset = offset;
    const dataOffset = anchorElement.getAttribute(`data-${dataAttribute}-offset`);
    if (dataOffset) {
      customOffset = parseInt(dataOffset, 10);
    }
    const scrollTop = sectionElement.offsetTop - customOffset;
    if (scrollToElement && 'scrollTo' in scrollToElement) {
      scrollToElement.scrollTo({
        top: scrollTop,
        left: 0,
        behavior: smooth ? 'smooth' : 'auto'
      });
    }
  }, [dataAttribute, offset, smooth, targetRef]);

  const scrollToHashSection = useCallback(() => {
    const hash = CSS.escape(window.location.hash.replace('#', ''));
    if (hash) {
      const targetElement = document.querySelector(`[data-${dataAttribute}-anchor="${hash}"]`);
      if (targetElement) {
        scrollTo(targetElement)();
      }
    }
  }, [dataAttribute, scrollTo]);
  useEffect(() => {
    if (selfRef.current) {
      anchorElementsRef.current = Array.from(selfRef.current.querySelectorAll(`[data-${dataAttribute}-anchor]`));
    }
    anchorElementsRef.current?.forEach(item => {
      item.addEventListener('click', scrollTo(item));
    });
    const scrollElement = targetRef?.current === document ? window : targetRef?.current;

    scrollElement?.addEventListener('scroll', handleScroll);

    setTimeout(() => {
      scrollToHashSection();
    }, 100);

    return () => {
      scrollElement?.removeEventListener('scroll', handleScroll);
      anchorElementsRef.current?.forEach(item => {
        item.removeEventListener('click', scrollTo(item));
      });
    };
  }, [targetRef, selfRef, handleScroll, dataAttribute, scrollTo, scrollToHashSection]);
  return <div className={className} ref={selfRef}>
      {children}
    </div>;
};
export { Scrollspy };