import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { diffsome } from "@/core/lib/diffsome";
import type {
  ProductReview,
  ProductReviewStats,
  ProductReviewListParams,
  CreateProductReviewData,
  UpdateProductReviewData,
  CanReviewResponse,
} from "@diffsome/sdk";

export type { ProductReview, ProductReviewStats, CanReviewResponse } from "@diffsome/sdk";

/**
 * Hook to get product reviews
 */
export function useProductReviews(productSlug: string, params?: ProductReviewListParams) {
  return useQuery({
    queryKey: ["productReviews", productSlug, params],
    queryFn: async () => {
      const response = await diffsome.shop.getProductReviews(productSlug, params);
      return response;
    },
    enabled: !!productSlug,
  });
}

/**
 * Hook to check if user can review
 */
export function useCanReview(productSlug: string) {
  return useQuery({
    queryKey: ["canReview", productSlug],
    queryFn: async () => {
      const response = await diffsome.shop.canReviewProduct(productSlug);
      return response;
    },
    enabled: !!productSlug && diffsome.isAuthenticated(),
  });
}

/**
 * Hook to create a review
 */
export function useCreateReview(productSlug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateProductReviewData) => {
      return diffsome.shop.createReview(productSlug, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["productReviews", productSlug] });
      queryClient.invalidateQueries({ queryKey: ["canReview", productSlug] });
      queryClient.invalidateQueries({ queryKey: ["myReviews"] });
    },
  });
}

/**
 * Hook to update a review
 */
export function useUpdateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      reviewId,
      data,
    }: {
      reviewId: number;
      data: UpdateProductReviewData;
    }) => {
      return diffsome.shop.updateReview(reviewId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["productReviews"] });
      queryClient.invalidateQueries({ queryKey: ["myReviews"] });
    },
  });
}

/**
 * Hook to delete a review
 */
export function useDeleteReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reviewId: number) => {
      return diffsome.shop.deleteReview(reviewId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["productReviews"] });
      queryClient.invalidateQueries({ queryKey: ["canReview"] });
      queryClient.invalidateQueries({ queryKey: ["myReviews"] });
    },
  });
}

/**
 * Hook to mark review as helpful
 */
export function useMarkReviewHelpful() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reviewId: number) => {
      return diffsome.shop.markReviewHelpful(reviewId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["productReviews"] });
    },
  });
}

/**
 * Hook to get my reviews
 */
export function useMyReviews(params?: { per_page?: number; page?: number }) {
  return useQuery({
    queryKey: ["myReviews", params],
    queryFn: async () => {
      const response = await diffsome.shop.myReviews(params);
      return response;
    },
    enabled: diffsome.isAuthenticated(),
  });
}
