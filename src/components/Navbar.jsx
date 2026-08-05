import { useState, useEffect } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { Ship, Menu, X, LogIn, LogOut, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar({ isLoggedIn, currentUser, onLogout }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const isDarkBackground = pathname === "/" && !isScrolled;

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Schedules", path: "/schedules" },
    { name: "Book Ticket", path: "/book" },
    { name: "My Bookings", path: "/my-bookings" },
    { name: "About", path: "/about" },
    { name: "Contact", path: "/contact" }
  ];

  const handleLogoutClick = () => {
    onLogout();
    setIsOpen(false);
    navigate("/");
  };

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-40 transition-all duration-300 ${
        isScrolled
          ? "bg-white/90 backdrop-blur-md shadow-md py-3"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="p-2 bg-gradient-to-br from-ocean-500 to-aqua-500 rounded-xl text-white shadow-md shadow-ocean-100 group-hover:rotate-6 transition-transform duration-300">
              <Ship className="w-6 h-6" />
            </div>
            <span className={`text-xl font-bold tracking-tight transition-colors duration-300 ${isDarkBackground ? "text-white" : "text-slate-900"}`}>
              Ferry<span className="text-aqua-600">Port</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                className={({ isActive }) =>
                  `text-sm font-semibold transition-all duration-200 relative py-1 ${
                    isActive
                      ? "text-ocean-600"
                      : isDarkBackground
                      ? "text-slate-200 hover:text-white"
                      : "text-slate-700 hover:text-ocean-600"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {link.name}
                    {isActive && (
                      <motion.div
                        layoutId="activeNavIndicator"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-ocean-500 rounded-full"
                      />
                    )}
                  </>
                )}
              </NavLink>
            ))}

            {currentUser?.role === "admin" && (
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `text-sm font-semibold transition-colors ${isActive ? "text-ocean-600" : isDarkBackground ? "text-amber-300 hover:text-white" : "text-amber-600 hover:text-amber-700"}`
                }
              >
                Admin
              </NavLink>
            )}

            {isLoggedIn ? (
              <div className="flex items-center gap-4 pl-4 border-l border-slate-200/30">
                <span className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full ${isDarkBackground ? "bg-white/10 text-white backdrop-blur" : "bg-slate-100 text-slate-700"}`}>
                  <User className="w-3.5 h-3.5" />
                  {currentUser?.name || "Profile"}
                </span>
                <button
                  onClick={handleLogoutClick}
                  className={`inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 ${
                    isDarkBackground
                      ? "bg-white/10 hover:bg-white/20 text-white backdrop-blur"
                      : "bg-rose-50 hover:bg-rose-100 text-rose-600"
                  }`}
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Logout
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className={`inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 ${
                  isScrolled
                    ? "bg-ocean-600 hover:bg-ocean-700 text-white shadow-md shadow-ocean-100"
                    : "bg-white text-ocean-600 hover:bg-slate-50 shadow-lg shadow-black/10"
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                Login
              </Link>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex lg:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`p-2 rounded-xl transition-colors duration-200 ${
                  isDarkBackground
                    ? "text-white hover:bg-white/10"
                    : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white border-t border-slate-100 shadow-xl overflow-hidden mt-2"
          >
            <div className="px-4 pt-2 pb-6 space-y-1.5 flex flex-col">
              {navLinks.map((link) => (
                <NavLink
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) =>
                    `px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                      isActive
                        ? "bg-ocean-50 text-ocean-600 font-bold"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`
                  }
                >
                  {link.name}
                </NavLink>
              ))}
              {currentUser?.role === "admin" && (
                <NavLink
                  to="/admin"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-sm font-bold text-amber-700 hover:bg-amber-50"
                >
                  Admin Dashboard
                </NavLink>
              )}

              <div className="pt-4 border-t border-slate-100 mt-2 flex flex-col gap-2">
                {isLoggedIn ? (
                  <>
                    <div className="flex items-center gap-2 px-4 py-2 text-slate-700 text-sm font-medium">
                      <User className="w-4 h-4 text-ocean-500" />
                      {currentUser?.name || "Logged in"}
                    </div>
                    <button
                      onClick={handleLogoutClick}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-sm font-bold transition-all duration-200"
                    >
                      <LogOut className="w-4 h-4" />
                      LOGOUT
                    </button>
                  </>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setIsOpen(false)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-ocean-600 to-ocean-500 text-white rounded-xl text-sm font-bold shadow-md shadow-ocean-100 transition-all duration-200"
                  >
                    <LogIn className="w-4 h-4" />
                    LOGIN
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
