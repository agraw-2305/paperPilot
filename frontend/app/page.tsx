'use client';

import { useState } from 'react';
import { Header } from '@/components/header';
import { UploadCard } from '@/components/upload-card';
import { FormProcessor } from '@/components/form-processor';

interface AnalysisData {
  filename: string;
  saved_as: string;
  extraction_method: string;
  action_overview: string;
  total_steps: number;
  mandatory: number;
  optional: number;
  steps: Array<{
    id: number;
    title: string;
    required: boolean;
    risk: 'low' | 'medium' | 'high';
    risk_reason: string;
    remediation_tip: string;
    what_to_do: string;
    fields: Array<{ label: string; tip: string; suggested_answer?: string }>;
    companion: string;
  }>;
}

export default function Home() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = async (file: File) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('file', file);

      const backendBase = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000';

      let response: Response;
      try {
        response = await fetch(`${backendBase}/upload/analyze`, {
          method: 'POST',
          body: formData,
        });
      } catch {
        response = await fetch('/api/analyze', {
          method: 'POST',
          body: formData,
        });
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.error || errorData.detail || 'Failed to analyze document');
        setIsLoading(false);
        return;
      }

      const data = await response.json();
      setAnalysisData(data);
      setUploadedFile(file);
    } catch (err) {
      console.error('[v0] Error analyzing file:', err);
      setError('Failed to analyze document. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    setUploadedFile(null);
    setAnalysisData(null);
    setError(null);
  };

  const handleLogoClick = () => {
    setUploadedFile(null);
    setAnalysisData(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onLogoClick={handleLogoClick} />

      {isLoading && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-background/60 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4 bg-card border border-border rounded-2xl px-8 py-6 shadow-2xl">
            <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <div className="text-center space-y-1">
              <p className="text-sm font-medium text-foreground">Analyzing your document...</p>
              <p className="text-xs text-muted-foreground max-w-sm">
                This can take a few seconds for larger or scanned files. You can keep this tab open while we extract and explain all fields.
              </p>
            </div>
          </div>
        </div>
      )}

      <main className={uploadedFile ? 'w-full' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-16'}>
        {!uploadedFile ? (
          // Upload View
          <div className="min-h-[calc(100vh-10rem)] flex flex-col justify-center gap-14">
            <div className="text-center space-y-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground text-balance leading-tight">
                Paperwork, without the headache
              </h1>
              <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto text-pretty leading-relaxed">
                Upload any form and let AI explain each question and draft accurate answers.
                <br className="hidden md:block" />
                Perfect for visa, college, insurance, and legal documents.
              </p>
            </div>

            <div className="max-w-3xl mx-auto w-full space-y-6">
              <UploadCard onFileSelect={handleFileSelect} isLoading={isLoading} />

              <div className="rounded-xl border border-primary/20 bg-primary/5 px-6 py-5 text-left">
                <p className="text-xs font-bold tracking-widest text-foreground uppercase">What happens next:</p>
                <div className="mt-4 space-y-3 text-sm text-muted-foreground">
                  <div className="flex gap-3">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                    <p>Analyze all form fields and extract questions</p>
                  </div>
                  <div className="flex gap-3">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                    <p>Provide clear explanations for complex language</p>
                  </div>
                  <div className="flex gap-3">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                    <p>Generate AI-drafted answers you can edit</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="max-w-5xl mx-auto">
              <h2 className="text-xs font-semibold text-muted-foreground mb-12 text-center uppercase tracking-widest">
                How it works
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="group rounded-xl border border-border bg-card p-7 space-y-4 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 cursor-default">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0 group-hover:bg-accent/15 transition-colors duration-300">
                      <span className="text-xs font-bold text-accent">01</span>
                    </div>
                    <h3 className="font-semibold text-foreground text-sm">
                      Extract fields
                    </h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    We analyze your document and identify all form fields and questions automatically.
                  </p>
                </div>
                <div className="group rounded-xl border border-primary/20 bg-card p-7 space-y-4 ring-1 ring-primary/10 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 cursor-default">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/15 transition-colors duration-300">
                      <span className="text-xs font-bold text-primary">02</span>
                    </div>
                    <h3 className="font-semibold text-foreground text-sm">
                      Explain clearly
                    </h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Complex wording is translated into simple, plain language so you understand what's being asked.
                  </p>
                </div>
                <div className="group rounded-xl border border-border bg-card p-7 space-y-4 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 cursor-default">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0 group-hover:bg-accent/15 transition-colors duration-300">
                      <span className="text-xs font-bold text-accent">03</span>
                    </div>
                    <h3 className="font-semibold text-foreground text-sm">
                      Draft answers
                    </h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    AI generates thoughtful answers you can review, edit, and finalize before submitting.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Processing View
          <div className="h-[calc(100vh-4rem)]">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-2">
                <p className="text-sm font-semibold text-red-700">Error</p>
                <p className="text-sm text-red-600">{error}</p>
                <button
                  onClick={handleBack}
                  className="text-sm font-medium text-red-700 hover:text-red-800 underline"
                >
                  Try again
                </button>
              </div>
            )}
            {uploadedFile && analysisData && (
              <FormProcessor
                fileName={uploadedFile.name}
                onBack={handleBack}
                file={uploadedFile}
                analysisData={analysisData!}
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
}
