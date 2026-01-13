import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/themes/default/layouts/Header";
import { Footer } from "@/themes/default/layouts/Footer";
import { ErrorState } from "@/themes/default/components/ErrorState";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuth } from "@/core/providers/AuthProvider";
import { useReservation, useCancelReservation } from "@/core/hooks/useReservation";
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  MapPin,
  Phone,
  Mail,
  CreditCard,
  FileText,
  XCircle,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { ko } from "date-fns/locale";

const ReservationDetail = () => {
  const { reservationNumber } = useParams<{ reservationNumber: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [cancelReason, setCancelReason] = useState("");
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const {
    data: reservation,
    isLoading,
    error,
    refetch,
  } = useReservation(reservationNumber || null);

  const cancelReservation = useCancelReservation();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ko-KR", {
      style: "currency",
      currency: "KRW",
    }).format(price);
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "confirmed":
        return "default";
      case "pending":
        return "secondary";
      case "completed":
        return "outline";
      case "cancelled":
      case "no_show":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const getPaymentStatusVariant = (status: string) => {
    switch (status) {
      case "paid":
        return "default";
      case "pending":
        return "secondary";
      case "refunded":
        return "outline";
      case "partial":
        return "secondary";
      default:
        return "secondary";
    }
  };

  const handleCancel = async () => {
    if (!reservationNumber) return;

    try {
      await cancelReservation.mutateAsync({
        reservationNumber,
        reason: cancelReason || undefined,
      });
      toast.success("예약이 취소되었습니다.");
      setShowCancelDialog(false);
      refetch();
    } catch (error: any) {
      toast.error(error.message || "예약 취소에 실패했습니다.");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 max-w-4xl mx-auto px-4 py-8 w-full">
          <Skeleton className="h-8 w-32 mb-6" />
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !reservation) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 max-w-4xl mx-auto px-4 py-8 w-full">
          <ErrorState
            message="예약 정보를 찾을 수 없습니다."
            onRetry={refetch}
          />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 max-w-4xl mx-auto px-4 py-8 w-full">
        <Button
          variant="ghost"
          onClick={() => navigate("/reservations/my")}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          내 예약
        </Button>

        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                예약번호: {reservation.reservation_number}
              </p>
              <h1 className="text-2xl font-bold">
                {reservation.service?.name || "예약"}
              </h1>
            </div>
            <div className="flex gap-2">
              <Badge variant={getStatusVariant(reservation.status)} className="text-sm">
                {reservation.status_label}
              </Badge>
              {reservation.price > 0 && (
                <Badge
                  variant={getPaymentStatusVariant(reservation.payment_status)}
                  className="text-sm"
                >
                  {reservation.payment_status_label}
                </Badge>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Reservation Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">예약 정보</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">
                      {format(
                        parseISO(reservation.reservation_date),
                        "yyyy년 M월 d일 (EEEE)",
                        { locale: ko }
                      )}
                    </p>
                    <p className="text-sm text-muted-foreground">예약일</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">{reservation.time_range}</p>
                    <p className="text-sm text-muted-foreground">
                      {reservation.service?.duration}분 소요
                    </p>
                  </div>
                </div>

                {reservation.staff && (
                  <div className="flex items-start gap-3">
                    <User className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">{reservation.staff.name}</p>
                      <p className="text-sm text-muted-foreground">담당자</p>
                    </div>
                  </div>
                )}

                <Separator />

                <div className="flex items-start gap-3">
                  <CreditCard className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium text-lg text-primary">
                      {reservation.price > 0
                        ? formatPrice(reservation.price)
                        : "무료"}
                    </p>
                    {reservation.deposit > 0 && (
                      <p className="text-sm text-muted-foreground">
                        예약금: {formatPrice(reservation.deposit)}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Customer Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">예약자 정보</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">{reservation.customer_name}</p>
                    <p className="text-sm text-muted-foreground">이름</p>
                  </div>
                </div>

                {reservation.customer_phone && (
                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">{reservation.customer_phone}</p>
                      <p className="text-sm text-muted-foreground">연락처</p>
                    </div>
                  </div>
                )}

                {reservation.customer_email && (
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">{reservation.customer_email}</p>
                      <p className="text-sm text-muted-foreground">이메일</p>
                    </div>
                  </div>
                )}

                {reservation.customer_memo && (
                  <>
                    <Separator />
                    <div className="flex items-start gap-3">
                      <FileText className="w-5 h-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">
                          요청사항
                        </p>
                        <p className="text-sm">{reservation.customer_memo}</p>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Created At */}
          <p className="text-sm text-muted-foreground text-center">
            예약일시:{" "}
            {format(parseISO(reservation.created_at), "yyyy년 M월 d일 HH:mm", {
              locale: ko,
            })}
          </p>

          {/* Cancel Button */}
          {reservation.can_cancel && (
            <Card className="border-destructive/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">예약 취소</h3>
                    <p className="text-sm text-muted-foreground">
                      예약을 취소하시겠습니까?
                    </p>
                  </div>
                  <AlertDialog
                    open={showCancelDialog}
                    onOpenChange={setShowCancelDialog}
                  >
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        <XCircle className="w-4 h-4 mr-2" />
                        예약 취소
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>예약을 취소하시겠습니까?</AlertDialogTitle>
                        <AlertDialogDescription>
                          취소된 예약은 복구할 수 없습니다.
                          {reservation.deposit > 0 && (
                            <span className="block mt-2">
                              예약금 환불 정책에 따라 처리됩니다.
                            </span>
                          )}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <div className="py-4">
                        <Label htmlFor="cancelReason">취소 사유 (선택)</Label>
                        <Textarea
                          id="cancelReason"
                          value={cancelReason}
                          onChange={(e) => setCancelReason(e.target.value)}
                          placeholder="취소 사유를 입력해주세요"
                          className="mt-2"
                          rows={3}
                        />
                      </div>
                      <AlertDialogFooter>
                        <AlertDialogCancel>돌아가기</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleCancel}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          disabled={cancelReservation.isPending}
                        >
                          {cancelReservation.isPending
                            ? "취소 중..."
                            : "예약 취소"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ReservationDetail;
