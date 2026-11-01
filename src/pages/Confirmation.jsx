import { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { Ship, CheckCircle, Printer, Download, List, Home, Calendar, Clock, HelpCircle } from "lucide-react";
import { motion } from "framer-motion";
import Button from "../components/Button";
import { bookingService } from "../services/dataService";

export default function Confirmation() {
  const location = useLocation();
  const [booking, setBooking] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadBooking = async () => {
      try {
        if (location.state?.booking) {
          setBooking(location.state.booking);
        } else {
          setBooking(await bookingService.getLatest());
        }
      } catch {
        setBooking(null);
      } finally {
        setIsLoading(false);
      }
    };
    loadBooking();
  }, [location.state]);

  const handlePrint = () => {
    const previousTitle = document.title;
    document.title = `FerryPort-Ticket-${booking?.bookingId || "Pass"}`;
    window.addEventListener("afterprint", () => { document.title = previousTitle; }, { once: true });
    window.print();
  };

  const handleDownload = () => window.print();

  if (isLoading) {
    return <div className="flex-1 bg-slate-50 pt-32 text-center text-sm font-semibold text-slate-500">Loading ticket...</div>;
  }

  if (!booking) {
    return (
      <div className="flex-1 bg-slate-50 pt-32 pb-20 flex flex-col items-center justify-center">
        <div className="bg-white rounded-2xl border border-slate-100 p-8 shadow-sm text-center max-w-sm">
          <HelpCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-800">No Booking Found</h3>
          <p className="text-xs text-slate-500 mt-2 mb-6">
            We couldn't retrieve any recent booking details. Please visit the book section to purchase a ticket.
          </p>
          <Link to="/book">
            <Button variant="primary" className="w-full">
              Book Tickets
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="confirmation-page flex-1 bg-slate-50 pt-28 pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Success Header */}
        <div className="text-center mb-8 no-print">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, type: "spring" }}
            className="p-3 bg-emerald-50 text-emerald-600 rounded-full w-max mx-auto mb-4 border border-emerald-100 shadow-sm shadow-emerald-50"
          >
            <CheckCircle className="w-12 h-12" />
          </motion.div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Booking Confirmed!</h1>
          <p className="text-sm text-slate-500 mt-1">
            Your payment was simulated successfully. Your digital ticket details are shown below.
          </p>
        </div>

        {/* Digital Boarding Pass Ticket */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="print-area bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden relative"
        >
          {/* Top colored strip */}
          <div className="bg-gradient-to-r from-ocean-600 to-aqua-500 h-4" />

          {/* Ticket Header */}
          <div className="p-6 md:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-dashed border-slate-200 gap-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-gradient-to-br from-ocean-600 to-aqua-500 rounded-xl text-white">
                <Ship className="w-5 h-5" />
              </div>
              <div>
                <span className="font-extrabold text-slate-800 tracking-tight">Ferry<span className="text-ocean-600">Port</span></span>
                <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Official Ticket</span>
              </div>
            </div>

            <div className="text-left sm:text-right bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-xl">
              <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-wider block leading-none">Booking Status</span>
              <span className="text-xs font-black text-emerald-700 mt-0.5 inline-block">CONFIRMED</span>
            </div>
          </div>

          {/* Main Ticket body */}
          <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            {/* Journey Grid */}
            <div className="md:col-span-8 space-y-6">
              
              {/* Trip details */}
              <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div className="text-left">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">From</span>
                  <span className="text-sm font-extrabold text-slate-800 block mt-0.5">{booking.from}</span>
                </div>
                
                <div className="flex flex-col items-center px-4">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">{booking.duration}</span>
                  <div className="w-20 h-0.5 bg-slate-200 relative">
                    <div className="absolute right-0 -top-1 w-2 h-2 rounded-full bg-ocean-500" />
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">To</span>
                  <span className="text-sm font-extrabold text-slate-800 block mt-0.5">{booking.to}</span>
                </div>
              </div>

              {/* Passenger Roster */}
              <div className="text-left">
                <h4 className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2.5">Passenger Details</h4>
                <div className="space-y-2">
                  {booking.passengers.map((p, index) => (
                    <div key={`confirm-p-${index}`} className="flex justify-between items-center text-xs pb-1.5 border-b border-slate-100 last:border-b-0 last:pb-0">
                      <div>
                        <span className="font-extrabold text-slate-800">{p.name}</span>
                        <span className="text-slate-500 ml-1.5">({p.gender}, {p.age} yrs)</span>
                      </div>
                      <span className="font-bold text-ocean-600 uppercase">Seat: {p.seat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Journey Specifications */}
              <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-left border-t border-slate-100 pt-4">
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    Date
                  </span>
                  <span className="text-xs font-bold text-slate-800 mt-1 block">{booking.date}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    Departure
                  </span>
                  <span className="text-xs font-bold text-slate-800 mt-1 block">{booking.departure}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Vessel</span>
                  <span className="text-xs font-bold text-slate-800 mt-1 block">{booking.ferryName}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Seats Booked</span>
                  <span className="text-xs font-bold text-slate-800 mt-1 block">{booking.seats.join(", ")}</span>
                </div>
              </div>

            </div>

            {/* Booking reference and fare summary */}
            <div className="md:col-span-4 flex flex-col justify-center p-6 bg-slate-50/50 rounded-2xl border border-slate-100 text-left space-y-5 md:h-full">
              <div className="rounded-xl bg-white border border-slate-200 p-4">
                <span className="block text-[9px] text-slate-400 font-bold uppercase tracking-wider">Keep this booking reference</span>
                <span className="booking-reference block text-base sm:text-lg font-black text-slate-800 tracking-normal mt-1">{booking.bookingId}</span>
                <span className="text-[10px] text-slate-500 mt-1 block">Show it to the ferry staff at check-in.</span>
              </div>
              <div>
                <span className="block text-[9px] text-slate-400 font-semibold uppercase tracking-wider">Passengers</span>
                <span className="block text-sm font-bold text-slate-800 mt-1">{booking.passengers.length} traveler{booking.passengers.length === 1 ? "" : "s"}</span>
              </div>
              <div className="border-t border-slate-200 w-full pt-3">
                <div className="flex justify-between text-xs text-slate-500"><span>Payment status</span><span className="font-bold text-emerald-600">PAID</span></div>
                <div className="flex justify-between items-end mt-3"><span className="text-[10px] font-bold text-slate-500 uppercase">Total paid</span><span className="text-xl font-black text-ocean-600">₹{Number(booking.amount || 0).toFixed(2)}</span></div>
              </div>
            </div>

          </div>

          {/* Bottom helper */}
          <div className="bg-slate-50 px-6 py-4 text-center border-t border-slate-100 text-[10px] text-slate-400 font-semibold leading-relaxed">
            Bring your booking reference and a valid identity document to check in at the port.
          </div>
          <div className="pdf-ticket-details">
            <div className="pdf-ticket-top">
              <div className="pdf-ticket-brand"><span className="pdf-ticket-mark"><Ship size={18} /></span><span>Ferry<span>Port</span><small>PASSENGER TRAVEL RECEIPT</small></span></div>
              <div className="pdf-ticket-status">PAYMENT CONFIRMED<small>Booking {booking.bookingId}</small></div>
            </div>
            <div className="pdf-ticket-route"><div><small>DEPARTURE</small><strong>{booking.from}</strong><span>{booking.departure}</span></div><div className="pdf-route-line"><span>FERRY VOYAGE</span><i /></div><div className="pdf-route-destination"><small>ARRIVAL</small><strong>{booking.to}</strong><span>{booking.arrival || "As scheduled"}</span></div></div>
            <div className="pdf-ticket-meta"><div><small>TRAVEL DATE</small><strong>{booking.date}</strong></div><div><small>VESSEL</small><strong>{booking.ferryName}</strong></div><div><small>SEATS</small><strong>{booking.seats.join(", ")}</strong></div><div><small>PASSENGERS</small><strong>{booking.passengers.length}</strong></div></div>
            <div className="pdf-ticket-passengers"><strong>Passenger manifest</strong>{booking.passengers.map((p, index) => <div key={`pdf-p-${index}`}><span>{p.name} <small>{p.gender}, {p.age} yrs</small></span><b>Seat {p.seat}</b></div>)}</div>
            <div className="pdf-ticket-total"><span>Paid in full <small>FerryPort booking payment</small></span><strong>₹{Number(booking.amount || 0).toFixed(2)}</strong></div>
            <div className="pdf-ticket-footer"><span>Arrive at the boarding point at least 30 minutes before departure.</span><b>ferryport · {booking.bookingId}</b></div>
          </div>
        </motion.div>

        {/* Action Controls */}
        <div className="mt-8 flex flex-wrap justify-center gap-4 no-print">
          <Button onClick={handlePrint} variant="outline" className="flex items-center gap-2">
            <Printer className="w-4 h-4" />
            Print Ticket
          </Button>
          
          <Button onClick={handleDownload} variant="outline" className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Download Ticket
          </Button>

          <Link to="/my-bookings">
            <Button variant="primary" className="flex items-center gap-2">
              <List className="w-4 h-4" />
              My Bookings
            </Button>
          </Link>

          <Link to="/">
            <Button variant="outline" className="flex items-center gap-2 bg-transparent text-slate-600 hover:text-slate-900 border-slate-200">
              <Home className="w-4 h-4" />
              Return Home
            </Button>
          </Link>
        </div>

      </div>
    </div>
  );
}
