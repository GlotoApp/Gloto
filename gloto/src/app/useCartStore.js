import { create } from "zustand";

export const useCartStore = create((set) => ({
  cart: [],

  // Añadir al carrito con opciones y notas
  addToCart: (product, selectedOptions = [], notes = "") =>
    set((state) => {
      // 1. Creamos un ID único para esta combinación específica
      // Ejemplo: "pizza123-grande-extraqueso"
      const optionsId = selectedOptions
        .map((o) => o.id)
        .sort()
        .join("-");
      const cartItemId = `${product.id}-${optionsId}`;

      const existingItem = state.cart.find(
        (item) => item.cartItemId === cartItemId,
      );

      // 2. Calculamos el precio real (Base + Extras)
      const extraTotal = selectedOptions.reduce(
        (acc, opt) => acc + (Number(opt.extra_price) || 0),
        0,
      );
      const finalPrice = Number(product.price) + extraTotal;

      if (existingItem) {
        return {
          cart: state.cart.map((item) =>
            item.cartItemId === cartItemId
              ? { ...item, quantity: item.quantity + 1 }
              : item,
          ),
        };
      }

      // 3. Si es nuevo o una combinación diferente, lo agregamos
      return {
        cart: [
          ...state.cart,
          {
            ...product,
            cartItemId, // ID único de la combinación
            selectedOptions, // Lista de extras elegidos
            notes, // "Sin cebolla", etc.
            price: finalPrice,
            quantity: 1,
          },
        ],
      };
    }),

  // Quitar usando el cartItemId único
  removeFromCart: (cartItemId) =>
    set((state) => ({
      cart: state.cart.reduce((acc, item) => {
        if (item.cartItemId === cartItemId) {
          if (item.quantity > 1)
            acc.push({ ...item, quantity: item.quantity - 1 });
        } else {
          acc.push(item);
        }
        return acc;
      }, []),
    })),

  clearCart: () => set({ cart: [] }),
}));
