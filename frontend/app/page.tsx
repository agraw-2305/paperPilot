'use client';

import { useState } from 'react';
import { Header } from '@/components/header';
import { UploadCard } from '@/components/upload-card';
import { FormProcessor } from '@/components/form-processor';
import {
  FileSearch,
  Sparkles,
  CheckCircle2,
  Languages,
  ShieldCheck,
  ScanLine,
  Eye,
  CheckSquare,
  FileText,
} from 'lucide-react';

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

  const fetchWithTimeout = async (url: string, init: RequestInit, timeoutMs: number) => {
    const controller = new AbortController();

    const ms = Number.isFinite(timeoutMs) && timeoutMs > 0 ? timeoutMs : 180_000;
    const timeoutId = setTimeout(() => controller.abort('timeout'), ms);
    try {
      return await fetch(url, { ...init, signal: controller.signal });
    } catch (err: any) {
      if (err?.name === 'AbortError') {
        throw new Error('TIMEOUT');
      }
      throw err;
    } finally {
      clearTimeout(timeoutId);
    }
  };

  const handleFileSelect = async (file: File) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const buildFormData = () => {
        const fd = new FormData();
        fd.append('file', file);
        return fd;
      };

      const backendBase = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000';
      const timeoutMs = 180_000;

      let response: Response;
      try {
        response = await fetchWithTimeout(
          `${backendBase}/upload/analyze`,
          {
            method: 'POST',
            body: buildFormData(),
          },
          timeoutMs
        );
      } catch (err: any) {
        if (err?.message === 'TIMEOUT' || err?.name === 'AbortError') {
          throw err;
        }
        response = await fetchWithTimeout(
          '/api/analyze',
          {
            method: 'POST',
            body: buildFormData(),
          },
          timeoutMs
        );
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
      if ((err as any)?.message === 'TIMEOUT' || (err as any)?.name === 'AbortError') {
        setError('Analysis timed out. Please try again, or use a smaller/clearer file.');
      } else {
        setError('Failed to analyze document. Please try again.');
      }
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
    <div className="min-h-screen bg-background relative background-gradient-effect">
      {/* Unique floating shapes effect */}
      <div className="floating-shapes">
        <div className="floating-shape floating-shape-1" />
        <div className="floating-shape floating-shape-2" />
        <div className="floating-shape floating-shape-3" />
        <div className="floating-shape floating-shape-4" />
      </div>
      {/* Abstract PDF watermark background for professional look */}
      <svg
        className="pointer-events-none fixed left-0 top-0 w-full h-full z-0"
        aria-hidden="true"
        focusable="false"
        style={{ opacity: 0.08 }}
      >
        <g>
          {/* Abstract PDF icon watermark, repeated and rotated for elegance */}
          <g transform="translate(12%, 18%) rotate(-8)">
            <rect width="60" height="80" rx="10" fill="#1E40AF" opacity="0.13" />
            <rect x="10" y="18" width="40" height="6" rx="2" fill="#1E40AF" opacity="0.18" />
            <rect x="10" y="32" width="30" height="6" rx="2" fill="#1E40AF" opacity="0.12" />
          </g>
          <g transform="translate(70%, 30%) rotate(7)">
            <rect width="50" height="70" rx="9" fill="#0F766E" opacity="0.11" />
            <rect x="8" y="16" width="30" height="5" rx="2" fill="#0F766E" opacity="0.16" />
            <rect x="8" y="28" width="22" height="5" rx="2" fill="#0F766E" opacity="0.10" />
          </g>
          <g transform="translate(30%, 75%) rotate(-5)">
            <rect width="70" height="50" rx="12" fill="#64748B" opacity="0.09" />
            <rect x="12" y="12" width="40" height="5" rx="2" fill="#64748B" opacity="0.13" />
            <rect x="12" y="24" width="30" height="5" rx="2" fill="#64748B" opacity="0.09" />
          </g>
        </g>
      </svg>
      <Header onLogoClick={handleLogoClick} />

      {isLoading && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-background/60 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-6 bg-card border border-border rounded-3xl px-16 py-12 shadow-2xl">
            <div className="h-12 w-12 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <div className="text-center space-y-3">
              <p className="text-2xl font-semibold text-foreground">Analyzing your document...</p>
              <p className="text-lg text-muted-foreground max-w-md">
                This can take a few seconds for larger or scanned files. You can keep this tab open while we extract and explain all fields.
              </p>
            </div>
          </div>
        </div>
      )}

      <main className={uploadedFile ? 'w-full relative z-10' : 'w-full relative z-10'}>
        {!uploadedFile ? (
          // Upload View - Full screen
          <div className="min-h-screen flex flex-col">
            {/* Full width quote section */}
            <section className="w-full bg-secondary/30 border-b border-border">
              <div className="w-full px-6 py-12 text-center">
                <p className="text-4xl font-semibold text-foreground max-w-6xl mx-auto leading-relaxed">
                  Built for high-stakes paperwork — visas, college applications, insurance claims, and more.
                </p>
              </div>
            </section>

            {/* Centered upload section */}
            <section className="flex-1 flex items-center justify-center py-20">
              <div className="w-full max-w-5xl px-4">
                <div className="text-center mb-16">
                  <h1 className="text-7xl sm:text-8xl lg:text-9xl font-black text-foreground text-balance leading-tight mb-8">
                    Paperwork, without any 
                    <span className="text-primary"> headache</span>
                  </h1>
                  <p className="text-2xl sm:text-3xl font-medium text-muted-foreground max-w-5xl mx-auto text-pretty leading-relaxed">
                      ~ Upload any form and get a clear, step-by-step explanation of every field - plus draft answers you can review and edit.
                  </p>
                </div>
                
                <div className="rounded-3xl bg-gradient-to-br from-primary/5 via-primary/3 to-accent/3 border border-primary/20 shadow-2xl shadow-primary/10 p-3">
                  <UploadCard onFileSelect={handleFileSelect} isLoading={isLoading} />
                </div>
              </div>
            </section>

            {/* Value grid - full width */}
            <section className="w-full px-6 py-24 bg-card/50">
              <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
                  <div className="rounded-3xl border border-border bg-card p-14 transition-all duration-300 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/15 hover:scale-[1.03]">
                    <div className="flex items-start gap-8">
                      <div className="h-24 w-24 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Languages className="h-12 w-12 text-primary" />
                      </div>
                      <div>
                        <div className="text-4xl font-bold text-foreground tracking-tight leading-tight">No confusing language</div>
                        <div className="text-3xl font-semibold text-muted-foreground mt-4 leading-relaxed">Plain-English explanations for form questions.</div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-border bg-card p-14 transition-all duration-300 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/15 hover:scale-[1.03]">
                    <div className="flex items-start gap-8">
                      <div className="h-24 w-24 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <CheckSquare className="h-12 w-12 text-primary" />
                      </div>
                      <div>
                        <div className="text-4xl font-bold text-foreground tracking-tight leading-tight">Fewer mistakes</div>
                        <div className="text-3xl font-semibold text-muted-foreground mt-4 leading-relaxed">Catch missing or incorrect fields before submission.</div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-border bg-card p-14 transition-all duration-300 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/15 hover:scale-[1.03]">
                    <div className="flex items-start gap-8">
                      <div className="h-24 w-24 rounded-2xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                        <ShieldCheck className="h-12 w-12 text-accent" />
                      </div>
                      <div>
                        <div className="text-4xl font-bold text-foreground tracking-tight leading-tight">Local & private</div>
                        <div className="text-3xl font-semibold text-muted-foreground mt-4 leading-relaxed">Your documents stay on your device.</div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-border bg-card p-14 transition-all duration-300 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/15 hover:scale-[1.03]">
                    <div className="flex items-start gap-8">
                      <div className="h-24 w-24 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <ScanLine className="h-12 w-12 text-primary" />
                      </div>
                      <div>
                        <div className="text-4xl font-bold text-foreground tracking-tight leading-tight">Works with scans</div>
                        <div className="text-3xl font-semibold text-muted-foreground mt-4 leading-relaxed">Upload photos, scans, or PDFs.</div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-border bg-card p-14 transition-all duration-300 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/15 hover:scale-[1.03]">
                    <div className="flex items-start gap-8">
                      <div className="h-24 w-24 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Eye className="h-12 w-12 text-primary" />
                      </div>
                      <div>
                        <div className="text-4xl font-bold text-foreground tracking-tight leading-tight">Review before submit</div>
                        <div className="text-3xl font-semibold text-muted-foreground mt-4 leading-relaxed">Nothing is auto-filled without your approval.</div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-border bg-card p-14 transition-all duration-300 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/15 hover:scale-[1.03]">
                    <div className="flex items-start gap-8">
                      <div className="h-24 w-24 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <FileText className="h-12 w-12 text-primary" />
                      </div>
                      <div>
                        <div className="text-4xl font-bold text-foreground tracking-tight leading-tight">Built for real forms</div>
                        <div className="text-3xl font-semibold text-muted-foreground mt-4 leading-relaxed">Visa, college, insurance and other types of forms.</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* How it works - full width */}
            <section className="w-full px-6 py-24">
              <div className="max-w-7xl mx-auto text-center">
                <h2 className="text-2xl font-bold text-muted-foreground mb-12 uppercase tracking-widest">
                  How it works
                </h2>

                <div className="relative">
                  <div className="hidden md:block absolute left-8 right-8 top-6 h-px bg-border" />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                    <div className="relative rounded-3xl border border-border bg-card p-14">
                      <div className="flex items-center gap-8">
                        <div className="h-24 w-24 rounded-2xl bg-primary/10 flex items-center justify-center">
                          <FileSearch className="h-12 w-12 text-primary" />
                        </div>
                        <div>
                          <div className="text-lg font-bold text-muted-foreground">Step 01</div>
                          <h3 className="text-4xl font-bold text-foreground">Extract fields</h3>
                        </div>
                      </div>
                      <p className="text-3xl font-semibold text-muted-foreground leading-relaxed mt-8">Find the exact fields to fill.</p>
                    </div>

                    <div className="relative rounded-3xl border border-border bg-card p-14">
                      <div className="flex items-center gap-8">
                        <div className="h-24 w-24 rounded-2xl bg-accent/10 flex items-center justify-center">
                          <Sparkles className="h-12 w-12 text-accent" />
                        </div>
                        <div>
                          <div className="text-lg font-bold text-muted-foreground">Step 02</div>
                          <div className="text-4xl font-bold text-foreground">Explain clearly</div>
                        </div>
                      </div>
                      <p className="text-3xl font-semibold text-muted-foreground leading-relaxed mt-8">Plain-language guidance for each question.</p>
                    </div>

                    <div className="relative rounded-3xl border border-border bg-card p-14">
                      <div className="flex items-center gap-8">
                        <div className="h-24 w-24 rounded-2xl bg-primary/10 flex items-center justify-center">
                          <CheckCircle2 className="h-12 w-12 text-primary" />
                        </div>
                        <div>
                          <div className="text-lg font-bold text-muted-foreground">Step 03</div>
                          <h3 className="text-4xl font-bold text-foreground">Draft answers</h3>
                        </div>
                      </div>
                      <p className="text-3xl font-semibold text-muted-foreground leading-relaxed mt-8">Edit and finalize with confidence.</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Footer - full width */}
            <section className="w-full px-6 py-20 bg-card/50">
              <div className="w-full">
                <div className="rounded-3xl border border-border bg-card px-16 py-12 w-full">
                  <p className="text-3xl font-semibold text-muted-foreground text-center">Private by design. No sign-up required. Accurate results</p>
                </div>
              </div>
            </section>
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
