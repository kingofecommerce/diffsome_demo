import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { diffsome } from "@/core/lib/diffsome";
import { useAuth } from "@/core/providers/AuthProvider";
import type { AddToCartData, UpdateCartItemData } from "@diffsome/sdk";

export function useCart() {
  const { isLoading: authLoading } = useAuth();

  return useQuery({
    queryKey: ["cart"],
    queryFn: async () => {
      const cart = await diffsome.shop.getCart();
      return cart;
    },
    staleTime: 1000 * 60, // 1 minute
    enabled: !authLoading, // Wait for auth to initialize before fetching cart
  });
}

export function useAddToCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: AddToCartData) => {
      const cart = await diffsome.shop.addToCart(data);
      return cart;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });
}

export function useUpdateCartItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ itemId, data }: { itemId: number; data: UpdateCartItemData }) => {
      const cart = await diffsome.shop.updateCartItem(itemId, data);
      return cart;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });
}

export function useRemoveFromCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (itemId: number) => {
      const cart = await diffsome.shop.removeFromCart(itemId);
      return cart;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });
}

export function useClearCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await diffsome.shop.clearCart();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });
}
