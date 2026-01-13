import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, CreditCard } from "lucide-react";
import type { ReservationService } from "@diffsome/sdk";

interface ServiceCardProps {
  service: ReservationService;
}

export function ServiceCard({ service }: ServiceCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ko-KR", {
      style: "currency",
      currency: "KRW",
    }).format(price);
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}분`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}시간 ${mins}분` : `${hours}시간`;
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      {service.thumbnail ? (
        <div className="aspect-video relative overflow-hidden">
          <img
            src={service.thumbnail}
            alt={service.name}
            className="w-full h-full object-cover"
          />
          {service.requires_payment && service.deposit > 0 && (
            <Badge className="absolute top-2 right-2" variant="secondary">
              예약금 {formatPrice(service.deposit)}
            </Badge>
          )}
        </div>
      ) : (
        <div className="aspect-video bg-muted flex items-center justify-center">
          <span className="text-muted-foreground text-4xl">
            {service.name.charAt(0)}
          </span>
          {service.requires_payment && service.deposit > 0 && (
            <Badge className="absolute top-2 right-2" variant="secondary">
              예약금 {formatPrice(service.deposit)}
            </Badge>
          )}
        </div>
      )}

      <CardContent className="p-4">
        <h3 className="font-semibold text-lg text-foreground mb-2 line-clamp-1">
          {service.name}
        </h3>

        {service.description && (
          <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
            {service.description}
          </p>
        )}

        <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{formatDuration(service.duration)}</span>
          </div>
          {service.requires_staff && service.staffs.length > 0 && (
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{service.staffs.length}명</span>
            </div>
          )}
          {service.requires_payment && (
            <div className="flex items-center gap-1">
              <CreditCard className="w-4 h-4" />
              <span>결제 필요</span>
            </div>
          )}
        </div>

        <div className="mt-3 pt-3 border-t">
          <span className="text-xl font-bold text-primary">
            {service.price > 0 ? formatPrice(service.price) : "무료"}
          </span>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Link to={`/reservations/book/${service.slug}`} className="w-full">
          <Button className="w-full">예약하기</Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
