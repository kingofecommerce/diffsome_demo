import { useParams, Link, useNavigate } from "react-router-dom";
import { useProduct } from "@/core/hooks/useProducts";
import { useAddToCart } from "@/core/hooks/useCart";
import { Header } from "@/themes/default/layouts/Header";
import { Footer } from "@/themes/default/layouts/Footer";
import { LoadingState } from "@/themes/default/components/LoadingState";
import { ErrorState } from "@/themes/default/components/ErrorState";
import { ProductReviews } from "@/themes/default/components/ProductReviews";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Package, ImageOff, ShoppingCart, Minus, Plus, Loader2 } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { useToast } from "@/core/hooks/use-toast";
import type { ProductVariant } from "@diffsome/sdk";

const ProductDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: product, isLoading, isError, error, refetch } = useProduct(slug || "");
  const addToCart = useAddToCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});

  // Initialize selected options when product loads
  useEffect(() => {
    if (product?.options && product.options.length > 0) {
      const initialOptions: Record<string, string> = {};
      product.options.forEach((option) => {
        if (option.values && option.values.length > 0) {
          initialOptions[option.name] = option.values[0].value;
        }
      });
      setSelectedOptions(initialOptions);
    }
  }, [product]);

  // Find matching variant based on selected options
  const selectedVariant = useMemo(() => {
    if (!product?.has_options || !product.variants || Object.keys(selectedOptions).length === 0) {
      return null;
    }

    return product.variants.find((variant) => {
      if (!variant.is_active) return false;
      // Check if all selected options match the variant's option_values
      return Object.entries(selectedOptions).every(
        ([optionName, optionValue]) => variant.option_values[optionName] === optionValue
      );
    }) || null;
  }, [product, selectedOptions]);

  // Get current price (from variant or product)
  const currentPrice = selectedVariant?.price ?? product?.price ?? 0;
  const currentComparePrice = selectedVariant?.compare_price ?? product?.compare_price;
  const currentStock = selectedVariant?.stock_quantity ?? product?.stock_quantity ?? 0;
  const isInStock = product?.has_options
    ? selectedVariant?.is_active && selectedVariant?.stock_quantity > 0
    : product?.in_stock;

  const handleOptionChange = (optionName: string, value: string) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [optionName]: value,
    }));
    setQuantity(1); // Reset quantity when option changes
  };

  const handleAddToCart = async () => {
    if (!product) return;

    // Check if options are required but no variant selected
    if (product.has_options && !selectedVariant) {
      toast({
        variant: "destructive",
        title: "옵션 선택 필요",
        description: "상품 옵션을 선택해주세요.",
      });
      return;
    }

    try {
      await addToCart.mutateAsync({
        product_id: product.id,
        variant_id: selectedVariant?.id,
        quantity,
      });

      const optionText = selectedVariant
        ? ` (${Object.values(selectedVariant.option_values).join(", ")})`
        : "";

      toast({
        title: "장바구니에 담았습니다",
        description: `${product.name}${optionText} ${quantity}개가 장바구니에 추가되었습니다.`,
      });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "오류",
        description: err.message || "장바구니 추가에 실패했습니다.",
      });
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ko-KR").format(price) + "원";
  };

  const discountPercent = currentComparePrice
    ? Math.round(((currentComparePrice - currentPrice) / currentComparePrice) * 100)
    : null;

  const handleQuantityChange = (delta: number) => {
    const newQuantity = quantity + delta;
    const maxStock = product?.track_inventory ? currentStock : 999;
    if (newQuantity >= 1 && newQuantity <= maxStock) {
      setQuantity(newQuantity);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <div className="flex-1 max-w-5xl mx-auto px-4 py-12 w-full">
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
        <div className="flex-1 max-w-5xl mx-auto px-4 py-12 w-full">
          <ErrorState
            message={error?.message || "상품을 불러오는데 실패했습니다."}
            onRetry={() => refetch()}
          />
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <div className="flex-1 max-w-5xl mx-auto px-4 py-12 w-full">
          <div className="text-center py-12">
            <p className="text-muted-foreground">상품을 찾을 수 없습니다.</p>
            <Button asChild className="mt-4">
              <Link to="/products">상품 목록으로</Link>
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
      <main className="flex-1 max-w-5xl mx-auto px-4 py-12 w-full">
        {/* Back button */}
        <Button variant="ghost" size="sm" asChild className="mb-6">
          <Link to="/products">
            <ArrowLeft className="w-4 h-4 mr-2" />
            상품 목록
          </Link>
        </Button>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Product Image */}
          <div className="space-y-4">
            <div className="aspect-square rounded-lg overflow-hidden bg-muted relative">
              {product.thumbnail ? (
                <img
                  src={product.thumbnail}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageOff className="w-24 h-24 text-muted-foreground/30" />
                </div>
              )}
              {discountPercent && discountPercent > 0 && (
                <Badge className="absolute top-4 left-4 bg-destructive text-destructive-foreground text-lg px-3 py-1">
                  {discountPercent}% OFF
                </Badge>
              )}
              {!isInStock && (
                <div className="absolute inset-0 bg-background/70 flex items-center justify-center">
                  <Badge variant="secondary" className="text-lg px-4 py-2">품절</Badge>
                </div>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {product.category?.name && (
              <Badge variant="outline" className="text-sm">
                {product.category.name}
              </Badge>
            )}

            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                {product.name}
              </h1>
              {(selectedVariant?.sku || product.sku) && (
                <p className="text-sm text-muted-foreground">
                  SKU: {selectedVariant?.sku || product.sku}
                </p>
              )}
            </div>

            {/* Price */}
            <div className="space-y-1">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-foreground">
                  {formatPrice(currentPrice)}
                </span>
                {currentComparePrice && currentComparePrice > currentPrice && (
                  <span className="text-xl text-muted-foreground line-through">
                    {formatPrice(currentComparePrice)}
                  </span>
                )}
              </div>
            </div>

            {/* Options Selector */}
            {product.has_options && product.options && product.options.length > 0 && (
              <div className="space-y-4">
                {product.options.map((option) => (
                  <div key={option.id}>
                    <label className="block text-sm font-medium mb-2">
                      {option.name}
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {option.values.map((value) => {
                        const isSelected = selectedOptions[option.name] === value.value;
                        return (
                          <Button
                            key={value.id}
                            variant={isSelected ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleOptionChange(option.name, value.value)}
                            className="min-w-[60px]"
                          >
                            {value.value}
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Stock Info */}
            {product.track_inventory && isInStock && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Package className="w-4 h-4" />
                <span>재고 {currentStock}개</span>
              </div>
            )}

            {/* Quantity Selector */}
            {isInStock && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">수량</span>
                    <div className="flex items-center gap-3">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleQuantityChange(-1)}
                        disabled={quantity <= 1}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span className="w-12 text-center font-medium text-lg">{quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleQuantityChange(1)}
                        disabled={product.track_inventory && quantity >= currentStock}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t flex items-center justify-between">
                    <span className="text-muted-foreground">총 금액</span>
                    <span className="text-xl font-bold text-foreground">
                      {formatPrice(currentPrice * quantity)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Add to Cart Button */}
            <Button
              className="w-full h-12 text-lg"
              disabled={!isInStock || addToCart.isPending || (product.has_options && !selectedVariant)}
              onClick={handleAddToCart}
            >
              {addToCart.isPending ? (
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <ShoppingCart className="w-5 h-5 mr-2" />
              )}
              {!isInStock
                ? "품절된 상품입니다"
                : product.has_options && !selectedVariant
                ? "옵션을 선택해주세요"
                : "장바구니 담기"}
            </Button>

            {/* Description */}
            {product.description && (
              <div className="pt-6 border-t">
                <h2 className="font-semibold text-lg mb-3">상품 설명</h2>
                <div
                  className="prose prose-neutral dark:prose-invert max-w-none text-muted-foreground"
                  dangerouslySetInnerHTML={{ __html: product.description }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Product Reviews Section */}
        <div className="mt-12">
          <ProductReviews productSlug={slug || ""} productName={product.name} />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProductDetail;
