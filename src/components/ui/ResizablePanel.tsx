'use client';

import { cn } from '@/lib/utils';
import { GripVertical } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

interface ResizablePanelProps {
  children: React.ReactNode;
  defaultWidth?: number;
  minWidth?: number;
  maxWidth?: number;
  className?: string;
  onResize?: (width: number) => void;
  storageKey?: string;
}

export function ResizablePanel({
  children,
  defaultWidth = 350,
  minWidth = 250,
  maxWidth = 500,
  className,
  onResize,
  storageKey = 'resizable-panel-width',
}: ResizablePanelProps) {
  const [width, setWidth] = useState(defaultWidth);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);

  // Load width from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedWidth = localStorage.getItem(storageKey);
      if (savedWidth) {
        const parsedWidth = parseInt(savedWidth, 10);
        if (parsedWidth >= minWidth && parsedWidth <= maxWidth) {
          setWidth(parsedWidth);
        }
      }
    }
  }, [storageKey, minWidth, maxWidth]);

  // Save width to localStorage when it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(storageKey, width.toString());
    }
    onResize?.(width);
  }, [width, storageKey, onResize]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    console.log('🎯 ResizablePanel: Mouse down triggered!', {
      clientX: e.clientX,
      currentWidth: width,
      storageKey
    });
    setIsResizing(true);
    setIsDragging(true);
    startXRef.current = e.clientX;
    startWidthRef.current = width;

    // Add global event listeners
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    // Add a class to prevent text selection during resize
    document.body.classList.add('resize-active');
  }, [width, storageKey]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing) return;
    e.preventDefault();

    const deltaX = e.clientX - startXRef.current;
    const newWidth = startWidthRef.current + deltaX;

    // Constrain width within bounds
    const constrainedWidth = Math.max(minWidth, Math.min(maxWidth, newWidth));
    console.log('🔄 ResizablePanel: Resizing', {
      deltaX,
      newWidth,
      constrainedWidth,
      minWidth,
      maxWidth
    });
    setWidth(constrainedWidth);
  }, [isResizing, minWidth, maxWidth]);

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
    setIsDragging(false);

    // Remove global event listeners
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';

    // Remove the resize-active class
    document.body.classList.remove('resize-active');
  }, [handleMouseMove]);

  // Cleanup event listeners on unmount
  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [handleMouseMove, handleMouseUp]);

  return (
    <div className="flex h-full">
      {/* Resizable Panel */}
      <div
        ref={panelRef}
        className={cn(
          'relative bg-white border-r border-gray-200 h-full overflow-hidden',
          !isResizing && 'transition-all duration-300 ease-in-out',
          className
        )}
        style={{ width: `${width}px` }}
      >
        {/* Panel Content */}
        <div className="h-full overflow-y-auto custom-scrollbar">
          {children}
        </div>

        {/* Resize Handle */}
        <div
          role="separator"
          aria-label="Resize panel"
          aria-valuenow={width}
          aria-valuemin={minWidth}
          aria-valuemax={maxWidth}
          className={cn(
            'absolute top-0 right-0 w-4 h-full cursor-col-resize group transition-colors z-20',
            'after:content-[""] after:absolute after:top-0 after:left-1/2 after:w-px after:h-full',
            'after:bg-gray-300 after:transition-opacity after:duration-200',
            isResizing ? 'after:opacity-100' : 'after:opacity-60 hover:after:opacity-100'
          )}
          onMouseDown={handleMouseDown}
        >
          {/* Enhanced grip indicator */}
          <div
            className={cn(
              'absolute top-1/2 right-0 transform -translate-y-1/2 translate-x-1/2',
              'transition-all duration-200',
              isDragging && 'scale-110'
            )}
          >
            <div
              className={cn(
                'flex items-center justify-center w-6 h-16 bg-white border border-gray-300 rounded-md',
                'shadow-md hover:shadow-lg transition-all duration-200',
                'opacity-80 group-hover:opacity-100',
                isDragging && 'opacity-100 shadow-xl border-blue-500 bg-blue-50'
              )}
            >
              <GripVertical
                className={cn(
                  'h-4 w-4 transition-colors duration-200',
                  isDragging ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'
                )}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Hook for components that need to respond to panel width changes
export function useResizablePanel(storageKey = 'resizable-panel-width', defaultWidth = 320) {
  const [width, setWidth] = useState(defaultWidth);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedWidth = localStorage.getItem(storageKey);
      if (savedWidth) {
        const parsedWidth = parseInt(savedWidth, 10);
        setWidth(parsedWidth);
      }
    }

    // Listen for storage changes (in case width is changed in another tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === storageKey && e.newValue) {
        const parsedWidth = parseInt(e.newValue, 10);
        setWidth(parsedWidth);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [storageKey]);

  return width;
}
