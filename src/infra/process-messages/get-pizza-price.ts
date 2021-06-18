import { Order } from '@/domain/models/order'

class GetPizzaPrice {
  private hasPizzaClass (pizzaClasses: GetPizzaPrice.PizzaClass[], pizzaClass: GetPizzaPrice.PizzaClass): boolean {
    return !!pizzaClasses.find(item => item === pizzaClass)
  }

  protected getPizzaClassesInTastesArr (tastes: GetPizzaPrice.TasteNumber[]): GetPizzaPrice.PizzaClass[] {
    const classes: GetPizzaPrice.PizzaClass[] = []

    for (const item of tastes) {
      if (item >= 1 && item <= 5) {
        !this.hasPizzaClass(classes, 'special') && classes.push('special')
      }
      if (item >= 6 && item <= 11) {
        !this.hasPizzaClass(classes, 'normal') && classes.push('normal')
      }
      if (item >= 12 && item <= 15) {
        !this.hasPizzaClass(classes, 'simple') && classes.push('simple')
      }
    }

    return classes
  }

  public getBrlString (
    size: GetPizzaPrice.Size,
    tastes: GetPizzaPrice.TasteNumber[],
    format = { minimumFractionDigits: 2, style: 'currency', currency: 'BRL' }
  ): GetPizzaPrice.PriceFormatted {
    const price = this.getInt(size, tastes)
    return this.format(price, format)
  }

  public format (price: GetPizzaPrice.Price, format = { minimumFractionDigits: 2, style: 'currency', currency: 'BRL' }): GetPizzaPrice.PriceFormatted {
    return (price / 100).toLocaleString('pt-BR', format)
  }

  public getInt (size: GetPizzaPrice.Size | undefined, tastes: GetPizzaPrice.TasteNumber[]): GetPizzaPrice.Price {
    const pizzaClasses = this.getPizzaClassesInTastesArr(tastes)
    let price: number = 0

    if (this.hasPizzaClass(pizzaClasses, 'simple')) {
      if (size === 'small') price = 1800
      if (size === 'medium') price = 2400
      if (size === 'great') price = 3000
      if (size === 'big') price = 3400
    }

    if (this.hasPizzaClass(pizzaClasses, 'normal')) {
      if (size === 'small') price = 2000
      if (size === 'medium') price = 2600
      if (size === 'great') price = 3200
      if (size === 'big') price = 3600
    }

    if (this.hasPizzaClass(pizzaClasses, 'special')) {
      if (size === 'small') price = 2200
      if (size === 'medium') price = 2800
      if (size === 'great') price = 3400
      if (size === 'big') price = 4000
    }

    return price
  }
}

namespace GetPizzaPrice {
  export type Price = number
  export type PriceFormatted = string
  export type Size = Order.Pizza.Size
  export type TasteNumber = number
  export type PizzaClass = 'special' | 'normal' | 'simple'
}

export const getPizzaPrice = new GetPizzaPrice()
