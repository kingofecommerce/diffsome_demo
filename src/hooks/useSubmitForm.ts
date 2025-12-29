import { useMutation } from "@tanstack/react-query";
import type { FormSubmitResponse } from "@/types/form";

const API_BASE_URL = "https://promptly.webbyon.com/api/demo/public";

interface SubmitFormParams {
  slug: string;
  data: Record<string, unknown>;
  token?: string | null;
}

export const useSubmitForm = () => {
  return useMutation<FormSubmitResponse, Error, SubmitFormParams>({
    mutationFn: async ({ slug, data, token }) => {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}/forms/${slug}/submit`, {
        method: "POST",
        headers,
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "폼 제출에 실패했습니다.");
      }
      
      return response.json();
    },
  });
};
