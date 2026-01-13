import { Header } from "@/themes/default/layouts/Header";
import { Footer } from "@/themes/default/layouts/Footer";
import { ErrorState } from "@/themes/default/components/ErrorState";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/core/providers/AuthProvider";
import {
  useUpcomingReservations,
  usePastReservations,
} from "@/core/hooks/useReservation";
import {
  Calendar,
  Clock,
  User,
  ArrowLeft,
  ChevronRight,
  CalendarPlus,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { ko } from "date-fns/locale";
import type { Reservation } from "@diffsome/sdk";
import { useEffect } from "react";

function ReservationCard({ reservation }: { reservation: Reservation }) {
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

  return (
    <Link to={`/reservations/my/${reservation.reservation_number}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant={getStatusVariant(reservation.status)}>
                  {reservation.status_label}
                </Badge>
                {reservation.price > 0 && (
                  <Badge variant={getPaymentStatusVariant(reservation.payment_status)}>
                    {reservation.payment_status_label}
                  </Badge>
                )}
              </div>

              <h3 className="font-semibold text-lg">
                {reservation.service?.name || "서비스"}
              </h3>

              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {format(parseISO(reservation.reservation_date), "M월 d일 (EEE)", {
                      locale: ko,
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{reservation.time_range}</span>
                </div>
                {reservation.staff && (
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    <span>{reservation.staff.name}</span>
                  </div>
                )}
              </div>

              {reservation.price > 0 && (
                <p className="text-sm font-medium">
                  {formatPrice(reservation.price)}
                </p>
              )}
            </div>

            <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function ReservationListLoading() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardContent className="p-4">
            <div className="space-y-3">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-6 w-48" />
              <div className="flex gap-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function EmptyState({ type }: { type: "upcoming" | "past" }) {
  return (
    <Card className="border-border/50">
      <CardContent className="p-12 text-center">
        <Calendar className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
        <h3 className="font-semibold text-foreground mb-2">
          {type === "upcoming"
            ? "예정된 예약이 없습니다"
            : "지난 예약이 없습니다"}
        </h3>
        <p className="text-muted-foreground text-sm mb-4">
          {type === "upcoming"
            ? "새로운 예약을 만들어보세요!"
            : "아직 완료된 예약이 없습니다."}
        </p>
        {type === "upcoming" && (
          <Link to="/reservations">
            <Button>
              <CalendarPlus className="w-4 h-4 mr-2" />
              예약하기
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  );
}

const MyReservations = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const {
    data: upcomingReservations,
    isLoading: upcomingLoading,
    error: upcomingError,
    refetch: refetchUpcoming,
  } = useUpcomingReservations();

  const {
    data: pastReservations,
    isLoading: pastLoading,
    error: pastError,
    refetch: refetchPast,
  } = usePastReservations();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/login", { state: { from: "/reservations/my" } });
    }
  }, [isAuthenticated, authLoading, navigate]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 max-w-4xl mx-auto px-4 py-8 w-full">
          <ReservationListLoading />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 max-w-4xl mx-auto px-4 py-8 w-full">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/reservations")}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              예약 서비스
            </Button>
          </div>
          <Link to="/reservations">
            <Button>
              <CalendarPlus className="w-4 h-4 mr-2" />
              새 예약
            </Button>
          </Link>
        </div>

        <h1 className="text-2xl font-bold mb-6">내 예약</h1>

        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="upcoming">
              예정된 예약
              {upcomingReservations && upcomingReservations.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {upcomingReservations.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="past">지난 예약</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming">
            {upcomingLoading ? (
              <ReservationListLoading />
            ) : upcomingError ? (
              <ErrorState
                message="예약 목록을 불러오는데 실패했습니다."
                onRetry={refetchUpcoming}
              />
            ) : !upcomingReservations || upcomingReservations.length === 0 ? (
              <EmptyState type="upcoming" />
            ) : (
              <div className="space-y-4">
                {upcomingReservations.map((reservation) => (
                  <ReservationCard
                    key={reservation.id}
                    reservation={reservation}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="past">
            {pastLoading ? (
              <ReservationListLoading />
            ) : pastError ? (
              <ErrorState
                message="예약 목록을 불러오는데 실패했습니다."
                onRetry={refetchPast}
              />
            ) : !pastReservations || pastReservations.length === 0 ? (
              <EmptyState type="past" />
            ) : (
              <div className="space-y-4">
                {pastReservations.map((reservation) => (
                  <ReservationCard
                    key={reservation.id}
                    reservation={reservation}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
};

export default MyReservations;
