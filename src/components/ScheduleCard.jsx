import { motion } from "framer-motion";
import { Ship, Clock, ArrowRight, User } from "lucide-react";
import Button from "./Button";

export default function ScheduleCard({ schedule, onBook }) {
  // Select badge color classes based on the badge type
  const getBadgeStyles = (badgeType) => {
    switch (badgeType) {
      case "fast":
        return "bg-sky-50 border-sky-200 text-sky-700";
      case "premium":
        return "bg-purple-50 border-purple-200 text-purple-700";
      case "limited":
        return "bg-amber-50 border-amber-200 text-amber-700 animate-pulse";
      case "economy":
      default:
        return "bg-emerald-50 border-emerald-200 text-emerald-700";
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-300 p-5 md:p-6"
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        
        {/* Ferry Information & Name */}
        <div className="flex items-start gap-4">
          <div className="p-3 bg-slate-50 rounded-2xl text-ocean-600 flex-shrink-0">
            <Ship className="w-6 h-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <h3 className="text-lg font-bold text-slate-800">{schedule.name}</h3>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getBadgeStyles(schedule.badgeType)}`}>
                {schedule.badge}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">{schedule.type}</p>
          </div>
        </div>

        {/* Departure -> Arrival Timeline */}
        <div className="flex-1 flex items-center justify-between max-w-md mx-auto lg:mx-0 w-full px-2">
          {/* Departure */}
          <div className="text-left">
            <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Departure</span>
            <span className="block text-lg font-extrabold text-slate-800 mt-0.5">{schedule.departure}</span>
            <span className="block text-xs font-medium text-slate-500 mt-0.5">{schedule.from}</span>
          </div>

          {/* Timeline Line */}
          <div className="flex-1 flex flex-col items-center px-4">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {schedule.duration}
            </span>
            <div className="relative w-full flex items-center justify-center">
              <div className="absolute w-full h-[2px] bg-slate-100" />
              <ArrowRight className="w-4 h-4 text-ocean-400 relative z-10 bg-white px-0.5" />
            </div>
          </div>

          {/* Arrival */}
          <div className="text-right">
            <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Arrival</span>
            <span className="block text-lg font-extrabold text-slate-800 mt-0.5">{schedule.arrival}</span>
            <span className="block text-xs font-medium text-slate-500 mt-0.5">{schedule.to}</span>
          </div>
        </div>

        {/* Price, Seats, & Book Button */}
        <div className="flex items-center lg:items-end justify-between lg:flex-col gap-4 border-t lg:border-t-0 border-slate-100 pt-4 lg:pt-0">
          <div className="text-left lg:text-right">
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ticket Price</span>
            <span className="block text-2xl font-black text-ocean-600">₹{schedule.price}</span>
            
            {/* Seats status */}
            <span className={`inline-flex items-center gap-1 text-xs font-semibold mt-1 ${schedule.seatsAvailable <= 10 ? 'text-amber-600 font-bold' : 'text-slate-500'}`}>
              <User className="w-3.5 h-3.5" />
              {schedule.seatsAvailable} seats left
            </span>
          </div>

          <Button
            onClick={() => onBook(schedule)}
            variant={schedule.seatsAvailable === 0 ? "outline" : "primary"}
            disabled={schedule.seatsAvailable === 0}
            className="w-full lg:w-auto"
          >
            {schedule.seatsAvailable === 0 ? "Sold Out" : "Book Now"}
          </Button>
        </div>

      </div>
    </motion.div>
  );
}
