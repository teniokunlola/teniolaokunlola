import { auth } from "./firebaseConfig";
import { buildApiUrl } from "./config";

export async function authFetch(input: RequestInfo, init: RequestInit = {}) {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");
  const token = await user.getIdToken();
  
  // Convert headers to a plain object
  const existingHeaders: Record<string, string> = {};
  if (init.headers) {
    if (init.headers instanceof Headers) {
      init.headers.forEach((value, key) => {
        existingHeaders[key] = value;
      });
    } else if (Array.isArray(init.headers)) {
      init.headers.forEach(([key, value]) => {
        existingHeaders[key] = value;
      });
    } else {
      Object.assign(existingHeaders, init.headers);
    }
  }
  
  const headers: Record<string, string> = {
    ...existingHeaders,
    Authorization: `Bearer ${token}`,
  };
  
  // Only set Content-Type if not FormData
  if (!(init.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }
  
  return fetch(input, {
    ...init,
    headers,
  });
}

export async function fetchAdminUser() {
  const response = await authFetch(buildApiUrl("current-admin-user/"));
  if (response.status === 403) {
    throw new Error("Forbidden: You do not have access.");
  }
  if (response.status === 404) {
    throw new Error("Admin user not found. Please complete the invitation process.");
  }
  if (!response.ok) {
    throw new Error("Failed to fetch admin user.");
  }
  return response.json();
}