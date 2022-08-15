export type Bookmark = {
  id: number;
  url: string;
  name: string;
  domain: string;
  host: string;
  tags?: string[];
};

export type DomainSuggestion = {
  id: number;
  url: string;
  domain: string;
};

export type Provider = 'Chrome' | 'Edge' | 'Brave';
