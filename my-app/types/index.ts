export type SearchTabMode = 'company' | 'lead' | 'domain';

export interface PresetTarget {
  id: string;
  name: string;
  domain: string;
  category: string;
  logo: string;
  description: string;
  icpScore: number;
}

export interface StepLog {
  id: string;
  stepName: string;
  status: 'completed' | 'in_progress' | 'pending' | 'failed';
  detail: string;
  duration?: string;
  timestamp: string;
}

export interface IntelligenceMetric {
  title: string;
  value: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  description: string;
  iconName: string;
}

export interface QuestionHook {
  id: string;
  category: 'Pain Point' | 'Value Proposition' | 'Qualifying Question' | 'Objection Handler';
  question: string;
  context: string;
  confidenceScore: number;
}

export interface DetectedTech {
  name: string;
  category: string;
  icon?: string;
  version?: string;
}

export interface ProspectLead {
  id: string;
  name: string;
  title: string;
  company: string;
  domain: string;
  email: string;
  phone: string;
  location: string;
  icpScore: number;
  status: 'Verified' | 'Enriched' | 'Contacted' | 'Hot Lead';
  techStack: string[];
  lastActivity: string;
  avatar: string;
}

export interface PlatformFeature {
  id: string;
  title: string;
  description: string;
  icon: string;
  tag: string;
  benefits: string[];
}
