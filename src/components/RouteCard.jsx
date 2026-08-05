import { motion } from "framer-motion";
import { Clock, ArrowRight, ArrowLeftRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function RouteCard({ route }) {
  const navigate = useNavigate();

  const handleViewSchedule = () => {
    navigate(`/schedules?from=${encodeURIComponent(route.from)}&to=${encodeURIComponent(route.to)}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -6 }}
      className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-slate-100 flex flex-col h-full text-left"
    >
      {/* Route Image container */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={route.image}
          alt={`${route.from} to ${route.to}`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-slate-900/10 to-transparent" />
        
        {/* Top badge starting price */}
        <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-slate-800 shadow-md">
          Starts at <span className="text-ocean-600 font-extrabold text-sm">₹{route.price}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* From & To title */}
          <div className="flex items-center gap-2 mb-2">
            <span className="font-bold text-slate-800 text-lg">{route.from}</span>
            <ArrowLeftRight className="w-4 h-4 text-ocean-500 flex-shrink-0" />
            <span className="font-bold text-slate-800 text-lg">{route.to}</span>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed mb-4 line-clamp-3">
            {route.description}
          </p>
        </div>

        {/* Action Row */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-auto">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <Clock className="w-4 h-4 text-slate-400" />
            {route.duration}
          </div>
          
          <button
            onClick={handleViewSchedule}
            className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-ocean-600 group-hover:text-ocean-700 transition-colors"
          >
            Schedules
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
