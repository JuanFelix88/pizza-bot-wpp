class VerifyIsMessageComplements {
  private tests = [
    /(sabor(es)?|quero mais|mais uma|adicio(n)?ar|acrescenta(r)?)/i,
    /(Pizz?a [0-9]{1,3})/ig
  ]

  public test (string: string): boolean {
    return !!this.tests.find(regex => regex.test(string))
  }
}

export const verifyIsMessageComplements = new VerifyIsMessageComplements()
