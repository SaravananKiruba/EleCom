'use client';

import { Box, IconButton, Text, HStack } from '@chakra-ui/react';
import { ReactNode, useEffect } from 'react';

interface SidePanelProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  children: ReactNode;
  width?: string;
}

export function SidePanel({ open, onClose, title, children, width = 'min(520px, 100vw)' }: SidePanelProps) {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 400,
          background: 'rgba(15,20,30,0.45)',
          backdropFilter: 'blur(3px)',
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
          transition: 'opacity 0.22s ease',
        }}
      />
      {/* Slide-in panel */}
      <div
        style={{
          position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 401,
          width, height: '100dvh',
          background: '#ffffff',
          boxShadow: '-8px 0 40px rgba(0,0,0,0.14)',
          display: 'flex', flexDirection: 'column',
          transform: open ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.26s cubic-bezier(0.4,0,0.2,1)',
        }}
      >
        {/* Header */}
        {title !== undefined && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '14px 20px', borderBottom: '1px solid #f0f0f0',
            flexShrink: 0, background: '#fff',
          }}>
            <div style={{ flex: 1, minWidth: 0 }}>{title}</div>
            <button
              onClick={onClose}
              style={{
                marginLeft: 12, width: 32, height: 32, borderRadius: 8,
                border: 'none', background: '#f5f5f5', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18, color: '#666', flexShrink: 0,
              }}
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        )}
        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
          {children}
        </div>
      </div>
    </>
  );
}
