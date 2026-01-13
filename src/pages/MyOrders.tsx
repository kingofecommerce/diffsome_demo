import { Link } from "react-router-dom";
import { useOrders } from "@/core/hooks/useOrder";
import { useAuth } from "@/core/providers/AuthProvider";
import { Header } from "@/themes/default/layouts/Header";
import { Footer } from "@/themes/default/layouts/Footer";
import { LoadingState } from "@/themes/default/components/LoadingState";
import { ErrorState } from "@/themes/default/components/ErrorState";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, ChevronRight, ShoppingBag } from "lucide-react";

const statusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: "결제 대기", color: "bg-yellow-500" },
  paid: { label: "결제 완료", color: "bg-blue-500" },
  preparing: { label: "상품 준비중", color: "bg-purple-500" },
  shipping: { label: "배송중", color: "bg-indigo-500" },
  delivered: { label: "배송 완료", color: "bg-green-500" },
  cancelled: { label: "주문 취소", color: "bg-gray-500" },
  refunded: { label: "환불 완료", color: "bg-red-500" },
};

const MyOrders = () => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { data: ordersData, isLoading, isError, error, refetch } = useOrders();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ko-KR").format(price) + "원";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (authLoading || isLoading) {
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

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <div className="flex-1 max-w-4xl mx-auto px-4 py-12 w-full">
          <Card>
            <CardContent className="p-12 text-center">
              <h2 className="text-xl font-semibold mb-4">로그인이 필요합니다</h2>
              <p className="text-muted-foreground mb-6">주문 내역을 보려면 먼저 로그인해주세요.</p>
              <Button asChild>
                <Link to="/login">로그인하기</Link>
              </Button>
            </CardContent>
          </Card>
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
            message={error?.message || "주문 내역을 불러오는데 실패했습니다."}
            onRetry={() => refetch()}
          />
        </div>
        <Footer />
      </div>
    );
  }

  const orders = ordersData?.data || [];

  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <div className="flex-1 max-w-4xl mx-auto px-4 py-12 w-full">
          <h1 className="text-2xl font-bold mb-8">주문 내역</h1>
          <Card>
            <CardContent className="p-12 text-center">
              <ShoppingBag className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-4">주문 내역이 없습니다</h2>
              <p className="text-muted-foreground mb-6">첫 주문을 시작해보세요!</p>
              <Button asChild>
                <Link to="/products">쇼핑하러 가기</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 max-w-4xl mx-auto px-4 py-12 w-full">
        <h1 className="text-2xl font-bold mb-8">주문 내역</h1>

        <div className="space-y-4">
          {orders.map((order: any) => {
            const status = statusConfig[order.status] || statusConfig.pending;
            const firstItem = order.items?.[0];
            const itemCount = order.items?.length || 0;

            return (
              <Link key={order.id} to={`/orders/${order.order_number}`}>
                <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      {/* Thumbnail */}
                      <div className="w-16 h-16 rounded bg-muted flex-shrink-0 overflow-hidden">
                        {firstItem?.thumbnail ? (
                          <img
                            src={firstItem.thumbnail}
                            alt={firstItem.product_name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-6 h-6 text-muted-foreground/30" />
                          </div>
                        )}
                      </div>

                      {/* Order Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={`${status.color} text-white text-xs`}>
                            {status.label}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(order.created_at)}
                          </span>
                        </div>
                        <p className="font-medium truncate">
                          {firstItem?.product_name || "상품"}
                          {itemCount > 1 && ` 외 ${itemCount - 1}건`}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          주문번호: {order.order_number}
                        </p>
                      </div>

                      {/* Price and Arrow */}
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{formatPrice(order.total)}</span>
                        <ChevronRight className="w-5 h-5 text-muted-foreground" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MyOrders;
