import { useQuery } from "@tanstack/react-query";
import { promptly } from "@/lib/promptly";

export function usePostDetail(postId: string) {
  return useQuery({
    queryKey: ["post", postId],
    queryFn: async () => {
      const post = await promptly.boards.getPost(Number(postId));
      return { data: post };
    },
    enabled: !!postId,
  });
}
