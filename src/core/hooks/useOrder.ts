import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { diffsome } from "@/core/lib/diffsome";
import { useAuth } from "@/core/providers/AuthProvider";
import type { CreateOrderData, OrderListParams } from "@diffsome/sdk";

export function useOrders(params?: OrderListParams) {
  const { isLoading: authLoading, isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ["orders", params],
    queryFn: async () => {
      const response = await diffsome.shop.listOrders(params);
      return response;
    },
    enabled: !authLoading && isAuthenticated,
  });
}

export function useOrder(idOrNumber: number | string) {
  const { isLoading: authLoading } = useAuth();

  return useQuery({
    queryKey: ["order", idOrNumber],
    queryFn: async () => {
      const order = await diffsome.shop.getOrder(idOrNumber);
      return order;
    },
    enabled: !authLoading && !!idOrNumber,
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateOrderData) => {
      const order = await diffsome.shop.createOrder(data);
      return order;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}

export function useCancelOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderId: number) => {
      const order = await diffsome.shop.cancelOrder(orderId);
      return order;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}
