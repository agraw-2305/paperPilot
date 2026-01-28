'use client';

import React from "react"

interface HeaderProps {
  onLogoClick?: () => void;
}

export function Header({ onLogoClick }: HeaderProps) {
  return (
    <header className="border-b border-border bg-background sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button
            onClick={onLogoClick}
            className="flex items-center gap-3 hover:opacity-85 transition-opacity duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg px-2 py-1"
          >
            {/* Modern minimalist logo */}
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-sm">
              <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2zm2 6h10v2H7V9zm0 4h10v2H7v-2z" />
              </svg>
            </div>
            <span className="font-semibold text-foreground text-base hidden sm:inline">
              PaperPilot
            </span>
          </button>

          {/* Spacer */}
          <div className="flex-1" />
        </div>
      </div>
    </header>
  );
}
