import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Ship, Compass } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Button from "../components/Button";
import Modal from "../components/Modal";
import { bookingService } from "../services/dataService";

export default function MyBookings({ addToast }) {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState(null);

  useEffect(() => {
    bookingService.getAll()
      .then(setBookings)
      .catch((error) => addToast(error.message, "error"))
      .finally(() => setIsLoading(false));
  }, [addToast]);

  const handleCancelClick = (bookingId) => {
    setSelectedBookingId(bookingId);
    setIsModalOpen(true);
  };

  const handleConfirmCancellation = async () => {
    if (!selectedBookingId) return;

    try {
      await bookingService.cancel(selectedBookingId);
      setBookings(await bookingService.getAll());
      addToast(`Booking has been successfully cancelled.`, "success");
      setSelectedBookingId(null);
    } catch (error) {
      addToast(error.message, "error");
    }
  };

  const handleViewTicket = (booking) => {
    navigate("/confirmation", { state: { booking } });
  };

  const visibleBookings = bookings.filter((booking) =>
    statusFilter === "all" || booking.status?.toLowerCase() === statusFilter
  );

  return (
    <div className="flex-1 bg-slate-50 pt-28 pb-20 text-left">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">My Bookings</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your scheduled ferry voyages, download boarding tickets, or request cancellations.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {["all", "confirmed", "completed", "cancelled"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-colors ${
                statusFilter === status
                  ? "bg-ocean-600 text-white"
                  : "bg-white border border-slate-200 text-slate-600 hover:border-ocean-300"
              }`}
            >
              {status === "confirmed" ? "Upcoming" : status}
            </button>
          ))}
        </div>

        {/* Bookings List or Empty State */}
        <AnimatePresence mode="popLayout">
          {isLoading ? (
            <div className="py-20 text-center text-sm font-semibold text-slate-500">Loading your bookings...</div>
          ) : visibleBookings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {visibleBookings.map((booking) => (
                <motion.div
                  key={booking.bookingId}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col justify-between"
                >
                  {/* Card Header */}
                  <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div className="flex items-center gap-2 text-slate-700">
                      <Ship className="w-4 h-4 text-ocean-600" />
                      <span className="text-xs font-black uppercase tracking-wider">{booking.ferryName}</span>
                    </div>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        booking.status === "Confirmed"
                          ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                          : booking.status === "Completed"
                          ? "bg-sky-50 border-sky-200 text-sky-700"
                          : "bg-rose-50 border-rose-200 text-rose-700"
                      }`}
                    >
                      {booking.status}
                    </span>
                  </div>

                  {/* Card Body */}
                  <div className="p-5 space-y-4">
                    {/* Route Info */}
                    <div className="flex justify-between items-center text-xs">
                      <div>
                        <span className="block text-[9px] text-slate-400 font-bold uppercase">Departure</span>
                        <span className="text-slate-800 font-bold">{booking.from}</span>
                      </div>
                      <div className="text-slate-400">➔</div>
                      <div className="text-right">
                        <span className="block text-[9px] text-slate-400 font-bold uppercase">Destination</span>
                        <span className="text-slate-800 font-bold">{booking.to}</span>
                      </div>
                    </div>

                    {/* Meta Specifications */}
                    <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-xs border-t border-slate-50 pt-3">
                      <div>
                        <span className="block text-slate-400 text-[10px] uppercase">Travel Date</span>
                        <span className="text-slate-800 font-semibold">{booking.date}</span>
                      </div>
                      <div>
                        <span className="block text-slate-400 text-[10px] uppercase">Timings</span>
                        <span className="text-slate-800 font-semibold">{booking.departure}</span>
                      </div>
                      <div>
                        <span className="block text-slate-400 text-[10px] uppercase">Primary Passenger</span>
                        <span className="text-slate-800 font-semibold truncate block max-w-[150px]">
                          {booking.passengers[0]?.name || "N/A"}
                        </span>
                      </div>
                      <div>
                        <span className="block text-slate-400 text-[10px] uppercase">Seats Booked</span>
                        <span className="text-slate-800 font-semibold">{booking.seats.join(", ")}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Actions Footer */}
                  <div className="p-5 border-t border-slate-100 flex items-center justify-between mt-auto bg-slate-50/20">
                    <div>
                      <span className="block text-[9px] text-slate-400 uppercase">Paid Amount</span>
                      <span className="text-base font-extrabold text-slate-800">₹{Number(booking.amount).toFixed(2)}</span>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleViewTicket(booking)}
                        variant="outline"
                        size="sm"
                      >
                        View Ticket
                      </Button>
                      
                      {booking.status === "Confirmed" && (
                        <Button
                          onClick={() => handleCancelClick(booking.id)}
                          variant="danger"
                          size="sm"
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </div>

                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center flex flex-col items-center justify-center min-h-[400px]"
            >
              <div className="p-4 bg-ocean-50 rounded-full text-ocean-600 mb-5">
                <Compass className="w-10 h-10 animate-spin" style={{ animationDuration: "12s" }} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">No Bookings Yet</h3>
              <p className="text-xs text-slate-400 max-w-sm leading-relaxed mb-6">
                You haven't booked any voyages. Set sail across the beautiful oceans by making your first ferry booking now!
              </p>
              <Link to="/book">
                <Button variant="primary">
                  Book Your First Journey
                </Button>
              </Link>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Cancellation confirmation modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onConfirm={handleConfirmCancellation}
          title="Cancel Ferry Booking"
          message={`Are you sure you want to cancel this booking? Eligible seats will be returned to the same schedule and the ticket will be voided.`}
          confirmText="Yes, Cancel Booking"
          cancelText="No, Keep Ticket"
        />

      </div>
    </div>
  );
}
