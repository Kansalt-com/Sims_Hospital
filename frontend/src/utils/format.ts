import dayjs from "dayjs";

export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(value || 0);
};

export const formatDateTime = (value?: string | null) => {
  if (!value) return "-";
  return dayjs(value).format("DD MMM YYYY, hh:mm A");
};

export const formatDate = (value?: string | null) => {
  if (!value) return "-";
  return dayjs(value).format("DD MMM YYYY");
};

export const formatVisitDate = (value?: string | null, type?: string | null) => {
  if (!value) return "-";
  return type === "OPD" ? formatDate(value) : formatDateTime(value);
};
