import { useMutation } from "@tanstack/react-query";
import { promptly } from "@/lib/promptly";

interface SubmitFormParams {
  slug: string;
  data: Record<string, unknown>;
  token?: string | null;
}

export const useSubmitForm = () => {
  return useMutation({
    mutationFn: async ({ slug, data }: SubmitFormParams) => {
      const response = await promptly.forms.submit(slug, data);
      return response;
    },
  });
};
