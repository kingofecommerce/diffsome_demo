import { useQuery } from "@tanstack/react-query";
import { diffsome } from "@/core/lib/diffsome";

export function usePostDetail(postId: string) {
  return useQuery({
    queryKey: ["post", postId],
    queryFn: async () => {
      const post = await diffsome.boards.getPost(Number(postId));
      return { data: post };
    },
    enabled: !!postId,
  });
}
