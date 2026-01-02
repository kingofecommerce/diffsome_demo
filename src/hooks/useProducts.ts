import { useQuery } from "@tanstack/react-query";
import { promptly } from "@/lib/promptly";
import type { Product } from "@back23/promptly-sdk";

export type { Product } from "@back23/promptly-sdk";

export const useProducts = (page: number = 1) => {
  return useQuery({
    queryKey: ["products", page],
    queryFn: async () => {
      const response = await promptly.shop.listProducts({ page });
      return response.data;
    },
  });
};
