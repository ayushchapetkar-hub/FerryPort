import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ShieldCheck, Ticket, IndianRupee, Zap, Compass } from "lucide-react";
import { testimonials } from "../data/testimonials";
import RouteCard from "../components/RouteCard";
import SearchForm from "../components/SearchForm";
import Button from "../components/Button";
import { contactService, routeService } from "../services/dataService";

// Custom animated counter component using Framer Motion
function StatCounter({ value, suffix = "", duration = 2 }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    // Extract integer from value (e.g. 10000 out of "10,000" or 25 out of "25")
    const cleanValue = parseInt(value.replace(/,/g, ""), 10);
    const end = cleanValue;
    if (start === end) return;

    let totalMiliseconds = duration * 1000;
    let incrementTime = Math.max(Math.floor(totalMiliseconds / end), 10);
    
    let timer = setInterval(() => {
      start += Math.ceil(end / (totalMiliseconds / incrementTime));
      if (start >= end) {
        clearInterval(timer);
        start = end;
      }
      setCount(start);
    }, incrementTime);

    return () => clearInterval(timer);
  }, [value, duration]);

  // Format count back to locale string if original value had commas
  const displayCount = value.includes(",") ? count.toLocaleString("en-IN") : count;

  return (
    <span className="font-extrabold text-3xl sm:text-4xl lg:text-5xl text-ocean-600 block">
      {displayCount}
      {suffix}
    </span>
  );
}

export default function Home({ addToast }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [liveRoutes, setLiveRoutes] = useState([]);

  useEffect(() => {
    routeService.getAll()
      .then((routes) => {
        const cards = routes.slice(0, 6).map((route) => ({
            id: route._id,
            from: route.source,
            to: route.destination,
            price: route.basePrice,
            duration: `${route.estimatedDuration} mins`,
            image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=600&q=80",
            description: `Travel from ${route.source} to ${route.destination} on a scheduled FerryPort service.`
          }));
        setLiveRoutes(cards);
      })
      .catch((error) => addToast(error.message, "error"));
  }, [addToast]);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) {
      addToast("Please enter a valid email address.", "error");
      return;
    }
    try {
      await contactService.subscribe(email);
      addToast(`Thank you! Subscription confirmed for ${email}.`, "success");
      setEmail("");
    } catch (error) {
      addToast(error.message, "error");
    }
  };

  const featureCards = [
    {
      icon: <Zap className="w-8 h-8 text-amber-500" />,
      title: "Easy Online Booking",
      description: "Search routes, select your deck seats, and confirm your bookings in under two minutes."
    },
    {
      icon: <ShieldCheck className="w-8 h-8 text-emerald-500" />,
      title: "Safe and Trusted Travel",
      description: "We partner with licensed vessel operators and crew strictly adhering to maritime safety standards."
    },
    {
      icon: <IndianRupee className="w-8 h-8 text-ocean-600" />,
      title: "Affordable Ticket Prices",
      description: "Enjoy transparency in fare calculations with no hidden service fees or processing markups."
    },
    {
      icon: <Ticket className="w-8 h-8 text-purple-500" />,
      title: "Quick Digital Tickets",
      description: "Download printable boarding passes and dynamic QR codes immediately after mock validation."
    }
  ];

  const steps = [
    {
      step: "01",
      title: "Search a Ferry",
      description: "Input your departure location, destination, date, and passenger count to find matching schedules."
    },
    {
      step: "02",
      title: "Enter Passenger Details",
      description: "Select available seats on our interactive deck layout and enter the primary traveler profiles."
    },
    {
      step: "03",
      title: "Complete Mock Payment",
      description: "Process checkout using UPI or credit card simulation to download your official boarding ticket."
    }
  ];

  return (
    <div className="flex-1">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center text-white bg-slate-950 overflow-hidden">
        {/* Background Image with Dark Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1920&q=80"
            alt="Ferry on Sea"
            className="w-full h-full object-cover opacity-45 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-navy-950/80 via-navy-950/40 to-slate-50" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-24 pb-16 md:py-32">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-white/10 text-aqua-400 backdrop-blur-sm border border-white/5 uppercase tracking-wider mb-6">
              <Compass className="w-3.5 h-3.5" />
              Coast-to-Coast Booking System
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-none mb-6"
          >
            Your Journey Across The <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-aqua-400 to-ocean-400">
              Water Starts Here
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-base sm:text-lg md:text-xl text-slate-200 max-w-2xl mx-auto mb-10 leading-relaxed font-medium"
          >
            Skip the long port terminal lines. Search schedules, book deck seating, and generate digital boarding passes instantly for India's finest coastal channels.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button onClick={() => navigate("/book")} variant="secondary" size="lg" className="w-full sm:w-auto">
              Book Your Ferry
            </Button>
            <Button onClick={() => navigate("/schedules")} variant="lightOutline" size="lg" className="w-full sm:w-auto">
              View Schedules
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Floating Search Form Section */}
      <section className="relative z-25 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 md:-mt-28">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <SearchForm />
        </motion.div>
      </section>

      {/* Popular Routes Section */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">Popular Ferry Routes</h2>
            <div className="w-12 h-1 bg-gradient-to-r from-ocean-500 to-aqua-500 mx-auto mt-4 rounded-full" />
            <p className="mt-4 text-slate-500 text-sm sm:text-base">
              Explore the most traveled passenger marine corridors connecting mainland harbors and tropical islands.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {liveRoutes.map((route) => (
              <RouteCard key={route.id} route={route} />
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Feature Section */}
      <section className="py-24 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-ocean-600">The FerryPort Advantage</span>
            <h2 className="text-3xl font-extrabold text-slate-900 sm:text-4xl mt-2">Why Choose FerryPort?</h2>
            <div className="w-12 h-1 bg-gradient-to-r from-ocean-500 to-aqua-500 mx-auto mt-4 rounded-full" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featureCards.map((feat, idx) => (
              <motion.div
                key={`feat-${idx}`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="p-6 bg-slate-50/50 rounded-2xl border border-slate-100 hover:shadow-lg transition-shadow duration-300 flex flex-col text-left"
              >
                <div className="p-3 bg-white rounded-xl shadow-sm w-max mb-5 flex-shrink-0">
                  {feat.icon}
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-3">{feat.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{feat.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-ocean-600">Simple Process</span>
            <h2 className="text-3xl font-extrabold text-slate-900 sm:text-4xl mt-2">How It Works</h2>
            <div className="w-12 h-1 bg-gradient-to-r from-ocean-500 to-aqua-500 mx-auto mt-4 rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative">
            {steps.map((step, idx) => (
              <motion.div
                key={`step-${idx}`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                className="relative bg-white p-8 rounded-2xl shadow-sm border border-slate-100/60 text-left flex flex-col justify-between h-full"
              >
                <div>
                  <span className="text-5xl font-black text-slate-100 block mb-4">{step.step}</span>
                  <h3 className="text-lg font-bold text-slate-800 mb-3">{step.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed mb-6">{step.description}</p>
                </div>
                <div className="w-8 h-1 bg-gradient-to-r from-ocean-500 to-aqua-500 rounded-full" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-20 bg-gradient-to-br from-slate-900 to-navy-950 text-white relative overflow-hidden">
        {/* Background bubbles */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-ocean-600/10 rounded-full blur-3xl -z-0" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-aqua-600/10 rounded-full blur-3xl -z-0" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-10 text-center">
            <div className="space-y-2">
              <StatCounter value="25" suffix="+" />
              <span className="text-xs uppercase tracking-wider text-slate-400 font-bold">Ferry Routes</span>
            </div>
            <div className="space-y-2">
              <StatCounter value="15" suffix="+" />
              <span className="text-xs uppercase tracking-wider text-slate-400 font-bold">Destinations</span>
            </div>
            <div className="space-y-2">
              <StatCounter value="10,000" suffix="+" />
              <span className="text-xs uppercase tracking-wider text-slate-400 font-bold">Happy Travellers</span>
            </div>
            <div className="space-y-2">
              <StatCounter value="98" suffix="%" />
              <span className="text-xs uppercase tracking-wider text-slate-400 font-bold">Satisfaction Rate</span>
            </div>
          </div>
        </div>
      </section>

      {/* Customer Reviews Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-ocean-600">Client Reviews</span>
            <h2 className="text-3xl font-extrabold text-slate-900 sm:text-4xl mt-2">What Our Passengers Say</h2>
            <div className="w-12 h-1 bg-gradient-to-r from-ocean-500 to-aqua-500 mx-auto mt-4 rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {testimonials.map((testi, idx) => (
              <motion.div
                key={testi.id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="bg-slate-50/50 border border-slate-100 rounded-2xl p-6 flex flex-col justify-between text-left hover:shadow-md transition-shadow"
              >
                <div>
                  <div className="flex gap-0.5 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={`text-lg ${i < testi.rating ? 'text-amber-400' : 'text-slate-200'}`}>★</span>
                    ))}
                  </div>
                  <p className="text-xs text-slate-600 italic leading-relaxed mb-6">"{testi.text}"</p>
                </div>
                
                <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                  <img
                    src={testi.avatar}
                    alt={testi.name}
                    className="w-10 h-10 rounded-full object-cover shadow-sm"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">{testi.name}</h4>
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{testi.location}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20 bg-slate-50 border-t border-slate-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Subscribe for Travel Updates</h2>
          <p className="mt-3 text-slate-500 text-sm max-w-md mx-auto">
            Get alerts on discount coupons, weather updates, and newly launched vessel routes.
          </p>

          <form onSubmit={handleSubscribe} className="mt-8 flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              className="flex-1 px-4 py-3.5 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:border-ocean-500 focus:ring-2 focus:ring-ocean-100 text-sm"
            />
            <Button type="submit" variant="primary" className="py-3.5">
              Subscribe
            </Button>
          </form>
        </div>
      </section>
    </div>
  );
}
