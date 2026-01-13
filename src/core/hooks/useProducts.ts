import { useQuery } from "@tanstack/react-query";
import { diffsome } from "@/core/lib/diffsome";
import type { Product } from "@diffsome/sdk";

export type { Product } from "@diffsome/sdk";

export const useProducts = (page: number = 1) => {
  return useQuery({
    queryKey: ["products", page],
    queryFn: async () => {
      const response = await diffsome.shop.listProducts({ page });
      return response.data;
    },
  });
};

export const useProduct = (idOrSlug: number | string) => {
  return useQuery({
    queryKey: ["product", idOrSlug],
    queryFn: async () => {
      const product = await diffsome.shop.getProduct(idOrSlug);
      return product;
    },
    enabled: !!idOrSlug,
  });
};
