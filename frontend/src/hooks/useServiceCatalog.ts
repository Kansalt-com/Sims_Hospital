import { useEffect, useMemo, useState } from "react";
import { SERVICE_CATALOG, type ServiceCatalogItem, type ServiceDepartment } from "../data/serviceCatalog";

const STORAGE_KEY = "sims_service_catalog_v1";
const UPDATE_EVENT = "sims:service-catalog:updated";

export type EditableServiceCatalogItem = ServiceCatalogItem & {
  isCustom?: boolean;
};

const normalizeBreakup = (value?: string[] | null) =>
  (value ?? []).map((part) => part.trim()).filter(Boolean);

const defaultCostBreakup = (item: ServiceCatalogItem) => {
  if (item.department !== "OT") {
    return [];
  }

  const name = item.name.toLowerCase();
  if (name.includes("package") || name.includes("surgery")) {
    return ["Procedure / Package", "Surgeon Fees", "Anaesthetist Fees", "OT Assistant Charges"];
  }
  if (name.includes("surgeon")) {
    return ["Surgeon Fees"];
  }
  if (name.includes("anesth") || name.includes("anaesth")) {
    return ["Anaesthetist Fees"];
  }
  if (name.includes("assistant")) {
    return ["OT Assistant Charges"];
  }

  return [item.name];
};

const buildSeedCatalog = (): EditableServiceCatalogItem[] =>
  SERVICE_CATALOG.map((item) => ({
    ...item,
    costBreakup: normalizeBreakup(item.costBreakup?.length ? item.costBreakup : defaultCostBreakup(item)),
  }));

const readCatalog = () => {
  if (typeof window === "undefined") {
    return buildSeedCatalog();
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return buildSeedCatalog();
  }

  try {
    const parsed = JSON.parse(raw) as EditableServiceCatalogItem[];
    return parsed.map((item) => ({
      ...item,
      costBreakup: normalizeBreakup(item.costBreakup),
    }));
  } catch {
    return buildSeedCatalog();
  }
};

const persistCatalog = (items: EditableServiceCatalogItem[]) => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent(UPDATE_EVENT));
};

const createCatalogId = (department: ServiceDepartment) =>
  `${department.toLowerCase()}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

export const useServiceCatalog = () => {
  const [catalog, setCatalog] = useState<EditableServiceCatalogItem[]>(() => readCatalog());

  useEffect(() => {
    const sync = () => setCatalog(readCatalog());
    window.addEventListener("storage", sync);
    window.addEventListener(UPDATE_EVENT, sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener(UPDATE_EVENT, sync);
    };
  }, []);

  const upsertItem = (input: Omit<EditableServiceCatalogItem, "id"> & { id?: string }) => {
    const nextItem: EditableServiceCatalogItem = {
      ...input,
      id: input.id || createCatalogId(input.department),
      costBreakup: normalizeBreakup(input.costBreakup),
      isCustom: input.isCustom ?? !input.id,
    };

    setCatalog((prev) => {
      const next = prev.some((item) => item.id === nextItem.id)
        ? prev.map((item) => (item.id === nextItem.id ? nextItem : item))
        : [...prev, nextItem];
      persistCatalog(next);
      return next;
    });
  };

  const catalogByDepartment = useMemo(
    () =>
      (department: ServiceDepartment) =>
        catalog.filter((item) => item.department === department),
    [catalog],
  );

  return {
    catalog,
    catalogByDepartment,
    upsertItem,
  };
};
