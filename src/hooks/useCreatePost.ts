import { useMutation, useQueryClient } from "@tanstack/react-query";
import { promptly } from "@/lib/promptly";
import { useAuth } from "@/contexts/AuthContext";

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
        promptly.setToken(token);
      }
      const post = await promptly.boards.createPost(payload);
      return post;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
}
