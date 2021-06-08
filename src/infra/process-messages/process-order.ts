import { Order } from '@/domain/models/order'
import { pizzaSizes } from './pizza-sizes'
import { tastesIdentifiers } from './tastes-identifiers'

class ProcessOrder {
  private tastesIdentifiers = tastesIdentifiers
  private pizzaSizes = pizzaSizes
  private regexTestToRepairMessage =
    /(e uma|e também|e tambem|e outra|mais uma|ai vou querer uma|querer outra|quero uma)/i

  public async loadMessage (message: string): Promise<ProcessOrder.Result> {
    const {
      regexTestToRepairMessage
    } = this

    const repairedMessage = message
      .replace(/\s{2,}/, ' ')
      .split(
        regexTestToRepairMessage
      )

    const pizzas: Order.Pizza[] = repairedMessage
      .map(message => ({
        price: 0,
        size: this.getPizzaSize(message),
        tastes: this.getPizzaTastesNumbers(message)
      }))

    return this.filterOnlyValidPizzasOrders(pizzas)
  }

  private filterOnlyValidPizzasOrders (pizzas: Order.Pizza[]): Order.Pizza[] {
    return pizzas.filter(item => item.size || item.tastes.length > 0)
  }

  private getPizzaSize (message: string): (Order.Pizza.Size | undefined) {
    return this.pizzaSizes.getPizzaSizeByMessage(message)
  }

  private getPizzaTastesNumbers (message: string): number[] {
    return this.tastesIdentifiers.getTastesNumbersByMessage(message)
  }
}

export namespace ProcessOrder {
  export type Result = Order.Pizza[]
}

export const processOrder = new ProcessOrder()
