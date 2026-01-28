'use client';

import React, { useEffect, useState } from 'react';
import { FileText, ZoomIn, ZoomOut, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PDFViewerProps {
  file: File | null;
  currentStepId?: number;
}

export function ProfessionalPDFViewer({ file, currentStepId }: PDFViewerProps) {
  const [zoom, setZoom] = useState(100);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (file) {
      setLoading(true);
      const url = URL.createObjectURL(file);
      setPdfUrl(url);
      setLoading(false);
      return () => URL.revokeObjectURL(url);
    }
  }, [file]);

  if (!file) {
    return (
      <div className="flex flex-col h-full bg-secondary/30 rounded-lg border border-border items-center justify-center">
        <div className="text-center space-y-3">
          <div className="p-4 rounded-lg bg-primary/10 inline-block">
            <Eye className="h-8 w-8 text-primary" />
          </div>
          <p className="text-sm font-semibold text-foreground">No document uploaded</p>
          <p className="text-xs text-muted-foreground">Upload a PDF to get started</p>
        </div>
      </div>
    );
  }

  const fileSizeInMB = (file.size / (1024 * 1024)).toFixed(2);
  const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
  const isImage = file.type.startsWith('image/') || /\.(png|jpe?g)$/i.test(file.name);

  return (
    <div className="flex flex-col h-full bg-secondary/40 rounded-lg border border-border overflow-hidden">
      {/* PDF Viewer Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card flex-shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-1.5 rounded bg-primary/10 flex-shrink-0">
            <FileText className="h-4 w-4 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-foreground truncate">{file.name}</p>
            <p className="text-xs text-muted-foreground">{fileSizeInMB} MB</p>
          </div>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setZoom(Math.max(50, zoom - 10))}
            className="h-8 w-8 p-0"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-xs font-medium text-muted-foreground w-10 text-center">
            {zoom}%
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setZoom(Math.min(200, zoom + 10))}
            className="h-8 w-8 p-0"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* PDF Display Area */}
      <div className="flex-1 overflow-auto p-2 bg-secondary/20">
        {loading ? (
          <div className="text-center">
            <div className="inline-block h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-muted-foreground mt-2">Loading PDF...</p>
          </div>
        ) : pdfUrl && isPdf ? (
          <iframe
            src={`${pdfUrl}#zoom=${zoom}`}
            className="w-full h-full min-h-[70vh] rounded-lg border border-border bg-background shadow-sm"
            title="PDF Document"
          />
        ) : pdfUrl && isImage ? (
          <div className="w-full flex justify-center">
            <div
              className="origin-top"
              style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
            >
              <img
                src={pdfUrl}
                alt={file.name}
                className="max-w-full h-auto rounded-lg border border-border bg-background shadow-sm"
              />
            </div>
          </div>
        ) : (
          <div className="text-center space-y-2">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto opacity-30" />
            <p className="text-sm font-medium text-foreground">Unable to load document</p>
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className="px-4 py-2 border-t border-border bg-card text-xs text-muted-foreground text-center flex-shrink-0">
        {currentStepId ? `Section: Step ${currentStepId}` : 'Select a step to highlight'}
      </div>
    </div>
  );
}
