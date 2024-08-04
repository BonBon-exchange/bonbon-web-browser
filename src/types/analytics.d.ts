export type EventParams =
  | { [key: string]: string | number | boolean }
  | undefined;

export type Event = (eventName: string, params?: EventParams) => void;

export type Page = (pageName: string, params?: EventParams) => void;
