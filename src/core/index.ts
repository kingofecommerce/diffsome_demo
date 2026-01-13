// Core module - SDK data layer (DO NOT MODIFY FOR THEMING)
// This module contains all SDK-related logic

// Client
export { diffsome, diffsome as getClient } from './lib/diffsome';

// Hooks - Board
export { usePosts } from './hooks/usePosts';
export { usePostDetail } from './hooks/usePostDetail';
export { useCreatePost } from './hooks/useCreatePost';
export { useUpdatePost } from './hooks/useUpdatePost';
export { useDeletePost } from './hooks/useDeletePost';

// Hooks - Comments
export { useComments } from './hooks/useComments';
export { useCreateComment } from './hooks/useCreateComment';
export { useUpdateComment } from './hooks/useUpdateComment';
export { useDeleteComment } from './hooks/useDeleteComment';

// Hooks - Blog Comments
export { useBlogComments } from './hooks/useBlogComments';
export { useCreateBlogComment } from './hooks/useCreateBlogComment';
export { useUpdateBlogComment } from './hooks/useUpdateBlogComment';
export { useDeleteBlogComment } from './hooks/useDeleteBlogComment';

// Hooks - Blog
export { useBlogPosts, useBlogPost } from './hooks/useBlog';

// Hooks - Products
export { useProducts, useProduct } from './hooks/useProducts';
export { useProductReviews, useCreateReview, useCanReview, useMarkHelpful } from './hooks/useProductReviews';

// Hooks - Cart & Order
export { useCart, useAddToCart, useUpdateCartItem, useRemoveFromCart, useClearCart } from './hooks/useCart';
export { useOrders, useOrder, useCreateOrder, useCancelOrder } from './hooks/useOrder';

// Hooks - Payment
export { useTossPaymentReady, useTossPaymentConfirm } from './hooks/usePayment';

// Hooks - Reservation
export {
  useReservationSettings,
  useReservationServices,
  useReservationStaffs,
  useAvailableDates,
  useAvailableSlots,
  useCreateReservation,
  useMyReservations,
  useReservation,
  useCancelReservation
} from './hooks/useReservation';

// Hooks - Form
export { useForm } from './hooks/useForm';
export { useSubmitForm } from './hooks/useSubmitForm';

// Providers
export { AuthProvider, useAuth } from './providers/AuthProvider';
