import { Header } from "@/themes/default/layouts/Header";
import { Footer } from "@/themes/default/layouts/Footer";
import { ServiceCard } from "@/themes/default/components/ServiceCard";
import { useReservationServices, useReservationSettings } from "@/core/hooks/useReservation";
import { ErrorState } from "@/themes/default/components/ErrorState";
import { Calendar } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/core/providers/AuthProvider";

function ServiceLoadingState() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="overflow-hidden">
          <Skeleton className="aspect-video w-full" />
          <CardContent className="p-4 space-y-2">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-6 w-24 mt-2" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function ServiceEmptyState() {
  return (
    <Card className="border-border/50">
      <CardContent className="p-12 text-center">
        <Calendar className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
        <h3 className="font-semibold text-foreground mb-2">등록된 서비스가 없습니다</h3>
        <p className="text-muted-foreground text-sm">
          예약 가능한 서비스가 아직 등록되지 않았습니다.
        </p>
      </CardContent>
    </Card>
  );
}

const Reservations = () => {
  const { isAuthenticated } = useAuth();
  const { data: services, isLoading, error, refetch } = useReservationServices();
  const { data: settings } = useReservationSettings();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 max-w-6xl mx-auto px-4 py-8 w-full">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">예약</h1>
            <p className="text-muted-foreground">원하는 서비스를 선택하고 예약하세요</p>
          </div>
          {isAuthenticated && (
            <Link to="/reservations/my">
              <Button variant="outline">
                <Calendar className="w-4 h-4 mr-2" />
                내 예약
              </Button>
            </Link>
          )}
        </div>

        {settings && (
          <Card className="mb-6 bg-muted/30">
            <CardContent className="p-4 text-sm text-muted-foreground">
              <p>
                예약은 최소 <strong>{settings.min_notice_hours}시간</strong> 전까지,
                최대 <strong>{settings.max_advance_days}일</strong> 후까지 가능합니다.
                취소는 예약 시간 <strong>{settings.cancellation_hours}시간</strong> 전까지 가능합니다.
              </p>
            </CardContent>
          </Card>
        )}

        {isLoading ? (
          <ServiceLoadingState />
        ) : error ? (
          <ErrorState
            message="서비스 목록을 불러오는데 실패했습니다."
            onRetry={refetch}
          />
        ) : !services || services.length === 0 ? (
          <ServiceEmptyState />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {services.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Reservations;
