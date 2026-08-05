import {
  apiRequest,
  clearStoredSession,
  downloadApiFile,
  getStoredSession,
  storeSession
} from "./api";

const queryString = (params = {}) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") query.set(key, value);
  });
  const value = query.toString();
  return value ? `?${value}` : "";
};

const normalizeBooking = (booking) => {
  const schedule = booking.schedule || {};
  const ferry = schedule.ferry || {};
  const route = schedule.route || {};

  return {
    ...booking,
    id: booking._id,
    ferryName: ferry.name || booking.ferryName,
    ferryType: ferry.description || booking.ferryType || "Passenger Ferry",
    from: route.source || booking.from,
    to: route.destination || booking.to,
    departure: schedule.departureTime || booking.departure,
    arrival: schedule.arrivalTime || booking.arrival,
    duration: route.estimatedDuration ? `${route.estimatedDuration} mins` : booking.duration,
    date: schedule.travelDate || booking.date,
    seats: booking.selectedSeats || booking.seats || [],
    passengers: (booking.passengers || []).map((passenger) => ({
      ...passenger,
      seat: passenger.seatNumber || passenger.seat
    })),
    amount: booking.totalAmount ?? booking.amount,
    status: booking.bookingStatus
      ? `${booking.bookingStatus.charAt(0).toUpperCase()}${booking.bookingStatus.slice(1)}`
      : booking.status
  };
};

export const authService = {
  async register(payload) {
    const data = await apiRequest("/auth/register", { method: "POST", body: payload });
    return storeSession({ token: data.token, user: data.user });
  },
  async login(payload) {
    const data = await apiRequest("/auth/login", { method: "POST", body: payload });
    return storeSession({ token: data.token, user: data.user });
  },
  async getCurrentUser() {
    const data = await apiRequest("/auth/me");
    const current = getStoredSession();
    if (current) storeSession({ ...current, user: data.user });
    return data.user;
  },
  getSession: getStoredSession,
  clearSession: clearStoredSession
};

export const scheduleService = {
  async search(params) {
    const data = await apiRequest(`/schedules/search${queryString(params)}`);
    return data.schedules;
  },
  async getById(id) {
    const data = await apiRequest(`/schedules/${id}`);
    return data.schedule;
  }
};

export const routeService = {
  async getAll() {
    const data = await apiRequest("/routes");
    return data.routes;
  }
};

export const contactService = {
  submit: (payload) => apiRequest("/contact", { method: "POST", body: payload }),
  subscribe: (email) => apiRequest("/subscribers", { method: "POST", body: { email } })
};

export const bookingService = {
  async create(payload) {
    const data = await apiRequest("/bookings", { method: "POST", body: payload });
    return data.booking;
  },
  async payDemo(payload) {
    const data = await apiRequest("/payments/demo", { method: "POST", body: payload });
    return normalizeBooking(data.booking);
  },
  async getAll() {
    const data = await apiRequest("/bookings/my-bookings");
    return data.bookings.map(normalizeBooking);
  },
  async getLatest() {
    const bookings = await this.getAll();
    return bookings[0] || null;
  },
  async getById(id) {
    const data = await apiRequest(`/bookings/${id}`);
    return normalizeBooking(data.booking);
  },
  async cancel(id) {
    const data = await apiRequest(`/bookings/${id}/cancel`, { method: "PATCH" });
    return normalizeBooking(data.booking);
  },
  async getTicket(id) {
    const data = await apiRequest(`/bookings/${id}/ticket`);
    return normalizeBooking(data.booking);
  }
};

const adminResource = (resource) => ({
  list: async (params) => (await apiRequest(`/admin/${resource}${queryString(params)}`))[resource],
  get: async (id) => apiRequest(`/admin/${resource}/${id}`),
  create: async (payload) => apiRequest(`/admin/${resource}`, { method: "POST", body: payload }),
  update: async (id, payload) => apiRequest(`/admin/${resource}/${id}`, { method: "PUT", body: payload }),
  remove: async (id) => apiRequest(`/admin/${resource}/${id}`, { method: "DELETE" })
});

export const adminService = {
  dashboard: async () => (await apiRequest("/admin/dashboard")).dashboard,
  bookings: adminResource("bookings"),
  users: adminResource("users"),
  ferries: adminResource("ferries"),
  routes: adminResource("routes"),
  schedules: adminResource("schedules"),
  payments: adminResource("payments"),
  promotions: adminResource("promotions"),
  contacts: adminResource("contacts"),
  subscribers: adminResource("subscribers"),
  logs: async () => (await apiRequest("/admin/logs")).logs,
  exportBookings: (params) =>
    downloadApiFile(`/admin/bookings/export${queryString(params)}`, "ferryport-bookings.csv"),
  action: (path, body) => apiRequest(`/admin/${path}`, { method: "PATCH", body })
};
