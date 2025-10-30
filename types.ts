
export enum ApplicationStatus {
  Discovery = 'Discovery Hub',
  Applied = 'Applied',
  Interview = 'Interview Center',
  Offer = 'Offer',
  Rejected = 'Rejected',
}

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  url: string;
  logo: string;
}

export interface Application extends Job {
  status: ApplicationStatus;
  fitAnalysis?: FitAnalysis;
  generatedContent?: GeneratedContent;
}

export interface FitAnalysis {
  fitScore: number;
  summary: string;
  pros: string[];
  cons: string[];
}

export interface GeneratedContent {
  coverLetter?: string;
  resumeBullets?: string;
  outreachPitch?: string;
  interviewPrep?: { questions: { type: string; question: string; tip: string }[] };
}

export interface Message {
  role: 'user' | 'model';
  text: string;
  sources?: { uri: string; title: string; }[];
}

export interface DashboardFiltersState {
  status: string;
  company: string;
  location: string;
}