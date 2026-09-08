export interface Mail {
  id: string;
  threadId: string | null | undefined;
  subject: string;
  sender: string;
  recipient: string;
  body: string;
  status: 'read' | 'unread';
  labels: string[];
  createdAt: string;
  categories?: string[] | null;
  category?: string | null;
  priority?: string[] | null;
  priority_score?: number | null;
  confidence_score?: number | null;
  versions?: number[] | null;
  retry_count?: number | null;
  summary?: string | null;
  description?: string;
}

export interface EmailAnalysisResult {
  id: string;
  threadId: string;
  summary?: string | null;
  category?: string | null;
  priority_score: number;
  confidence_score: number;
  versions: number[];
  retry_count: number;
}


export interface CloudQueryOptions {
  provider?: string;
  unread: boolean;
  days: number;
  count: number;
  important: boolean;
  starred: boolean;
}

export interface DatabaseQueryOptions {
  count: number;
  sessionUserId: string
}

export type FetchOptions = CloudQueryOptions;

export interface AnalyzeOptions extends CloudQueryOptions {
  store: boolean;
}

export interface LoadOptions{
  count: number;
  sessionUserId: string
}

export interface AnalyzeCheckRequest {
  mails: Mail[];
  store: boolean;
}

export interface AnalyzeRunPayload {
  mails: Mail[];
  options: AnalyzeOptions;
}

export interface AnalysisModel {
  id: string;
  provider: string;
  name: string;
  default: boolean;
  settingId?: string;
}
