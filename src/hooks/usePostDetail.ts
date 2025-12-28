import { useQuery } from "@tanstack/react-query";
import type { PostDetailResponse } from "@/types/board";

const API_BASE = "https://promptly.webbyon.com/api/demo/public";

async function fetchPostDetail(postId: string): Promise<PostDetailResponse> {
  const response = await fetch(`${API_BASE}/posts/${postId}`);
  
  if (!response.ok) {
    throw new Error("게시글을 불러오는데 실패했습니다.");
  }
  
  return response.json();
}

export function usePostDetail(postId: string) {
  return useQuery({
    queryKey: ["post", postId],
    queryFn: () => fetchPostDetail(postId),
    enabled: !!postId,
  });
}
