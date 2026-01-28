'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { FileText, X } from 'lucide-react';

interface PDFPreviewProps {
  file: File | null;
  isExpanded: boolean;
  onToggle: () => void;
}

export function PDFPreview({ file, isExpanded, onToggle }: PDFPreviewProps) {
  if (!file) return null;

  const fileSize = (file.size / 1024 / 1024).toFixed(2);

  return (
    <Card className="overflow-hidden border-border/50">
      <button
        onClick={onToggle}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-muted/30 transition-colors duration-200"
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <FileText className="h-5 w-5 text-primary flex-shrink-0" />
          <div className="text-left min-w-0">
            <p className="font-semibold text-foreground text-sm truncate">{file.name}</p>
            <p className="text-xs text-muted-foreground">{fileSize} MB</p>
          </div>
        </div>
        <svg
          className={`h-5 w-5 text-muted-foreground transition-transform duration-300 flex-shrink-0 ${
            isExpanded ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </button>

      {isExpanded && (
        <div className="border-t border-border/50 p-6 bg-muted/10">
          <div className="space-y-4">
            <div className="bg-white rounded-lg border border-border p-8 text-center">
              <FileText className="h-12 w-12 text-primary/40 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground mb-2">
                {file.type === 'application/pdf' ? 'PDF Document' : 'Image Preview'}
              </p>
              <p className="text-xs text-muted-foreground">
                {file.name} • {fileSize} MB
              </p>
              <p className="text-xs text-muted-foreground mt-3">
                Form analysis in progress. Fields are being extracted and analyzed.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-primary/5 border border-primary/10 rounded-lg p-3">
                <p className="font-semibold text-primary mb-1">File Type</p>
                <p className="text-muted-foreground capitalize">
                  {file.type === 'application/pdf'
                    ? 'PDF'
                    : file.type.split('/')[1]?.toUpperCase() || 'Document'}
                </p>
              </div>
              <div className="bg-accent/5 border border-accent/10 rounded-lg p-3">
                <p className="font-semibold text-accent mb-1">File Size</p>
                <p className="text-muted-foreground">{fileSize} MB</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
