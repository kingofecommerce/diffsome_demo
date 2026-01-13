import { useQuery } from "@tanstack/react-query";
import { diffsome } from "@/core/lib/diffsome";

interface UseBlogParams {
  page?: number;
  perPage?: number;
  category?: string;
  tag?: string;
  search?: string;
}

export function useBlog(params: UseBlogParams = {}) {
  return useQuery({
    queryKey: ["blog", params],
    queryFn: async () => {
      const { data: posts, meta } = await diffsome.blog.list({
        page: params.page ?? 1,
        per_page: params.perPage ?? 10,
        category: params.category,
        tag: params.tag,
        search: params.search,
      });
      return { data: posts, meta };
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useBlogPost(slug: string) {
  return useQuery({
    queryKey: ["blog", slug],
    queryFn: async () => {
      const post = await diffsome.blog.get(slug);
      return post;
    },
    enabled: !!slug,
  });
}

export function useBlogCategories() {
  return useQuery({
    queryKey: ["blog-categories"],
    queryFn: async () => {
      try {
        const categories = await diffsome.blog.categories();
        return categories;
      } catch {
        return [];
      }
    },
    staleTime: 1000 * 60 * 30,
  });
}

export function useBlogTags() {
  return useQuery({
    queryKey: ["blog-tags"],
    queryFn: async () => {
      try {
        const tags = await diffsome.blog.tags();
        return tags;
      } catch {
        return [];
      }
    },
    staleTime: 1000 * 60 * 30,
  });
}

export function useFeaturedPosts(limit: number = 5) {
  return useQuery({
    queryKey: ["blog-featured", limit],
    queryFn: async () => {
      const posts = await diffsome.blog.featured(limit);
      return posts;
    },
    staleTime: 1000 * 60 * 10,
  });
}
