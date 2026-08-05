import { useEffect, useState } from "react";
import { adminService } from "../../services/dataService";

const labels = {
  totalUsers: "Registered Users",
  totalBookings: "Total Bookings",
  confirmedBookings: "Confirmed",
  pendingBookings: "Pending",
  cancelledBookings: "Cancelled",
  completedJourneys: "Completed",
  totalRevenue: "Revenue (₹)",
  activeFerries: "Active Ferries",
  activeRoutes: "Active Routes",
  upcomingSchedules: "Upcoming Schedules",
  soldOutSchedules: "Sold-out Schedules"
};

export default function AdminDashboard({ addToast }) {
  const [dashboard, setDashboard] = useState(null);

  useEffect(() => {
    adminService.dashboard()
      .then(setDashboard)
      .catch((error) => addToast(error.message, "error"));
  }, [addToast]);

  if (!dashboard) {
    return <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-7">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(labels).map(([key, label]) => (
          <div key={key} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <span className="block text-2xl font-black text-slate-900">{dashboard[key] ?? 0}</span>
            <span className="block text-xs font-semibold text-slate-500 mt-1">{label}</span>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h2 className="font-extrabold text-slate-900 mb-4">Recent Bookings</h2>
        <div className="space-y-2">
          {(dashboard.recentBookings || []).map((booking) => (
            <div key={booking._id} className="flex justify-between gap-4 border-b border-slate-100 py-2 text-sm">
              <span className="font-bold text-slate-700">{booking.bookingId}</span>
              <span className="text-slate-500">{booking.user?.email}</span>
              <span className="font-semibold text-ocean-600">₹{booking.totalAmount}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
