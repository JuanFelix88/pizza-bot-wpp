export namespace Pipeline {
  export type Result = {
    processed: boolean;
    userStateChanged?: boolean;
    contextCreated?: boolean;
    error?: any;
  };
}
