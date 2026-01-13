import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { diffsome } from "@/core/lib/diffsome";
import type {
  AvailableDatesParams,
  AvailableSlotsParams,
  CreateReservationData,
  ReservationListParams,
} from "@diffsome/sdk";

/**
 * Hook to get reservation settings
 */
export function useReservationSettings() {
  return useQuery({
    queryKey: ["reservationSettings"],
    queryFn: async () => {
      const settings = await diffsome.reservation.getSettings();
      return settings;
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

/**
 * Hook to list available services
 */
export function useReservationServices() {
  return useQuery({
    queryKey: ["reservationServices"],
    queryFn: async () => {
      const services = await diffsome.reservation.listServices();
      return services;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to list staff members
 */
export function useReservationStaff(serviceId?: number) {
  return useQuery({
    queryKey: ["reservationStaff", serviceId],
    queryFn: async () => {
      const staff = await diffsome.reservation.listStaff(serviceId);
      return staff;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to get available dates for booking
 */
export function useAvailableDates(params: AvailableDatesParams | null) {
  return useQuery({
    queryKey: ["availableDates", params],
    queryFn: async () => {
      if (!params) return [];
      const dates = await diffsome.reservation.getAvailableDates(params);
      return dates;
    },
    enabled: !!params?.service_id,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

/**
 * Hook to get available time slots for a specific date
 */
export function useAvailableSlots(params: AvailableSlotsParams | null) {
  return useQuery({
    queryKey: ["availableSlots", params],
    queryFn: async () => {
      if (!params) return [];
      const slots = await diffsome.reservation.getAvailableSlots(params);
      return slots;
    },
    enabled: !!params?.service_id && !!params?.date,
    staleTime: 1000 * 60 * 1, // 1 minute
  });
}

/**
 * Hook to create a reservation
 */
export function useCreateReservation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateReservationData) => {
      const result = await diffsome.reservation.create(data);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reservations"] });
      queryClient.invalidateQueries({ queryKey: ["upcomingReservations"] });
    },
  });
}

/**
 * Hook to list my reservations
 */
export function useMyReservations(params?: ReservationListParams) {
  return useQuery({
    queryKey: ["reservations", params],
    queryFn: async () => {
      const response = await diffsome.reservation.list(params);
      return response;
    },
    staleTime: 1000 * 30, // 30 seconds
  });
}

/**
 * Hook to get upcoming reservations
 */
export function useUpcomingReservations(limit: number = 10) {
  return useQuery({
    queryKey: ["upcomingReservations", limit],
    queryFn: async () => {
      const reservations = await diffsome.reservation.upcoming(limit);
      return reservations;
    },
    staleTime: 1000 * 30, // 30 seconds
  });
}

/**
 * Hook to get past reservations
 */
export function usePastReservations(limit: number = 10) {
  return useQuery({
    queryKey: ["pastReservations", limit],
    queryFn: async () => {
      const reservations = await diffsome.reservation.past(limit);
      return reservations;
    },
    staleTime: 1000 * 60, // 1 minute
  });
}

/**
 * Hook to get a single reservation
 */
export function useReservation(reservationNumber: string | null) {
  return useQuery({
    queryKey: ["reservation", reservationNumber],
    queryFn: async () => {
      if (!reservationNumber) throw new Error("Reservation number required");
      const reservation = await diffsome.reservation.get(reservationNumber);
      return reservation;
    },
    enabled: !!reservationNumber,
    staleTime: 1000 * 30, // 30 seconds
  });
}

/**
 * Hook to cancel a reservation
 */
export function useCancelReservation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      reservationNumber,
      reason,
    }: {
      reservationNumber: string;
      reason?: string;
    }) => {
      const result = await diffsome.reservation.cancel(reservationNumber, reason);
      return result;
    },
    onSuccess: (_, { reservationNumber }) => {
      queryClient.invalidateQueries({ queryKey: ["reservations"] });
      queryClient.invalidateQueries({ queryKey: ["upcomingReservations"] });
      queryClient.invalidateQueries({ queryKey: ["reservation", reservationNumber] });
    },
  });
}
