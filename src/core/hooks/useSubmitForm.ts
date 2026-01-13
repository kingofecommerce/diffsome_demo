import { useMutation } from "@tanstack/react-query";
import { diffsome } from "@/core/lib/diffsome";

interface SubmitFormParams {
  slug: string;
  data: Record<string, unknown>;
  token?: string | null;
}

export const useSubmitForm = () => {
  return useMutation({
    mutationFn: async ({ slug, data }: SubmitFormParams) => {
      const response = await diffsome.forms.submit(slug, data);
      return response;
    },
  });
};
