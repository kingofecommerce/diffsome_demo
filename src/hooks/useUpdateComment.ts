import { useMutation, useQueryClient } from "@tanstack/react-query";
import { promptly } from "@/lib/promptly";
import { useAuth } from "@/contexts/AuthContext";

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
      promptly.setToken(token);
      const comment = await promptly.boards.updateComment(Number(data.commentId), {
        content: data.content,
      });
      return comment;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["comments", variables.postId] });
    },
  });
}
