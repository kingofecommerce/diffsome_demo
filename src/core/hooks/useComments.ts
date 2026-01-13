import { useQuery } from "@tanstack/react-query";
import { diffsome } from "@/core/lib/diffsome";

export function useComments(postId: string) {
  return useQuery({
    queryKey: ["comments", postId],
    queryFn: async () => {
      const comments = await diffsome.boards.listComments(Number(postId));
      return { data: comments ?? [] };
    },
    enabled: !!postId,
  });
}
