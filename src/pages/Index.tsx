import { usePosts } from "@/hooks/usePosts";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BoardHeader } from "@/components/BoardHeader";
import { PostList } from "@/components/PostList";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";
import { EmptyState } from "@/components/EmptyState";

const Index = () => {
  const { data, isLoading, isError, error, refetch } = usePosts();

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
        
        {data && data.data.length > 0 && <PostList posts={data.data} />}
      </div>
      <Footer />
    </div>
  );
};

export default Index;
