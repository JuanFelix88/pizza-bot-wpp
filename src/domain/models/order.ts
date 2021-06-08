export interface Order {
  pizzas: Order.Pizza;
}

export namespace Order {
  export type Pizza = {
    tastes: number[];
    size?: Pizza.Size;
    price: number;
  }

  export namespace Pizza {
    export type Size =
      | 'small'
      | 'medium'
      | 'great'
      | 'big';
  }
}
