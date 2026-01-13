import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/themes/default/layouts/Header";
import { Footer } from "@/themes/default/layouts/Footer";
import { ErrorState } from "@/themes/default/components/ErrorState";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar } from "@/components/ui/calendar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useAuth } from "@/core/providers/AuthProvider";
import {
  useReservationServices,
  useReservationStaff,
  useAvailableDates,
  useAvailableSlots,
  useCreateReservation,
} from "@/core/hooks/useReservation";
import {
  ArrowLeft,
  Clock,
  User,
  Calendar as CalendarIcon,
  CreditCard,
  CheckCircle,
} from "lucide-react";
import { format, parseISO, isValid } from "date-fns";
import { ko } from "date-fns/locale";
import type { ReservationStaffSummary } from "@diffsome/sdk";

const ReservationBooking = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, member } = useAuth();

  const [selectedStaff, setSelectedStaff] = useState<number | undefined>();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState<string | undefined>();
  const [customerName, setCustomerName] = useState(member?.name || "");
  const [customerPhone, setCustomerPhone] = useState(member?.phone || "");
  const [customerEmail, setCustomerEmail] = useState(member?.email || "");
  const [customerMemo, setCustomerMemo] = useState("");

  const { data: services, isLoading: servicesLoading } = useReservationServices();
  const service = useMemo(
    () => services?.find((s) => s.slug === slug),
    [services, slug]
  );

  const { data: staffList } = useReservationStaff(service?.id);

  const availableDatesParams = useMemo(() => {
    if (!service) return null;
    return {
      service_id: service.id,
      staff_id: selectedStaff,
    };
  }, [service, selectedStaff]);

  const { data: availableDates, isLoading: datesLoading } =
    useAvailableDates(availableDatesParams);

  const availableSlotsParams = useMemo(() => {
    if (!service || !selectedDate) return null;
    return {
      service_id: service.id,
      date: format(selectedDate, "yyyy-MM-dd"),
      staff_id: selectedStaff,
    };
  }, [service, selectedDate, selectedStaff]);

  const { data: availableSlots, isLoading: slotsLoading } =
    useAvailableSlots(availableSlotsParams);

  const createReservation = useCreateReservation();

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

  const availableDateSet = useMemo(() => {
    if (!availableDates) return new Set<string>();
    return new Set(availableDates);
  }, [availableDates]);

  const isDateAvailable = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return availableDateSet.has(dateStr);
  };

  const handleStaffSelect = (staffId: number | undefined) => {
    setSelectedStaff(staffId);
    setSelectedDate(undefined);
    setSelectedTime(undefined);
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    setSelectedTime(undefined);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error("로그인이 필요합니다.");
      navigate("/login", { state: { from: `/reservations/book/${slug}` } });
      return;
    }

    if (!service || !selectedDate || !selectedTime || !customerName) {
      toast.error("필수 정보를 모두 입력해주세요.");
      return;
    }

    try {
      const result = await createReservation.mutateAsync({
        service_id: service.id,
        staff_id: selectedStaff,
        reservation_date: format(selectedDate, "yyyy-MM-dd"),
        start_time: selectedTime,
        customer_name: customerName,
        customer_phone: customerPhone || undefined,
        customer_email: customerEmail || undefined,
        customer_memo: customerMemo || undefined,
      });

      toast.success("예약이 완료되었습니다!");

      if (result.requires_payment && result.deposit > 0) {
        // TODO: Navigate to payment page
        toast.info(`예약금 ${formatPrice(result.deposit)} 결제가 필요합니다.`);
      }

      navigate(`/reservations/my/${result.reservation.reservation_number}`);
    } catch (error: any) {
      toast.error(error.message || "예약에 실패했습니다.");
    }
  };

  if (servicesLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 max-w-4xl mx-auto px-4 py-8 w-full">
          <Skeleton className="h-8 w-48 mb-4" />
          <Skeleton className="h-64 w-full" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 max-w-4xl mx-auto px-4 py-8 w-full">
          <ErrorState message="서비스를 찾을 수 없습니다." />
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
          onClick={() => navigate("/reservations")}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          서비스 목록
        </Button>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Service Info */}
          <Card className="md:col-span-1">
            <CardContent className="p-4">
              {service.thumbnail && (
                <img
                  src={service.thumbnail}
                  alt={service.name}
                  className="w-full aspect-video object-cover rounded-lg mb-4"
                />
              )}
              <h2 className="font-semibold text-xl mb-2">{service.name}</h2>
              {service.description && (
                <p className="text-muted-foreground text-sm mb-4">
                  {service.description}
                </p>
              )}
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span>{formatDuration(service.duration)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-muted-foreground" />
                  <span className="font-semibold text-primary">
                    {service.price > 0 ? formatPrice(service.price) : "무료"}
                  </span>
                </div>
                {service.requires_payment && service.deposit > 0 && (
                  <Badge variant="secondary">
                    예약금 {formatPrice(service.deposit)}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Booking Form */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>예약 정보 입력</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Staff Selection */}
                {service.requires_staff && staffList && staffList.length > 0 && (
                  <div className="space-y-3">
                    <Label>담당자 선택 (선택사항)</Label>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant={selectedStaff === undefined ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleStaffSelect(undefined)}
                      >
                        상관없음
                      </Button>
                      {staffList.map((staff) => (
                        <Button
                          key={staff.id}
                          type="button"
                          variant={selectedStaff === staff.id ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleStaffSelect(staff.id)}
                          className="flex items-center gap-2"
                        >
                          <Avatar className="w-5 h-5">
                            <AvatarImage src={staff.avatar || undefined} />
                            <AvatarFallback className="text-xs">
                              {staff.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          {staff.name}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Date Selection */}
                <div className="space-y-3">
                  <Label>날짜 선택 *</Label>
                  {datesLoading ? (
                    <Skeleton className="h-64 w-full" />
                  ) : (
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={handleDateSelect}
                      locale={ko}
                      disabled={(date) => !isDateAvailable(date)}
                      className="rounded-md border"
                    />
                  )}
                </div>

                {/* Time Slot Selection */}
                {selectedDate && (
                  <div className="space-y-3">
                    <Label>시간 선택 *</Label>
                    {slotsLoading ? (
                      <div className="flex flex-wrap gap-2">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                          <Skeleton key={i} className="h-10 w-20" />
                        ))}
                      </div>
                    ) : availableSlots && availableSlots.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {availableSlots.map((slot) => (
                          <Button
                            key={slot.time}
                            type="button"
                            variant={selectedTime === slot.time ? "default" : "outline"}
                            size="sm"
                            disabled={!slot.available}
                            onClick={() => setSelectedTime(slot.time)}
                          >
                            {slot.time}
                          </Button>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-sm">
                        선택한 날짜에 예약 가능한 시간이 없습니다.
                      </p>
                    )}
                  </div>
                )}

                {/* Customer Info */}
                <div className="space-y-4 pt-4 border-t">
                  <h3 className="font-medium">예약자 정보</h3>

                  <div className="space-y-2">
                    <Label htmlFor="customerName">이름 *</Label>
                    <Input
                      id="customerName"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="customerPhone">연락처</Label>
                    <Input
                      id="customerPhone"
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="010-0000-0000"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="customerEmail">이메일</Label>
                    <Input
                      id="customerEmail"
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="customerMemo">요청사항</Label>
                    <Textarea
                      id="customerMemo"
                      value={customerMemo}
                      onChange={(e) => setCustomerMemo(e.target.value)}
                      placeholder="요청사항이 있으시면 입력해주세요"
                      rows={3}
                    />
                  </div>
                </div>

                {/* Summary */}
                {selectedDate && selectedTime && (
                  <Card className="bg-muted/30">
                    <CardContent className="p-4">
                      <h4 className="font-medium mb-3 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        예약 정보 확인
                      </h4>
                      <div className="space-y-1 text-sm">
                        <p>
                          <span className="text-muted-foreground">서비스:</span>{" "}
                          {service.name}
                        </p>
                        <p>
                          <span className="text-muted-foreground">날짜:</span>{" "}
                          {format(selectedDate, "yyyy년 M월 d일 (EEEE)", {
                            locale: ko,
                          })}
                        </p>
                        <p>
                          <span className="text-muted-foreground">시간:</span>{" "}
                          {selectedTime}
                        </p>
                        {selectedStaff && staffList && (
                          <p>
                            <span className="text-muted-foreground">담당자:</span>{" "}
                            {staffList.find((s) => s.id === selectedStaff)?.name}
                          </p>
                        )}
                        <p className="pt-2 text-base font-semibold">
                          <span className="text-muted-foreground">총 금액:</span>{" "}
                          <span className="text-primary">
                            {service.price > 0 ? formatPrice(service.price) : "무료"}
                          </span>
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={
                    !selectedDate ||
                    !selectedTime ||
                    !customerName ||
                    createReservation.isPending
                  }
                >
                  {createReservation.isPending ? "예약 중..." : "예약하기"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ReservationBooking;
