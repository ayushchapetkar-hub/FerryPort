import { motion } from "framer-motion";
import { Ship, Code2, ShieldAlert, FileSpreadsheet, CalendarDays, Armchair, TicketCheck, Tag } from "lucide-react";

export default function About() {
  const technologies = [
    { name: "React.js", desc: "A JavaScript library for building component-based, single-page user interfaces." },
    { name: "Vite", desc: "A modern build tool providing incredibly fast development server and bundling." },
    { name: "Tailwind CSS v4", desc: "A utility-first CSS framework used to build our coastal theme styling." },
    { name: "React Router DOM", desc: "Provides client-side declarative routing and URL parameter matching." },
    { name: "Framer Motion", desc: "An open-source library for React powering our page and button animations." },
    { name: "Node.js + Express", desc: "Provides the REST API for authentication, schedules, bookings, payments, and administration." },
    { name: "MongoDB + Mongoose", desc: "Stores users, ferries, routes, schedules, bookings, offers, and payment records." },
    { name: "JWT + bcrypt", desc: "Protects user sessions and securely hashes account passwords." },
    { name: "Lucide React", desc: "Clean, consistent icon vectors representing ships, dates, and actions." }
  ];

  return (
    <div className="flex-1 bg-slate-50 pt-28 pb-20 text-left">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-10 text-center md:text-left">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">About FerryPort</h1>
          <p className="text-sm text-slate-500 mt-1">
            Explore routes, compare sailings, and manage your ferry trip in one place.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Content */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* What is FerryPort */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6"
            >
              <h2 className="text-xl font-extrabold text-slate-900 mb-3 flex items-center gap-2">
                <Ship className="w-5 h-5 text-ocean-600" />
                Project Overview
              </h2>
              <p className="text-xs text-slate-500 leading-relaxed">
                FerryPort is a full-stack online ticketing portal for commuter marine ferry voyages. It combines a responsive React interface with an Express REST API and MongoDB database to manage accounts, schedules, live seat availability, bookings, promotional offers, payments, and administration.
              </p>
              <div className="mt-4 p-4 bg-amber-50 border border-amber-100 rounded-xl text-xs text-amber-800 font-semibold leading-relaxed flex gap-2.5">
                <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <span>
                  Accounts, schedules, seat allocations, and booking history are stored through the secured backend. Payment remains a clearly labelled college demonstration and does not communicate with a real bank or process real money.
                </span>
              </div>
            </motion.div>

            {/* Tech Stack Details */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6"
            >
              <h2 className="text-xl font-extrabold text-slate-900 mb-4 flex items-center gap-2">
                <Code2 className="w-5 h-5 text-ocean-600" />
                Technologies Implemented
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {technologies.map((tech) => (
                  <div key={tech.name} className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="font-extrabold text-slate-800 text-sm block">{tech.name}</span>
                    <span className="text-[11px] text-slate-500 mt-1 block leading-relaxed">{tech.desc}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Why Online Booking */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6"
            >
              <h2 className="text-xl font-extrabold text-slate-900 mb-3 flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-ocean-600" />
                Benefits of Online Ferry Booking
              </h2>
              <ul className="space-y-3.5 text-xs text-slate-500 leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-ocean-500 mt-1.5 flex-shrink-0" />
                  <span><strong>Zero Queueing:</strong> Boarding passes are generated digitally, reducing check-in times at heavy cargo ports.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-ocean-500 mt-1.5 flex-shrink-0" />
                  <span><strong>Interactive Layouts:</strong> Passenger choice of window, aisle, or bench seats before boarding.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-ocean-500 mt-1.5 flex-shrink-0" />
                  <span><strong>Schedule Transparency:</strong> Travel durations, fares, departure, and arrival times are explicitly visible.</span>
                </li>
              </ul>
            </motion.div>

          </div>

          {/* How the website works */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-4 bg-gradient-to-br from-slate-900 to-navy-950 text-white rounded-2xl border border-slate-800 shadow-lg p-6 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-ocean-600/10 rounded-full blur-2xl" />
            
            <h3 className="text-lg font-extrabold text-white flex items-center gap-2 mb-6 border-b border-slate-800 pb-4">
              <TicketCheck className="w-5 h-5 text-aqua-400" />
              What you can do
            </h3>

            <div className="space-y-5 text-xs">
              <div className="flex gap-3">
                <CalendarDays className="w-4 h-4 text-aqua-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-sm font-extrabold text-white block">Find a sailing</span>
                  <span className="text-slate-300 block mt-1 leading-relaxed">Browse ferry routes and compare departure times, journey details, and fares.</span>
                </div>
              </div>

              <div className="flex gap-3">
                <Armchair className="w-4 h-4 text-aqua-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-sm font-extrabold text-white block">Plan your trip</span>
                  <span className="text-slate-300 block mt-1 leading-relaxed">Choose seats, add passenger details, and apply an available offer at checkout.</span>
                </div>
              </div>

              <div className="flex gap-3">
                <TicketCheck className="w-4 h-4 text-aqua-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-sm font-extrabold text-white block">Keep track of bookings</span>
                  <span className="text-slate-300 block mt-1 leading-relaxed">View booking confirmations and trip details from your account.</span>
                </div>
              </div>

              <div className="flex gap-3">
                <Tag className="w-4 h-4 text-aqua-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-sm font-extrabold text-white block">Manage the service</span>
                  <span className="text-slate-300 block mt-1 leading-relaxed">Administrators can manage schedules, routes, bookings, offers, and payment records.</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-5 border-t border-slate-800 text-[10px] text-slate-400 text-center leading-relaxed">
              FerryPort is a demonstration project. Online payments are simulated and do not transfer real money.
            </div>
          </motion.div>

        </div>

      </div>
    </div>
  );
}
