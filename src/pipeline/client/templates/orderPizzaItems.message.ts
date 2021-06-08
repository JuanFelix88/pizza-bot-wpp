import { Order } from '@/domain/models/order'
import { pizzaSizes } from '@/infra/process-messages/pizza-sizes'
import { tastesIdentifiers } from '@/infra/process-messages/tastes-identifiers'

export function renderOrderPizzaItemsMessages (pizzas: Order.Pizza[]): string[] {
  const pizzasMessages = pizzas.map((pizza, index) => `*Pizza ${index + 1}*\n` +
    `🍽️ Tamanho: *${pizza.size ? pizzaSizes.getSizeName(pizza.size) : pizza.size}*\n\n` +
    `🍕 Sabor(es):\n${pizza.tastes.map(item => `   - *${tastesIdentifiers.getTasteNameByNumber(item)}*`).join('\n')}\n\n` +
    `💰 Valor: *${pizza.size ? '?' : `*R$ ${pizza.price}`}*`
  )

  return pizzasMessages
}
