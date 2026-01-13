import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/core/providers/AuthProvider";
import { useCreatePost } from "@/core/hooks/useCreatePost";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/core/hooks/use-toast";
import { ArrowLeft, Loader2, FileText } from "lucide-react";
import { z } from "zod";

const postSchema = z.object({
  title: z.string().min(1, "제목을 입력해주세요.").max(255, "제목은 255자 이내로 입력해주세요."),
  content: z.string().min(1, "내용을 입력해주세요."),
});

const WritePost = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [errors, setErrors] = useState<{ title?: string; content?: string }>({});

  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const createPost = useCreatePost();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = postSchema.safeParse({ title, content });
    if (!result.success) {
      const fieldErrors: { title?: string; content?: string } = {};
      result.error.errors.forEach((err) => {
        if (err.path[0] === "title") fieldErrors.title = err.message;
        if (err.path[0] === "content") fieldErrors.content = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    if (!isAuthenticated) {
      toast({
        title: "로그인 필요",
        description: "글을 작성하려면 로그인이 필요합니다.",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    try {
      await createPost.mutateAsync({
        board_id: 1,
        title,
        content,
      });

      toast({
        title: "작성 완료",
        description: "게시글이 성공적으로 작성되었습니다.",
      });
      navigate("/");
    } catch (error) {
      toast({
        title: "작성 실패",
        description: error instanceof Error ? error.message : "게시글 작성에 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-border/50 shadow-lg">
          <CardContent className="pt-6 text-center space-y-4">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto" />
            <p className="text-muted-foreground">글을 작성하려면 로그인이 필요합니다.</p>
            <div className="flex gap-2 justify-center">
              <Button variant="outline" asChild>
                <Link to="/">돌아가기</Link>
              </Button>
              <Button asChild>
                <Link to="/login">로그인</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          게시판으로 돌아가기
        </Link>

        <Card className="border-border/50 shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-primary/10 rounded-xl">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-xl font-bold">새 글 작성</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">제목</Label>
                <Input
                  id="title"
                  placeholder="제목을 입력하세요"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={errors.title ? "border-destructive" : ""}
                  disabled={createPost.isPending}
                />
                {errors.title && (
                  <p className="text-sm text-destructive">{errors.title}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">내용</Label>
                <Textarea
                  id="content"
                  placeholder="내용을 입력하세요"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className={`min-h-[300px] resize-y ${errors.content ? "border-destructive" : ""}`}
                  disabled={createPost.isPending}
                />
                {errors.content && (
                  <p className="text-sm text-destructive">{errors.content}</p>
                )}
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" asChild>
                  <Link to="/">취소</Link>
                </Button>
                <Button type="submit" disabled={createPost.isPending}>
                  {createPost.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      작성 중...
                    </>
                  ) : (
                    "작성하기"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WritePost;
