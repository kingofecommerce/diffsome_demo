import { useQuery } from "@tanstack/react-query";
import { CommentListResponse } from "@/types/comment";

const API_BASE_URL = "https://promptly.webbyon.com/api/demo";

async function fetchComments(postId: string): Promise<CommentListResponse> {
  const response = await fetch(`${API_BASE_URL}/public/posts/${postId}/comments`);
  
  if (!response.ok) {
    throw new Error("댓글을 불러오는데 실패했습니다.");
  }
  
  return response.json();
}

export function useComments(postId: string) {
  return useQuery({
    queryKey: ["comments", postId],
    queryFn: () => fetchComments(postId),
    enabled: !!postId,
  });
}
