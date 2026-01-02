import { useQuery } from "@tanstack/react-query";
import { promptly } from "@/lib/promptly";

interface UsePostsParams {
  page?: number;
  perPage?: number;
  search?: string;
}

export function usePosts(params: UsePostsParams = {}) {
  return useQuery({
    queryKey: ["posts", params],
    queryFn: async () => {
      const { data: posts, meta } = await promptly.boards.listPosts('first', {
        page: params.page ?? 1,
        per_page: params.perPage ?? 10,
        search: params.search,
      });
      return { data: posts, meta };
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
