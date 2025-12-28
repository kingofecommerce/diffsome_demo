import { useState } from "react";
import { usePosts } from "@/hooks/usePosts";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BoardHeader } from "@/components/BoardHeader";
import { PostList } from "@/components/PostList";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";
import { EmptyState } from "@/components/EmptyState";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const Index = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const { data, isLoading, isError, error, refetch } = usePosts({ page: currentPage });

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const renderPagination = () => {
    if (!data?.meta || data.meta.last_page <= 1) return null;

    const { current_page, last_page } = data.meta;
    const pages: (number | "ellipsis")[] = [];

    // Always show first page
    pages.push(1);

    if (current_page > 3) {
      pages.push("ellipsis");
    }

    // Show pages around current
    for (let i = Math.max(2, current_page - 1); i <= Math.min(last_page - 1, current_page + 1); i++) {
      if (!pages.includes(i)) {
        pages.push(i);
      }
    }

    if (current_page < last_page - 2) {
      pages.push("ellipsis");
    }

    // Always show last page
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
      <div className="flex-1 max-w-3xl mx-auto px-4 py-12 w-full">
        <BoardHeader total={data?.meta.total ?? 0} />
        
        {isLoading && <LoadingState />}
        
        {isError && (
          <ErrorState 
            message={error?.message || "알 수 없는 오류가 발생했습니다."} 
            onRetry={() => refetch()} 
          />
        )}
        
        {data && data.data.length === 0 && <EmptyState />}
        
        {data && data.data.length > 0 && (
          <>
            <PostList posts={data.data} />
            {renderPagination()}
          </>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Index;
