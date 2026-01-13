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

  const discountPercent = product.compare_price
    ? Math.round(((product.compare_price - product.price) / product.compare_price) * 100)
    : null;

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
        {discountPercent && discountPercent > 0 && (
          <Badge className="absolute top-2 left-2 bg-destructive text-destructive-foreground">
            {discountPercent}% OFF
          </Badge>
        )}
        {!product.in_stock && (
          <div className="absolute inset-0 bg-background/70 flex items-center justify-center">
            <Badge variant="secondary" className="text-sm">품절</Badge>
          </div>
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
          <div className="flex items-baseline gap-2">
            <span className="font-bold text-lg text-foreground">
              {formatPrice(product.price)}
            </span>
            {product.compare_price && product.compare_price > product.price && (
              <span className="text-muted-foreground text-sm line-through">
                {formatPrice(product.compare_price)}
              </span>
            )}
          </div>

          {product.track_inventory && product.stock_quantity > 0 && (
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
