import { useMutation, useQueryClient } from "@tanstack/react-query";
import { diffsome } from "@/core/lib/diffsome";
import { useAuth } from "@/core/providers/AuthProvider";

interface CreatePostPayload {
  board_id: number;
  title: string;
  content: string;
}

export function useCreatePost() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreatePostPayload) => {
      if (token) {
        diffsome.setToken(token);
      }
      const post = await diffsome.boards.createPost(payload);
      return post;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
}
