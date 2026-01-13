import { useParams, Link, useNavigate } from "react-router-dom";
import { useBlogPost } from "@/core/hooks/useBlog";
import { Header } from "@/themes/default/layouts/Header";
import { Footer } from "@/themes/default/layouts/Footer";
import { LoadingState } from "@/themes/default/components/LoadingState";
import { ErrorState } from "@/themes/default/components/ErrorState";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, User, Eye, Tag, FolderOpen } from "lucide-react";
import { BlogCommentList } from "@/themes/default/components/BlogCommentList";

const BlogDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { data: post, isLoading, isError, error, refetch } = useBlogPost(slug || "");

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleCategoryClick = (category: string) => {
    navigate(`/blog?category=${encodeURIComponent(category)}`);
  };

  const handleTagClick = (tag: string) => {
    navigate(`/blog?tag=${encodeURIComponent(tag)}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <div className="flex-1 max-w-3xl mx-auto px-4 py-12 w-full">
          <LoadingState />
        </div>
        <Footer />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <div className="flex-1 max-w-3xl mx-auto px-4 py-12 w-full">
          <ErrorState
            message={error?.message || "Failed to load article."}
            onRetry={() => refetch()}
          />
        </div>
        <Footer />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <div className="flex-1 max-w-3xl mx-auto px-4 py-12 w-full">
          <div className="text-center py-12">
            <p className="text-muted-foreground">Article not found.</p>
            <Button asChild className="mt-4">
              <Link to="/blog">Back to blog</Link>
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <article className="flex-1 max-w-3xl mx-auto px-4 py-12 w-full">
        {/* Back button */}
        <Button variant="ghost" size="sm" asChild className="mb-6">
          <Link to="/blog">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to blog
          </Link>
        </Button>

        {/* Featured Image */}
        {post.featured_image && (
          <div className="mb-8 rounded-lg overflow-hidden">
            <img
              src={post.featured_image}
              alt={post.title}
              className="w-full h-64 md:h-96 object-cover"
            />
          </div>
        )}

        {/* Header */}
        <header className="mb-8">
          {/* Category & Tags */}
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            {(post as any).category && (
              <Badge
                variant="secondary"
                className="cursor-pointer hover:bg-secondary/80 gap-1"
                onClick={() => handleCategoryClick((post as any).category)}
              >
                <FolderOpen className="w-3 h-3" />
                {(post as any).category}
              </Badge>
            )}
            {(post as any).tags && (post as any).tags.map((tag: string) => (
              <Badge
                key={tag}
                variant="outline"
                className="cursor-pointer hover:bg-muted gap-1"
                onClick={() => handleTagClick(tag)}
              >
                <Tag className="w-3 h-3" />
                #{tag}
              </Badge>
            ))}
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {post.title}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            {post.author && (
              <span className="flex items-center gap-1">
                <User className="w-4 h-4" />
                {post.author}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {formatDate((post as any).published_at || post.created_at)}
            </span>
            {(post as any).views !== undefined && (post as any).views > 0 && (
              <span className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                {(post as any).views.toLocaleString()} views
              </span>
            )}
          </div>
        </header>

        {/* Content */}
        <div
          className="prose prose-neutral dark:prose-invert max-w-none mb-8"
          dangerouslySetInnerHTML={{ __html: post.content || "" }}
        />

        {/* Tags at bottom */}
        {(post as any).tags && (post as any).tags.length > 0 && (
          <div className="mt-8 pt-6 border-t">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {(post as any).tags.map((tag: string) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="cursor-pointer hover:bg-secondary/80"
                  onClick={() => handleTagClick(tag)}
                >
                  #{tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Comments */}
        {slug && <BlogCommentList slug={slug} />}

        {/* Navigation */}
        <div className="mt-12 pt-6 border-t">
          <Button asChild>
            <Link to="/blog">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to all posts
            </Link>
          </Button>
        </div>
      </article>
      <Footer />
    </div>
  );
};

export default BlogDetail;
