import { useCallback, useEffect, useMemo, useState } from "react";
import Button from "../../components/Button";
import { adminService } from "../../services/dataService";

const editableResources = new Set(["ferries", "routes", "schedules", "promotions"]);

const formFields = {
  ferries: [
    ["name", "Ferry name"], ["ferryCode", "Ferry code"], ["totalCapacity", "Capacity", "number"],
    ["status", "Status", "select", ["active", "inactive", "maintenance"]],
    ["image", "Image URL"], ["description", "Description"], ["facilities", "Facilities (comma separated)"]
  ],
  routes: [
    ["source", "Source port"], ["destination", "Destination port"],
    ["distance", "Distance (km)", "number"], ["estimatedDuration", "Duration (minutes)", "number"],
    ["basePrice", "Base price", "number"], ["status", "Status", "select", ["active", "inactive"]]
  ],
  schedules: [
    ["ferry", "Ferry", "ferry"], ["route", "Route", "route"], ["travelDate", "Travel date", "date"],
    ["departureTime", "Departure", "time"], ["arrivalTime", "Arrival", "time"],
    ["totalSeats", "Total seats", "number"], ["availableSeats", "Available seats", "number"],
    ["ticketPrice", "Ticket price", "number"], ["taxPercent", "Tax %", "number"],
    ["serviceCharge", "Service charge", "number"], ["convenienceFee", "Convenience fee", "number"],
    ["discountPercent", "Schedule discount %", "number"],
    ["status", "Status", "select", ["scheduled", "boarding", "departed", "completed", "cancelled"]],
    ["bookingEnabled", "Booking enabled", "checkbox"]
  ],
  promotions: [
    ["offerName", "Offer name"], ["offerCode", "Offer code"], ["description", "Description"],
    ["discountType", "Discount type", "select", ["percentage", "fixed"]],
    ["discountValue", "Discount value", "number"],
    ["minimumBookingAmount", "Minimum booking amount", "number"],
    ["validFrom", "Valid from", "datetime-local"], ["validUntil", "Valid until", "datetime-local"],
    ["usageLimit", "Usage limit", "number"], ["active", "Active", "checkbox"]
  ]
};

const summary = (resource, item) => {
  if (resource === "bookings") return `${item.bookingId} · ${item.contactEmail} · ${item.bookingStatus}`;
  if (resource === "users") return `${item.name} · ${item.email} · ${item.isBlocked ? "Blocked" : item.status}`;
  if (resource === "ferries") return `${item.name} · ${item.ferryCode} · ${item.totalCapacity} seats · ${item.status}`;
  if (resource === "routes") return `${item.source} → ${item.destination} · ₹${item.basePrice} · ${item.status}`;
  if (resource === "schedules") return `${item.ferry?.name || "Ferry"} · ${item.route?.source || ""} → ${item.route?.destination || ""} · ${item.travelDate} · ${item.status}`;
  if (resource === "payments") return `${item.paymentId} · ${item.user?.email || ""} · ₹${item.amount} · ${item.status}`;
  if (resource === "promotions") return `${item.offerName} · ${item.offerCode} · ${item.discountValue}${item.discountType === "percentage" ? "%" : " ₹"} · ${item.active ? "Active" : "Disabled"}`;
  if (resource === "contacts") return `${item.name} · ${item.email} · ${item.subject} · ${item.status}`;
  if (resource === "subscribers") return `${item.email} · ${item.active ? "Active" : "Inactive"}`;
  if (resource === "logs") return `${item.action} · ${item.entityType} · ${new Date(item.createdAt).toLocaleString()}`;
  return item._id;
};

export default function AdminDataPage({ resource, addToast, editable = false }) {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [formData, setFormData] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [related, setRelated] = useState({ ferries: [], routes: [] });
  const [bookingFilters, setBookingFilters] = useState({
    date: "",
    source: "",
    destination: "",
    ferry: "",
    paymentStatus: "",
    bookingStatus: ""
  });

  const api = adminService[resource];
  const load = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const data = resource === "logs" ? await adminService.logs() : await api.list(params);
      setItems(data || []);
    } catch (error) {
      addToast(error.message, "error");
    } finally {
      setLoading(false);
    }
  }, [resource, api, addToast]);

  useEffect(() => { load({}); }, [load]);

  useEffect(() => {
    if (resource !== "schedules") return;
    Promise.all([adminService.ferries.list(), adminService.routes.list()])
      .then(([ferries, routes]) => setRelated({ ferries, routes }))
      .catch((error) => addToast(error.message, "error"));
  }, [resource, addToast]);

  const filtered = useMemo(
    () => items.filter((item) => summary(resource, item).toLowerCase().includes(search.toLowerCase())),
    [items, resource, search]
  );

  const edit = (item) => {
    const clean = { ...item };
    ["_id", "__v", "createdAt", "updatedAt", "createdBy"].forEach((key) => delete clean[key]);
    if (clean.ferry && typeof clean.ferry === "object") clean.ferry = clean.ferry._id;
    if (clean.route && typeof clean.route === "object") clean.route = clean.route._id;
    if (Array.isArray(clean.facilities)) clean.facilities = clean.facilities.join(", ");
    if (clean.validFrom) clean.validFrom = new Date(clean.validFrom).toISOString().slice(0, 16);
    if (clean.validUntil) clean.validUntil = new Date(clean.validUntil).toISOString().slice(0, 16);
    setEditingId(item._id);
    setFormData(clean);
  };

  const save = async () => {
    try {
      const payload = { ...formData };
      for (const [name, , type] of formFields[resource] || []) {
        if (type === "number" && payload[name] !== "" && payload[name] !== undefined) {
          payload[name] = Number(payload[name]);
        }
      }
      if (typeof payload.facilities === "string") {
        payload.facilities = payload.facilities.split(",").map((item) => item.trim()).filter(Boolean);
      }
      if (payload.usageLimit === "") payload.usageLimit = null;
      if (editingId) await api.update(editingId, payload);
      else await api.create(payload);
      addToast(`${resource.slice(0, -1)} saved successfully.`, "success");
      setFormData({});
      setEditingId(null);
      load();
    } catch (error) {
      addToast(error.message, "error");
    }
  };

  const remove = async (id) => {
    try {
      await api.remove(id);
      addToast("Record deleted.", "success");
      load();
    } catch (error) {
      addToast(error.message, "error");
    }
  };

  const action = async (path, body) => {
    try {
      await adminService.action(path, body);
      addToast("Action completed.", "success");
      load();
    } catch (error) {
      addToast(error.message, "error");
    }
  };

  const viewDetails = async (item) => {
    try {
      const data = await api.get(item._id);
      setDetails(data);
    } catch (error) {
      addToast(error.message, "error");
    }
  };

  const exportBookings = async () => {
    try {
      await adminService.exportBookings({
        ...bookingFilters,
        ...(search && { bookingId: search })
      });
      addToast("Booking CSV downloaded.", "success");
    } catch (error) {
      addToast(error.message, "error");
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row justify-between gap-3">
        <h2 className="text-xl font-black text-slate-900 capitalize">{resource}</h2>
        <div className="flex gap-2">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={`Search ${resource}`}
            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm"
          />
          {resource === "bookings" && <Button onClick={exportBookings}>Export CSV</Button>}
        </div>
      </div>

      {resource === "bookings" && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 grid grid-cols-2 md:grid-cols-4 gap-3">
          <input type="date" value={bookingFilters.date} onChange={(event) => setBookingFilters({ ...bookingFilters, date: event.target.value })} className="px-3 py-2 rounded-xl border border-slate-200 text-sm" />
          <input placeholder="Source port" value={bookingFilters.source} onChange={(event) => setBookingFilters({ ...bookingFilters, source: event.target.value })} className="px-3 py-2 rounded-xl border border-slate-200 text-sm" />
          <input placeholder="Destination port" value={bookingFilters.destination} onChange={(event) => setBookingFilters({ ...bookingFilters, destination: event.target.value })} className="px-3 py-2 rounded-xl border border-slate-200 text-sm" />
          <input placeholder="Ferry name" value={bookingFilters.ferry} onChange={(event) => setBookingFilters({ ...bookingFilters, ferry: event.target.value })} className="px-3 py-2 rounded-xl border border-slate-200 text-sm" />
          <select value={bookingFilters.paymentStatus} onChange={(event) => setBookingFilters({ ...bookingFilters, paymentStatus: event.target.value })} className="px-3 py-2 rounded-xl border border-slate-200 text-sm">
            <option value="">All payments</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>
          <select value={bookingFilters.bookingStatus} onChange={(event) => setBookingFilters({ ...bookingFilters, bookingStatus: event.target.value })} className="px-3 py-2 rounded-xl border border-slate-200 text-sm">
            <option value="">All bookings</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
            <option value="completed">Completed</option>
          </select>
          <Button onClick={() => load({ ...bookingFilters, ...(search && { bookingId: search }) })}>Apply Filters</Button>
          <Button variant="outline" onClick={() => {
            const cleared = { date: "", source: "", destination: "", ferry: "", paymentStatus: "", bookingStatus: "" };
            setBookingFilters(cleared);
            setSearch("");
            load({});
          }}>Clear</Button>
        </div>
      )}

      {details && (
        <div className="bg-white rounded-2xl border border-ocean-200 p-5">
          <div className="flex justify-between mb-3">
            <h3 className="font-bold text-slate-800">Ferry details and assigned schedules</h3>
            <button onClick={() => setDetails(null)} className="text-xs font-bold text-slate-500">Close</button>
          </div>
          <pre className="overflow-auto text-xs bg-slate-50 rounded-xl p-4">{JSON.stringify(details, null, 2)}</pre>
        </div>
      )}

      {editable && editableResources.has(resource) && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h3 className="font-bold text-slate-800 mb-2">{editingId ? "Edit record" : "Create record"}</h3>
          <p className="text-xs text-slate-500 mb-4">All values are validated again by the backend before saving.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {(formFields[resource] || []).map(([name, label, type = "text", options]) => (
              <label key={name} className="text-xs font-bold text-slate-600">
                <span className="block mb-1.5">{label}</span>
                {type === "select" ? (
                  <select value={formData[name] ?? ""} onChange={(event) => setFormData({ ...formData, [name]: event.target.value })} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white">
                    <option value="">Select</option>
                    {options.map((option) => <option key={option} value={option}>{option}</option>)}
                  </select>
                ) : type === "ferry" || type === "route" ? (
                  <select value={formData[name] ?? ""} onChange={(event) => setFormData({ ...formData, [name]: event.target.value })} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white">
                    <option value="">Select</option>
                    {(type === "ferry" ? related.ferries : related.routes).map((item) => (
                      <option key={item._id} value={item._id}>
                        {type === "ferry" ? `${item.name} (${item.ferryCode})` : `${item.source} → ${item.destination}`}
                      </option>
                    ))}
                  </select>
                ) : type === "checkbox" ? (
                  <input type="checkbox" checked={Boolean(formData[name])} onChange={(event) => setFormData({ ...formData, [name]: event.target.checked })} className="w-5 h-5 accent-sky-600" />
                ) : (
                  <input type={type} value={formData[name] ?? ""} onChange={(event) => setFormData({ ...formData, [name]: event.target.value })} className="w-full px-3 py-2.5 rounded-xl border border-slate-200" />
                )}
              </label>
            ))}
          </div>
          <div className="flex gap-2 mt-3">
            <Button onClick={save}>Save</Button>
            {editingId && <Button variant="outline" onClick={() => { setEditingId(null); setFormData({}); }}>Cancel edit</Button>}
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-500">No records found.</div>
        ) : filtered.map((item) => (
          <div key={item._id} className="p-4 border-b border-slate-100 last:border-0 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <span className="text-sm text-slate-700">{summary(resource, item)}</span>
            <div className="flex flex-wrap gap-2">
              {editable && <Button size="sm" variant="outline" onClick={() => edit(item)}>Edit</Button>}
              {resource === "ferries" && <Button size="sm" variant="outline" onClick={() => viewDetails(item)}>Schedules</Button>}
              {resource === "bookings" && item.bookingStatus === "confirmed" && (
                <>
                  <Button size="sm" variant="outline" onClick={() => action(`bookings/${item._id}/complete`)}>Complete</Button>
                  <Button size="sm" variant="danger" onClick={() => action(`bookings/${item._id}/cancel`)}>Cancel</Button>
                </>
              )}
              {resource === "bookings" && item.bookingStatus === "pending" && item.paymentStatus === "paid" && (
                <Button size="sm" onClick={() => action(`bookings/${item._id}/confirm`)}>Confirm</Button>
              )}
              {resource === "users" && (
                <>
                  <Button size="sm" variant="outline" onClick={() => action(`users/${item._id}/${item.isBlocked ? "unblock" : "block"}`)}>
                    {item.isBlocked ? "Unblock" : "Block"}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => action(`users/${item._id}/status`, { status: item.status === "active" ? "inactive" : "active" })}>
                    Set {item.status === "active" ? "Inactive" : "Active"}
                  </Button>
                </>
              )}
              {resource === "payments" && item.status === "successful" && (
                <Button size="sm" variant="outline" onClick={() => action(`payments/${item._id}/refund`)}>Refund</Button>
              )}
              {resource === "promotions" && (
                <Button size="sm" variant="outline" onClick={() => action(`promotions/${item._id}/status`, { active: !item.active })}>
                  {item.active ? "Disable" : "Enable"}
                </Button>
              )}
              {resource === "contacts" && (
                <Button size="sm" variant="outline" onClick={() => action(`contacts/${item._id}/status`, { status: item.status === "resolved" ? "new" : "resolved" })}>
                  Mark {item.status === "resolved" ? "New" : "Resolved"}
                </Button>
              )}
              {resource === "subscribers" && (
                <Button size="sm" variant="outline" onClick={() => action(`subscribers/${item._id}/status`, { active: !item.active })}>
                  {item.active ? "Disable" : "Enable"}
                </Button>
              )}
              {(editable || ["bookings", "users", "contacts", "subscribers"].includes(resource)) && (
                <Button size="sm" variant="danger" onClick={() => remove(item._id)}>Delete</Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
