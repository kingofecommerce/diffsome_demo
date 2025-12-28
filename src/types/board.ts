export interface Post {
  id: number;
  title: string;
  excerpt: string;
  author: string;
  views: number;
  is_notice: boolean;
  created_at: string;
}

export interface Meta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface BoardResponse {
  success: boolean;
  data: Post[];
  meta: Meta;
}
