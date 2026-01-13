import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { diffsome } from "@/core/lib/diffsome";
import type {
  TossPaymentReadyData,
  TossPaymentConfirmData,
  StripeCheckoutData,
  StripeVerifyData,
} from "@diffsome/sdk";

/**
 * Hook to get available payment methods
 */
export function usePaymentStatus() {
  return useQuery({
    queryKey: ["paymentStatus"],
    queryFn: async () => {
      const status = await diffsome.shop.getPaymentStatus();
      return status;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook for Toss payment ready
 */
export function useTossPaymentReady() {
  return useMutation({
    mutationFn: async (data: TossPaymentReadyData) => {
      const response = await diffsome.shop.tossPaymentReady(data);
      return response;
    },
  });
}

/**
 * Hook for Toss payment confirmation
 */
export function useTossPaymentConfirm() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: TossPaymentConfirmData) => {
      const response = await diffsome.shop.tossPaymentConfirm(data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["order"] });
    },
  });
}

/**
 * Hook for Stripe checkout
 */
export function useStripeCheckout() {
  return useMutation({
    mutationFn: async (data: StripeCheckoutData) => {
      const response = await diffsome.shop.stripeCheckout(data);
      return response;
    },
  });
}

/**
 * Hook for Stripe payment verification
 */
export function useStripeVerify() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: StripeVerifyData) => {
      const response = await diffsome.shop.stripeVerify(data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["order"] });
    },
  });
}
