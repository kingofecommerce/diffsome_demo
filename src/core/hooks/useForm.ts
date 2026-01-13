import { useQuery } from "@tanstack/react-query";
import { diffsome } from "@/core/lib/diffsome";

export const useForm = (slug: string) => {
  return useQuery({
    queryKey: ["form", slug],
    queryFn: async () => {
      const form = await diffsome.forms.get(slug);
      return form;
    },
    enabled: !!slug,
  });
};
