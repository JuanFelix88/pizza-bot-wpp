namespace VerifyMessageTag {
  export type Result = boolean;
}

class VerifyMessageTag {
  public testMessage (data: string): VerifyMessageTag.Result {
    if (!/^#/.test(data)) return false
    return true
  }
}

export const verifyMessageTag = new VerifyMessageTag()
