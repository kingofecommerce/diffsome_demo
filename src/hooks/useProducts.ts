import { useQuery } from "@tanstack/react-query";
import type { Product, ProductListResponse } from "@/types/product";

const API_BASE_URL = "https://promptly.webbyon.com/api/demo/public";

export const useProducts = (page: number = 1) => {
  return useQuery<Product[], Error>({
    queryKey: ["products", page],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/products?page=${page}`);
      
      if (!response.ok) {
        throw new Error("상품 목록을 불러오는데 실패했습니다.");
      }
      
      const result: ProductListResponse = await response.json();
      return result.data;
    },
  });
};
