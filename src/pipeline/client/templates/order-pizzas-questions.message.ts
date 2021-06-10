import { Order } from '@/domain/models/order'

function getPtName (key: keyof Order.Pizza): string {
  if (key === 'tastes') {
    return 'sabor(es)'
  }
  if (key === 'size') {
    return 'tamanho'
  }

  return 'Erro ao processar'
}

export function renderOrderPizzasQuestionsMessage (pizzasOrders: Order.Pizza[]): (string | undefined)[] {
  return pizzasOrders.map(({ size, tastes }, index) => {
    if (size && tastes.length > 0) return undefined

    const missingItems = Object
      .entries({ size, tastes })
      .map(([key, val]) => (!val || (Array.isArray(val) && val.length === 0)) ? `${getPtName(key as any)}` : undefined)
      .filter(item => !!item) as string[]

    return `Por favor informar o ${missingItems.join(' e ')} da *Pizza ${index + 1}*.`
  })
}
