import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, ImageOff } from "lucide-react";
import type { Product } from "@diffsome/sdk";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ko-KR").format(price) + "원";
  };

  // 옵션 상품의 경우 가격 범위 표시
  const hasPriceRange = product.has_options &&
    product.min_sale_price !== null &&
    product.max_sale_price !== null &&
    product.min_sale_price !== product.max_sale_price;

  return (
    <Link to={`/products/${product.slug}`}>
    <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group">
      <div className="aspect-square overflow-hidden bg-muted relative">
        {product.thumbnail ? (
          <img
            src={product.thumbnail}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted">
            <ImageOff className="w-12 h-12 text-muted-foreground/30" />
          </div>
        )}
        {product.discount_percent && product.discount_percent > 0 && (
          <Badge className="absolute top-2 left-2 bg-destructive text-destructive-foreground">
            {product.discount_percent}% OFF
          </Badge>
        )}
        {!product.in_stock && (
          <div className="absolute inset-0 bg-background/70 flex items-center justify-center">
            <Badge variant="secondary" className="text-sm">품절</Badge>
          </div>
        )}
        {product.is_low_stock && product.in_stock && (
          <Badge className="absolute top-2 right-2 bg-orange-500 text-white text-xs">
            재고 부족
          </Badge>
        )}
      </div>
      <CardContent className="p-4">
        {product.category?.name && (
          <Badge variant="outline" className="mb-2 text-xs">
            {product.category.name}
          </Badge>
        )}
        <h3 className="font-medium text-foreground line-clamp-2 mb-3 min-h-[2.5rem]">
          {product.name}
        </h3>

        <div className="space-y-2">
          <div className="flex items-baseline gap-2 flex-wrap">
            {hasPriceRange ? (
              <span className="font-bold text-lg text-foreground">
                {formatPrice(product.min_sale_price!)} ~ {formatPrice(product.max_sale_price!)}
              </span>
            ) : (
              <>
                <span className="font-bold text-lg text-foreground">
                  {formatPrice(product.sale_price)}
                </span>
                {product.regular_price && product.regular_price > product.sale_price && (
                  <span className="text-muted-foreground text-sm line-through">
                    {formatPrice(product.regular_price)}
                  </span>
                )}
              </>
            )}
          </div>

          {product.track_inventory && product.in_stock && (
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Package className="w-3 h-3" />
                <span>재고 {product.stock_quantity}</span>
              </div>
            </div>
          )}

          {product.sku && (
            <p className="text-xs text-muted-foreground">
              SKU: {product.sku}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
    </Link>
  );
}
