import { useState } from "react";
import { useProductReviews, useCanReview, useMarkReviewHelpful } from "@/core/hooks/useProductReviews";
import { ReviewForm } from "@/themes/default/components/ReviewForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Star, ThumbsUp, MessageSquare, ChevronDown, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { diffsome } from "@/core/lib/diffsome";
import type { ProductReview, ProductReviewStats } from "@diffsome/sdk";

interface ProductReviewsProps {
  productSlug: string;
  productName: string;
}

const RatingStars = ({ rating, size = "sm" }: { rating: number; size?: "sm" | "lg" }) => {
  const starSize = size === "lg" ? "w-5 h-5" : "w-4 h-4";
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${starSize} ${
            star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
          }`}
        />
      ))}
    </div>
  );
};

const ReviewStats = ({ stats }: { stats: ProductReviewStats }) => {
  const maxCount = Math.max(...Object.values(stats.rating_counts), 1);

  return (
    <div className="flex flex-col sm:flex-row gap-6 p-4 bg-muted/50 rounded-lg">
      <div className="flex flex-col items-center justify-center">
        <div className="text-4xl font-bold">{stats.average_rating.toFixed(1)}</div>
        <RatingStars rating={Math.round(stats.average_rating)} size="lg" />
        <div className="text-sm text-muted-foreground mt-1">
          {stats.total_count}개 리뷰
        </div>
      </div>
      <div className="flex-1 space-y-2">
        {[5, 4, 3, 2, 1].map((rating) => (
          <div key={rating} className="flex items-center gap-2">
            <span className="text-sm w-8">{rating}점</span>
            <Progress
              value={(stats.rating_counts[rating as keyof typeof stats.rating_counts] / maxCount) * 100}
              className="h-2 flex-1"
            />
            <span className="text-sm text-muted-foreground w-8 text-right">
              {stats.rating_counts[rating as keyof typeof stats.rating_counts]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const ReviewCard = ({ review }: { review: ProductReview }) => {
  const markHelpful = useMarkReviewHelpful();

  const handleHelpful = () => {
    markHelpful.mutate(review.id);
  };

  return (
    <div className="border-b py-4 last:border-b-0">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <RatingStars rating={review.rating} />
            {review.is_verified_purchase && (
              <Badge variant="secondary" className="text-xs">구매인증</Badge>
            )}
            {review.is_featured && (
              <Badge variant="default" className="text-xs">추천</Badge>
            )}
          </div>
          {review.title && (
            <h4 className="font-medium mb-1">{review.title}</h4>
          )}
          <p className="text-muted-foreground whitespace-pre-wrap">{review.content}</p>

          {/* Review Images */}
          {review.images && review.images.length > 0 && (
            <div className="flex gap-2 mt-3">
              {review.images.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`리뷰 이미지 ${index + 1}`}
                  className="w-20 h-20 object-cover rounded-md"
                />
              ))}
            </div>
          )}

          {/* Admin Reply */}
          {review.admin_reply && (
            <div className="mt-3 p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <MessageSquare className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">판매자 답변</span>
              </div>
              <p className="text-sm text-muted-foreground">{review.admin_reply}</p>
            </div>
          )}

          <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
            <span>{review.author?.name || "익명"}</span>
            <span>
              {formatDistanceToNow(new Date(review.created_at), {
                addSuffix: true,
                locale: ko,
              })}
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-0 text-muted-foreground hover:text-foreground"
              onClick={handleHelpful}
              disabled={markHelpful.isPending}
            >
              <ThumbsUp className="w-4 h-4 mr-1" />
              도움됨 {review.helpful_count > 0 && `(${review.helpful_count})`}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ProductReviews = ({ productSlug, productName }: ProductReviewsProps) => {
  const [showForm, setShowForm] = useState(false);
  const [sortBy, setSortBy] = useState<"newest" | "highest" | "lowest" | "helpful">("newest");
  const [filterRating, setFilterRating] = useState<number | undefined>();

  const { data, isLoading, error } = useProductReviews(productSlug, {
    sort: sortBy,
    rating: filterRating,
    per_page: 10,
  });

  const { data: canReviewData } = useCanReview(productSlug);

  const isLoggedIn = diffsome.isAuthenticated();
  const canReview = canReviewData?.can_review ?? false;

  const handleReviewSuccess = () => {
    setShowForm(false);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  const reviews = data?.data || [];
  const stats = data?.stats;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>상품 리뷰</span>
          {stats && stats.total_count > 0 && (
            <Badge variant="secondary">{stats.total_count}개</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Stats */}
        {stats && stats.total_count > 0 && <ReviewStats stats={stats} />}

        {/* Write Review Button */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          {isLoggedIn ? (
            canReview ? (
              <Button onClick={() => setShowForm(!showForm)}>
                {showForm ? "취소" : "리뷰 작성하기"}
              </Button>
            ) : (
              <p className="text-sm text-muted-foreground">
                {canReviewData?.reason === "already_reviewed"
                  ? "이미 리뷰를 작성하셨습니다."
                  : "구매 완료 후 리뷰를 작성할 수 있습니다."}
              </p>
            )
          ) : (
            <p className="text-sm text-muted-foreground">
              리뷰를 작성하려면 로그인이 필요합니다.
            </p>
          )}

          {/* Sort & Filter */}
          {reviews.length > 0 && (
            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="text-sm border rounded-md px-2 py-1"
              >
                <option value="newest">최신순</option>
                <option value="highest">평점 높은순</option>
                <option value="lowest">평점 낮은순</option>
                <option value="helpful">도움순</option>
              </select>
              <select
                value={filterRating || ""}
                onChange={(e) =>
                  setFilterRating(e.target.value ? Number(e.target.value) : undefined)
                }
                className="text-sm border rounded-md px-2 py-1"
              >
                <option value="">전체 평점</option>
                <option value="5">5점</option>
                <option value="4">4점</option>
                <option value="3">3점</option>
                <option value="2">2점</option>
                <option value="1">1점</option>
              </select>
            </div>
          )}
        </div>

        {/* Review Form */}
        {showForm && (
          <ReviewForm
            productSlug={productSlug}
            productName={productName}
            onSuccess={handleReviewSuccess}
            onCancel={() => setShowForm(false)}
          />
        )}

        {/* Reviews List */}
        {reviews.length > 0 ? (
          <div className="divide-y">
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            아직 리뷰가 없습니다. 첫 번째 리뷰를 작성해보세요!
          </div>
        )}
      </CardContent>
    </Card>
  );
};
