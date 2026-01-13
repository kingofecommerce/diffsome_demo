import { useState } from "react";
import { useCreateReview } from "@/core/hooks/useProductReviews";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, Loader2 } from "lucide-react";
import { useToast } from "@/core/hooks/use-toast";

interface ReviewFormProps {
  productSlug: string;
  productName: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const RatingInput = ({
  value,
  onChange,
}: {
  value: number;
  onChange: (rating: number) => void;
}) => {
  const [hoverRating, setHoverRating] = useState(0);

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHoverRating(star)}
          onMouseLeave={() => setHoverRating(0)}
          className="p-1 transition-transform hover:scale-110"
        >
          <Star
            className={`w-8 h-8 ${
              star <= (hoverRating || value)
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            }`}
          />
        </button>
      ))}
      <span className="ml-2 text-lg font-medium self-center">
        {value > 0 ? `${value}점` : "평점을 선택하세요"}
      </span>
    </div>
  );
};

export const ReviewForm = ({
  productSlug,
  productName,
  onSuccess,
  onCancel,
}: ReviewFormProps) => {
  const { toast } = useToast();
  const createReview = useCreateReview(productSlug);

  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      toast({
        variant: "destructive",
        title: "평점을 선택해주세요",
        description: "1점부터 5점까지 선택할 수 있습니다.",
      });
      return;
    }

    if (!content.trim()) {
      toast({
        variant: "destructive",
        title: "리뷰 내용을 입력해주세요",
        description: "상품에 대한 솔직한 의견을 남겨주세요.",
      });
      return;
    }

    try {
      await createReview.mutateAsync({
        rating,
        title: title.trim() || undefined,
        content: content.trim(),
      });

      toast({
        title: "리뷰가 등록되었습니다",
        description: "소중한 리뷰 감사합니다!",
      });

      // Reset form
      setRating(0);
      setTitle("");
      setContent("");

      onSuccess?.();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "리뷰 등록 실패",
        description: error.message || "잠시 후 다시 시도해주세요.",
      });
    }
  };

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">리뷰 작성</CardTitle>
        <p className="text-sm text-muted-foreground">
          {productName}에 대한 솔직한 리뷰를 남겨주세요.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Rating */}
          <div>
            <Label className="mb-2 block">평점 *</Label>
            <RatingInput value={rating} onChange={setRating} />
          </div>

          {/* Title */}
          <div>
            <Label htmlFor="review-title">제목 (선택)</Label>
            <Input
              id="review-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="리뷰 제목을 입력하세요"
              maxLength={100}
              className="mt-1"
            />
          </div>

          {/* Content */}
          <div>
            <Label htmlFor="review-content">내용 *</Label>
            <Textarea
              id="review-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="상품에 대한 솔직한 의견을 남겨주세요."
              rows={4}
              maxLength={2000}
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {content.length}/2000자
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              type="submit"
              disabled={createReview.isPending}
              className="flex-1"
            >
              {createReview.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  등록 중...
                </>
              ) : (
                "리뷰 등록"
              )}
            </Button>
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={createReview.isPending}
              >
                취소
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
