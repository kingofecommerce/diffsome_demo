import { useState } from "react";
import { MessageCircle, User, Clock, Edit, Trash2, Reply, Send, X, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/contexts/AuthContext";
import { useComments } from "@/hooks/useComments";
import { useCreateComment } from "@/hooks/useCreateComment";
import { useUpdateComment } from "@/hooks/useUpdateComment";
import { useDeleteComment } from "@/hooks/useDeleteComment";
import { useToast } from "@/hooks/use-toast";
import { Comment, CommentReply } from "@/types/comment";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";

interface CommentListProps {
  postId: string;
}

function CommentSkeleton() {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-16" />
      </div>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
    </div>
  );
}

interface ReplyItemProps {
  reply: CommentReply;
  postId: string;
  onEdit: (id: string, content: string) => void;
  onDelete: (id: string) => void;
  isAuthenticated: boolean;
}

function ReplyItem({ reply, postId, onEdit, onDelete, isAuthenticated }: ReplyItemProps) {
  const relativeDate = formatDistanceToNow(new Date(reply.created_at), {
    addSuffix: true,
    locale: ko,
  });

  return (
    <div className="pl-6 border-l-2 border-primary/20 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-sm text-muted-foreground mb-2">
          <span className="flex items-center gap-1.5">
            <User className="w-3.5 h-3.5" />
            <span className="font-medium text-foreground">{reply.author.name}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            {relativeDate}
          </span>
        </div>
        {isAuthenticated && (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-muted-foreground hover:text-foreground"
              onClick={() => onEdit(String(reply.id), reply.content)}
            >
              <Edit className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-muted-foreground hover:text-destructive"
              onClick={() => onDelete(String(reply.id))}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        )}
      </div>
      <p className="text-sm text-foreground/90">{reply.content}</p>
    </div>
  );
}

interface CommentItemProps {
  comment: Comment;
  postId: string;
  onEdit: (id: string, content: string) => void;
  onDelete: (id: string) => void;
  onReply: (parentId: string) => void;
  isAuthenticated: boolean;
}

function CommentItem({ comment, postId, onEdit, onDelete, onReply, isAuthenticated }: CommentItemProps) {
  const relativeDate = formatDistanceToNow(new Date(comment.created_at), {
    addSuffix: true,
    locale: ko,
  });

  return (
    <div className="py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-sm text-muted-foreground mb-3">
          <span className="flex items-center gap-1.5">
            <User className="w-4 h-4 text-primary/70" />
            <span className="font-medium text-foreground">{comment.author.name}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-primary/70" />
            {relativeDate}
          </span>
        </div>
        {isAuthenticated && (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-muted-foreground hover:text-foreground"
              onClick={() => onReply(String(comment.id))}
            >
              <Reply className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-muted-foreground hover:text-foreground"
              onClick={() => onEdit(String(comment.id), comment.content)}
            >
              <Edit className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-muted-foreground hover:text-destructive"
              onClick={() => onDelete(String(comment.id))}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        )}
      </div>
      <p className="text-foreground/90 leading-relaxed">{comment.content}</p>
      
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-4 space-y-2">
          {comment.replies.map((reply) => (
            <ReplyItem
              key={reply.id}
              reply={reply}
              postId={postId}
              onEdit={onEdit}
              onDelete={onDelete}
              isAuthenticated={isAuthenticated}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function CommentList({ postId }: CommentListProps) {
  const { isAuthenticated } = useAuth();
  const { data, isLoading, isError } = useComments(postId);
  const createComment = useCreateComment();
  const updateComment = useUpdateComment();
  const deleteComment = useDeleteComment();
  const { toast } = useToast();

  const [newComment, setNewComment] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleCreateComment = async () => {
    if (!newComment.trim()) return;
    
    try {
      await createComment.mutateAsync({
        postId,
        content: newComment.trim(),
      });
      setNewComment("");
      toast({
        title: "댓글 작성 완료",
        description: "댓글이 등록되었습니다.",
      });
    } catch (error) {
      toast({
        title: "댓글 작성 실패",
        description: error instanceof Error ? error.message : "댓글 작성에 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  const handleCreateReply = async () => {
    if (!replyContent.trim() || !replyingTo) return;
    
    try {
      await createComment.mutateAsync({
        postId,
        content: replyContent.trim(),
        parentId: parseInt(replyingTo),
      });
      setReplyContent("");
      setReplyingTo(null);
      toast({
        title: "답글 작성 완료",
        description: "답글이 등록되었습니다.",
      });
    } catch (error) {
      toast({
        title: "답글 작성 실패",
        description: error instanceof Error ? error.message : "답글 작성에 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (id: string, content: string) => {
    setEditingId(id);
    setEditContent(content);
  };

  const handleUpdateComment = async () => {
    if (!editContent.trim() || !editingId) return;
    
    try {
      await updateComment.mutateAsync({
        commentId: editingId,
        postId,
        content: editContent.trim(),
      });
      setEditingId(null);
      setEditContent("");
      toast({
        title: "댓글 수정 완료",
        description: "댓글이 수정되었습니다.",
      });
    } catch (error) {
      toast({
        title: "댓글 수정 실패",
        description: error instanceof Error ? error.message : "댓글 수정에 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteClick = (id: string) => {
    setDeletingId(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;
    
    try {
      await deleteComment.mutateAsync({
        commentId: deletingId,
        postId,
      });
      toast({
        title: "댓글 삭제 완료",
        description: "댓글이 삭제되었습니다.",
      });
    } catch (error) {
      toast({
        title: "댓글 삭제 실패",
        description: error instanceof Error ? error.message : "댓글 삭제에 실패했습니다.",
        variant: "destructive",
      });
    }
    setDeleteDialogOpen(false);
    setDeletingId(null);
  };

  return (
    <>
      <Card className="border-border/50 shadow-lg animate-slide-up mt-6">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <MessageCircle className="w-5 h-5 text-primary" />
            댓글
            {data && (
              <span className="text-sm font-normal text-muted-foreground">
                ({data.data.length})
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <Separator />
        <CardContent className="pt-4">
          {/* Comment Form */}
          {isAuthenticated && (
            <div className="mb-6">
              <Textarea
                placeholder="댓글을 입력하세요..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="min-h-[80px] resize-none"
                maxLength={1000}
              />
              <div className="flex justify-end mt-2">
                <Button
                  onClick={handleCreateComment}
                  disabled={!newComment.trim() || createComment.isPending}
                  size="sm"
                  className="gap-1.5"
                >
                  {createComment.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  작성
                </Button>
              </div>
            </div>
          )}

          {/* Edit Form */}
          {editingId && (
            <div className="mb-6 p-4 bg-muted/50 rounded-lg">
              <p className="text-sm font-medium mb-2">댓글 수정</p>
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="min-h-[80px] resize-none"
                maxLength={1000}
              />
              <div className="flex justify-end gap-2 mt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditingId(null);
                    setEditContent("");
                  }}
                >
                  <X className="w-4 h-4 mr-1" />
                  취소
                </Button>
                <Button
                  onClick={handleUpdateComment}
                  disabled={!editContent.trim() || updateComment.isPending}
                  size="sm"
                >
                  {updateComment.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-1" />
                  ) : (
                    <Edit className="w-4 h-4 mr-1" />
                  )}
                  수정
                </Button>
              </div>
            </div>
          )}

          {/* Reply Form */}
          {replyingTo && (
            <div className="mb-6 p-4 bg-muted/50 rounded-lg">
              <p className="text-sm font-medium mb-2">답글 작성</p>
              <Textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                className="min-h-[80px] resize-none"
                placeholder="답글을 입력하세요..."
                maxLength={1000}
              />
              <div className="flex justify-end gap-2 mt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setReplyingTo(null);
                    setReplyContent("");
                  }}
                >
                  <X className="w-4 h-4 mr-1" />
                  취소
                </Button>
                <Button
                  onClick={handleCreateReply}
                  disabled={!replyContent.trim() || createComment.isPending}
                  size="sm"
                >
                  {createComment.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-1" />
                  ) : (
                    <Reply className="w-4 h-4 mr-1" />
                  )}
                  답글
                </Button>
              </div>
            </div>
          )}

          {isLoading && (
            <div className="space-y-6">
              <CommentSkeleton />
              <CommentSkeleton />
            </div>
          )}

          {isError && (
            <p className="text-sm text-muted-foreground text-center py-6">
              댓글을 불러오는데 실패했습니다.
            </p>
          )}

          {data && data.data.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-6">
              아직 댓글이 없습니다.
            </p>
          )}

          {data && data.data.length > 0 && (
            <div className="divide-y divide-border/50">
              {data.data.map((comment) => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  postId={postId}
                  onEdit={handleEdit}
                  onDelete={handleDeleteClick}
                  onReply={(parentId) => setReplyingTo(parentId)}
                  isAuthenticated={isAuthenticated}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>댓글 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              정말로 이 댓글을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleteComment.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteComment.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  삭제 중...
                </>
              ) : (
                "삭제"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
