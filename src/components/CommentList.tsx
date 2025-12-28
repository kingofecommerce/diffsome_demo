import { MessageCircle, User, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { useComments } from "@/hooks/useComments";
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

function ReplyItem({ reply }: { reply: CommentReply }) {
  const relativeDate = formatDistanceToNow(new Date(reply.created_at), {
    addSuffix: true,
    locale: ko,
  });

  return (
    <div className="pl-6 border-l-2 border-primary/20 py-3">
      <div className="flex items-center gap-3 text-sm text-muted-foreground mb-2">
        <span className="flex items-center gap-1.5">
          <User className="w-3.5 h-3.5" />
          <span className="font-medium text-foreground">{reply.author}</span>
        </span>
        <span className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" />
          {relativeDate}
        </span>
      </div>
      <p className="text-sm text-foreground/90">{reply.content}</p>
    </div>
  );
}

function CommentItem({ comment }: { comment: Comment }) {
  const relativeDate = formatDistanceToNow(new Date(comment.created_at), {
    addSuffix: true,
    locale: ko,
  });

  return (
    <div className="py-4">
      <div className="flex items-center gap-3 text-sm text-muted-foreground mb-3">
        <span className="flex items-center gap-1.5">
          <User className="w-4 h-4 text-primary/70" />
          <span className="font-medium text-foreground">{comment.author}</span>
        </span>
        <span className="flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-primary/70" />
          {relativeDate}
        </span>
      </div>
      <p className="text-foreground/90 leading-relaxed">{comment.content}</p>
      
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-4 space-y-2">
          {comment.replies.map((reply) => (
            <ReplyItem key={reply.id} reply={reply} />
          ))}
        </div>
      )}
    </div>
  );
}

export function CommentList({ postId }: CommentListProps) {
  const { data, isLoading, isError } = useComments(postId);

  return (
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
              <CommentItem key={comment.id} comment={comment} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
