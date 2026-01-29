'use client';

import React from "react"
import { useState, useRef } from 'react';
import { Upload, Lock } from 'lucide-react';

interface UploadCardProps {
  onFileSelect: (file: File) => void;
  isLoading?: boolean;
  onDemoClick?: () => void; // Declare the onDemoClick variable
}

export function UploadCard({ onFileSelect, isLoading }: UploadCardProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  const maxSize = 10 * 1024 * 1024; // 10MB

  const validateFile = (file: File): boolean => {
    const validTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const validExtensions = ['.pdf', '.png', '.jpg', '.jpeg', '.docx'];
    const hasValidType = validTypes.includes(file.type);
    const hasValidExtension = validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
    if (!hasValidType && !hasValidExtension) {
      setError('Invalid file type. Please upload a PDF, image, or Word document.');
      return false;
    }
    if (file.size > maxSize) {
      setError('File is too large. Maximum size is 10MB.');
      return false;
    }
    if (file.size === 0) {
      setError('File is empty. Please select a valid document.');
      return false;
    }
    setError(null);
    return true;
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      const file = files[0];
      if (validateFile(file)) {
        onFileSelect(file);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      if (validateFile(files[0])) {
        onFileSelect(files[0]);
      }
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-4">
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`relative rounded-3xl bg-gradient-to-br from-card via-background to-card border-2 border-primary/30 shadow-2xl shadow-primary/20 ring-2 ring-primary/15 p-28 sm:p-32 md:p-36 transition-all duration-300 group ${
          isDragActive
            ? 'border-primary bg-primary/10 scale-[1.03] shadow-primary/30'
            : 'hover:border-primary/70 hover:shadow-2xl hover:bg-gradient-to-br hover:from-primary/8 hover:via-background hover:to-primary/4'
        } ${isLoading ? 'opacity-80 pointer-events-none' : ''}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.png,.jpg,.jpeg,.docx"
          onChange={handleChange}
          className="hidden"
          disabled={isLoading}
          aria-label="Upload document"
        />
        
        <button
          onClick={() => !isLoading && fileInputRef.current?.click()}
          disabled={isLoading}
          className="w-full cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl p-2"
        >
          <div className="flex flex-col items-center gap-5">
            <div className="rounded-2xl bg-primary/10 p-24 transition-all duration-300 group-hover:bg-primary/15">
              {isLoading ? (
                <div className="h-28 w-28 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              ) : (
                <Upload className={`h-28 w-28 text-primary transition-all duration-300 ${isDragActive ? 'translate-y-[-4px]' : ''}`} strokeWidth={1.5} />
              )}
            </div>
            <div className="text-center space-y-10">
              <h3 className="font-bold text-foreground text-6xl md:text-7xl tracking-tight">
                {isLoading ? 'Analyzing your form...' : 'Upload your form'}
              </h3>
              <p className="text-4xl font-semibold text-muted-foreground leading-relaxed">
                {isLoading ? 'Please wait while we process your document' : 'PDF, image, or scanned documents'}
              </p>
              <p className="text-3xl text-muted-foreground/80 leading-relaxed">
                {isLoading ? 'This can take longer for scanned files' : 'Drag and drop or click to browse (max 10MB)'}
              </p>
            </div>
            {isLoading && (
              <div className="w-32 h-1 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full animate-pulse" style={{ width: '60%' }} />
              </div>
            )}
          </div>
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-2">
          <p className="text-sm font-semibold text-red-700">Upload Error</p>
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Trust signal */}
      <div className="flex items-center gap-4 text-xl text-muted-foreground pt-6 justify-center">
        <Lock className="h-6 w-6 text-accent" />
        <span>Processed locally. Your data never leaves your device.</span>
      </div>
    </div>
  );
}
