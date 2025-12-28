import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";

const API_BASE_URL = "https://promptly.webbyon.com/api/demo";

interface DeleteCommentData {
  commentId: string;
  postId: string;
}

async function deleteComment(
  data: DeleteCommentData,
  token: string
): Promise<{ success: boolean; message: string }> {
  const response = await fetch(`${API_BASE_URL}/comments/${data.commentId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "댓글 삭제에 실패했습니다.");
  }

  return result;
}

export function useDeleteComment() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: DeleteCommentData) => {
      if (!token) {
        throw new Error("로그인이 필요합니다.");
      }
      return deleteComment(data, token);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["comments", variables.postId] });
    },
  });
}
