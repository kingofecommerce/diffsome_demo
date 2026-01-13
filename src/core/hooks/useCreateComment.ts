import { useMutation, useQueryClient } from "@tanstack/react-query";
import { diffsome } from "@/core/lib/diffsome";
import { useAuth } from "@/core/providers/AuthProvider";

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
      diffsome.setToken(token);
      const comment = await diffsome.boards.createComment(Number(data.postId), {
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
