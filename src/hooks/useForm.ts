import { useQuery } from "@tanstack/react-query";
import type { FormData, FormDetailResponse } from "@/types/form";

const API_BASE_URL = "https://promptly.webbyon.com/api/demo/public";

export const useForm = (slug: string) => {
  return useQuery<FormData>({
    queryKey: ["form", slug],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/forms/${slug}`);
      
      if (!response.ok) {
        throw new Error("폼을 불러오는데 실패했습니다.");
      }
      
      const result: FormDetailResponse = await response.json();
      return result.data;
    },
    enabled: !!slug,
  });
};
