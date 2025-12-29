import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Product } from "@/types/product";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ko-KR").format(price) + "원";
  };

  const discountPercent = product.compare_price
    ? Math.round(((product.compare_price - product.price) / product.compare_price) * 100)
    : null;

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group">
      <div className="aspect-square overflow-hidden bg-muted">
        <img
          src={product.thumbnail}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <CardContent className="p-4">
        <Badge variant="secondary" className="mb-2 text-xs">
          {product.category.name}
        </Badge>
        <h3 className="font-medium text-foreground line-clamp-2 mb-2 min-h-[2.5rem]">
          {product.name}
        </h3>
        <div className="flex items-center gap-2">
          {discountPercent && (
            <span className="text-destructive font-bold text-sm">
              {discountPercent}%
            </span>
          )}
          <span className="font-bold text-foreground">
            {formatPrice(product.price)}
          </span>
        </div>
        {product.compare_price && (
          <span className="text-muted-foreground text-sm line-through">
            {formatPrice(product.compare_price)}
          </span>
        )}
        {!product.in_stock && (
          <Badge variant="outline" className="mt-2 text-xs">
            품절
          </Badge>
        )}
      </CardContent>
    </Card>
  );
}
