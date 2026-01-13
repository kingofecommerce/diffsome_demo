import { useMutation, useQueryClient } from "@tanstack/react-query";
import { diffsome } from "@/core/lib/diffsome";
import { useAuth } from "@/core/providers/AuthProvider";

interface UpdatePostData {
  title: string;
  content: string;
}

export function useUpdatePost(postId: string) {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdatePostData) => {
      if (token) {
        diffsome.setToken(token);
      }
      const post = await diffsome.boards.updatePost(Number(postId), data);
      return post;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["post", postId] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
}
