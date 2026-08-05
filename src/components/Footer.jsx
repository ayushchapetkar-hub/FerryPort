import { Link } from "react-router-dom";
import { Ship, Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-slate-400 pt-16 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand Info */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2 group w-max">
              <div className="p-2 bg-gradient-to-br from-ocean-500 to-aqua-500 rounded-xl text-white">
                <Ship className="w-5 h-5" />
              </div>
              <span className="text-lg font-bold tracking-tight text-white">
                Ferry<span className="text-aqua-400">Port</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-slate-400">
              Your gateway to seamless coastal travel. Book tickets across India's premium ferry routes with ease, speed, and safety.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a href="#" className="p-2 bg-slate-800 hover:bg-ocean-600 hover:text-white rounded-lg transition-all duration-200" title="Facebook">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
              <a href="#" className="p-2 bg-slate-800 hover:bg-ocean-600 hover:text-white rounded-lg transition-all duration-200" title="Twitter/X">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <a href="#" className="p-2 bg-slate-800 hover:bg-ocean-600 hover:text-white rounded-lg transition-all duration-200" title="Instagram">
                <svg className="w-4 h-4 stroke-current fill-none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
              </a>
              <a href="#" className="p-2 bg-slate-800 hover:bg-ocean-600 hover:text-white rounded-lg transition-all duration-200" title="LinkedIn">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="hover:text-aqua-400 transition-colors duration-200">Home</Link>
              </li>
              <li>
                <Link to="/schedules" className="hover:text-aqua-400 transition-colors duration-200">Schedules</Link>
              </li>
              <li>
                <Link to="/book" className="hover:text-aqua-400 transition-colors duration-200">Book Ticket</Link>
              </li>
              <li>
                <Link to="/my-bookings" className="hover:text-aqua-400 transition-colors duration-200">My Bookings</Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-aqua-400 transition-colors duration-200">About Project</Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-aqua-400 transition-colors duration-200">Contact Us</Link>
              </li>
            </ul>
          </div>

          {/* Popular Routes */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">Popular Routes</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/schedules?from=Mumbai&to=Mandwa" className="hover:text-aqua-400 transition-colors duration-200">Mumbai to Mandwa</Link>
              </li>
              <li>
                <Link to="/schedules?from=Mumbai&to=Elephanta Island" className="hover:text-aqua-400 transition-colors duration-200">Mumbai to Elephanta Island</Link>
              </li>
              <li>
                <Link to="/schedules?from=Port Blair&to=Havelock Island" className="hover:text-aqua-400 transition-colors duration-200">Port Blair to Havelock</Link>
              </li>
              <li>
                <Link to="/schedules?from=Kochi&to=Lakshadweep" className="hover:text-aqua-400 transition-colors duration-200">Kochi to Lakshadweep</Link>
              </li>
              <li>
                <Link to="/schedules?from=Okha&to=Beyt Dwarka" className="hover:text-aqua-400 transition-colors duration-200">Okha to Beyt Dwarka</Link>
              </li>
            </ul>
          </div>

          {/* Contact Support */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">Contact Info</h4>
            <div className="flex items-start gap-3 text-sm">
              <MapPin className="w-4 h-4 text-aqua-400 mt-0.5 flex-shrink-0" />
              <span>FerryPort Support Centre, Mumbai, Maharashtra, India</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Phone className="w-4 h-4 text-aqua-400 flex-shrink-0" />
              <span>+91 98765 43210</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Mail className="w-4 h-4 text-aqua-400 flex-shrink-0" />
              <a href="mailto:support@ferryport.demo" className="hover:text-aqua-400 transition-colors">support@ferryport.demo</a>
            </div>
          </div>
        </div>

        {/* Disclaimer and copyright */}
        <div className="border-t border-slate-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
          <div className="text-xs max-w-lg leading-relaxed">
            <span className="text-amber-500 font-semibold block mb-1">Disclaimer:</span>
            FerryPort is a frontend demonstration project created for educational purposes as a Semester 5 B.Sc. Computer Science college project. No real payments are processed, and no real tickets are dispatched.
          </div>
          <div className="text-xs text-slate-500">
            &copy; {currentYear} FerryPort. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
