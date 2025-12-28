import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";

const API_BASE_URL = "https://promptly.webbyon.com/api/demo";

interface UpdateCommentData {
  commentId: string;
  postId: string;
  content: string;
}

async function updateComment(
  data: UpdateCommentData,
  token: string
): Promise<{ success: boolean; message: string }> {
  const response = await fetch(`${API_BASE_URL}/comments/${data.commentId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      content: data.content,
    }),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "댓글 수정에 실패했습니다.");
  }

  return result;
}

export function useUpdateComment() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateCommentData) => {
      if (!token) {
        throw new Error("로그인이 필요합니다.");
      }
      return updateComment(data, token);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["comments", variables.postId] });
    },
  });
}
