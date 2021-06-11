class VerifyIsMessageComplements {
  private tests = [
    /(sabor(es)?|quero mais|mais uma|adicio(n)?ar|acrescenta(r)?)/i,
    /Pizz?a [0-9]{1,3}/i
  ]

  public test (text: string): boolean {
    return !!this.tests.find(regex => regex.test(text))
  }
}

export const verifyIsMessageComplements = new VerifyIsMessageComplements()
