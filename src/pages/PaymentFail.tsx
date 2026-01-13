import { Link, useSearchParams } from "react-router-dom";
import { Header } from "@/themes/default/layouts/Header";
import { Footer } from "@/themes/default/layouts/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { XCircle } from "lucide-react";

const PaymentFail = () => {
  const [searchParams] = useSearchParams();

  const code = searchParams.get("code") || "UNKNOWN";
  const message = searchParams.get("message") || "결제에 실패했습니다.";
  const orderId = searchParams.get("orderId");

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 max-w-lg mx-auto px-4 py-12 w-full flex items-center justify-center">
        <Card className="w-full">
          <CardContent className="p-8 text-center">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
            <h1 className="text-2xl font-bold mb-2">결제 실패</h1>
            <p className="text-muted-foreground mb-2">
              {message}
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              오류 코드: <span className="font-mono">{code}</span>
            </p>

            <div className="flex flex-col gap-3">
              <Button asChild>
                <Link to="/checkout">다시 결제하기</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/cart">장바구니로 돌아가기</Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link to="/">홈으로 돌아가기</Link>
              </Button>
            </div>

            {orderId && (
              <p className="text-xs text-muted-foreground mt-6">
                주문번호: {orderId}
              </p>
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default PaymentFail;
