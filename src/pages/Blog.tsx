import { useState } from "react";
import { Link } from "react-router-dom";
import { useBlog, useBlogCategories, useBlogTags } from "@/core/hooks/useBlog";
import { Header } from "@/themes/default/layouts/Header";
import { Footer } from "@/themes/default/layouts/Footer";
import { LoadingState } from "@/themes/default/components/LoadingState";
import { ErrorState } from "@/themes/default/components/ErrorState";
import { EmptyState } from "@/themes/default/components/EmptyState";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, X, Calendar, Eye, Tag, FolderOpen } from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const Blog = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [selectedTag, setSelectedTag] = useState<string | undefined>();

  const { data, isLoading, isError, error, refetch } = useBlog({
    page: currentPage,
    search: searchQuery || undefined,
    category: selectedCategory,
    tag: selectedTag,
  });

  const { data: categories = [] } = useBlogCategories();
  const { data: tags = [] } = useBlogTags();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(searchInput);
    setCurrentPage(1);
  };

  const handleClearSearch = () => {
    setSearchInput("");
    setSearchQuery("");
    setCurrentPage(1);
  };

  const handleCategorySelect = (category: string | undefined) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const handleTagSelect = (tag: string | undefined) => {
    setSelectedTag(tag);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setSelectedCategory(undefined);
    setSelectedTag(undefined);
    setSearchQuery("");
    setSearchInput("");
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const hasActiveFilters = selectedCategory || selectedTag || searchQuery;

  const renderPagination = () => {
    if (!data?.meta || data.meta.last_page <= 1) return null;

    const { current_page, last_page } = data.meta;
    const pages: (number | "ellipsis")[] = [];

    pages.push(1);

    if (current_page > 3) {
      pages.push("ellipsis");
    }

    for (let i = Math.max(2, current_page - 1); i <= Math.min(last_page - 1, current_page + 1); i++) {
      if (!pages.includes(i)) {
        pages.push(i);
      }
    }

    if (current_page < last_page - 2) {
      pages.push("ellipsis");
    }

    if (last_page > 1 && !pages.includes(last_page)) {
      pages.push(last_page);
    }

    return (
      <Pagination className="mt-8">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => current_page > 1 && handlePageChange(current_page - 1)}
              className={current_page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
            />
          </PaginationItem>

          {pages.map((page, index) =>
            page === "ellipsis" ? (
              <PaginationItem key={`ellipsis-${index}`}>
                <PaginationEllipsis />
              </PaginationItem>
            ) : (
              <PaginationItem key={page}>
                <PaginationLink
                  onClick={() => handlePageChange(page)}
                  isActive={page === current_page}
                  className="cursor-pointer"
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            )
          )}

          <PaginationItem>
            <PaginationNext
              onClick={() => current_page < last_page && handlePageChange(current_page + 1)}
              className={current_page === last_page ? "pointer-events-none opacity-50" : "cursor-pointer"}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <div className="flex-1 max-w-6xl mx-auto px-4 py-12 w-full">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="lg:w-64 flex-shrink-0">
            {/* Categories */}
            {categories.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <FolderOpen className="w-4 h-4" />
                  Categories
                </h3>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={!selectedCategory ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleCategorySelect(undefined)}
                    className="text-xs"
                  >
                    All
                  </Button>
                  {categories.map((category) => (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleCategorySelect(category)}
                      className="text-xs"
                    >
                      {category}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            {tags.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant={selectedTag === tag ? "default" : "secondary"}
                      className="cursor-pointer hover:bg-primary/80 transition-colors"
                      onClick={() => handleTagSelect(selectedTag === tag ? undefined : tag)}
                    >
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Clear Filters */}
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="text-xs text-muted-foreground"
              >
                <X className="w-3 h-3 mr-1" />
                Clear all filters
              </Button>
            )}
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">Blog</h1>
              <p className="text-muted-foreground">
                Latest news and articles
              </p>
            </div>

            {/* Search */}
            <div className="flex justify-between items-center mb-6">
              {/* Active Filters Display */}
              <div className="flex items-center gap-2 flex-wrap">
                {selectedCategory && (
                  <Badge variant="outline" className="gap-1">
                    <FolderOpen className="w-3 h-3" />
                    {selectedCategory}
                    <X
                      className="w-3 h-3 ml-1 cursor-pointer"
                      onClick={() => handleCategorySelect(undefined)}
                    />
                  </Badge>
                )}
                {selectedTag && (
                  <Badge variant="outline" className="gap-1">
                    <Tag className="w-3 h-3" />
                    #{selectedTag}
                    <X
                      className="w-3 h-3 ml-1 cursor-pointer"
                      onClick={() => handleTagSelect(undefined)}
                    />
                  </Badge>
                )}
              </div>

              <form onSubmit={handleSearch} className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="pl-9 pr-8 h-9 text-sm"
                />
                {searchInput && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </form>
            </div>

            {searchQuery && (
              <div className="flex items-center gap-2 mb-4">
                <span className="text-sm text-muted-foreground">
                  "{searchQuery}" search results
                </span>
                <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                  {data?.meta?.total ?? 0} posts
                </span>
              </div>
            )}

            {isLoading && <LoadingState />}

            {isError && (
              <ErrorState
                message={error?.message || "An error occurred."}
                onRetry={() => refetch()}
              />
            )}

            {data && data.data.length === 0 && <EmptyState />}

            {data && data.data.length > 0 && (
              <>
                <div className="grid gap-6">
                  {data.data.map((post) => (
                    <Link key={post.id} to={`/blog/${post.slug}`}>
                      <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                        <div className="flex flex-col md:flex-row">
                          {post.featured_image && (
                            <div className="md:w-64 h-48 md:h-auto flex-shrink-0">
                              <img
                                src={post.featured_image}
                                alt={post.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          <CardContent className="flex-1 p-6">
                            {/* Category & Tags */}
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              {post.category && (
                                <Badge
                                  variant="secondary"
                                  className="text-xs cursor-pointer hover:bg-secondary/80"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    handleCategorySelect(post.category!);
                                  }}
                                >
                                  {post.category}
                                </Badge>
                              )}
                              {post.tags && post.tags.slice(0, 3).map((tag) => (
                                <Badge
                                  key={tag}
                                  variant="outline"
                                  className="text-xs cursor-pointer hover:bg-muted"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    handleTagSelect(tag);
                                  }}
                                >
                                  #{tag}
                                </Badge>
                              ))}
                            </div>

                            <h2 className="text-xl font-semibold text-foreground mb-2 line-clamp-2 hover:text-primary transition-colors">
                              {post.title}
                            </h2>
                            {post.excerpt && (
                              <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                                {post.excerpt}
                              </p>
                            )}
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              {post.author && (
                                <span>{post.author}</span>
                              )}
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {formatDate(post.published_at || post.created_at)}
                              </span>
                              {post.views !== undefined && post.views > 0 && (
                                <span className="flex items-center gap-1">
                                  <Eye className="w-3 h-3" />
                                  {post.views.toLocaleString()}
                                </span>
                              )}
                            </div>
                          </CardContent>
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>
                {renderPagination()}
              </>
            )}
          </main>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Blog;
