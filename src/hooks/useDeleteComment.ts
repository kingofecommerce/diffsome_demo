import { useMutation, useQueryClient } from "@tanstack/react-query";
import { promptly } from "@/lib/promptly";
import { useAuth } from "@/contexts/AuthContext";

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
      promptly.setToken(token);
      await promptly.boards.deleteComment(Number(data.commentId));
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["comments", variables.postId] });
    },
  });
}
