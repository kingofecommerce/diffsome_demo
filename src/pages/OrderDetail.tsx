import { Link, useParams } from "react-router-dom";
import { useOrder } from "@/core/hooks/useOrder";
import { Header } from "@/themes/default/layouts/Header";
import { Footer } from "@/themes/default/layouts/Footer";
import { LoadingState } from "@/themes/default/components/LoadingState";
import { ErrorState } from "@/themes/default/components/ErrorState";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Package, Truck, CheckCircle, XCircle, Clock, ImageOff } from "lucide-react";

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  pending: { label: "결제 대기", color: "bg-yellow-500", icon: Clock },
  paid: { label: "결제 완료", color: "bg-blue-500", icon: CheckCircle },
  preparing: { label: "상품 준비중", color: "bg-purple-500", icon: Package },
  shipping: { label: "배송중", color: "bg-indigo-500", icon: Truck },
  delivered: { label: "배송 완료", color: "bg-green-500", icon: CheckCircle },
  cancelled: { label: "주문 취소", color: "bg-gray-500", icon: XCircle },
  refunded: { label: "환불 완료", color: "bg-red-500", icon: XCircle },
};

const OrderDetail = () => {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const { data: order, isLoading, isError, error, refetch } = useOrder(orderNumber || "");

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ko-KR").format(price) + "원";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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
            message={error?.message || "주문 정보를 불러오는데 실패했습니다."}
            onRetry={() => refetch()}
          />
        </div>
        <Footer />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <div className="flex-1 max-w-4xl mx-auto px-4 py-12 w-full">
          <Card>
            <CardContent className="p-12 text-center">
              <h2 className="text-xl font-semibold mb-4">주문을 찾을 수 없습니다</h2>
              <Button asChild>
                <Link to="/orders">주문 목록으로</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  const status = statusConfig[order.status] || statusConfig.pending;
  const StatusIcon = status.icon;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 max-w-4xl mx-auto px-4 py-12 w-full">
        {/* Back button */}
        <Button variant="ghost" size="sm" asChild className="mb-6">
          <Link to="/orders">
            <ArrowLeft className="w-4 h-4 mr-2" />
            주문 목록
          </Link>
        </Button>

        {/* Order Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold">주문 상세</h1>
            <p className="text-muted-foreground">주문번호: {order.order_number}</p>
          </div>
          <Badge className={`${status.color} text-white px-3 py-1`}>
            <StatusIcon className="w-4 h-4 mr-1" />
            {status.label}
          </Badge>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle>주문 상품</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.items?.map((item) => (
                    <div key={item.id} className="flex gap-4">
                      <div className="w-20 h-20 rounded bg-muted flex-shrink-0 overflow-hidden">
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
                      <div className="flex-1">
                        <p className="font-medium">{item.product_name}</p>
                        {item.variant_name && (
                          <p className="text-sm text-muted-foreground">{item.variant_name}</p>
                        )}
                        <p className="text-sm text-muted-foreground">
                          {formatPrice(item.price)} x {item.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatPrice(item.total)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Shipping Info */}
            <Card>
              <CardHeader>
                <CardTitle>배송 정보</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <span className="text-muted-foreground">받는 분</span>
                  <span className="col-span-2">{order.shipping?.name}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <span className="text-muted-foreground">연락처</span>
                  <span className="col-span-2">{order.shipping?.phone}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <span className="text-muted-foreground">주소</span>
                  <span className="col-span-2">
                    {order.shipping?.zipcode && `[${order.shipping.zipcode}] `}{order.shipping?.address}
                    {order.shipping?.address_detail && ` ${order.shipping.address_detail}`}
                  </span>
                </div>
                {order.shipping?.memo && (
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <span className="text-muted-foreground">배송 메모</span>
                    <span className="col-span-2">{order.shipping.memo}</span>
                  </div>
                )}
                {order.shipping?.tracking_number && (
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <span className="text-muted-foreground">운송장 번호</span>
                    <span className="col-span-2">
                      {order.shipping.company} {order.shipping.tracking_number}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Orderer Info */}
            <Card>
              <CardHeader>
                <CardTitle>주문자 정보</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <span className="text-muted-foreground">이름</span>
                  <span className="col-span-2">{order.orderer?.name}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <span className="text-muted-foreground">연락처</span>
                  <span className="col-span-2">{order.orderer?.phone}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <span className="text-muted-foreground">이메일</span>
                  <span className="col-span-2">{order.orderer?.email}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>결제 정보</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">상품 금액</span>
                    <span>{formatPrice(order.subtotal)}</span>
                  </div>
                  {order.discount_amount > 0 && (
                    <div className="flex justify-between text-red-500">
                      <span>할인</span>
                      <span>-{formatPrice(order.discount_amount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">배송비</span>
                    <span>{order.shipping_fee > 0 ? formatPrice(order.shipping_fee) : "무료"}</span>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between font-semibold">
                  <span>총 결제 금액</span>
                  <span className="text-lg text-primary">{formatPrice(order.total)}</span>
                </div>

                <Separator />

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">결제 수단</span>
                    <span>{order.payment?.method_label || order.payment_method || "-"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">결제 상태</span>
                    <span>{order.payment_status_label || order.payment_status}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">주문 일시</span>
                    <span>{formatDate(order.created_at)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default OrderDetail;
