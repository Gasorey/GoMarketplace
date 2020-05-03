import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';
import api from 'src/services/api';
import { Product } from '../pages/Dashboard/index';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Product): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const cartStorage = await AsyncStorage.getItem('@GoMarketplace:products');
      if (cartStorage) {
        const cart = JSON.parse(cartStorage);
        setProducts(cart);
      }
    }

    loadProducts();
  }, []);

  const findProduct = useCallback(
    (id: string): number => {
      return products.findIndex(item => item.id === id);
    },
    [products],
  );

  const addToCart = useCallback(
    async (product: Product) => {
      const checkProduct = products.findIndex(
        produto => produto.id === product.id,
      );

      if (checkProduct) {
        products[checkProduct].quantity += 1;
      }

      await AsyncStorage.setItem(
        '@GoMarketplace:Products',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const productIncrement = products.findIndex(produto => produto.id === id);
      if (productIncrement) {
        products[productIncrement].quantity += 1;
      }
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const productDecrement = products.findIndex(produto => produto.id === id);
      if (productDecrement) {
        products[productDecrement].quantity -= 1;
      }
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
