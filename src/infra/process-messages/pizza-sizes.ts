import { Order } from '@/domain/models/order'

class PizzaSizes {
  public sizesMap: PizzaSizes.SizeMap[] = [
    ['small', 'Broto'],
    ['medium', 'Média'],
    ['great', 'Grande'],
    ['big', 'Big']
  ]

  public pizzaSizesTestsMap: PizzaSizes.SizeTestMap[] = [
    ['small', /brot(o)?/i],
    ['medium', /m(é|e)di(o|a)?/i],
    ['great', /grand(e)?/i],
    ['big', /b(i|y)g/i]
  ];

  public getPizzaSizeByMessage (message: PizzaSizes.Message): PizzaSizes.Result {
    return this.pizzaSizesTestsMap.find(([, testSize]) => {
      return testSize.test(message)
    })?.[0]
  }

  public getSizeName (type: PizzaSizes.Type): string | undefined {
    return this.sizesMap.find(([item]) => type === item)?.[1]
  }
}

export namespace PizzaSizes {
  export type Result = PizzaSizes.Type;

  export type SizeTestMap = [PizzaSizes.Type, RegExp];

  export type SizeMap = [PizzaSizes.Type, string];

  export type Message = string;

  export type Type = Order.Pizza.Size | undefined
}

export const pizzaSizes = new PizzaSizes()
