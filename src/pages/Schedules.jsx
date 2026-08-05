import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Filter, RotateCcw, Ship } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { routeService, scheduleService } from "../services/dataService";
import ScheduleCard from "../components/ScheduleCard";
import Button from "../components/Button";

export default function Schedules({ addToast }) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Extract initial parameters from URL
  const initFrom = searchParams.get("from") || "";
  const initTo = searchParams.get("to") || "";
  const initDate = searchParams.get("date") || "";
  const initType = searchParams.get("type") || "";

  // State for form filters
  const [from, setFrom] = useState(initFrom);
  const [to, setTo] = useState(initTo);
  const [date, setDate] = useState(initDate);
  const [type, setType] = useState(initType);

  // State for filtered schedules shown on UI
  const [filteredFerries, setFilteredFerries] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [routes, setRoutes] = useState([]);
  const locations = [...new Set(routes.flatMap((route) => [route.source, route.destination]))].sort();
  const destinationOptions = from
    ? routes.filter((route) => route.source === from).map((route) => route.destination)
    : locations;

  useEffect(() => {
    routeService.getAll()
      .then(setRoutes)
      .catch((error) => addToast(error.message, "error"));
  }, [addToast]);

  // Perform filtering based on current query parameters
  useEffect(() => {
    const qFrom = searchParams.get("from");
    const qTo = searchParams.get("to");
    const qType = searchParams.get("type");

    setIsLoading(true);
    scheduleService.search({
      source: qFrom,
      destination: qTo,
      date: searchParams.get("date")
    })
      .then((results) => {
        const typedResults = qType
          ? results.filter((ferry) =>
            ferry.type.toLowerCase().includes(qType.toLowerCase()) || ferry.badgeType === qType
          )
          : results;
        setFilteredFerries(typedResults);
      })
      .catch((error) => {
        setFilteredFerries([]);
        addToast(error.message, "error");
      })
      .finally(() => setIsLoading(false));
    setHasSearched(!!(qFrom || qTo || qType));

    // Synchronize local filter inputs if changed from URL (e.g. back button)
    setFrom(qFrom || "");
    setTo(qTo || "");
    setType(qType || "");
    setDate(searchParams.get("date") || "");
  }, [searchParams, addToast]);

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    const params = {};
    if (from) params.from = from;
    if (to) params.to = to;
    if (date) params.date = date;
    if (type) params.type = type;

    setSearchParams(params);
  };

  const handleResetFilters = () => {
    setFrom("");
    setTo("");
    setDate("");
    setType("");
    setSearchParams({});
  };

  const handleBookNow = (schedule) => {
    // Navigate to booking wizard page passing the ferry schedule state
    navigate("/book", { state: { schedule } });
  };

  return (
    <div className="flex-1 bg-slate-50 pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Header */}
        <div className="text-left mb-10">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Available Ferry Schedules</h1>
          <p className="text-sm text-slate-500 mt-1">
            Search, filter, and choose from our listing of coastal passenger ferry voyages.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Filters Sidebar */}
          <div className="lg:col-span-4 bg-white border border-slate-100 shadow-sm rounded-2xl p-5 md:p-6 text-left">
            <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-100">
              <span className="font-bold text-slate-800 flex items-center gap-2">
                <Filter className="w-4 h-4 text-ocean-600" />
                Filter Schedules
              </span>
              {(from || to || date || type) && (
                <button
                  onClick={handleResetFilters}
                  className="text-xs font-semibold text-rose-500 hover:text-rose-700 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset
                </button>
              )}
            </div>

            <form onSubmit={handleFilterSubmit} className="space-y-4">
              {/* Departure */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Departure Port</label>
                <select
                  value={from}
                  onChange={(e) => {
                    const nextFrom = e.target.value;
                    setFrom(nextFrom);
                    if (!routes.some((route) => route.source === nextFrom && route.destination === to)) {
                      setTo("");
                    }
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-700 focus:outline-none focus:border-ocean-500 text-sm font-medium cursor-pointer"
                >
                  <option value="">All Ports</option>
                  {locations.map((loc) => (
                    <option key={`filter-from-${loc}`} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>

              {/* Destination */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Destination Port</label>
                <select
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-700 focus:outline-none focus:border-ocean-500 text-sm font-medium cursor-pointer"
                >
                  <option value="">All Ports</option>
                  {destinationOptions.map((loc) => (
                    <option key={`filter-to-${loc}`} value={loc} disabled={loc === from}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Travel Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-700 focus:outline-none focus:border-ocean-500 text-sm font-medium cursor-pointer"
                />
              </div>

              {/* Ferry Type */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Ferry Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-700 focus:outline-none focus:border-ocean-500 text-sm font-medium cursor-pointer"
                >
                  <option value="">All Types</option>
                  <option value="economy">Economy</option>
                  <option value="premium">Premium</option>
                  <option value="fast">Fast Ferry</option>
                </select>
              </div>

              <Button type="submit" variant="primary" className="w-full mt-2">
                Apply Filters
              </Button>
            </form>
          </div>

          {/* Right Schedules List */}
          <div className="lg:col-span-8 space-y-4">
            <div className="flex justify-between items-center text-xs font-semibold text-slate-400 uppercase tracking-wider pl-1 mb-2">
              <span>Showing {filteredFerries.length} schedules</span>
              {hasSearched && <span className="text-ocean-600 font-bold">Filtered Results</span>}
            </div>

            <AnimatePresence mode="popLayout">
              {isLoading ? (
                <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center text-sm font-semibold text-slate-500">
                  Loading current schedules...
                </div>
              ) : filteredFerries.length > 0 ? (
                <div className="space-y-4">
                  {filteredFerries.map((ferry) => (
                    <ScheduleCard
                      key={ferry.id}
                      schedule={ferry}
                      onBook={handleBookNow}
                    />
                  ))}
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center flex flex-col items-center justify-center min-h-[350px]"
                >
                  <div className="p-4 bg-rose-50 rounded-full text-rose-500 mb-5">
                    <Ship className="w-10 h-10" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">No Ferries Found</h3>
                  <p className="text-xs text-slate-400 max-w-sm leading-relaxed mb-6">
                    We couldn't find any ferry schedules matching your filters. Try changing your departure, destination ports or reset the selections.
                  </p>
                  <Button onClick={handleResetFilters} variant="outline" className="text-slate-600 hover:text-slate-900 border-slate-200">
                    Clear All Filters
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>

      </div>
    </div>
  );
}
