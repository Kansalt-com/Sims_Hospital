import { useEffect } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import type { ServiceDepartment } from "../../data/serviceCatalog";
import { InvoiceBillingForm } from "./InvoiceBillingForm";
import { InvoiceListTable } from "./InvoiceListTable";
import { PaymentModal } from "./PaymentModal";
import { useInvoices } from "./useInvoices";

export const InvoicesPage = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const presetVisitId = searchParams.get("visitId") || "";
  const presetDepartment = (searchParams.get("department") as ServiceDepartment | null) ?? null;
  const presetCatalogItemId = searchParams.get("catalogItemId");
  const backTo = (location.state as { backTo?: string } | null)?.backTo;
  const source = (location.state as { source?: string } | null)?.source;
  const {
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
  } = useInvoices(presetVisitId, presetDepartment, presetCatalogItemId);

  const canCancelInvoices = user?.permissions?.includes("billing:cancel") ?? false;

  useEffect(() => {
    load(query, { includeCancelled: canCancelInvoices });
  }, [canCancelInvoices]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Billing Desk</h1>
        <p className="text-sm text-slate-500">A simplified hospital billing screen designed for reception and billing staff.</p>
        {source === "opd-visit-created" && selectedVisit ? (
          <Card className="mt-4 border border-cyan-200 bg-cyan-50/70">
            <h2 className="text-lg font-semibold text-cyan-900">OPD visit created for {selectedVisit.patient.name}</h2>
            <p className="mt-1 text-sm text-cyan-800">
              Continue directly with billing. Once the bill is saved, print the bill first and then print the prescription immediately after it.
            </p>
          </Card>
        ) : null}
        {backTo ? (
          <div className="mt-3">
            <Link to={backTo}>
              <Button variant="secondary">Back</Button>
            </Link>
          </div>
        ) : null}
      </div>

      <InvoiceBillingForm
        visitId={visitId}
        visits={visits}
        selectedVisit={selectedVisit}
        existingInvoice={existingInvoice}
        errors={errors}
        draftItems={draftItems}
        payment={payment}
        notes={notes}
        totalAmount={totalAmount}
        saving={saving}
        lastCreatedInvoiceId={lastCreated?.invoiceId ?? null}
        catalogSelection={catalogSelection}
        catalogItems={catalogItems}
        onVisitChange={setVisitId}
        onCatalogSelectionChange={setCatalogSelection}
        onAddCatalogItem={() => addCatalogItem(catalogItems.find((item) => item.id === catalogSelection.itemId) ?? null)}
        onAddCustomItem={addCustomItem}
        onDraftItemChange={updateDraftItem}
        onRemoveDraftItem={removeDraftItem}
        onPaymentChange={(value) => {
          if (isNumeric(value.amount)) {
            setPayment(value);
          }
        }}
        onNotesChange={setNotes}
        onSubmit={async (event) => {
          event.preventDefault();
          await createOrUpdateInvoice();
        }}
        onReset={resetForm}
      />

      {lastCreated ? (
        <Card className="border border-emerald-200 bg-emerald-50/60">
          <h3 className="text-lg font-semibold text-emerald-800">Billing updated successfully</h3>
          <p className="mt-1 text-sm text-emerald-700">The bill for visit #{lastCreated.visitId} is ready. Print the bill now, then print the prescription right after that.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link to={`/invoices/${lastCreated.invoiceId}/print`} state={{ backTo: backTo || `${location.pathname}${location.search}` }}>
              <Button>Print Invoice</Button>
            </Link>
            <Link to={`/prescriptions/${lastCreated.visitId}/print`} state={{ backTo: backTo || `${location.pathname}${location.search}` }}>
              <Button variant="secondary">Print Prescription</Button>
            </Link>
          </div>
        </Card>
      ) : null}

      <InvoiceListTable
        loading={loading}
        query={query}
        invoices={invoices}
        cancelledInvoices={cancelledInvoices}
        canCancelInvoices={canCancelInvoices}
        pageError={pageError}
        onQueryChange={setQuery}
        onSearch={() => load(query, { includeCancelled: canCancelInvoices })}
        onReset={() => {
          setQuery("");
          load("", { includeCancelled: canCancelInvoices });
        }}
        onRetry={() => load(query, { includeCancelled: canCancelInvoices })}
        onCollectPayment={openPaymentModal}
        onAddCharges={(invoice) => {
          setVisitId(String(invoice.visitId));
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        onCancelInvoice={(invoice) => cancelInvoice(invoice, canCancelInvoices)}
      />

      <PaymentModal
        invoice={paymentTarget}
        payment={paymentDraft}
        saving={paymentSaving === paymentTarget?.id}
        onClose={closePaymentModal}
        onChange={(value) => {
          if (isNumeric(value.amount)) {
            setPaymentDraft(value);
          }
        }}
        onSubmit={savePayment}
      />
    </div>
  );
};
