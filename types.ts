
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
}

export interface Message {
  role: 'user' | 'model';
  text: string;
}
