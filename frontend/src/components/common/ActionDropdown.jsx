import React, { useState, useRef, useLayoutEffect, useEffect } from 'react';
import { createPortal } from 'react-dom';

/**
 * ActionDropdown
 * Enterprise-grade, screen-aware contextual popover menu with React Portal rendering.
 * 
 * Why React Portal?
 * When tables or cards have `overflow-x: auto` or `overflow: hidden`, standard
 * `position: absolute` dropdowns are clipped by the table boundaries.
 * Rendering via `createPortal(..., document.body)` with `position: fixed` guarantees
 * the dropdown is NEVER clipped by any parent scroll container, card, or modal,
 * while staying perfectly anchored to the trigger button in real-time.
 */
export default function ActionDropdown({
  trigger,
  children,
  align = 'right', // 'right' | 'left'
  className = '',
  menuWidth = '230px'
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0, maxHeight: '320px' });

  const triggerRef = useRef(null);
  const menuRef = useRef(null);

  const updatePosition = () => {
    if (!triggerRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Default numeric width or parse px
    const numericWidth = parseInt(menuWidth, 10) || 230;

    // Horizontal calculation
    let leftPos;
    if (align === 'center') {
      leftPos = triggerRect.left + (triggerRect.width / 2) - (numericWidth / 2);
    } else if (align === 'right') {
      leftPos = triggerRect.right - numericWidth;
    } else {
      leftPos = triggerRect.left;
    }

    // Edge clamp horizontally to avoid screen edge clipping
    if (leftPos + numericWidth > viewportWidth - 12) {
      leftPos = viewportWidth - numericWidth - 12;
    }
    if (leftPos < 12) {
      leftPos = 12;
    }

    // Vertical calculation: check space below vs space above
    const spaceBelow = viewportHeight - triggerRect.bottom;
    const spaceAbove = triggerRect.top;

    // Read live measured menu height if already mounted, else estimate 220px
    const measuredHeight = menuRef.current ? menuRef.current.getBoundingClientRect().height : 220;

    // Open upwards if not enough room below AND more room above
    const shouldOpenUp = spaceBelow < measuredHeight && spaceAbove > spaceBelow;

    if (shouldOpenUp) {
      const availableHeight = Math.max(140, Math.floor(spaceAbove - 16));
      // Anchor bottom to just above trigger
      const topPos = Math.max(12, triggerRect.top - Math.min(measuredHeight, availableHeight) - 6);
      setCoords({
        top: topPos,
        left: leftPos,
        maxHeight: `${availableHeight}px`
      });
    } else {
      const availableHeight = Math.max(140, Math.floor(spaceBelow - 16));
      setCoords({
        top: triggerRect.bottom + 6,
        left: leftPos,
        maxHeight: `${availableHeight}px`
      });
    }
  };

  useLayoutEffect(() => {
    if (isOpen) {
      updatePosition();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (e) => {
      if (
        triggerRef.current && triggerRef.current.contains(e.target) ||
        menuRef.current && menuRef.current.contains(e.target)
      ) {
        return;
      }
      setIsOpen(false);
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    const handleReposition = (e) => {
      // Reposition on scroll, or close if parent scrolled significantly
      if (menuRef.current && menuRef.current.contains(e.target)) return;
      updatePosition();
    };

    const handleWindowResize = () => {
      updatePosition();
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', handleWindowResize);
    window.addEventListener('scroll', handleReposition, true);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleWindowResize);
      window.removeEventListener('scroll', handleReposition, true);
    };
  }, [isOpen]);

  const toggleOpen = (e) => {
    e.stopPropagation();
    setIsOpen(prev => !prev);
  };

  return (
    <>
      <div 
        ref={triggerRef} 
        onClick={toggleOpen} 
        className={`action-dropdown-trigger ${className}`}
        style={{ cursor: 'pointer', display: 'inline-flex' }}
      >
        {typeof trigger === 'function' ? trigger({ isOpen, toggleOpen }) : trigger}
      </div>

      {isOpen && typeof document !== 'undefined' && createPortal(
        <div
          ref={menuRef}
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'fixed',
            top: `${coords.top}px`,
            left: `${coords.left}px`,
            width: menuWidth,
            minWidth: menuWidth,
            maxHeight: coords.maxHeight,
            overflowY: 'auto',
            background: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 20px 35px -4px rgba(15, 23, 42, 0.28), 0 8px 16px -4px rgba(15, 23, 42, 0.16)',
            zIndex: 99999, // Render on top of all tables, drawers, and modal backdrops
            padding: '6px',
            boxSizing: 'border-box'
          }}
        >
          {typeof children === 'function' ? children({ close: () => setIsOpen(false) }) : children}
        </div>,
        document.body
      )}
    </>
  );
}
