import { useMutation, useQueryClient } from "@tanstack/react-query";
import { promptly } from "@/lib/promptly";
import { useAuth } from "@/contexts/AuthContext";

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
        promptly.setToken(token);
      }
      const post = await promptly.boards.updatePost(Number(postId), data);
      return post;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["post", postId] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
}
