import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, User, Clock, Eye, Home, ChevronRight, Pin, Edit, Trash2, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { usePostDetail } from "@/hooks/usePostDetail";
import { useDeletePost } from "@/hooks/useDeletePost";
import { useToast } from "@/hooks/use-toast";
import { CommentList } from "@/components/CommentList";
import { formatDistanceToNow, format } from "date-fns";
import { ko } from "date-fns/locale";

function PostDetailSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Skeleton className="h-5 w-48 mb-8" />
        <Card className="border-border/50">
          <CardHeader className="space-y-4 pb-6">
            <Skeleton className="h-8 w-3/4" />
            <div className="flex gap-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-16" />
            </div>
          </CardHeader>
          <Separator />
          <CardContent className="pt-8 space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function PostDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { data, isLoading, error } = usePostDetail(id || "");
  const deletePost = useDeletePost();
  const { toast } = useToast();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleDelete = async () => {
    if (!id) return;
    
    try {
      await deletePost.mutateAsync(id);
      toast({
        title: "삭제 완료",
        description: "게시글이 성공적으로 삭제되었습니다.",
      });
      navigate("/");
    } catch (error) {
      toast({
        title: "삭제 실패",
        description: error instanceof Error ? error.message : "게시글 삭제에 실패했습니다.",
        variant: "destructive",
      });
    }
    setIsDeleteDialogOpen(false);
  };

  if (isLoading) {
    return <PostDetailSkeleton />;
  }

  if (error || !data?.data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="border-destructive/30 bg-destructive/5 max-w-md mx-4">
          <CardContent className="p-8 text-center">
            <h3 className="font-semibold text-foreground mb-2">오류가 발생했습니다</h3>
            <p className="text-muted-foreground text-sm mb-4">
              {error?.message || "게시글을 찾을 수 없습니다."}
            </p>
            <Button onClick={() => navigate("/")} variant="outline" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              목록으로 돌아가기
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const post = data.data;
  const relativeDate = formatDistanceToNow(new Date(post.created_at), {
    addSuffix: true,
    locale: ko,
  });
  const absoluteDate = format(new Date(post.created_at), "yyyy년 M월 d일 HH:mm", { locale: ko });

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6 animate-fade-in">
          <button 
            onClick={() => navigate("/")}
            className="flex items-center gap-1 hover:text-primary transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>홈</span>
          </button>
          <ChevronRight className="w-4 h-4" />
          <span className="text-foreground">{post.board.name}</span>
          <ChevronRight className="w-4 h-4" />
          <span className="text-foreground truncate max-w-[200px]">{post.title}</span>
        </nav>

        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => navigate("/")}
          className="mb-6 gap-2 hover:bg-primary/10 hover:text-primary transition-colors animate-fade-in"
        >
          <ArrowLeft className="w-4 h-4" />
          목록으로
        </Button>

        {/* Main Content Card */}
        <Card className="border-border/50 shadow-lg animate-slide-up overflow-hidden">
          <CardHeader className="space-y-4 bg-gradient-to-br from-primary/5 to-transparent pb-6">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-3 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  {post.is_notice && (
                    <Badge variant="notice" className="flex items-center gap-1">
                      <Pin className="w-3 h-3" />
                      공지
                    </Badge>
                  )}
                  <Badge variant="secondary" className="text-xs">
                    {post.board.name}
                  </Badge>
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground leading-tight">
                  {post.title}
                </h1>
              </div>
              <div className="text-5xl font-bold text-primary/10 hidden md:block">
                {String(post.id).padStart(2, '0')}
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <User className="w-4 h-4 text-primary/70" />
                <span className="font-medium text-foreground">{post.author || '익명'}</span>
              </span>
              <span className="flex items-center gap-1.5" title={absoluteDate}>
                <Clock className="w-4 h-4 text-primary/70" />
                {relativeDate}
              </span>
              <span className="flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-primary/70" />
                조회 {post.views ?? 0}
              </span>
            </div>
          </CardHeader>
          
          <Separator />
          
          <CardContent className="pt-8 pb-12">
            <article 
              className="prose prose-lg dark:prose-invert max-w-none
                prose-headings:text-foreground
                prose-p:text-foreground/90 prose-p:leading-relaxed
                prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                prose-strong:text-foreground
                prose-blockquote:border-l-primary prose-blockquote:bg-muted/50 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-r-lg
                prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
                prose-img:rounded-lg prose-img:shadow-md"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </CardContent>
        </Card>

        {/* Comment List */}
        {id && <CommentList postId={id} />}

        {/* Footer Navigation */}
        <div className="mt-8 flex justify-center gap-3 animate-fade-in" style={{ animationDelay: "200ms" }}>
          <Button 
            variant="outline" 
            onClick={() => navigate("/")}
            className="gap-2 hover:bg-primary hover:text-primary-foreground transition-all duration-300"
          >
            <ArrowLeft className="w-4 h-4" />
            목록으로 돌아가기
          </Button>
          {isAuthenticated && (
            <>
              <Button 
                onClick={() => navigate(`/posts/${id}/edit`)}
                className="gap-2"
              >
                <Edit className="w-4 h-4" />
                수정하기
              </Button>
              <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="gap-2">
                    <Trash2 className="w-4 h-4" />
                    삭제하기
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>게시글 삭제</AlertDialogTitle>
                    <AlertDialogDescription>
                      정말로 이 게시글을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>취소</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      disabled={deletePost.isPending}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {deletePost.isPending ? (
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
          )}
        </div>
      </div>
    </div>
  );
}
