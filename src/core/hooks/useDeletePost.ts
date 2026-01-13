import { useMutation, useQueryClient } from "@tanstack/react-query";
import { diffsome } from "@/core/lib/diffsome";
import { useAuth } from "@/core/providers/AuthProvider";

export function useDeletePost() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: string | number) => {
      if (token) {
        diffsome.setToken(token);
      }
      await diffsome.boards.deletePost(Number(postId));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
}
