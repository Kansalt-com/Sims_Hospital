import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { getErrorMessage } from "../../api/client";
import { invoiceApi, visitApi } from "../../api/services";
import type { ServiceCatalogItem, ServiceDepartment } from "../../data/serviceCatalog";
import { useServiceCatalog } from "../../hooks/useServiceCatalog";
import type {
  BillingErrors,
  CancelledInvoiceLog,
  CatalogSelection,
  DraftBillingItem,
  ExistingInvoiceSummary,
  InvoiceListItem,
  PaymentFormState,
  VisitOption,
} from "./invoiceTypes";

const isNumeric = (value: string) => value === "" || /^\d*\.?\d*$/.test(value);

const emptyErrors: BillingErrors = {
  visitId: "",
  items: "",
  paymentAmount: "",
};

const createDraftItem = (input?: Partial<DraftBillingItem>): DraftBillingItem => ({
  id: input?.id ?? `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  name: input?.name ?? "",
  category: input?.category ?? "PROCEDURE",
  invoiceType: input?.invoiceType ?? "GENERAL",
  qty: input?.qty ?? "1",
  unitPrice: input?.unitPrice ?? "0",
  source: input?.source,
  department: input?.department,
  editablePrice: input?.editablePrice ?? true,
});

const sumDraftItems = (items: DraftBillingItem[]) =>
  items.reduce((sum, item) => sum + Number(item.qty || 0) * Number(item.unitPrice || 0), 0);

const mapDraftItemsToPayload = (items: DraftBillingItem[]) =>
  items
    .map((item) => ({
      category: item.category === "RADIOLOGY" ? "LAB" : item.category,
      name: item.name.trim(),
      qty: Number(item.qty || 0),
      unitPrice: Number(item.unitPrice || 0),
    }))
    .filter((item) => item.name && item.qty > 0 && item.unitPrice >= 0);

export const blankPayment = (): PaymentFormState => ({
  paymentMode: "CASH",
  amount: "0",
  referenceNo: "",
});

export const useInvoices = (
  presetVisitId = "",
  presetDepartment?: ServiceDepartment | null,
  presetCatalogItemId?: string | null,
) => {
  const { catalog } = useServiceCatalog();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [paymentSaving, setPaymentSaving] = useState<number | null>(null);
  const [pageError, setPageError] = useState("");
  const [query, setQuery] = useState("");
  const [invoices, setInvoices] = useState<InvoiceListItem[]>([]);
  const [cancelledInvoices, setCancelledInvoices] = useState<CancelledInvoiceLog[]>([]);
  const [visits, setVisits] = useState<VisitOption[]>([]);
  const [errors, setErrors] = useState<BillingErrors>(emptyErrors);
  const [visitId, setVisitId] = useState(presetVisitId);
  const [draftItems, setDraftItems] = useState<DraftBillingItem[]>([]);
  const [payment, setPayment] = useState<PaymentFormState>(blankPayment());
  const [notes, setNotes] = useState("");
  const [catalogSelection, setCatalogSelection] = useState<CatalogSelection>({
    department: presetDepartment ?? "LAB",
    itemId: "",
  });
  const [lastCreated, setLastCreated] = useState<{ invoiceId: number; visitId: number; dueAmount: number } | null>(null);
  const [paymentTarget, setPaymentTarget] = useState<InvoiceListItem | null>(null);
  const [paymentDraft, setPaymentDraft] = useState<PaymentFormState>(blankPayment());

  const load = async (search = query, options?: { includeCancelled?: boolean }) => {
    setLoading(true);
    setPageError("");
    try {
      const tasks = [
        invoiceApi.list({ page: 1, pageSize: 200, q: search }),
        visitApi.list({ page: 1, pageSize: 100 }),
      ] as const;

      const includeCancelled = Boolean(options?.includeCancelled);
      const responses = includeCancelled
        ? await Promise.all([...tasks, invoiceApi.listCancelled()] as const)
        : await Promise.all(tasks);

      const [invoiceRes, visitRes] = responses;
      setInvoices(invoiceRes.data.data);
      setVisits(visitRes.data.data);
      setCancelledInvoices(includeCancelled && responses[2] ? responses[2].data.data : []);
    } catch (error) {
      const message = getErrorMessage(error);
      setPageError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (!presetVisitId) {
      return;
    }
    setVisitId(presetVisitId);
  }, [presetVisitId]);

  useEffect(() => {
    if (!presetDepartment) {
      return;
    }

    setCatalogSelection((prev) => ({
      department: presetDepartment,
      itemId: prev.department === presetDepartment ? prev.itemId : "",
    }));
  }, [presetDepartment]);

  useEffect(() => {
    if (!presetCatalogItemId) {
      return;
    }

    setCatalogSelection((prev) => ({
      department: prev.department,
      itemId: presetCatalogItemId,
    }));
  }, [presetCatalogItemId]);

  const selectedVisit = useMemo(
    () => visits.find((visit) => String(visit.id) === visitId) ?? null,
    [visitId, visits],
  );

  const existingInvoice = useMemo<ExistingInvoiceSummary | null>(() => {
    if (!selectedVisit?.invoice) {
      return null;
    }
    return selectedVisit.invoice;
  }, [selectedVisit]);

  const catalogItems = useMemo(
    () => catalog.filter((item) => item.department === catalogSelection.department),
    [catalog, catalogSelection.department],
  );

  useEffect(() => {
    setCatalogSelection((prev) => ({
      ...prev,
      itemId: catalogItems.some((item) => item.id === prev.itemId) ? prev.itemId : catalogItems[0]?.id ?? "",
    }));
  }, [catalogItems]);

  useEffect(() => {
    if (!selectedVisit) {
      return;
    }

    setDraftItems((prev) => {
      if (prev.length > 0) {
        return prev;
      }
      if (selectedVisit.invoice) {
        return [];
      }
      if ((selectedVisit.consultationFee ?? 0) <= 0) {
        return [];
      }
      return [
        createDraftItem({
          name: "Consultation Fee",
          category: "CONSULTATION",
          invoiceType: selectedVisit.type === "IPD" ? "IPD" : "OPD",
          qty: "1",
          unitPrice: String(selectedVisit.consultationFee || 0),
          department: selectedVisit.type === "IPD" ? "IPD" : "OPD",
          editablePrice: true,
          source: "Visit consultation fee",
        }),
      ];
    });
  }, [selectedVisit]);

  useEffect(() => {
    if (!presetCatalogItemId || !selectedVisit || draftItems.length > 0) {
      return;
    }

    const presetItem = catalog.find((item) => item.id === presetCatalogItemId);
    if (!presetItem) {
      return;
    }

    addCatalogItem(presetItem);
  }, [presetCatalogItemId, selectedVisit, draftItems.length, catalog]);

  const totalAmount = useMemo(() => sumDraftItems(draftItems), [draftItems]);

  const resetForm = () => {
    setVisitId("");
    setDraftItems([]);
    setPayment(blankPayment());
    setNotes("");
    setErrors(emptyErrors);
  };

  const validateForm = () => {
    const nextErrors = { ...emptyErrors };
    if (!visitId) {
      nextErrors.visitId = "Select a patient visit before billing.";
    }

    const payloadItems = mapDraftItemsToPayload(draftItems);
    if (payloadItems.length === 0 || totalAmount <= 0) {
      nextErrors.items = "Add at least one charge line greater than zero.";
    }

    if (!isNumeric(payment.amount)) {
      nextErrors.paymentAmount = "Enter a valid payment amount.";
    } else if (Number(payment.amount || 0) > totalAmount) {
      nextErrors.paymentAmount = "Paid amount cannot exceed the charges being added right now.";
    }

    setErrors(nextErrors);
    return !Object.values(nextErrors).some(Boolean);
  };

  const addCatalogItem = (catalogItem: ServiceCatalogItem | null) => {
    if (!catalogItem) {
      return;
    }
    setDraftItems((prev) => [
      ...prev,
      createDraftItem({
        name: catalogItem.name,
        category:
          catalogItem.department === "XRAY" || catalogItem.department === "ULTRASOUND"
            ? "RADIOLOGY"
            : catalogItem.category,
        invoiceType: catalogItem.invoiceType,
        qty: "1",
        unitPrice: String(catalogItem.price),
        source: catalogItem.source,
        department: catalogItem.department,
        editablePrice: catalogItem.editablePrice ?? false,
      }),
    ]);
  };

  const addCustomItem = () => {
    const fallbackInvoiceType = selectedVisit?.type === "IPD" ? "IPD" : "GENERAL";
    setDraftItems((prev) => [
      ...prev,
      createDraftItem({
        name: "",
        category: "PROCEDURE",
        invoiceType: fallbackInvoiceType,
        qty: "1",
        unitPrice: "0",
        editablePrice: true,
      }),
    ]);
  };

  const updateDraftItem = (id: string, patch: Partial<DraftBillingItem>) => {
    setDraftItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  };

  const removeDraftItem = (id: string) => {
    setDraftItems((prev) => prev.filter((item) => item.id !== id));
  };

  const createOrUpdateInvoice = async () => {
    if (saving || !validateForm() || !selectedVisit) {
      return false;
    }

    const items = mapDraftItemsToPayload(draftItems);
    const payments =
      Number(payment.amount || 0) > 0
        ? [
            {
              paymentMode: payment.paymentMode,
              amount: Number(payment.amount),
              referenceNo: payment.referenceNo.trim() || undefined,
            },
          ]
        : undefined;

    setSaving(true);
    try {
      const response = existingInvoice
        ? await invoiceApi.addItems(existingInvoice.id, {
            items,
            payments,
            notes: notes.trim() || undefined,
          })
        : await invoiceApi.create({
            visitId: Number(visitId),
            invoiceType: draftItems.some((item) => item.category === "LAB" || item.category === "RADIOLOGY")
              ? "LAB"
              : selectedVisit.type === "IPD"
                ? "IPD"
                : "OPD",
            items,
            payments,
            notes: notes.trim() || undefined,
          });

      toast.success(existingInvoice ? "Charges added to bill" : "Bill created successfully");
      setLastCreated({
        invoiceId: response.data.data.id,
        visitId: response.data.data.visitId,
        dueAmount: Number(response.data.data.dueAmount || 0),
      });
      setDraftItems([]);
      setPayment(blankPayment());
      setNotes("");
      await load();
      return true;
    } catch (error) {
      toast.error(getErrorMessage(error));
      return false;
    } finally {
      setSaving(false);
    }
  };

  const openPaymentModal = (invoice: InvoiceListItem) => {
    setPaymentTarget(invoice);
    setPaymentDraft(blankPayment());
  };

  const closePaymentModal = () => {
    setPaymentTarget(null);
    setPaymentDraft(blankPayment());
  };

  const savePayment = async () => {
    if (!paymentTarget || Number(paymentDraft.amount) <= 0 || paymentSaving === paymentTarget.id) {
      toast.error("Enter a valid payment amount.");
      return;
    }

    setPaymentSaving(paymentTarget.id);
    try {
      await invoiceApi.addPayments(paymentTarget.id, {
        payments: [
          {
            paymentMode: paymentDraft.paymentMode,
            amount: Number(paymentDraft.amount),
            referenceNo: paymentDraft.referenceNo.trim() || undefined,
          },
        ],
      });
      toast.success("Payment recorded");
      closePaymentModal();
      await load();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setPaymentSaving(null);
    }
  };

  const cancelInvoice = async (invoice: InvoiceListItem, canViewCancelled = false) => {
    if (!window.confirm(`Cancel bill ${invoice.invoiceNo}? This action is restricted and will be logged.`)) {
      return false;
    }

    try {
      await invoiceApi.cancel(invoice.id);
      toast.success("Bill cancelled successfully");
      await load(query, { includeCancelled: canViewCancelled });
      return true;
    } catch (error) {
      toast.error(getErrorMessage(error));
      return false;
    }
  };

  return {
    loading,
    saving,
    paymentSaving,
    pageError,
    query,
    setQuery,
    invoices,
    cancelledInvoices,
    visits,
    errors,
    visitId,
    setVisitId,
    draftItems,
    addCatalogItem,
    addCustomItem,
    updateDraftItem,
    removeDraftItem,
    payment,
    setPayment,
    notes,
    setNotes,
    catalogSelection,
    setCatalogSelection,
    catalogItems,
    lastCreated,
    selectedVisit,
    existingInvoice,
    totalAmount,
    load,
    createOrUpdateInvoice,
    resetForm,
    paymentTarget,
    paymentDraft,
    setPaymentDraft,
    openPaymentModal,
    closePaymentModal,
    savePayment,
    cancelInvoice,
    isNumeric,
  };
};
