const normalizeBasePath = (value?: string | null) => {
  if (!value || value === "/") {
    return "";
  }

  const withLeadingSlash = value.startsWith("/") ? value : `/${value}`;
  return withLeadingSlash.endsWith("/") ? withLeadingSlash.slice(0, -1) : withLeadingSlash;
};

const isLocalDevUrl = (value?: string | null) =>
  Boolean(value && /^(https?:\/\/)?(localhost|127\.0\.0\.1)(:\d+)?(\/|$)/i.test(value));

export const buildPublicAssetPath = (assetPath: string) => {
  const basePath = normalizeBasePath(import.meta.env.BASE_URL);
  const normalizedAssetPath = assetPath.startsWith("/") ? assetPath.slice(1) : assetPath;
  return `${basePath}/${normalizedAssetPath}`.replace(/\/{2,}/g, "/");
};

export const getDefaultHospitalLogoPath = () => buildPublicAssetPath("assets/branding/sims-logo.jpg");

export const getDefaultKansaltLogoPath = () => buildPublicAssetPath("assets/branding/kansalt-logo.svg");

export const buildAssetUrl = (pathValue?: string | null, version?: string | number | null) => {
  if (!pathValue) {
    return null;
  }

  if (/^https?:\/\//i.test(pathValue)) {
    return pathValue;
  }

  const appBasePath = normalizeBasePath(import.meta.env.BASE_URL);
  const defaultBaseUrl = typeof window !== "undefined" ? `${window.location.origin}${appBasePath}` : "";
  const baseUrl =
    import.meta.env.VITE_UPLOAD_BASE_URL && !isLocalDevUrl(import.meta.env.VITE_UPLOAD_BASE_URL)
      ? import.meta.env.VITE_UPLOAD_BASE_URL
      : defaultBaseUrl;
  const normalizedPath = pathValue.startsWith("/") ? pathValue : `/${pathValue}`;
  const url = `${baseUrl}${normalizedPath}`;
  if (!version) {
    return url;
  }

  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}v=${encodeURIComponent(String(version))}`;
};

export const isValidImageFile = (file: File) => {
  const validTypes = ["image/png", "image/jpeg", "image/jpg", "image/svg+xml"];
  return validTypes.includes(file.type);
};

export const formatAcceptedImageTypes = () => "PNG, JPG, JPEG or SVG";

export const getBrandingVersion = (updatedAt?: string | number | null, pathValue?: string | null) => updatedAt || pathValue || null;
