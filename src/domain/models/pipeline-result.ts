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
  public restartPipeline?: boolean;

  public setRestartPipeline (test: boolean) {
    this.restartPipeline = test
  }

  constructor (public processed: boolean, {
    userStateChanged,
    contextCreated,
    error
  }: PipelineOptions = {}) {
    this.userStateChanged = userStateChanged
    this.contextCreated = contextCreated
    this.error = error
  }

  static bypass (userStateChanged: boolean = false): PipelineResult {
    return new PipelineResult(false, { userStateChanged })
  }

  static stopPropagation (userStateChanged: boolean = false): PipelineResult {
    return new PipelineResult(true, { userStateChanged })
  }

  static restartPipeline (userStateChanged: boolean = false): PipelineResult {
    const pipeline = new PipelineResult(true, { userStateChanged })
    pipeline.setRestartPipeline(true)
    return pipeline
  }
}
