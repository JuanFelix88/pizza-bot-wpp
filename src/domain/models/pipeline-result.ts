import { Pipeline } from './pipeline'

interface PipelineOptions {
  userStateChanged?: boolean;
  contextCreated?: boolean;
  error?: any;
}

export class PipelineResult implements Pipeline.Result {
  public userStateChanged?: boolean;
  public contextCreated?: boolean;
  public error?: any;

  constructor (public processed: boolean, {
    userStateChanged,
    contextCreated,
    error
  }: PipelineOptions = {}) {
    this.userStateChanged = userStateChanged
    this.contextCreated = contextCreated
    this.error = error
  }
}
