export interface MessageCache {
  from: MessageCache.From;
  dataText: MessageCache.DataText;
  isCommand: boolean;
}

export namespace MessageCache {
  export type From = string;
  export type DataText = string;
}
