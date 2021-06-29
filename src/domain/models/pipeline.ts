export namespace Pipeline {
  export type Result = {
    processed: boolean;
    userStateChanged?: boolean;
    contextCreated?: boolean;
    restartPipeline?: boolean;
    error?: any;
  };
}
