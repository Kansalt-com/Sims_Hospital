import { clearCache } from "../utils/memoryCache.js";

export const CACHE_PREFIXES = {
  authUser: "auth:user:",
  authPermissions: "auth:permissions:",
  dashboard: "dashboard:",
  reports: "reports:",
  patients: "patients:",
  doctors: "doctors:",
  rooms: "rooms:",
  settings: "settings:",
  users: "users:",
  prescriptions: "prescriptions:",
} as const;

export const clearReportingCache = () => {
  clearCache(CACHE_PREFIXES.dashboard);
  clearCache(CACHE_PREFIXES.reports);
};

export const clearPatientCache = () => {
  clearCache(CACHE_PREFIXES.patients);
};

export const clearDoctorCache = () => {
  clearCache(CACHE_PREFIXES.doctors);
};

export const clearSettingsCache = () => {
  clearCache(CACHE_PREFIXES.settings);
};

export const clearRoomCache = () => {
  clearCache(CACHE_PREFIXES.rooms);
};

export const clearUserCache = () => {
  clearCache(CACHE_PREFIXES.users);
  clearCache(CACHE_PREFIXES.authUser);
};

export const clearPrescriptionCache = () => {
  clearCache(CACHE_PREFIXES.prescriptions);
};
