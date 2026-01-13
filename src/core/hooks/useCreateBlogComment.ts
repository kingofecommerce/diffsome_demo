import { useMutation, useQueryClient } from "@tanstack/react-query";
import { diffsome } from "@/core/lib/diffsome";
import { useAuth } from "@/core/providers/AuthProvider";

interface CreateBlogCommentData {
  slug: string;
  content: string;
  parentId?: number | null;
}

export function useCreateBlogComment() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateBlogCommentData) => {
      if (!token) {
        throw new Error("로그인이 필요합니다.");
      }
      diffsome.setToken(token);
      const response = await diffsome.comments.createBlogPost(data.slug, {
        content: data.content,
        parent_id: data.parentId ?? undefined,
      });
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["blogComments", variables.slug] });
    },
  });
}
