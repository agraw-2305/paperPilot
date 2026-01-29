'use client';

import React from "react"

interface HeaderProps {
  onLogoClick?: () => void;
}

export function Header({ onLogoClick }: HeaderProps) {
  return (
    <header className="border-b border-border bg-background sticky top-0 z-50">
      <div className="w-full px-4">
        <div className="flex items-center justify-between h-28">
          {/* Logo - Leftmost corner */}
          <button
            onClick={onLogoClick}
            className="flex items-center gap-8 hover:opacity-85 transition-opacity duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg px-4 py-3"
          >
            {/* Extra large logo */}
            <div className="w-20 h-20 rounded-xl bg-primary flex items-center justify-center shadow-xl">
              <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2zm2 6h10v2H7V9zm0 4h10v2H7v-2z" />
              </svg>
            </div>

            <div className="hidden sm:flex flex-col items-start leading-tight">
              <span className="text-4xl font-bold text-foreground">paperPilot</span>
              <span className="text-lg font-semibold text-muted-foreground">Your AI paperwork companion</span>
            </div>
          </button>

          {/* Spacer */}
          <div className="flex-1" />
        </div>
      </div>
    </header>
  );
}
