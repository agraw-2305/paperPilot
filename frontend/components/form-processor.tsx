'use client';

import React, { useRef, useState } from 'react';
import { ChevronDown, ChevronLeft, LayoutList, PanelLeft, AlertCircle, Lightbulb, CheckCircle2, Upload, FileText, Zap, ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ProfessionalPDFViewer } from './professional-pdf-viewer';

/* =========================
   Types
========================= */

interface Field {
  name?: string;
  label: string;
  tip?: string;
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

/* =========================
   Helper: AI fallback suggestions
========================= */
function getDefaultSuggestion(label: string): string {
  const l = label.toLowerCase();

  if (l.includes('bank name')) return 'Enter the bank’s full name as printed on your passbook/cheque (example: State Bank of India).';
  if (l.includes('branch')) return 'Enter the branch name and city as per your bank records (example: MG Road, Bengaluru).';
  if (l.includes('ifsc')) return 'Enter the 11‑digit IFSC exactly as shown (example: HDFC0000123).';
  if (l.includes('account')) return 'Enter your bank account number exactly as shown in your passbook (do not mask digits).';
  if (l.includes('full name') || l === 'name' || l.endsWith(' name')) return 'Enter your full legal name exactly as on government ID (no nicknames, no initials only).';
  if (l.includes('email')) return 'Use a working email you can access; include the domain (example: name@example.com).';
  if (l.includes('phone') || l.includes('mobile')) return 'Include country code and use digits only (example: +91 9876543210).';
  if (l.includes('address')) return 'Write: House/Flat number, Street, Area/Locality, City, State, PIN Code, Country.';
  if (l.includes('dob') || l.includes('date of birth')) return 'Use the exact format shown on the form (commonly DD/MM/YYYY or YYYY-MM-DD).';
  if (l.includes('passport')) return 'Enter your passport number without spaces (example: A1234567).';
  if (l.includes('pan')) return 'Enter in ABCDE1234F format (10 characters, no spaces).';
  if (l.includes('ssn')) return 'Enter as XXX-XX-XXXX (9 digits).';
  if (l.includes('nationality')) return 'Enter your nationality (example: Indian).';
  if (l.includes('occupation') || l.includes('job')) return 'Enter your current occupation (example: Software Engineer).';
  if (l.includes('income') || l.includes('salary')) return 'Enter the amount in numbers only (example: 850000).';
  if (l.includes('signature')) return 'Type your full name as it should appear as a signature, or upload an image if requested.';

  if (l.includes('nominee') && l.includes('name')) return 'Enter the full name of the person you wish to nominate (matching their ID).';
  if (l.includes('nominee')) return 'Enter the nominee details exactly as requested on the form.';
  if (l.includes('father') && l.includes('name')) return 'Enter your father’s full legal name as per official records.';
  if (l.includes('mother') && l.includes('name')) return 'Enter your mother’s full legal name as per official records.';
  if (l.includes('guardian') && l.includes('name')) return 'Enter your guardian’s full legal name as per official records.';
  if (l.includes('spouse') && l.includes('name')) return 'Enter your spouse’s full legal name as per official records.';
  if (l.includes('relation')) return 'Specify the relationship (example: Father, Mother, Spouse, Guardian).';
  if (l.includes('employer') && l.includes('name')) return 'Enter your employer’s full legal name as per your appointment letter.';
  if (l.includes('company') && l.includes('name')) return 'Enter the company’s full legal name (example: ABC Technologies Pvt. Ltd.).';

  if (l.includes('gender')) return 'Select your gender as per your official ID (Male/Female/Other).';
  if (l.includes('marital')) return 'Select your current marital status (Single/Married/Divorced/Widowed).';
  if (l.includes('country')) return 'Enter the country name (example: India).';
  if (l.includes('state')) return 'Enter the state name (example: Karnataka).';
  if (l.includes('city')) return 'Enter the city name (example: Bengaluru).';
  if (l.includes('pin') || l.includes('postal') || l.includes('zip')) return 'Enter the postal/ZIP code (example: 560001).';

  if (l.includes('age')) return 'Enter your age in completed years (example: 28).';
  if (l.includes('age proof')) return 'Attach a document proving your age (birth certificate, school leaving certificate, or Aadhaar).';
  if (l.includes('photo') || l.includes('photograph')) return 'Upload a recent passport-size color photo with a plain white background.';
  if (l.includes('id proof') || l.includes('identity proof')) return 'Attach a government-issued photo ID (Aadhaar, PAN, passport, voter ID, or driving license).';
  if (l.includes('address proof')) return 'Attach a recent document showing your current address (utility bill, bank statement, or rent agreement).';
  if (l.includes('signature')) return 'Upload a clear signature in black ink on white paper, or type your full name if digital.';
  if (l.includes('dob proof') || l.includes('date of birth proof')) return 'Attach a document showing your date of birth (birth certificate, 10th marksheet, or Aadhaar).';
  if (l.includes('income proof') || l.includes('salary proof')) return 'Attach recent salary slips, Form 16, or bank statements showing income credits.';
  if (l.includes('experience')) return 'Enter total years of relevant experience (example: 4 years).';
  if (l.includes('qualification') || l.includes('education')) return 'Enter your highest qualification and field (example: B.E. Computer Science).';
  if (l.includes('category') || l.includes('caste')) return 'Select your category as per government records (General/OBC/SC/ST/EWS).';
  if (l.includes('religion')) return 'Select your religion as per official records (example: Hindu, Muslim, Christian, Sikh, Other).';
  if (l.includes('blood group')) return 'Enter your blood group (example: O+, A-, AB+).';
  if (l.includes('emergency') && l.includes('contact')) return 'Enter an emergency contact number with country code (example: +91 9876543210).';
  if (l.includes('reference') || l.includes('referee')) return 'Enter a reference name and contact (if required).';
  if (l.includes('declaration') || l.includes('undertaking')) return 'Type the declaration exactly as given, or check the box to agree.';
  if (l.includes('witness')) return 'Enter the witness’s full name and signature (if required).';
  if (l.includes('place')) return 'Enter the city/place where you are filling the form (example: Bengaluru).';
  if (l.includes('date') && !l.includes('birth')) return 'Enter today’s date in the format shown on the form (example: 29/01/2026).';

  return 'Fill as requested on the form.';
}

function isCheckboxField(field: Field): boolean {
  const raw = `${field.label} ${field.tip ?? ''}`.toLowerCase();
  // Keywords indicating a checkbox/tick option
  const checkboxKeywords = [
    'i agree',
    'agree',
    'consent',
    'declaration',
    'undertaking',
    'acknowledge',
    'confirm',
    'yes/no',
    'tick',
    'check',
    'accept',
    'approve',
    'certify',
  ];
  return checkboxKeywords.some(k => raw.includes(k)) || /\b(yes|no)\b/i.test(raw);
}

function extractChoiceOptions(field: Field): string[] {
  const raw = `${field.label} ${field.tip ?? ''}`.toLowerCase();

  if (raw.includes('gender')) {
    return ['Male', 'Female', 'Other'];
  }

  const options: string[] = [];

  // Common patterns like (M/F), (M / F), Male/Female, Yes/No, etc.
  const parenMatch = raw.match(/\(([^)]{1,40})\)/g);
  if (parenMatch) {
    for (const m of parenMatch) {
      const inner = m.replace(/[()]/g, '');
      const parts = inner.split(/\s*\/\s*|\s*,\s*|\s*\|\s*/g).filter(Boolean);
      for (const p of parts) {
        const cleaned = p.trim();
        if (!cleaned) continue;
        if (cleaned.length > 20) continue;
        options.push(cleaned);
      }
    }
  }

  const slashMatch = raw.match(/\b(yes|no|male|female|other)\b\s*\/\s*\b(yes|no|male|female|other)\b/g);
  if (slashMatch) {
    for (const s of slashMatch) {
      const parts = s.split('/').map((x: string) => x.trim());
      options.push(...parts);
    }
  }

  const normalized = Array.from(
    new Set(
      options
        .map((o: string) => o.replace(/[^a-z0-9 ]/gi, '').trim())
        .filter(Boolean)
        .map((o: string) => (o.length <= 3 ? o.toUpperCase() : o[0].toUpperCase() + o.slice(1)))
    )
  );

  // Clean up short option sets
  if (normalized.length >= 2 && normalized.length <= 6) return normalized;
  return [];
}

function isInformationalField(field: Field): boolean {
  const raw = `${field.label} ${field.tip ?? ''}`.toLowerCase();
  const keywords = [
    'terms',
    'condition',
    'declaration',
    'disclaimer',
    'privacy',
    'consent',
    'agreement',
    'acknowledg',
    'instruction',
    'instructions',
    'note',
    'read',
    'please read',
    'i agree',
    'acc open',
    'account opening',
    'rules',
    'no fill',
    'not fillable',
    'information only',
    'for reference',
    'guidelines',
  ];

  if (keywords.some((k) => raw.includes(k))) return true;

  // Heuristics: long “legal/theory” sentences should not be treated as fillable
  const looksLikeDeclaration =
    raw.includes('hereby') ||
    raw.includes('declare') ||
    raw.includes('undertake') ||
    raw.includes('agree') ||
    raw.includes('acknowledge') ||
    raw.includes('shall') ||
    raw.includes('liability') ||
    raw.includes('responsible') ||
    raw.includes('read and understood') ||
    raw.includes('i/we') ||
    raw.includes('we ') ||
    raw.includes('you ') ||
    raw.includes('the applicant');

  if (looksLikeDeclaration && raw.length > 80) return true;

  // If tip is very long and not a clear field instruction, treat as info
  if (field.tip && field.tip.length > 140 && !raw.includes('enter') && !raw.includes('fill')) return true;

  return false;
}

function sanitizeSuggestionForField(field: Field, suggestion: string): string {
  const options = extractChoiceOptions(field);
  if (options.length > 0) {
    const s = (suggestion || '').toLowerCase();
    const match = options.find((o) => o.toLowerCase() === s);
    if (match) return match;
    const fuzzy = options.find((o) => s.includes(o.toLowerCase()) || o.toLowerCase().includes(s));
    if (fuzzy) return fuzzy;
    return options[0];
  }

  // Avoid obviously bad short junk for sensitive labels
  const l = field.label.toLowerCase();
  if (l.includes('gender') || l.includes('sex')) return 'Male';

  return suggestion;
}

function shouldShowRequirementLabel(step: Step): boolean {
  const haystack = [
    step.title,
    step.what_to_do,
    step.companion,
    step.risk_reason,
    step.remediation_tip,
    ...(step.fields || []).map((f) => `${f.label} ${f.tip}`),
  ]
    .join(' ')
    .toLowerCase();

  const explicit = /\b(required|optional|mandatory|must|compulsory|required field|optional field)\b/.test(haystack);
  return explicit;
}

function getFieldGuide(field: Field): { title: string; lines: string[]; template?: string } | null {
  const raw = `${field.label} ${field.tip ?? ''}`.toLowerCase();
  const lines: string[] = [];

  if (raw.includes('date of birth') || raw.includes('dob') || (raw.includes('date') && raw.includes('birth'))) {
    return {
      title: 'Date of birth',
      template: 'YYYY-MM-DD (example: 1998-04-21)',
      lines: [
        'Write the date in numbers only. Use 4-digit year.',
        'If the form uses DD/MM/YYYY, follow that exactly.',
      ],
    };
  }

  if (raw.includes('date') && !raw.includes('birth')) {
    return {
      title: 'Date',
      template: 'YYYY-MM-DD (example: 2026-01-29)',
      lines: [
        'Follow the form’s date format. If unclear, use YYYY-MM-DD.',
        'Avoid ambiguous formats like 01/02/03.',
      ],
    };
  }

  if (raw.includes('address')) {
    return {
      title: 'Address',
      template: 'House/Flat, Street, Area, City, State/Province, Postal Code, Country',
      lines: [
        'Include house/flat + street + city + state + postal code.',
        'If “current” and “permanent” are separate, don’t mix them.',
      ],
    };
  }

  if (raw.includes('full name') || raw === 'name' || raw.endsWith(' name')) {
    return {
      title: 'Name',
      lines: [
        'Use full name (no nicknames). Keep the same spelling everywhere.',
        'If there are separate First/Middle/Last name boxes, split accordingly.',
      ],
    };
  }

  if (raw.includes('passport')) {
    return {
      title: 'Passport number',
      lines: [
        'Enter without spaces (example: A1234567).',
        'Double-check 0/O and 1/I mistakes.',
      ],
    };
  }

  if (raw.includes('pan')) {
    return {
      title: 'PAN',
      lines: [
        'Format: ABCDE1234F (10 characters).',
        'Use uppercase letters and digits only.',
      ],
    };
  }

  if (raw.includes('aadhar') || raw.includes('aadhaar')) {
    return {
      title: 'Aadhaar',
      lines: [
        'Enter 12 digits (example: 123412341234).',
        'Do not add spaces unless the form shows spaces.',
      ],
    };
  }

  if (raw.includes('email')) {
    return {
      title: 'Email',
      template: 'name@example.com',
      lines: [
        'Use a working email (OTP/updates come here).',
        'Check spelling of the domain (gmail.com, outlook.com, etc.).',
      ],
    };
  }

  if (raw.includes('phone') || raw.includes('mobile')) {
    return {
      title: 'Phone number',
      template: '+91 9876543210',
      lines: [
        'Include country code. Use digits only.',
        'Avoid spaces/dashes unless the form format shows them.',
      ],
    };
  }

  if (raw.includes('pin') || raw.includes('postal') || raw.includes('zip')) {
    return {
      title: 'Postal/ZIP code',
      template: '560001',
      lines: [
        'Enter the code for your area (example: 560001).',
        'Do not add extra text or spaces unless shown.',
      ],
    };
  }

  if (raw.includes('age')) {
    return {
      title: 'Age',
      template: '28',
      lines: [
        'Enter your age in completed years.',
        'If asked for age proof, attach birth certificate or school certificate.',
      ],
    };
  }

  if (raw.includes('age proof')) {
    return {
      title: 'Age proof',
      lines: [
        'Attach a document that proves your age.',
        'Examples: birth certificate, school leaving certificate, Aadhaar.',
      ],
    };
  }

  if (raw.includes('photo') || raw.includes('photograph')) {
    return {
      title: 'Photograph',
      lines: [
        'Upload a recent passport-size color photo.',
        'Plain background, face clearly visible.',
      ],
    };
  }

  if (raw.includes('id proof') || raw.includes('identity proof')) {
    return {
      title: 'ID proof',
      lines: [
        'Attach a government-issued photo ID.',
        'Examples: Aadhaar, PAN, passport, voter ID, driving license.',
      ],
    };
  }

  if (raw.includes('address proof')) {
    return {
      title: 'Address proof',
      lines: [
        'Attach a recent document showing your current address.',
        'Examples: utility bill, bank statement, rent agreement.',
      ],
    };
  }

  if (raw.includes('income proof') || raw.includes('salary proof')) {
    return {
      title: 'Income proof',
      lines: [
        'Attach recent salary slips, Form 16, or bank statements.',
        'Make sure your name and income are clearly visible.',
      ],
    };
  }

  if (raw.includes('experience')) {
    return {
      title: 'Experience',
      template: '4 years',
      lines: [
        'Enter total years of relevant experience.',
        'If asked for proof, attach offer letters or experience certificates.',
      ],
    };
  }

  if (raw.includes('qualification') || raw.includes('education')) {
    return {
      title: 'Qualification',
      template: 'B.E. Computer Science',
      lines: [
        'Enter your highest qualification and field.',
        'If asked for proof, attach degree certificates or marksheets.',
      ],
    };
  }

  if (raw.includes('category') || raw.includes('caste')) {
    return {
      title: 'Category',
      lines: [
        'Select your category as per government records.',
        'Options: General/OBC/SC/ST/EWS.',
      ],
    };
  }

  if (raw.includes('blood group')) {
    return {
      title: 'Blood group',
      template: 'O+',
      lines: [
        'Enter your blood group (A+, A-, B+, B-, AB+, AB-, O+, O-).',
        'If unsure, check a medical report or donor card.',
      ],
    };
  }

  if (raw.includes('emergency') && raw.includes('contact')) {
    return {
      title: 'Emergency contact',
      template: '+91 9876543210',
      lines: [
        'Enter a contact number for emergencies.',
        'Include country code. Use digits only.',
      ],
    };
  }

  if (raw.includes('nominee') && raw.includes('name')) {
    return {
      title: 'Nominee name',
      lines: [
        'Enter the full name of the person you wish to nominate.',
        'Ensure spelling matches their ID documents.',
      ],
    };
  }

  if (raw.includes('father') && raw.includes('name')) {
    return {
      title: 'Father’s name',
      lines: [
        'Enter your father’s full name as per official records.',
        'Avoid abbreviations; use the exact spelling.',
      ],
    };
  }

  if (raw.includes('mother') && raw.includes('name')) {
    return {
      title: 'Mother’s name',
      lines: [
        'Enter your mother’s full name as per official records.',
        'Avoid abbreviations; use the exact spelling.',
      ],
    };
  }

  if (raw.includes('spouse') && raw.includes('name')) {
    return {
      title: 'Spouse’s name',
      lines: [
        'Enter your spouse’s full name as per official records.',
        'Avoid abbreviations; use the exact spelling.',
      ],
    };
  }

  if (raw.includes('relation')) {
    return {
      title: 'Relationship',
      template: 'Father',
      lines: [
        'Specify the relationship to the person (if asked).',
        'Examples: Father, Mother, Spouse, Guardian.',
      ],
    };
  }

  if (raw.includes('place')) {
    return {
      title: 'Place',
      template: 'Bengaluru',
      lines: [
        'Enter the city/place where you are filling the form.',
        'Use the same spelling as on your documents.',
      ],
    };
  }

  if (raw.includes('date') && !raw.includes('birth')) {
    return {
      title: 'Date',
      template: '2026-01-29',
      lines: [
        'Enter today’s date in the format shown on the form.',
        'If unclear, use YYYY-MM-DD.',
      ],
    };
  }

  if (raw.includes('ifsc')) {
    return {
      title: 'IFSC',
      lines: [
        'IFSC is 11 characters (example: HDFC0000123).',
        'Copy it exactly (0 is a zero, not O).',
      ],
    };
  }

  if (raw.includes('bank') && raw.includes('name')) {
    return {
      title: 'Bank name',
      template: 'State Bank of India',
      lines: [
        'Enter your bank’s full name as printed on your passbook/cheque.',
        'Avoid abbreviations (use “State Bank of India”, not “SBI”).',
      ],
    };
  }

  if (raw.includes('branch')) {
    return {
      title: 'Branch',
      template: 'MG Road, Bengaluru',
      lines: [
        'Enter the branch name and city as per your bank records.',
        'Example: MG Road, Bengaluru.',
      ],
    };
  }

  if (raw.includes('account') && raw.includes('number')) {
    return {
      title: 'Account number',
      lines: [
        'Enter your bank account number exactly as shown.',
        'Do not mask or omit any digits.',
      ],
    };
  }

  if (raw.includes('gender')) {
    return {
      title: 'Gender',
      lines: [
        'Select your gender as per your official ID.',
        'Options: Male, Female, Other.',
      ],
    };
  }

  if (raw.includes('marital')) {
    return {
      title: 'Marital status',
      lines: [
        'Select your current marital status.',
        'Options: Single, Married, Divorced, Widowed.',
      ],
    };
  }

  if (raw.includes('nationality')) {
    return {
      title: 'Nationality',
      template: 'Indian',
      lines: [
        'Enter your nationality as per official records.',
        'Example: Indian, USA, etc.',
      ],
    };
  }

  if (raw.includes('religion')) {
    return {
      title: 'Religion',
      lines: [
        'Select your religion as per official records.',
        'Examples: Hindu, Muslim, Christian, Sikh, Other.',
      ],
    };
  }

  if (raw.includes('declaration') || raw.includes('undertaking')) {
    return {
      title: 'Declaration',
      lines: [
        'Type the declaration exactly as given in the form.',
        'If there is a checkbox, check it to agree.',
      ],
    };
  }

  if (raw.includes('income') || raw.includes('salary')) {
    return {
      title: 'Income',
      template: 'Numbers only (example: 350000)',
      lines: [
        'Enter the amount in numbers only (no “p”, “/-”, or words).',
        'If asked for proof, attach salary slips or Form 16.',
      ],
    };
  }

  return null;
}

/* =========================
   Component
========================= */

export function FormProcessor({
  fileName,
  onBack,
  file,
  analysisData,
}: FormProcessorProps) {
  const [selectedStepId, setSelectedStepId] = useState<number>(1);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [skippedSteps, setSkippedSteps] = useState<Set<number>>(new Set());
  const [expandedFields, setExpandedFields] = useState<Set<string>>(new Set());
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [draftedAnswers, setDraftedAnswers] = useState<Record<string, boolean>>({});
  const [previewExpanded, setPreviewExpanded] = useState(true);
  const [reviewMode, setReviewMode] = useState(false);

  const signatureInputRef = useRef<HTMLInputElement | null>(null);
  const [signaturePreview, setSignaturePreview] = useState<string | null>(null);
  const [signatureFile, setSignatureFile] = useState<File | null>(null);

  const [isGeneratingGuide, setIsGeneratingGuide] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const data = analysisData || {
    filename: fileName,
    action_overview: 'Document Analysis',
    total_steps: 0,
    mandatory: 0,
    optional: 0,
    steps: [],
  };

  const stepIds = data.steps.map((s) => s.id);
  const currentStepIndex = stepIds.indexOf(selectedStepId);
  const currentStep = data.steps.find((s) => s.id === selectedStepId);

  const hasPdfFieldNames = data.steps.some((s) => s.fields.some((f) => !!f?.name));
  const progressPercentage =
    data.total_steps > 0
      ? Math.round((completedSteps.size / data.total_steps) * 100)
      : 0;

  /* =========================
     Handlers
  ========================= */

  const toggleFieldExpanded = (key: string) => {
    setExpandedFields((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const handleDraftAnswer = (fieldKey: string, field?: Field) => {
    setDraftedAnswers((prev) => ({
      ...prev,
      [fieldKey]: !prev[fieldKey],
    }));

    if (!answers[fieldKey]) {
      const f = field;
      const rawSuggestion =
        f?.suggested_answer || getDefaultSuggestion(f?.label || '');

      setAnswers((prev) => ({
        ...prev,
        [fieldKey]:
          f ? sanitizeSuggestionForField(f, rawSuggestion) : rawSuggestion,
      }));
    }
  };

  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSignatureFile(file);

    const url = URL.createObjectURL(file);
    setSignaturePreview(url);
  };

  const handleGenerateGuide = async () => {
    if (!data || !data.steps.length) return;
    setIsGeneratingGuide(true);
    try {
      const lines: string[] = [];
      lines.push(`Guide to Fill: ${data.action_overview || fileName}`);
      lines.push(`Generated on: ${new Date().toLocaleDateString()}`);
      lines.push('');
      lines.push('---');
      lines.push('');

      data.steps.forEach((step, idx) => {
        lines.push(`${idx + 1}. ${step.title}`);
        lines.push(`   ${step.companion || ''}`);
        lines.push('');
        step.fields.forEach((field) => {
          lines.push(`   • ${field.label}`);
          if (field.tip) lines.push(`     Guidance: ${field.tip}`);
          if (field.suggested_answer) lines.push(`     Suggested: ${field.suggested_answer}`);
          lines.push('');
        });
        lines.push('---');
        lines.push('');
      });

      const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${fileName.replace(/\.[^.]+$/, '')}_guide.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } finally {
      setIsGeneratingGuide(false);
    }
  };

  const handleDownloadFilledPdf = async () => {
    if (!file || !analysisData) return;

    try {
      setIsDownloading(true);

      const backendBase = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000';

      const fieldData: Record<string, string> = {};
      for (const step of data.steps) {
        step.fields.forEach((f, index) => {
          if (!f?.name) return;
          const key = `${step.id}-${index}`;
          const value = (answers[key] || '').trim();
          if (!value) return;
          fieldData[f.name] = value;
        });
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('data', JSON.stringify(fieldData));
      if (signatureFile) formData.append('signature', signatureFile);

      const res = await fetch(`${backendBase}/upload/fill`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        throw new Error('Failed to generate filled PDF');
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `filled_${fileName}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } finally {
      setIsDownloading(false);
    }
  };

  const goToNextStep = () => {
    if (stepIds.length === 0) return;
    const next = currentStepIndex >= 0 ? stepIds[currentStepIndex + 1] : stepIds[0];
    if (next != null) {
      setSelectedStepId(next);
      return;
    }
    setSelectedStepId(stepIds[stepIds.length - 1]);
  };

  const toggleStepCompleted = (stepId: number) => {
    setCompletedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(stepId)) next.delete(stepId);
      else next.add(stepId);
      return next;
    });
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

  const getRiskColor = (risk: Step['risk']) => {
    switch (risk) {
      case 'high':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'medium':
        return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'low':
        return 'text-green-600 bg-green-50 border-green-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  /* =========================
     UI
  ========================= */

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b bg-card">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div className="border-l-2 border-primary pl-4 hidden sm:block">
            <h1 className="font-bold text-foreground text-4xl">{data.action_overview}</h1>
            <p className="text-xl text-muted-foreground mt-1">{fileName}</p>
          </div>
        </div>

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
            <p className="text-xl font-bold text-foreground uppercase font-semibold">Progress</p>
            <p className="text-4xl font-bold text-foreground">{progressPercentage}%</p>
          </div>
          <div className="w-48 h-3 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all duration-300" style={{ width: `${progressPercentage}%` }} />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_520px_minmax(0,1fr)]">
          {/* PDF/Document Preview */}
          <div className="hidden lg:block border-r border-border bg-secondary/10">
            <div className="h-full p-4">
              <ProfessionalPDFViewer file={file || null} currentStepId={selectedStepId} />
            </div>
          </div>

          {/* Steps Column */}
          <div className="hidden lg:flex flex-col border-r border-border bg-card">
            <div className="px-6 py-6 border-b border-border">
              <h3 className="text-2xl font-bold text-foreground uppercase tracking-widest">Form Steps</h3>
              <p className="text-xl text-muted-foreground mt-2">Click a section to review.</p>
            </div>
            <div className="flex-1 overflow-auto p-6 space-y-4">
              {data.steps.map((step) => (
                <button
                  key={step.id}
                  onClick={() => {
                    setReviewMode(false);
                    setSelectedStepId(step.id);
                  }}
                  className={`w-full text-left px-5 py-5 rounded-2xl border transition-all text-3xl font-semibold group ${
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
                      {completedSteps.has(step.id) && <CheckCircle2 className="h-3.5 w-3.5" />}
                    </div>
                    <div className="min-w-0">
                      <div className="truncate text-3xl">{step.title}</div>
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
              <div className="p-4 flex items-center justify-between">
                <div className="text-xl font-bold text-foreground uppercase tracking-widest">Form Steps</div>
                <div className="flex items-center gap-3">
                  <Button
                    variant={reviewMode ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setReviewMode((v) => !v)}
                    className="h-10 px-4 text-xl font-semibold gap-2"
                  >
                    <LayoutList className="h-4 w-4" />
                    {reviewMode ? 'Steps' : 'Review'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPreviewExpanded((v) => !v)}
                    className="h-10 px-4 text-xl font-semibold gap-2"
                  >
                    <PanelLeft className="h-4 w-4" />
                    {previewExpanded ? 'Hide' : 'Preview'}
                  </Button>
                </div>
              </div>

              {previewExpanded && (
                <div className="px-4 pb-4">
                  <div className="h-[45vh]">
                    <ProfessionalPDFViewer file={file || null} currentStepId={selectedStepId} />
                  </div>
                </div>
              )}

              <div className="px-4 pb-4">
                <div className="flex gap-3 overflow-x-auto">
                  {data.steps.map((step) => (
                    <button
                      key={step.id}
                      onClick={() => {
                        setReviewMode(false);
                        setSelectedStepId(step.id);
                      }}
                      className={`whitespace-nowrap px-4 py-3 rounded-lg border text-xl font-semibold transition-all ${
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
            <div className="flex-1 overflow-auto p-12 bg-background">
              {currentStep ? (
                <div className="space-y-10 max-w-none">
                  {reviewMode ? (
                    <div className="space-y-10">
                      {data.steps.map((step) => (
                        <div key={step.id} className="rounded-xl border border-border bg-card p-6">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <h3 className="text-3xl font-bold text-foreground">{step.title}</h3>
                              <p className="text-xl text-muted-foreground mt-2">
                                {step.fields.length} fields
                              </p>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setReviewMode(false);
                                setSelectedStepId(step.id);
                              }}
                              className="h-10 px-4 text-xl font-semibold"
                            >
                              Open
                            </Button>
                          </div>
                          <div className="mt-6 space-y-4">
                            {step.fields.map((field, index) => {
                              const fieldKey = `${step.id}-${index}`;
                              return (
                                <div key={fieldKey} className="rounded-lg border border-border bg-background p-4">
                                  <div className="text-2xl font-semibold text-foreground">{field.label}</div>
                                  <div className="text-xl text-muted-foreground mt-2">{field.tip}</div>
                                  <textarea
                                    value={answers[fieldKey] || ''}
                                    onChange={(e) => setAnswers((prev) => ({ ...prev, [fieldKey]: e.target.value }))}
                                    placeholder={`Enter ${field.label.toLowerCase()}...`}
                                    className="mt-4 w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground text-2xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none shadow-sm"
                                    rows={3}
                                  />
                                  <div className="mt-3">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleDraftAnswer(fieldKey, field)}
                                      className="h-10 px-4 text-xl font-semibold gap-2"
                                    >
                                      <Lightbulb className="h-4 w-4" />
                                      Guide Draft
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
                          className="flex-1 h-10 bg-primary hover:bg-primary/90 text-white text-2xl font-semibold"
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
                    <div className="space-y-8">
                      {/* Step Header */}
                      <div className="space-y-5 pb-6 border-b border-border">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="h-8 w-1 bg-gradient-to-b from-primary to-accent rounded-full" />
                              <h2 className="text-6xl font-bold text-foreground">{currentStep.title}</h2>
                            </div>
                            <p className="text-3xl text-muted-foreground ml-4">
                              {currentStep.fields.length} fields
                            </p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <Button
                              size="sm"
                              onClick={() => toggleStepCompleted(currentStep.id)}
                              className={`gap-2 text-lg h-14 px-6 font-semibold ${completedSteps.has(currentStep.id) ? 'bg-accent hover:bg-accent/90 text-white' : 'bg-primary hover:bg-primary/90 text-white'}`}
                            >
                              <CheckCircle2 className="h-4 w-4" />
                              {completedSteps.has(currentStep.id) ? 'Done' : 'Mark Done'}
                            </Button>
                          </div>
                        </div>
                      </div>

                      {(() => {
                        const indexed = currentStep.fields.map((f, originalIndex) => ({ field: f, originalIndex }));
                        const fillableFields = indexed.filter(({ field }) => !isInformationalField(field));
                        const infoFields = indexed.filter(({ field }) => isInformationalField(field));
                        const isLastStep = currentStepIndex === stepIds.length - 1;

                        return (
                          <div className="grid grid-cols-1 xl:grid-cols-[1fr_520px] gap-10">
                            {/* Fillable */}
                            <div>
                              <div className="space-y-6">
                                <h3 className="text-2xl font-bold text-foreground">Fill these fields</h3>
                                <div className="space-y-5">
                                  {fillableFields.length === 0 ? (
                                    <div className="rounded-2xl border border-border bg-card p-6">
                                      <div className="text-2xl font-semibold text-foreground">No fillable fields detected in this step.</div>
                                      <div className="text-lg text-muted-foreground mt-2">Use the Info & Guidance panel to review the instructions/terms.</div>
                                    </div>
                                  ) : null}

                                  {fillableFields.map(({ field, originalIndex }) => {
                                    const key = `${currentStep.id}-${originalIndex}`;
                                    const expanded = expandedFields.has(key);
                                    const isSignature = field.label.toLowerCase().includes('signature');
                                    const options = extractChoiceOptions(field);
                                    const isCheckbox = isCheckboxField(field);
                                    const value = answers[key] || '';

                                    return (
                                      <div key={key} className="rounded-2xl border border-border bg-card overflow-hidden">
                                        <button
                                          className="w-full px-6 py-5 text-left font-semibold flex items-center justify-between"
                                          onClick={() => toggleFieldExpanded(key)}
                                        >
                                          <div className="min-w-0">
                                            <div className="truncate text-2xl text-foreground">{field.label}</div>
                                            <div className="text-sm text-muted-foreground mt-2">
                                              {draftedAnswers[key] ? 'AI draft added' : 'Tap to view guidance'}
                                            </div>
                                          </div>
                                          <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform ${expanded ? 'rotate-180' : ''}`} />
                                        </button>

                                        {expanded && (
                                          <div className="px-6 pb-6 space-y-5">
                                            {field.tip ? (
                                              <p className="text-3xl text-muted-foreground leading-relaxed">{field.tip}</p>
                                            ) : null}

                                            {(() => {
                                              const guide = getFieldGuide(field);
                                              if (!guide) return null;
                                              return (
                                                <div className="rounded-xl border border-primary/20 bg-primary/5 px-6 py-5">
                                                  <div className="flex items-start gap-4">
                                                    <Lightbulb className="h-7 w-7 text-primary flex-shrink-0 mt-1" />
                                                    <div className="min-w-0">
                                                      <div className="text-3xl font-bold text-foreground">{guide.title} guide</div>
                                                      {guide.template ? (
                                                        <div className="text-2xl text-muted-foreground mt-2">Format: {guide.template}</div>
                                                      ) : null}
                                                      <div className="mt-3 space-y-2">
                                                        {guide.lines.map((line, i) => (
                                                          <div key={`${key}-guide-${i}`} className="text-2xl text-foreground leading-relaxed">{line}</div>
                                                        ))}
                                                      </div>
                                                    </div>
                                                  </div>
                                                </div>
                                              );
                                            })()}

                                            {isSignature ? (
                                              <>
                                                <input
                                                  type="file"
                                                  ref={signatureInputRef}
                                                  hidden
                                                  onChange={handleSignatureUpload}
                                                />
                                                <Button
                                                  variant="outline"
                                                  onClick={() => signatureInputRef.current?.click()}
                                                  className="h-14 px-6 text-lg font-semibold"
                                                >
                                                  Upload Signature
                                                </Button>
                                                {signaturePreview && (
                                                  <img
                                                    src={signaturePreview}
                                                    className="max-h-28 mt-2 border rounded"
                                                  />
                                                )}
                                              </>
                                            ) : isCheckbox ? (
                                              <div className="flex items-center gap-4">
                                                <input
                                                  type="checkbox"
                                                  checked={value === 'true' || value === 'checked'}
                                                  onChange={(e) => setAnswers((prev) => ({ ...prev, [key]: e.target.checked ? 'checked' : '' }))}
                                                  className="h-6 w-6 rounded border-border text-primary focus:ring-primary"
                                                />
                                                <label className="text-2xl text-foreground">
                                                  {field.label.includes('agree') || field.label.includes('consent') ? 'I agree' : 'Yes'}
                                                </label>
                                              </div>
                                            ) : options.length > 0 ? (
                                              <select
                                                value={sanitizeSuggestionForField(field, value || options[0])}
                                                onChange={(e) => setAnswers((prev) => ({ ...prev, [key]: e.target.value }))}
                                                className="w-full h-14 px-4 rounded-lg border border-border bg-background text-foreground text-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                              >
                                                {options.map((o) => (
                                                  <option key={o} value={o}>
                                                    {o}
                                                  </option>
                                                ))}
                                              </select>
                                            ) : (
                                              <textarea
                                                className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground text-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none shadow-sm"
                                                rows={3}
                                                value={value}
                                                onChange={(e) => setAnswers((prev) => ({ ...prev, [key]: e.target.value }))}
                                              />
                                            )}

                                            <Button
                                              size="sm"
                                              variant="outline"
                                              onClick={() => handleDraftAnswer(key, field)}
                                              className="h-20 px-8 text-3xl font-semibold gap-3"
                                            >
                                              <Zap className="h-5 w-5" />
                                              Guide Draft
                                            </Button>
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>

                              {/* Action Footer */}
                              <div className="mt-10 pt-8 border-t border-border flex gap-4">
                                <Button
                                  variant="outline"
                                  className="flex-1 h-14 text-3xl font-semibold hover:bg-muted/50 bg-transparent"
                                  onClick={handleSkipStep}
                                >
                                  Skip this step
                                </Button>
                                <Button
                                  className="gap-2 text-3xl h-14 px-6 hover:bg-primary/10 hover:border-primary font-semibold"
                                  onClick={handleSaveAndContinue}
                                >
                                  Save & Continue
                                </Button>
                              </div>

                              <div className="mt-6">
                                <Button
                                  variant="outline"
                                  className="w-full h-14 text-3xl font-semibold gap-3"
                                  onClick={handleGenerateGuide}
                                  disabled={!file || !analysisData || isGeneratingGuide}
                                >
                                  <FileText className="h-5 w-5" />
                                  {isGeneratingGuide ? 'Generating Guide…' : 'Generate Guide'}
                                </Button>
                                <div className="text-xl text-muted-foreground mt-2">
                                  Download a step-by-step guide to fill this form offline.
                                </div>
                              </div>
                            </div>

                            {/* Info */}
                            <aside className="rounded-2xl border border-border bg-card p-8 space-y-8">
                              <div>
                                <h3 className="text-4xl font-bold text-foreground">Info & Guidance</h3>
                                <p className="text-2xl text-muted-foreground mt-2">
                                  {currentStep.fields.length} items
                                </p>
                              </div>

                              <div className={`rounded-xl border p-6 space-y-3 ${getRiskColor(currentStep.risk)}`}>
                                <div className="flex items-start gap-3">
                                  <AlertCircle className="h-6 w-6 flex-shrink-0 mt-0.5" />
                                  <div className="flex-1">
                                    <p className="text-xl font-bold uppercase tracking-wide">Risk Level: {currentStep.risk}</p>
                                    <p className="text-2xl mt-2 leading-relaxed">{currentStep.risk_reason}</p>
                                    <div className="mt-4 pt-4 border-t border-current border-opacity-20">
                                      <p className="text-xl font-semibold">Tip: {currentStep.remediation_tip}</p>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className="rounded-xl bg-gradient-to-r from-primary/8 to-accent/5 border border-primary/15 p-6 flex gap-4">
                                <Lightbulb className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                                <p className="text-2xl text-foreground leading-relaxed">{currentStep.companion}</p>
                              </div>

                              {infoFields.length > 0 && (
                                <div className="space-y-4">
                                  <h4 className="text-2xl font-bold text-foreground">Terms / Declarations</h4>
                                  {infoFields.map(({ field }, i) => (
                                    <div key={`${currentStep.id}-info-${i}`} className="rounded-xl border border-border bg-background p-5">
                                      <div className="text-2xl font-semibold text-foreground">{field.label}</div>
                                      <div className="text-xl text-muted-foreground mt-2 leading-relaxed">{field.tip}</div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </aside>
                          </div>
                        );
                      })()}

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
