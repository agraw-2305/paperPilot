'use client';

import React from "react"
import { useState } from 'react';
import { CheckCircle2, AlertCircle, ArrowLeft, Lightbulb, Zap, ChevronDown, LayoutList, PanelLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ProfessionalPDFViewer } from './professional-pdf-viewer';

interface Field {
  label: string;
  tip: string;
  suggested_answer?: string;
}

interface Step {
  id: number;
  title: string;
  required: boolean;
  risk: 'low' | 'medium' | 'high';
  risk_reason: string;
  remediation_tip: string;
  what_to_do: string;
  fields: Field[];
  companion: string;
}

interface Section {
  id: number;
  title: string;
  status: string;
  questions: string[];
}

interface FormProcessorProps {
  fileName: string;
  onBack: () => void;
  file?: File | null;
  analysisData?: {
    filename: string;
    action_overview: string;
    total_steps: number;
    mandatory: number;
    optional: number;
    steps: Step[];
    extraction_method?: string;
  };
}

export function FormProcessor({ fileName, onBack, file, analysisData }: FormProcessorProps) {
  const [selectedStepId, setSelectedStepId] = useState<number>(1);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [skippedSteps, setSkippedSteps] = useState<Set<number>>(new Set());
  const [expandedFields, setExpandedFields] = useState<Set<string>>(new Set());
  const [fieldNotes, setFieldNotes] = useState<Record<string, string>>({});
  const [draftedAnswers, setDraftedAnswers] = useState<Record<string, boolean>>({});
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [previewExpanded, setPreviewExpanded] = useState(true);
  const [reviewMode, setReviewMode] = useState(false);

  // Default fallback data for demo purposes
  const defaultData = {
    filename: 'form.pdf',
    action_overview: 'Document Analysis',
    total_steps: 0,
    mandatory: 0,
    optional: 0,
    steps: [],
  };

  const data = analysisData || defaultData;
  const currentStep = data.steps && data.steps.length > 0 ? data.steps.find(s => s.id === selectedStepId) : undefined;
  const progressPercentage = data.total_steps > 0 ? Math.round((completedSteps.size / data.total_steps) * 100) : 0;

  const stepIds = (data.steps || []).map((s) => s.id);
  const currentStepIndex = stepIds.indexOf(selectedStepId);

  const goToNextStep = () => {
    if (stepIds.length === 0) return;
    const next = currentStepIndex >= 0 ? stepIds[currentStepIndex + 1] : stepIds[0];
    if (next != null) {
      setSelectedStepId(next);
      return;
    }
    setSelectedStepId(stepIds[stepIds.length - 1]);
  };

  const handleSkipStep = () => {
    if (!currentStep) return;
    setSkippedSteps((prev) => new Set(prev).add(currentStep.id));
    setCompletedSteps((prev) => new Set(prev).add(currentStep.id));
    goToNextStep();
  };

  const handleSaveAndContinue = () => {
    if (!currentStep) return;
    setCompletedSteps((prev) => new Set(prev).add(currentStep.id));
    setSkippedSteps((prev) => {
      const next = new Set(prev);
      next.delete(currentStep.id);
      return next;
    });
    goToNextStep();
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'high': return 'high-priority';
      case 'medium': return 'medium-priority';
      case 'low': return 'low-priority';
      default: return '';
    }
  };

  const toggleFieldExpanded = (fieldLabel: string) => {
    setExpandedFields(prev => {
      const newSet = new Set(prev);
      if (newSet.has(fieldLabel)) {
        newSet.delete(fieldLabel);
      } else {
        newSet.add(fieldLabel);
      }
      return newSet;
    });
  };

  const toggleStepCompleted = (stepId: number) => {
    setCompletedSteps(prev => {
      const newSet = new Set(prev);
      if (newSet.has(stepId)) {
        newSet.delete(stepId);
      } else {
        newSet.add(stepId);
      }
      return newSet;
    });
  };

  const handleAutoFillStep = (stepId: number) => {
    const step = data.steps.find(s => s.id === stepId);
    if (!step) return;

    const newAnswers: Record<string, string> = {};
    step.fields.forEach((field, index) => {
      const fieldKey = `${stepId}-${index}`;
      newAnswers[fieldKey] =
        field.suggested_answer ||
        `Suggested: Please enter ${field.label.toLowerCase()} as per your official documents.`;
    });

    setAnswers(prev => ({ ...prev, ...newAnswers }));
    
    step.fields.forEach((_, index) => {
      const fieldKey = `${stepId}-${index}`;
      setDraftedAnswers(prev => ({ ...prev, [fieldKey]: true }));
    });
  };

  const handleDraftAnswer = (fieldKey: string, field?: Field) => {
    setDraftedAnswers((prev) => ({
      ...prev,
      [fieldKey]: !prev[fieldKey],
    }));
    if (!answers[fieldKey]) {
      setAnswers((prev) => ({
        ...prev,
        [fieldKey]:
          field?.suggested_answer ||
          'Suggested: Provide accurate details matching your official documents.',
      }));
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-border bg-card shadow-sm">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="gap-2 h-9 px-3 text-muted-foreground hover:text-foreground hover:bg-muted/40"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div className="border-l-2 border-primary pl-4">
            <h1 className="font-bold text-foreground text-lg">{data.action_overview}</h1>
            <p className="text-xs text-muted-foreground mt-0.5">{fileName}</p>
          </div>
        </div>
        
        {/* Progress Summary */}
        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-2">
            <Button
              variant={reviewMode ? 'default' : 'outline'}
              size="sm"
              onClick={() => setReviewMode((v) => !v)}
              className="gap-2 h-9 px-3"
            >
              <LayoutList className="h-4 w-4" />
              {reviewMode ? 'Step View' : 'Full Review'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPreviewExpanded((v) => !v)}
              className="gap-2 h-9 px-3 lg:hidden"
            >
              <PanelLeft className="h-4 w-4" />
              {previewExpanded ? 'Hide Preview' : 'Show Preview'}
            </Button>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold text-foreground uppercase font-semibold">Progress</p>
            <p className="text-lg font-bold text-foreground">{progressPercentage}%</p>
          </div>
          <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all duration-300" style={{ width: `${progressPercentage}%` }} />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px_minmax(0,1fr)]">
          {/* PDF/Document Preview */}
          <div className="hidden lg:block border-r border-border bg-secondary/10">
            <div className="h-full p-4">
              <ProfessionalPDFViewer file={file || null} currentStepId={selectedStepId} />
            </div>
          </div>

          {/* Steps Column */}
          <div className="hidden lg:flex flex-col border-r border-border bg-card">
            <div className="px-4 py-4 border-b border-border">
              <h3 className="text-xs font-bold text-foreground uppercase tracking-widest">Form Steps</h3>
              <p className="text-xs text-muted-foreground mt-2">Click a section to review.</p>
            </div>
            <div className="flex-1 overflow-auto p-4 space-y-2">
              {data.steps.map((step) => (
                <button
                  key={step.id}
                  onClick={() => {
                    setReviewMode(false);
                    setSelectedStepId(step.id);
                  }}
                  className={`w-full text-left px-3 py-2.5 rounded-lg border transition-all text-xs font-medium group ${
                    selectedStepId === step.id
                      ? 'bg-primary text-white border-primary shadow-md'
                      : 'bg-background border-border text-foreground hover:border-primary/40 hover:bg-muted/50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`h-4 w-4 rounded-full flex items-center justify-center flex-shrink-0 ${
                      completedSteps.has(step.id)
                        ? 'bg-accent'
                        : selectedStepId === step.id
                          ? 'bg-white/20'
                          : 'border border-current opacity-50'
                    }`}>
                      {completedSteps.has(step.id) && <CheckCircle2 className="h-3 w-3" />}
                    </div>
                    <div className="min-w-0">
                      <div className="truncate text-xs">{step.title}</div>
                      <div className={`text-[10px] mt-0.5 ${
                        selectedStepId === step.id ? 'text-white/80' : 'text-muted-foreground'
                      }`}>
                        {skippedSteps.has(step.id) ? 'Skipped' : step.required ? 'Required' : 'Optional'}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Right Panel - Fields */}
          <div className="flex flex-col overflow-hidden">
            {/* Mobile Preview + Steps */}
            <div className="lg:hidden border-b border-border bg-card">
              <div className="p-3 flex items-center justify-between">
                <div className="text-xs font-bold text-foreground uppercase tracking-widest">Form Steps</div>
                <div className="flex items-center gap-2">
                  <Button
                    variant={reviewMode ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setReviewMode((v) => !v)}
                    className="h-8 px-2.5 text-xs gap-1.5"
                  >
                    <LayoutList className="h-3.5 w-3.5" />
                    {reviewMode ? 'Steps' : 'Review'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPreviewExpanded((v) => !v)}
                    className="h-8 px-2.5 text-xs gap-1.5"
                  >
                    <PanelLeft className="h-3.5 w-3.5" />
                    {previewExpanded ? 'Hide' : 'Preview'}
                  </Button>
                </div>
              </div>

              {previewExpanded && (
                <div className="px-3 pb-3">
                  <div className="h-[45vh]">
                    <ProfessionalPDFViewer file={file || null} currentStepId={selectedStepId} />
                  </div>
                </div>
              )}

              <div className="px-3 pb-3">
                <div className="flex gap-2 overflow-x-auto">
                  {data.steps.map((step) => (
                    <button
                      key={step.id}
                      onClick={() => {
                        setReviewMode(false);
                        setSelectedStepId(step.id);
                      }}
                      className={`whitespace-nowrap px-3 py-2 rounded-lg border text-xs font-semibold transition-all ${
                        selectedStepId === step.id
                          ? 'bg-primary text-white border-primary'
                          : 'bg-background text-foreground border-border'
                      }`}
                    >
                      {step.title}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Form Content */}
            <div className="flex-1 overflow-auto p-6 bg-background">
              {currentStep ? (
                <div className="space-y-6 max-w-3xl">
                  {reviewMode ? (
                    <div className="space-y-6">
                      {data.steps.map((step) => (
                        <div key={step.id} className="rounded-xl border border-border bg-card p-5">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <h3 className="text-base font-bold text-foreground">{step.title}</h3>
                              <p className="text-xs text-muted-foreground mt-1">{step.fields.length} fields • {step.required ? 'Required' : 'Optional'}</p>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setReviewMode(false);
                                setSelectedStepId(step.id);
                              }}
                              className="h-8 px-3 text-xs"
                            >
                              Open
                            </Button>
                          </div>
                          <div className="mt-4 space-y-3">
                            {step.fields.map((field, index) => {
                              const fieldKey = `${step.id}-${index}`;
                              return (
                                <div key={fieldKey} className="rounded-lg border border-border bg-background p-3">
                                  <div className="text-sm font-semibold text-foreground">{field.label}</div>
                                  <div className="text-xs text-muted-foreground mt-1">{field.tip}</div>
                                  <textarea
                                    value={answers[fieldKey] || ''}
                                    onChange={(e) => setAnswers((prev) => ({ ...prev, [fieldKey]: e.target.value }))}
                                    placeholder={`Enter ${field.label.toLowerCase()}...`}
                                    className="mt-3 w-full px-3 py-2.5 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none shadow-sm"
                                    rows={2}
                                  />
                                  <div className="mt-2">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleDraftAnswer(fieldKey, field)}
                                      className="h-8 px-3 text-xs gap-2"
                                    >
                                      <Zap className="h-3.5 w-3.5" />
                                      AI Suggestion
                                    </Button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}

                      <div className="pt-2 flex gap-3">
                        <Button
                          variant="outline"
                          className="flex-1 h-10 font-semibold hover:bg-muted/50 bg-transparent"
                          onClick={onBack}
                        >
                          Back
                        </Button>
                        <Button
                          className="flex-1 h-10 bg-primary hover:bg-primary/90 text-white font-semibold"
                          onClick={() => {
                            data.steps.forEach((s) => {
                              setCompletedSteps((prev) => new Set(prev).add(s.id));
                            });
                          }}
                        >
                          Mark All Reviewed
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Step Header */}
                      <div className="space-y-5 pb-6 border-b border-border">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="h-8 w-1 bg-gradient-to-b from-primary to-accent rounded-full" />
                              <h2 className="text-2xl font-bold text-foreground">{currentStep.title}</h2>
                            </div>
                            <p className="text-sm text-muted-foreground ml-4">{currentStep.fields.length} fields • <span className={currentStep.required ? 'text-destructive font-semibold' : 'text-primary'}>{currentStep.required ? 'Required' : 'Optional'}</span></p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleAutoFillStep(currentStep.id)}
                              className="gap-2 text-xs h-9 px-3 hover:bg-primary/10 hover:border-primary"
                            >
                              <Zap className="h-4 w-4" />
                              Auto-fill
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => toggleStepCompleted(currentStep.id)}
                              className={`gap-2 text-xs h-9 px-3 ${completedSteps.has(currentStep.id) ? 'bg-accent hover:bg-accent/90 text-white' : 'bg-primary hover:bg-primary/90 text-white'}`}
                            >
                              <CheckCircle2 className="h-4 w-4" />
                              {completedSteps.has(currentStep.id) ? 'Done' : 'Mark Done'}
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Risk Assessment */}
                      <div className={`rounded-lg border-l-4 p-4 space-y-3 ${getRiskColor(currentStep.risk)}`}>
                        <div className="flex items-start gap-3">
                          <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <p className="text-xs font-bold uppercase tracking-wide">Risk Level: {currentStep.risk}</p>
                            <p className="text-sm mt-2 leading-relaxed">{currentStep.risk_reason}</p>
                            <div className="mt-3 pt-3 border-t border-current border-opacity-20">
                              <p className="text-xs font-semibold">💡 Tip: {currentStep.remediation_tip}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Companion Message */}
                      <div className="rounded-lg bg-gradient-to-r from-primary/8 to-accent/5 border border-primary/15 p-4 flex gap-3">
                        <Lightbulb className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-foreground leading-relaxed">{currentStep.companion}</p>
                      </div>

                      {/* Fields */}
                      <div className="space-y-3 mt-6">
                        {currentStep.fields.map((field, index) => {
                          const fieldKey = `${currentStep.id}-${index}`;
                          const isExpanded = expandedFields.has(fieldKey);

                          return (
                            <div key={fieldKey}>
                              <button
                                onClick={() => toggleFieldExpanded(fieldKey)}
                                className={`w-full text-left px-4 py-3 rounded-lg border transition-all group ${
                                  isExpanded 
                                    ? 'border-primary/50 bg-primary/5 shadow-sm' 
                                    : 'border-border bg-card hover:border-primary/30 hover:bg-muted/30'
                                }`}
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex-1">
                                    <h4 className="text-sm font-semibold text-foreground">{field.label}</h4>
                                  </div>
                                  <ChevronDown
                                    className={`h-4 w-4 text-muted-foreground transition-transform flex-shrink-0 group-hover:text-primary ${
                                      isExpanded ? 'rotate-180' : ''
                                    }`}
                                  />
                                </div>
                              </button>
                              
                              {isExpanded && (
                                <div className="mt-3 ml-1 pl-4 border-l-2 border-primary space-y-3">
                                  <div className="bg-primary/5 border border-primary/10 rounded-lg p-3">
                                    <p className="text-xs text-foreground/70 leading-relaxed italic">{field.tip}</p>
                                  </div>
                                  <textarea
                                    value={answers[fieldKey] || ''}
                                    onChange={(e) => setAnswers(prev => ({ ...prev, [fieldKey]: e.target.value }))}
                                    placeholder={`Enter ${field.label.toLowerCase()}...`}
                                    className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none shadow-sm"
                                    rows={3}
                                  />
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleDraftAnswer(fieldKey, field)}
                                    className="gap-2 w-full justify-center text-xs h-9 hover:bg-accent/10 hover:border-accent hover:text-accent"
                                  >
                                    <Zap className="h-3.5 w-3.5" />
                                    {draftedAnswers[fieldKey] ? 'Remove suggestion' : 'AI Suggestion'}
                                  </Button>
                                  {draftedAnswers[fieldKey] && (
                                    <p className="text-xs font-semibold text-accent">✓ Suggestion applied</p>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Action Footer */}
                      <div className="mt-8 pt-6 border-t border-border flex gap-3">
                        <Button
                          variant="outline"
                          className="flex-1 h-10 font-semibold hover:bg-muted/50 bg-transparent"
                          onClick={handleSkipStep}
                        >
                          Skip this step
                        </Button>
                        <Button
                          className="flex-1 h-10 bg-primary hover:bg-primary/90 text-white font-semibold"
                          onClick={handleSaveAndContinue}
                        >
                          Save & Continue
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center space-y-4 py-12">
                  <h3 className="font-semibold text-foreground">Loading form data</h3>
                  <p className="text-xs text-muted-foreground">Analyzing your document...</p>
                  <div className="flex justify-center">
                    <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
