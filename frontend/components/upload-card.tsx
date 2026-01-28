'use client';

import React from "react"
import { useState, useRef } from 'react';
import { Upload, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
    if (!validTypes.includes(file.type)) {
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
    <div className="space-y-4">
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`relative rounded-2xl border-2 border-dashed p-10 transition-all duration-300 group ${
          isDragActive
            ? 'border-primary bg-primary/5 shadow-lg scale-[1.02]'
            : 'border-border bg-card hover:border-primary/40 hover:shadow-lg hover:bg-muted/10 hover:scale-[1.01]'
        } ${isLoading ? 'opacity-60 pointer-events-none' : ''}`}
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
          className="w-full cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl p-4"
        >
          <div className="flex flex-col items-center gap-5">
            <div className="rounded-full bg-primary/10 p-5 transition-all duration-300 group-hover:scale-105 group-hover:bg-primary/15">
              {isLoading ? (
                <div className="h-7 w-7 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              ) : (
                <Upload className={`h-7 w-7 text-primary transition-all duration-300 ${isDragActive ? 'translate-y-[-6px]' : ''}`} strokeWidth={1.5} />
              )}
            </div>
            <div className="text-center space-y-2">
              <h3 className="font-semibold text-foreground text-base md:text-lg">
                {isLoading ? 'Analyzing your form...' : 'Upload your form'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {isLoading ? 'Please wait while we process your document' : 'Drag and drop your document here or click to browse'}
              </p>
              <p className="text-xs text-muted-foreground/80">
                Supports PDF, images, and Word documents (max 10MB)
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
      <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 justify-center">
        <Lock className="h-3 w-3 text-accent" />
        <span>Your files are secure and processed locally</span>
      </div>

      {/* Expectation-setting text */}
      <div className="bg-gradient-to-br from-primary/5 via-accent/5 to-transparent rounded-xl border border-primary/10 p-5 mt-6 space-y-3">
        <p className="text-xs font-semibold text-foreground uppercase tracking-wider">What happens next:</p>
        <ul className="text-sm text-muted-foreground space-y-2">
          <li className="flex items-start gap-2">
            <span className="text-accent font-bold mt-0.5">→</span>
            <span>Analyze all form fields and extract questions</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-accent font-bold mt-0.5">→</span>
            <span>Provide clear explanations for complex language</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-accent font-bold mt-0.5">→</span>
            <span>Generate AI-drafted answers you can edit</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
