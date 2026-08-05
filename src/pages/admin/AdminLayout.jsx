import { NavLink, Outlet } from "react-router-dom";

const links = [
  ["Overview", "/admin"],
  ["Bookings", "/admin/bookings"],
  ["Users", "/admin/users"],
  ["Ferries", "/admin/ferries"],
  ["Routes", "/admin/routes"],
  ["Schedules", "/admin/schedules"],
  ["Payments", "/admin/payments"],
  ["Promotions", "/admin/promotions"],
  ["Inquiries", "/admin/contacts"],
  ["Subscribers", "/admin/subscribers"],
  ["Logs", "/admin/logs"]
];

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-slate-50 pt-28 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-7">
          <p className="text-xs font-bold uppercase tracking-widest text-ocean-600">Administration</p>
          <h1 className="text-3xl font-black text-slate-900">FerryPort Control Centre</h1>
        </div>
        <nav className="flex gap-2 overflow-x-auto bg-white border border-slate-200 rounded-2xl p-2 mb-7">
          {links.map(([label, path]) => (
            <NavLink
              key={path}
              to={path}
              end={path === "/admin"}
              className={({ isActive }) =>
                `whitespace-nowrap px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                  isActive ? "bg-ocean-600 text-white" : "text-slate-600 hover:bg-slate-100"
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
        <Outlet />
      </div>
    </div>
  );
}
