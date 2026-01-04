import { useQuery } from "@tanstack/react-query";
import { promptly } from "@/lib/promptly";

export function useComments(postId: string) {
  return useQuery({
    queryKey: ["comments", postId],
    queryFn: async () => {
      const comments = await promptly.boards.listComments(Number(postId));
      return { data: comments };
    },
    enabled: !!postId,
  });
}
