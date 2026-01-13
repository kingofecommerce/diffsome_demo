import { Link } from "react-router-dom";
import { useCart, useUpdateCartItem, useRemoveFromCart, useClearCart } from "@/core/hooks/useCart";
import { Header } from "@/themes/default/layouts/Header";
import { Footer } from "@/themes/default/layouts/Footer";
import { LoadingState } from "@/themes/default/components/LoadingState";
import { ErrorState } from "@/themes/default/components/ErrorState";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ShoppingCart, Trash2, Minus, Plus, ArrowLeft, ImageOff } from "lucide-react";
import { useToast } from "@/core/hooks/use-toast";

const Cart = () => {
  const { toast } = useToast();
  const { data: cart, isLoading, isError, error, refetch } = useCart();
  const updateItem = useUpdateCartItem();
  const removeItem = useRemoveFromCart();
  const clearCart = useClearCart();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ko-KR").format(price) + "원";
  };

  const handleUpdateQuantity = async (itemId: number, quantity: number) => {
    if (quantity < 1) return;
    try {
      await updateItem.mutateAsync({ itemId, data: { quantity } });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "오류",
        description: err.message || "수량 변경에 실패했습니다.",
      });
    }
  };

  const handleRemoveItem = async (itemId: number) => {
    try {
      await removeItem.mutateAsync(itemId);
      toast({
        title: "삭제되었습니다",
        description: "상품이 장바구니에서 삭제되었습니다.",
      });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "오류",
        description: err.message || "삭제에 실패했습니다.",
      });
    }
  };

  const handleClearCart = async () => {
    try {
      await clearCart.mutateAsync();
      toast({
        title: "장바구니 비우기",
        description: "장바구니가 비워졌습니다.",
      });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "오류",
        description: err.message || "장바구니 비우기에 실패했습니다.",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <div className="flex-1 max-w-4xl mx-auto px-4 py-12 w-full">
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
        <div className="flex-1 max-w-4xl mx-auto px-4 py-12 w-full">
          <ErrorState
            message={error?.message || "장바구니를 불러오는데 실패했습니다."}
            onRetry={() => refetch()}
          />
        </div>
        <Footer />
      </div>
    );
  }

  const items = cart?.items || [];
  const subtotal = cart?.subtotal || 0;
  const shippingFee = cart?.shipping_fee || 0;
  const total = cart?.total || subtotal;
  const shippingInfo = cart?.shipping_info;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 max-w-4xl mx-auto px-4 py-12 w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">장바구니</h1>
            <p className="text-muted-foreground">
              {items.length > 0 ? `${items.length}개의 상품` : "장바구니가 비어있습니다"}
            </p>
          </div>
          {items.length > 0 && (
            <Button variant="outline" onClick={handleClearCart} disabled={clearCart.isPending}>
              <Trash2 className="w-4 h-4 mr-2" />
              전체 삭제
            </Button>
          )}
        </div>

        {items.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <ShoppingCart className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="font-semibold text-foreground mb-2">장바구니가 비어있습니다</h3>
              <p className="text-muted-foreground text-sm mb-6">
                상품을 추가해보세요
              </p>
              <Button asChild>
                <Link to="/products">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  쇼핑 계속하기
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item: any) => (
                <Card key={item.id}>
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      {/* Product Image */}
                      <div className="w-24 h-24 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                        {item.thumbnail ? (
                          <img
                            src={item.thumbnail}
                            alt={item.product_name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageOff className="w-8 h-8 text-muted-foreground/30" />
                          </div>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-foreground truncate">
                          {item.product_name}
                        </h3>
                        {item.variant_name && (
                          <p className="text-sm text-muted-foreground">{item.variant_name}</p>
                        )}
                        <p className="font-semibold text-foreground mt-1">
                          {formatPrice(item.price)}
                        </p>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2 mt-3">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1 || updateItem.isPending}
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="w-8 text-center font-medium">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                            disabled={updateItem.isPending}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 ml-2 text-destructive hover:text-destructive"
                            onClick={() => handleRemoveItem(item.id)}
                            disabled={removeItem.isPending}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Subtotal */}
                      <div className="text-right">
                        <p className="font-semibold text-foreground">
                          {formatPrice(item.subtotal)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg mb-4">주문 요약</h3>

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">상품 금액</span>
                      <span className="font-medium">{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">배송비</span>
                      <span className="font-medium">
                        {shippingInfo?.is_free ? (
                          <span className="text-green-600">무료</span>
                        ) : (
                          formatPrice(shippingFee)
                        )}
                      </span>
                    </div>
                    {shippingInfo?.message && !shippingInfo?.free_shipping_applied && (
                      <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                        {shippingInfo.message}
                      </div>
                    )}
                    {shippingInfo?.free_shipping_applied && (
                      <div className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                        무료배송이 적용되었습니다!
                      </div>
                    )}
                    <div className="border-t pt-3 flex justify-between">
                      <span className="font-semibold">총 결제 금액</span>
                      <span className="font-bold text-lg text-primary">{formatPrice(total)}</span>
                    </div>
                  </div>

                  <Button className="w-full mt-6" size="lg" asChild>
                    <Link to="/checkout">주문하기</Link>
                  </Button>

                  <Button variant="outline" className="w-full mt-2" asChild>
                    <Link to="/products">
                      쇼핑 계속하기
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Cart;
