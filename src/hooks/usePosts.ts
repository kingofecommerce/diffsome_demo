import { useQuery } from "@tanstack/react-query";
import type { BoardResponse } from "@/types/board";

const API_URL = "https://promptly.webbyon.com/api/demo/public/boards/first/posts";

interface UsePostsParams {
  page?: number;
  perPage?: number;
  search?: string;
}

async function fetchPosts(params: UsePostsParams): Promise<BoardResponse> {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set("page", params.page.toString());
  if (params.perPage) searchParams.set("per_page", params.perPage.toString());
  if (params.search) searchParams.set("search", params.search);
  
  const url = `${API_URL}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("게시글을 불러오는데 실패했습니다.");
  }
  return response.json();
}

export function usePosts(params: UsePostsParams = {}) {
  return useQuery({
    queryKey: ["posts", params],
    queryFn: () => fetchPosts(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
