import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "@/core/hooks/useCart";
import { useCreateOrder } from "@/core/hooks/useOrder";
import { usePaymentStatus, useTossPaymentReady } from "@/core/hooks/usePayment";
import { useAuth } from "@/core/providers/AuthProvider";
import { Header } from "@/themes/default/layouts/Header";
import { Footer } from "@/themes/default/layouts/Footer";
import { LoadingState } from "@/themes/default/components/LoadingState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, ShoppingCart, Loader2, ImageOff, CreditCard } from "lucide-react";
import { useToast } from "@/core/hooks/use-toast";
import { loadTossPayments } from "@tosspayments/payment-sdk";

const Checkout = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { data: cart, isLoading: cartLoading } = useCart();
  const { data: paymentStatus } = usePaymentStatus();
  const createOrder = useCreateOrder();
  const tossPaymentReady = useTossPaymentReady();

  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState({
    orderer_name: "",
    orderer_email: "",
    orderer_phone: "",
    shipping_name: "",
    shipping_phone: "",
    shipping_zipcode: "",
    shipping_address: "",
    shipping_address_detail: "",
    shipping_memo: "",
  });

  const [sameAsOrderer, setSameAsOrderer] = useState(true);

  // Pre-fill with user info
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        orderer_name: user.name || "",
        orderer_email: user.email || "",
        orderer_phone: user.phone || "",
        shipping_name: user.name || "",
        shipping_phone: user.phone || "",
      }));
    }
  }, [user]);

  // Sync shipping info with orderer info
  useEffect(() => {
    if (sameAsOrderer) {
      setFormData((prev) => ({
        ...prev,
        shipping_name: prev.orderer_name,
        shipping_phone: prev.orderer_phone,
      }));
    }
  }, [sameAsOrderer, formData.orderer_name, formData.orderer_phone]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ko-KR").format(price) + "원";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!cart || cart.items.length === 0) {
      toast({
        variant: "destructive",
        title: "오류",
        description: "장바구니가 비어있습니다.",
      });
      return;
    }

    // Validation
    if (!formData.orderer_name || !formData.orderer_email || !formData.orderer_phone) {
      toast({
        variant: "destructive",
        title: "오류",
        description: "주문자 정보를 모두 입력해주세요.",
      });
      return;
    }

    if (!formData.shipping_name || !formData.shipping_phone || !formData.shipping_zipcode || !formData.shipping_address) {
      toast({
        variant: "destructive",
        title: "오류",
        description: "배송지 정보를 모두 입력해주세요.",
      });
      return;
    }

    setIsProcessing(true);

    try {
      // 1. Create order
      const order = await createOrder.mutateAsync(formData);

      // 2. Check if Toss payment is available
      if (paymentStatus?.toss?.available) {
        // Prepare payment
        const baseUrl = window.location.origin;
        const paymentData = await tossPaymentReady.mutateAsync({
          order_number: order.order_number,
          success_url: `${baseUrl}/payment/success`,
          fail_url: `${baseUrl}/payment/fail`,
        });

        // Load Toss SDK and open payment widget
        const tossPayments = await loadTossPayments(paymentData.client_key);

        await tossPayments.requestPayment("카드", {
          amount: paymentData.amount,
          orderId: paymentData.order_id,
          orderName: paymentData.order_name,
          customerName: paymentData.customer_name,
          customerEmail: paymentData.customer_email,
          successUrl: paymentData.success_url,
          failUrl: paymentData.fail_url,
        });
      } else {
        // No payment gateway configured - just complete order
        toast({
          title: "주문 완료",
          description: `주문번호: ${order.order_number}`,
        });
        navigate(`/orders/${order.order_number}`);
      }
    } catch (err: any) {
      // Toss SDK throws error when user cancels
      if (err.code === "USER_CANCEL") {
        toast({
          title: "결제 취소",
          description: "결제가 취소되었습니다.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "주문 실패",
          description: err.message || "주문 처리 중 오류가 발생했습니다.",
        });
      }
    } finally {
      setIsProcessing(false);
    }
  };

  if (authLoading || cartLoading) {
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
              <p className="text-muted-foreground mb-6">주문하려면 먼저 로그인해주세요.</p>
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

  const items = cart?.items || [];
  const subtotal = cart?.subtotal || 0;
  const shippingFee = cart?.shipping_fee || 0;
  const total = cart?.total || subtotal;
  const shippingInfo = cart?.shipping_info;

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <div className="flex-1 max-w-4xl mx-auto px-4 py-12 w-full">
          <Card>
            <CardContent className="p-12 text-center">
              <ShoppingCart className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-4">장바구니가 비어있습니다</h2>
              <p className="text-muted-foreground mb-6">상품을 추가한 후 주문해주세요.</p>
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
        {/* Back button */}
        <Button variant="ghost" size="sm" asChild className="mb-6">
          <Link to="/cart">
            <ArrowLeft className="w-4 h-4 mr-2" />
            장바구니로 돌아가기
          </Link>
        </Button>

        <h1 className="text-2xl font-bold mb-8">주문하기</h1>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Order Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Orderer Info */}
              <Card>
                <CardHeader>
                  <CardTitle>주문자 정보</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="orderer_name">이름 *</Label>
                      <Input
                        id="orderer_name"
                        name="orderer_name"
                        value={formData.orderer_name}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="orderer_phone">연락처 *</Label>
                      <Input
                        id="orderer_phone"
                        name="orderer_phone"
                        type="tel"
                        placeholder="010-0000-0000"
                        value={formData.orderer_phone}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="orderer_email">이메일 *</Label>
                    <Input
                      id="orderer_email"
                      name="orderer_email"
                      type="email"
                      value={formData.orderer_email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Shipping Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    배송지 정보
                    <label className="flex items-center gap-2 text-sm font-normal cursor-pointer">
                      <input
                        type="checkbox"
                        checked={sameAsOrderer}
                        onChange={(e) => setSameAsOrderer(e.target.checked)}
                        className="rounded"
                      />
                      주문자 정보와 동일
                    </label>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="shipping_name">받는 분 *</Label>
                      <Input
                        id="shipping_name"
                        name="shipping_name"
                        value={formData.shipping_name}
                        onChange={handleChange}
                        disabled={sameAsOrderer}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="shipping_phone">연락처 *</Label>
                      <Input
                        id="shipping_phone"
                        name="shipping_phone"
                        type="tel"
                        placeholder="010-0000-0000"
                        value={formData.shipping_phone}
                        onChange={handleChange}
                        disabled={sameAsOrderer}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="shipping_zipcode">우편번호 *</Label>
                      <Input
                        id="shipping_zipcode"
                        name="shipping_zipcode"
                        placeholder="12345"
                        value={formData.shipping_zipcode}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="shipping_address">주소 *</Label>
                      <Input
                        id="shipping_address"
                        name="shipping_address"
                        placeholder="기본 주소"
                        value={formData.shipping_address}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="shipping_address_detail">상세 주소</Label>
                    <Input
                      id="shipping_address_detail"
                      name="shipping_address_detail"
                      placeholder="동/호수"
                      value={formData.shipping_address_detail}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="shipping_memo">배송 메모</Label>
                    <Textarea
                      id="shipping_memo"
                      name="shipping_memo"
                      placeholder="배송 시 요청사항을 입력해주세요"
                      value={formData.shipping_memo}
                      onChange={handleChange}
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>주문 상품</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Product List */}
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {items.map((item: any) => (
                      <div key={item.id} className="flex gap-3">
                        <div className="w-16 h-16 rounded bg-muted flex-shrink-0 overflow-hidden">
                          {item.thumbnail ? (
                            <img
                              src={item.thumbnail}
                              alt={item.product_name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ImageOff className="w-6 h-6 text-muted-foreground/30" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{item.product_name}</p>
                          {item.variant_name && (
                            <p className="text-xs text-muted-foreground">{item.variant_name}</p>
                          )}
                          <p className="text-sm">
                            {formatPrice(item.price)} x {item.quantity}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  {/* Price Summary */}
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">상품 금액</span>
                      <span>{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">배송비</span>
                      <span>
                        {shippingInfo?.is_free ? (
                          <span className="text-green-600">무료</span>
                        ) : (
                          formatPrice(shippingFee)
                        )}
                      </span>
                    </div>
                    {shippingInfo?.free_shipping_applied && (
                      <div className="text-xs text-green-600">
                        무료배송 적용
                      </div>
                    )}
                  </div>

                  <Separator />

                  <div className="flex justify-between font-semibold">
                    <span>총 결제 금액</span>
                    <span className="text-lg text-primary">{formatPrice(total)}</span>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        결제 준비 중...
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4 mr-2" />
                        {formatPrice(total)} 결제하기
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </main>
      <Footer />
    </div>
  );
};

export default Checkout;
