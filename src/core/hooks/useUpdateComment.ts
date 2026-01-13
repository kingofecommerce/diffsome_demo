import { useMutation, useQueryClient } from "@tanstack/react-query";
import { diffsome } from "@/core/lib/diffsome";
import { useAuth } from "@/core/providers/AuthProvider";

interface UpdateCommentData {
  commentId: string;
  postId: string;
  content: string;
}

export function useUpdateComment() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateCommentData) => {
      if (!token) {
        throw new Error("로그인이 필요합니다.");
      }
      diffsome.setToken(token);
      const comment = await diffsome.boards.updateComment(Number(data.commentId), {
        content: data.content,
      });
      return comment;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["comments", variables.postId] });
    },
  });
}
