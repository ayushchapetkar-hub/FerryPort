const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const SESSION_KEY = "ferryportSession";

export const getStoredSession = () => {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
  } catch {
    return null;
  }
};

export const storeSession = (session) => {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
};

export const clearStoredSession = () => localStorage.removeItem(SESSION_KEY);

export const apiRequest = async (path, options = {}) => {
  const session = getStoredSession();
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(session?.token && { Authorization: `Bearer ${session.token}` }),
      ...options.headers
    },
    body: options.body && typeof options.body !== "string"
      ? JSON.stringify(options.body)
      : options.body
  });

  let data;
  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok) {
    const error = new Error(data.message || "The server could not complete the request.");
    error.status = response.status;
    throw error;
  }
  return data;
};

export const downloadApiFile = async (path, filename) => {
  const session = getStoredSession();
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      ...(session?.token && { Authorization: `Bearer ${session.token}` })
    }
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.message || "The export could not be downloaded.");
  }
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};
