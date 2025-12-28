export interface CommentReply {
  id: number;
  content: string;
  author: string;
  created_at: string;
}

export interface Comment {
  id: string;
  content: string;
  author: string;
  created_at: string;
  replies: CommentReply[];
}

export interface CommentListResponse {
  success: boolean;
  message: string;
  data: Comment[];
}
