import { useMutation, useQueryClient } from "@tanstack/react-query";
import { diffsome } from "@/core/lib/diffsome";
import { useAuth } from "@/core/providers/AuthProvider";

interface DeleteBlogCommentData {
  commentId: string;
  slug: string;
}

export function useDeleteBlogComment() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: DeleteBlogCommentData) => {
      if (!token) {
        throw new Error("로그인이 필요합니다.");
      }
      diffsome.setToken(token);
      await diffsome.comments.delete(Number(data.commentId));
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["blogComments", variables.slug] });
    },
  });
}
