import { useQuery } from "@tanstack/react-query";
import type { BoardResponse } from "@/types/board";

const API_URL = "https://promptly.webbyon.com/api/demo/public/boards/first/posts";

async function fetchPosts(): Promise<BoardResponse> {
  const response = await fetch(API_URL);
  if (!response.ok) {
    throw new Error("게시글을 불러오는데 실패했습니다.");
  }
  return response.json();
}

export function usePosts() {
  return useQuery({
    queryKey: ["posts"],
    queryFn: fetchPosts,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
