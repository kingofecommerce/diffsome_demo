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
      const response = await promptly.boards.listPosts('first', {
        page: params.page,
        per_page: params.perPage,
        search: params.search,
      });
      return response;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
