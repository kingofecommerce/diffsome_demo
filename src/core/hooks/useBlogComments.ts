import { useQuery } from "@tanstack/react-query";
import { diffsome } from "@/core/lib/diffsome";

export function useBlogComments(slug: string) {
  return useQuery({
    queryKey: ["blogComments", slug],
    queryFn: async () => {
      const response = await diffsome.comments.blogPost(slug);
      // response가 배열이면 바로 사용, 아니면 response.data 사용
      const comments = Array.isArray(response) ? response : (response.data ?? []);
      return { data: comments };
    },
    enabled: !!slug,
  });
}
