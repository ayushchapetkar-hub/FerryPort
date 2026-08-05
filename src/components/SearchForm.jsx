import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Calendar, Users, ArrowUpDown, Search } from "lucide-react";
import { motion } from "framer-motion";
import { routeService } from "../services/dataService";
import Button from "./Button";

export default function SearchForm({ initialValues = {} }) {
  const navigate = useNavigate();
  const [from, setFrom] = useState(initialValues.from || "");
  const [to, setTo] = useState(initialValues.to || "");
  const [date, setDate] = useState(initialValues.date || "");
  const [passengers, setPassengers] = useState(initialValues.passengers || 1);
  const [error, setError] = useState("");
  const [routes, setRoutes] = useState([]);
  const [isLoadingRoutes, setIsLoadingRoutes] = useState(true);
  const locations = useMemo(
    () => [...new Set(routes.flatMap((route) => [route.source, route.destination]))].sort(),
    [routes]
  );
  const destinationOptions = from
    ? routes.filter((route) => route.source === from).map((route) => route.destination)
    : locations;

  useEffect(() => {
    routeService.getAll()
      .then(setRoutes)
      .catch(() => setError("The route network is currently unavailable."))
      .finally(() => setIsLoadingRoutes(false));
  }, []);

  // Get today's date formatted as YYYY-MM-DD for the date input's "min" attribute
  const today = new Date().toISOString().split("T")[0];

  const handleSwap = () => {
    const temp = from;
    setFrom(to);
    setTo(temp);
    setError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!from || !to) {
      setError("Please select both departure and destination ports.");
      return;
    }
    if (from === to) {
      setError("Departure and destination ports cannot be the same.");
      return;
    }
    setError("");
    
    // Redirect to schedules with search parameters
    const params = new URLSearchParams({
      from,
      to,
      date,
      passengers: passengers.toString()
    });
    navigate(`/schedules?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="bg-white rounded-2xl md:rounded-3xl shadow-xl border border-slate-100 p-5 md:p-6 lg:p-8 space-y-4">
        {/* Error Alert */}
        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold rounded-xl flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-600 flex-shrink-0" />
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          
          {/* Departure Port Selection */}
          <div className="md:col-span-4 relative flex flex-col gap-1.5 text-left">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-ocean-500" />
              Departure Port
            </label>
            <select
              value={from}
              onChange={(e) => {
                setFrom(e.target.value);
                if (!routes.some((route) => route.source === e.target.value && route.destination === to)) {
                  setTo("");
                }
                setError("");
              }}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 focus:outline-none focus:border-ocean-500 focus:ring-2 focus:ring-ocean-100 transition-all text-sm appearance-none font-medium cursor-pointer"
            >
              <option value="" disabled>{isLoadingRoutes ? "Loading ports..." : "Select Departure Location"}</option>
              {locations.map((loc) => (
                <option key={`from-${loc}`} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>

          {/* Swap Button */}
          <div className="md:col-span-1 flex justify-center mt-2 md:mt-4">
            <motion.button
              type="button"
              onClick={handleSwap}
              whileHover={{ scale: 1.15, rotate: 180 }}
              whileTap={{ scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="p-3 bg-ocean-50 text-ocean-600 hover:bg-ocean-100 active:bg-ocean-200 rounded-full shadow-sm border border-ocean-100/50 transition-colors flex items-center justify-center cursor-pointer"
              title="Swap Locations"
            >
              <ArrowUpDown className="w-4 h-4 md:rotate-90" />
            </motion.button>
          </div>

          {/* Destination Port Selection */}
          <div className="md:col-span-4 relative flex flex-col gap-1.5 text-left">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-aqua-600" />
              Destination Port
            </label>
            <select
              value={to}
              onChange={(e) => {
                setTo(e.target.value);
                if (e.target.value === from) setFrom("");
                setError("");
              }}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 focus:outline-none focus:border-ocean-500 focus:ring-2 focus:ring-ocean-100 transition-all text-sm appearance-none font-medium cursor-pointer"
            >
              <option value="" disabled>Select Destination Location</option>
              {destinationOptions.map((loc) => (
                <option key={`to-${loc}`} value={loc} disabled={loc === from}>
                  {loc}
                </option>
              ))}
            </select>
          </div>

          {/* Date Picker */}
          <div className="md:col-span-3 flex flex-col gap-1.5 text-left">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-ocean-500" />
              Travel Date
            </label>
            <input
              type="date"
              value={date}
              min={today}
              required
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 focus:outline-none focus:border-ocean-500 focus:ring-2 focus:ring-ocean-100 transition-all text-sm font-medium cursor-pointer"
            />
          </div>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center pt-2">
          
          {/* Passenger count */}
          <div className="md:col-span-4 flex flex-col gap-1.5 text-left">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-ocean-500" />
              Passengers
            </label>
            <input
              type="number"
              min="1"
              max="10"
              value={passengers}
              onChange={(e) => setPassengers(Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 focus:outline-none focus:border-ocean-500 focus:ring-2 focus:ring-ocean-100 transition-all text-sm font-medium"
            />
            <span className="text-[10px] text-slate-400 pl-1">Max 10 passengers per booking</span>
          </div>

          {/* Search Button */}
          <div className="md:col-span-8 flex justify-end md:mt-4">
            <Button
              type="submit"
              variant="secondary"
              className="w-full md:w-auto md:px-10 py-3.5"
            >
              <Search className="w-4 h-4 mr-2" />
              Search Ferries
            </Button>
          </div>

        </div>
      </div>
    </form>
  );
}
