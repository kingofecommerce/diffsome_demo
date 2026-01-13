import type { BoardComment } from "@diffsome/sdk";

// SDK의 BoardComment 타입 재export
export type Comment = BoardComment;
export type CommentReply = BoardComment;

export interface CommentListResponse {
  success: boolean;
  message: string;
  data: Comment[];
}
