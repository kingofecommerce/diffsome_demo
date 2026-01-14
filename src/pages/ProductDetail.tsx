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
    if (product?.attributes && product.attributes.length > 0) {
      const initialOptions: Record<string, string> = {};
      product.attributes.forEach((attr) => {
        if (attr.values && attr.values.length > 0) {
          initialOptions[attr.name] = attr.values[0].value;
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
  const currentPrice = selectedVariant?.final_price ?? product?.sale_price ?? 0;
  const currentRegularPrice = selectedVariant?.regular_price ?? product?.regular_price;
  const currentStock = selectedVariant?.stock_quantity ?? product?.stock_quantity ?? 0;
  const isInStock = product?.has_options
    ? selectedVariant?.is_active && selectedVariant?.in_stock
    : product?.in_stock;

  const handleOptionChange = (optionName: string, value: string) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [optionName]: value,
    }));
    setQuantity(1); // Reset quantity when option changes
  };

  // Check if a specific option value's variant is in stock
  const isOptionValueInStock = (attrName: string, value: string) => {
    if (!product?.variants) return true;

    // Find variants that have this option value
    const matchingVariants = product.variants.filter(variant =>
      variant.option_values[attrName] === value
    );

    // Check if at least one matching variant is in stock
    return matchingVariants.some(variant => variant.is_active && variant.in_stock);
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
        ? ` (${selectedVariant.option_string})`
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

  // Use discount_percent from product or calculate from variant
  const discountPercent = product?.discount_percent ?? (
    currentRegularPrice && currentRegularPrice > currentPrice
      ? Math.round(((currentRegularPrice - currentPrice) / currentRegularPrice) * 100)
      : null
  );

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
                {/* Show price range for option products without selection */}
                {product.has_options && !selectedVariant && product.min_sale_price !== product.max_sale_price ? (
                  <span className="text-3xl font-bold text-foreground">
                    {formatPrice(product.min_sale_price ?? product.sale_price)} ~ {formatPrice(product.max_sale_price ?? product.sale_price)}
                  </span>
                ) : (
                  <>
                    <span className="text-3xl font-bold text-foreground">
                      {formatPrice(currentPrice)}
                    </span>
                    {currentRegularPrice && currentRegularPrice > currentPrice && (
                      <span className="text-xl text-muted-foreground line-through">
                        {formatPrice(currentRegularPrice)}
                      </span>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Options Selector */}
            {product.has_options && product.attributes && product.attributes.length > 0 && (
              <div className="space-y-4">
                {product.attributes.map((attr) => (
                  <div key={attr.id}>
                    <label className="block text-sm font-medium mb-2">
                      {attr.name}
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {attr.values?.map((value) => {
                        const isSelected = selectedOptions[attr.name] === value.value;
                        const inStock = isOptionValueInStock(attr.name, value.value);
                        return (
                          <Button
                            key={value.id}
                            variant={isSelected ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleOptionChange(attr.name, value.value)}
                            className={`min-w-[60px] relative ${!inStock ? "opacity-50" : ""}`}
                            disabled={!inStock}
                          >
                            {value.color_code && (
                              <span
                                className="w-4 h-4 rounded-full mr-2 border"
                                style={{ backgroundColor: value.color_code }}
                              />
                            )}
                            {value.value}
                            {!inStock && (
                              <span className="absolute -top-1 -right-1 text-[10px] bg-muted text-muted-foreground px-1 rounded">
                                품절
                              </span>
                            )}
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {/* Selected variant info */}
                {selectedVariant && (
                  <div className="p-3 bg-muted rounded-lg text-sm">
                    <span className="font-medium">선택: </span>
                    <span>{selectedVariant.option_string}</span>
                    {!selectedVariant.in_stock && (
                      <Badge variant="destructive" className="ml-2">품절</Badge>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Stock Info */}
            {product.track_inventory && isInStock && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Package className="w-4 h-4" />
                <span>재고 {currentStock}개</span>
                {product.is_low_stock && (
                  <Badge variant="outline" className="text-orange-600 border-orange-300">
                    재고 부족
                  </Badge>
                )}
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
