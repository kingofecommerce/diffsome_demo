import { useMutation, useQueryClient } from "@tanstack/react-query";
import { diffsome } from "@/core/lib/diffsome";
import { useAuth } from "@/core/providers/AuthProvider";

interface DeleteCommentData {
  commentId: string;
  postId: string;
}

export function useDeleteComment() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: DeleteCommentData) => {
      if (!token) {
        throw new Error("로그인이 필요합니다.");
      }
      diffsome.setToken(token);
      await diffsome.boards.deleteComment(Number(data.commentId));
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["comments", variables.postId] });
    },
  });
}
