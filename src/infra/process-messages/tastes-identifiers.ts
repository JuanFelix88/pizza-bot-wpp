import { createRegexp } from '@/shared/helpers/create-regexp.helper'

class TastesIdentifiers {
  public tastesMap: TastesIdentifiers.TasteMap[] = [
    [1, 'Strogonoff de Carne'],
    [2, 'Strogonoff de Frango'],
    [3, 'Mignon Suíno'],
    [4, 'Seis Queijos'],
    [5, 'Canadense'],
    [6, 'Frango com Catupiri'],
    [7, 'Frango com Cheddar'],
    [8, 'Cinco Queijos'],
    [9, 'Italiana'],
    [10, 'Bacon'],
    [11, 'Calabresa com Catupiri'],
    [12, 'Cheddar'],
    [13, 'Catupiri'],
    [14, 'Presunto e Queijo'],
    [15, 'Calabresa']
  ]

  private tastesAdaptersMessageMap:TastesIdentifiers.TastesAdaptersMap[] = [
    [12, /frang(o)? ((com|de) )?ch(e){1,2}(d){1,2}a(r)?/ig],
    [13, /(frang(o)? ((com|de) )?catup(i|y)r(i|y)?|calabr(e)?s(a)? ((com|de) )?catup(i|y)r(i|y)?)/ig],
    [15, /calabr(e)?s(a)? ((com|de) )?catup(i|y)r(i|y)?/ig]
  ]

  public tastesTestsMap: TastesIdentifiers.TasteTestsMap[] = [
    [1, /(s|is|es)trog(g)?o(nof(f|e|i|fi|fe))? (de )?carne/i],
    [2, /(s|is|es)trog(g)?o(nof(f|e|i|fi|fe))? (de )?frang(o)?/i],
    [3, /m(i|y)(gnon|nhom|nhon) (de )?su(í|i)n(o)?/i],
    [4, /(sei(s|z)|6) queijo(s)?/i],
    [5, /can(n)?ad(d)?en(s|z)(e)?/i],
    [6, /frang(o)? ((com|de) )?catup(i|y)r(i|y)?/i],
    [7, /frang(o)? ((com|de) )?ch(e){1,2}(d){1,2}a(r)?/i],
    [8, /(cinco(s)?|5) queijo(s)?/i],
    [9, /(i|y)tal(i|y)an(a)?(s)?/i],
    [10, /b(a|e)(c){1,2}o(n){0,2}/i],
    [11, /calabr(e)?s(a)? ((com|de) )?catup(i|y)r(i|y)?/i],
    [12, /ch(e){1,2}(d){1,2}a(r)?/i],
    [13, /^(?!.*frang(o)? ((com|de) )?|calabr(e)?s(a)? ((com|de) )?).*catup(i|y)r(i|y)?/i],
    [14, /presunt(o)? ((e|de|com) )?queij(o)?/i],
    [15, /calabr(e)?s(a)?/i]
  ]

  private adaptMessage (message: string, numberTaste: number): string {
    for (const [itemNumb, messageAdapt] of this.tastesAdaptersMessageMap) {
      if (numberTaste !== itemNumb) continue
      message = message.replace(messageAdapt, '')
    }
    return message
  }

  public getTasteNameByNumber (n: number): string | undefined {
    return this.tastesMap.find(([itemNumb]) => itemNumb === n)?.[1]
  }

  /**
   *  Remembering that the message should already be broken by
   * single pizza orders
   */
  public getTastesNumbersByMessage (message: string): number[] {
    const { tastesTestsMap: tastesMap } = this

    return tastesMap.filter(([numberTaste, testTaste]) => {
      const adaptedMessage = this.adaptMessage(message, numberTaste)

      // eslint-disable-next-line no-useless-escape
      const regexNumberTaste = createRegexp(` (0)?${numberTaste}(\s|$)`)
      const hasTasteNumber = regexNumberTaste.test(adaptedMessage)
      const hasMentionTaste = testTaste.test(adaptedMessage)

      return hasTasteNumber || hasMentionTaste
    }).map(([numberTaste]) => numberTaste)
  }
}

export namespace TastesIdentifiers {
  export type TasteTestsMap = [number, RegExp];
  export type TasteMap = [number, string];
  export type Price = number;
  export type TastesAdaptersMap = [number, RegExp]
}

export const tastesIdentifiers = new TastesIdentifiers()
