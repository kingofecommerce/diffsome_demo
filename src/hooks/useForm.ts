import { useQuery } from "@tanstack/react-query";
import { promptly } from "@/lib/promptly";

export const useForm = (slug: string) => {
  return useQuery({
    queryKey: ["form", slug],
    queryFn: async () => {
      const form = await promptly.forms.get(slug);
      return form;
    },
    enabled: !!slug,
  });
};
