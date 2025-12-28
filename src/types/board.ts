export interface Post {
  id: number;
  title: string;
  excerpt: string;
  author: string;
  views: number;
  is_notice: boolean;
  created_at: string;
}

export interface Board {
  id: number;
  name: string;
  slug: string;
}

export interface PostDetail {
  id: number;
  title: string;
  content: string;
  author: string;
  views: number;
  is_notice: boolean;
  board: Board;
  created_at: string;
  updated_at: string;
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

export interface PostDetailResponse {
  success: boolean;
  message: string;
  data: PostDetail;
}
