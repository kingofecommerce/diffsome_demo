import { useEffect, useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { useTossPaymentConfirm } from "@/core/hooks/usePayment";
import { Header } from "@/themes/default/layouts/Header";
import { Footer } from "@/themes/default/layouts/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Loader2, XCircle } from "lucide-react";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const confirmPayment = useTossPaymentConfirm();

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [orderNumber, setOrderNumber] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    const paymentKey = searchParams.get("paymentKey");
    const orderId = searchParams.get("orderId");
    const amount = searchParams.get("amount");

    if (!paymentKey || !orderId || !amount) {
      setStatus("error");
      setErrorMessage("결제 정보가 올바르지 않습니다.");
      return;
    }

    // Confirm payment
    confirmPayment.mutate(
      {
        payment_key: paymentKey,
        order_id: orderId,
        amount: parseInt(amount, 10),
      },
      {
        onSuccess: (data) => {
          setStatus("success");
          setOrderNumber(data.order_number);
        },
        onError: (error: any) => {
          setStatus("error");
          setErrorMessage(error.message || "결제 확인에 실패했습니다.");
        },
      }
    );
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 max-w-lg mx-auto px-4 py-12 w-full flex items-center justify-center">
        <Card className="w-full">
          <CardContent className="p-8 text-center">
            {status === "loading" && (
              <>
                <Loader2 className="w-16 h-16 text-primary mx-auto mb-6 animate-spin" />
                <h1 className="text-2xl font-bold mb-2">결제 확인 중</h1>
                <p className="text-muted-foreground">
                  잠시만 기다려주세요...
                </p>
              </>
            )}

            {status === "success" && (
              <>
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
                <h1 className="text-2xl font-bold mb-2">결제가 완료되었습니다</h1>
                <p className="text-muted-foreground mb-2">
                  주문이 성공적으로 처리되었습니다.
                </p>
                <p className="text-sm text-muted-foreground mb-6">
                  주문번호: <span className="font-mono font-semibold">{orderNumber}</span>
                </p>
                <div className="flex flex-col gap-3">
                  <Button asChild>
                    <Link to={`/orders/${orderNumber}`}>주문 상세 보기</Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link to="/products">쇼핑 계속하기</Link>
                  </Button>
                </div>
              </>
            )}

            {status === "error" && (
              <>
                <XCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
                <h1 className="text-2xl font-bold mb-2">결제 확인 실패</h1>
                <p className="text-muted-foreground mb-6">
                  {errorMessage}
                </p>
                <div className="flex flex-col gap-3">
                  <Button variant="outline" asChild>
                    <Link to="/orders">주문 내역 확인</Link>
                  </Button>
                  <Button variant="ghost" asChild>
                    <Link to="/">홈으로 돌아가기</Link>
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default PaymentSuccess;
