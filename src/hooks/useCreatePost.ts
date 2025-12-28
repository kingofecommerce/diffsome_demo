import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";

interface CreatePostPayload {
  board_id: number;
  title: string;
  content: string;
}

interface CreatePostResponse {
  success: boolean;
  message: string;
  data?: {
    id: number;
    title: string;
    content: string;
  };
}

const API_URL = "https://promptly.webbyon.com/api/demo/posts";

export function useCreatePost() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreatePostPayload): Promise<CreatePostResponse> => {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "게시글 작성에 실패했습니다.");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
}
