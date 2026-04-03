import { create } from "zustand";

export const useCartStore = create((set) => ({
  cart: [],
  showConflictModal: false,
  pendingProduct: null,

  // Añadir al carrito con opciones y notas
  addToCart: (product, selectedOptions = [], notes = "") =>
    set((state) => {
      // Verificar si el carrito está vacío o si el business_id coincide
      const currentBusinessId =
        state.cart.length > 0 ? state.cart[0].business_id : null;

      if (currentBusinessId && currentBusinessId !== product.business_id) {
        // Mostrar modal de conflicto
        return {
          showConflictModal: true,
          pendingProduct: { product, selectedOptions, notes },
        };
      }

      // 1. Creamos un ID único para esta combinación específica
      // Incluye: producto + opciones + notas
      // Ejemplo: "pizza123-grande-extraqueso-sinCebolla"
      const optionsId = selectedOptions
        .map((o) => o.id)
        .sort()
        .join("-");

      // Crear un hash simple de las notas para incluirlo en el ID
      const notesHash = notes
        ? notes
            .split("")
            .reduce((acc, char) => (acc << 5) - acc + char.charCodeAt(0), 0)
            .toString(36)
        : "none";

      const cartItemId = `${product.id}-${optionsId}-${notesHash}`;

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

  // Limpiar carrito y agregar el producto pendiente
  clearAndAdd: () =>
    set((state) => {
      if (!state.pendingProduct) return state;

      const { product, selectedOptions, notes } = state.pendingProduct;

      // Limpiar el carrito
      const newCart = [];

      // Crear el nuevo item
      const optionsId = selectedOptions
        .map((o) => o.id)
        .sort()
        .join("-");

      // Crear un hash simple de las notas
      const notesHash = notes
        ? notes
            .split("")
            .reduce((acc, char) => (acc << 5) - acc + char.charCodeAt(0), 0)
            .toString(36)
        : "none";

      const cartItemId = `${product.id}-${optionsId}-${notesHash}`;

      const extraTotal = selectedOptions.reduce(
        (acc, opt) => acc + (Number(opt.extra_price) || 0),
        0,
      );
      const finalPrice = Number(product.price) + extraTotal;

      newCart.push({
        ...product,
        cartItemId,
        selectedOptions,
        notes,
        price: finalPrice,
        quantity: 1,
      });

      return {
        cart: newCart,
        showConflictModal: false,
        pendingProduct: null,
      };
    }),

  // Cancelar el conflicto (cerrar modal sin hacer nada)
  cancelConflict: () =>
    set({
      showConflictModal: false,
      pendingProduct: null,
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
