import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";

const API_BASE_URL = "https://promptly.webbyon.com/api/demo";

interface CreateCommentData {
  postId: string;
  content: string;
  parentId?: number | null;
}

async function createComment(
  data: CreateCommentData,
  token: string
): Promise<{ success: boolean; message: string }> {
  const response = await fetch(`${API_BASE_URL}/posts/${data.postId}/comments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      content: data.content,
      parent_id: data.parentId ?? null,
    }),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "댓글 작성에 실패했습니다.");
  }

  return result;
}

export function useCreateComment() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCommentData) => {
      if (!token) {
        throw new Error("로그인이 필요합니다.");
      }
      return createComment(data, token);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["comments", variables.postId] });
    },
  });
}
