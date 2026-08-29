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
  priority?: string[] | null;
  summary?: string;
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
  name: string;
  displayName: string;
  model: string;
  logo?: string | null;
}
