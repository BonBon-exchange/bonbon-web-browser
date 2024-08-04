export type Bookmark = {
  id: number;
  url: string;
  name: string;
  domain: string;
  host: string;
  tags?: string[];
};

export type Tag = {
  tag: string;
  inputValue?: string;
};

export type Provider = 'Chrome' | 'Edge' | 'Brave';
