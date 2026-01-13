import { Header } from "@/themes/default/layouts/Header";
import { Footer } from "@/themes/default/layouts/Footer";
import { ProductCard } from "@/themes/default/components/ProductCard";
import { useProducts } from "@/core/hooks/useProducts";
import { ErrorState } from "@/themes/default/components/ErrorState";
import { ShoppingBag } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

function ProductLoadingState() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <Card key={i} className="overflow-hidden">
          <Skeleton className="aspect-square w-full" />
          <CardContent className="p-4 space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-24" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function ProductEmptyState() {
  return (
    <Card className="border-border/50">
      <CardContent className="p-12 text-center">
        <ShoppingBag className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
        <h3 className="font-semibold text-foreground mb-2">등록된 상품이 없습니다</h3>
        <p className="text-muted-foreground text-sm">
          아직 등록된 상품이 없습니다.
        </p>
      </CardContent>
    </Card>
  );
}

const Products = () => {
  const { data: products, isLoading, error, refetch } = useProducts();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 max-w-6xl mx-auto px-4 py-8 w-full">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">상품 목록</h1>
          <p className="text-muted-foreground">다양한 상품을 만나보세요</p>
        </div>

        {isLoading ? (
          <ProductLoadingState />
        ) : error ? (
          <ErrorState 
            message="상품을 불러오는데 실패했습니다." 
            onRetry={refetch} 
          />
        ) : !products || products.length === 0 ? (
          <ProductEmptyState />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Products;
