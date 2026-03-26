import { Link, useLocation, useSearchParams } from "react-router-dom";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import type { ServiceDepartment } from "../../data/serviceCatalog";
import { InvoiceBillingForm } from "./InvoiceBillingForm";
import { InvoiceListTable } from "./InvoiceListTable";
import { PaymentModal } from "./PaymentModal";
import { useInvoices } from "./useInvoices";

export const InvoicesPage = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const presetVisitId = searchParams.get("visitId") || "";
  const presetDepartment = (searchParams.get("department") as ServiceDepartment | null) ?? null;
  const backTo = (location.state as { backTo?: string } | null)?.backTo;
  const {
    loading,
    saving,
    paymentSaving,
    pageError,
    query,
    setQuery,
    invoices,
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
    isNumeric,
  } = useInvoices(presetVisitId, presetDepartment);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Billing Desk</h1>
        <p className="text-sm text-slate-500">A simplified hospital billing screen designed for reception and billing staff.</p>
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
          <p className="mt-1 text-sm text-emerald-700">The bill for visit #{lastCreated.visitId} is ready for print and further payment collection.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link to={`/invoices/${lastCreated.invoiceId}/print`} state={{ backTo: backTo || `${location.pathname}${location.search}` }}>
              <Button>Print Invoice</Button>
            </Link>
            {lastCreated.dueAmount <= 0 ? (
              <Link to={`/prescriptions/${lastCreated.visitId}/print`} state={{ backTo: backTo || `${location.pathname}${location.search}` }}>
                <Button variant="secondary">Print Prescription</Button>
              </Link>
            ) : (
              <Badge tone="warning">Prescription enabled after full payment</Badge>
            )}
          </div>
        </Card>
      ) : null}

      <InvoiceListTable
        loading={loading}
        query={query}
        invoices={invoices}
        pageError={pageError}
        onQueryChange={setQuery}
        onSearch={() => load(query)}
        onReset={() => {
          setQuery("");
          load("");
        }}
        onRetry={() => load(query)}
        onCollectPayment={openPaymentModal}
        onAddCharges={(invoice) => {
          setVisitId(String(invoice.visitId));
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
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
