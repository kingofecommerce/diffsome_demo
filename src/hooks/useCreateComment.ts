import { useMutation, useQueryClient } from "@tanstack/react-query";
import { promptly } from "@/lib/promptly";
import { useAuth } from "@/contexts/AuthContext";

interface CreateCommentData {
  postId: string;
  content: string;
  parentId?: number | null;
}

export function useCreateComment() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateCommentData) => {
      if (!token) {
        throw new Error("로그인이 필요합니다.");
      }
      promptly.setToken(token);
      const comment = await promptly.boards.createComment(Number(data.postId), {
        content: data.content,
        parent_id: data.parentId ?? undefined,
      });
      return comment;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["comments", variables.postId] });
    },
  });
}
