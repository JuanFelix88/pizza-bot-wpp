class VerifyIsMessageComplements {
  private tests = [
    /(sabor(es)?|tamanho|muda|coloca|po(e|ê|ẽ)m?|quero mais|mais uma|adicio(n)?ar|acrescenta(r)?)/i,
    /Pizz?a [0-9]{1,3}/i
  ]

  public test (text: string): boolean {
    return !!this.tests.find(regex => regex.test(text))
  }
}

export const verifyIsMessageComplements = new VerifyIsMessageComplements()
