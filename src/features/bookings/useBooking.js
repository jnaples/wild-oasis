import { useQuery } from "@tanstack/react-query";
import { getBooking } from "../../services/apiBookings";
import { useParams } from "react-router-dom";

export function useBooking() {
  const { bookingId } = useParams();

  const {
    isLoading,
    data: booking,
    error,
  } = useQuery({
    queryKey: ["booking"],
    queryFn: () => getBooking(bookingId),
    retry: false, // By default react query tries to fetch data 3x, here we disable that
  });

  return { isLoading, error, booking };
}
