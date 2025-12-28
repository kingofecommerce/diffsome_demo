import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";

const API_BASE = "https://promptly.webbyon.com/api/demo";

interface UpdatePostData {
  title: string;
  content: string;
}

interface UpdatePostResponse {
  success: boolean;
  message: string;
  data: {
    id: number;
    title: string;
    content: string;
  };
}

export function useUpdatePost(postId: string) {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdatePostData): Promise<UpdatePostResponse> => {
      const response = await fetch(`${API_BASE}/posts/${postId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "게시글 수정에 실패했습니다.");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["post", postId] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
}
