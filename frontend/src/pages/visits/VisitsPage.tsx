import { useNavigate } from "react-router-dom";
import { useServiceCatalog } from "../../hooks/useServiceCatalog";
import { IPDTransferPanel } from "./IPDTransferPanel";
import { VisitQueueTable } from "./VisitQueueTable";
import { VisitRegistrationForm } from "./VisitRegistrationForm";
import { useVisits } from "./useVisits";

export const VisitsPage = () => {
  const navigate = useNavigate();
  const { catalog } = useServiceCatalog();
  const {
    rows,
    doctors,
    patients,
    rooms,
    loading,
    saving,
    pageError,
    query,
    setQuery,
    patientMode,
    setPatientMode,
    transferVisitId,
    transferForm,
    setTransferForm,
    form,
    setForm,
    availableBeds,
    load,
    createVisit,
    openTransfer,
    transferToIpd,
    closeTransfer,
  } = useVisits();

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">OPD Workflow</h1>
        <p className="text-sm text-slate-500">Register OPD patients for consultation or labs, collect billing, print prescriptions, and admit to IPD using bed-aware allocation.</p>
      </div>

      <VisitRegistrationForm
        patientMode={patientMode}
        doctors={doctors}
        patients={patients}
        form={form}
        saving={saving}
        onPatientModeChange={setPatientMode}
        onFormChange={setForm}
        onSubmit={async (event) => {
          event.preventDefault();
          const created = await createVisit();
          if (created?.invoiceId) {
            navigate(`/invoices/${created.invoiceId}/print`, {
              state: { backTo: "/visits", source: "lab-visit-created" },
            });
          } else if (created?.visit) {
            navigate(`/invoices?visitId=${created.visit.id}`, {
              state: { backTo: "/visits", source: "opd-visit-created" },
            });
          }
        }}
      />

      <VisitQueueTable
        rows={rows}
        loading={loading}
        query={query}
        pageError={pageError}
        onQueryChange={setQuery}
        onSearch={() => load(query)}
        onReset={() => {
          setQuery("");
          load("");
        }}
        onRetry={() => load(query)}
        onCreateBill={(visit) =>
          {
            const labOnlyMatch = visit.reason?.match(/^LAB_ONLY::([^:]+)::(.*)$/);
            const selectedItemId = labOnlyMatch?.[1];
            const selectedItem = catalog.find((item) => item.id === selectedItemId);
            const department =
              selectedItem?.department === "XRAY" || selectedItem?.department === "ULTRASOUND"
                ? selectedItem.department
                : "LAB";

            navigate(
              `/invoices?visitId=${visit.id}${visit.consultationFee <= 0 ? `&department=${department}${selectedItemId ? `&catalogItemId=${selectedItemId}` : ""}` : ""}`,
              {
                state: { backTo: "/visits" },
              },
            );
          }
        }
        onPrintBill={(invoiceId) => navigate(`/invoices/${invoiceId}/print`, { state: { backTo: "/visits" } })}
        onPrescription={(visitId) => navigate(`/prescriptions/${visitId}/print`, { state: { backTo: "/visits" } })}
        onAdmitToIpd={openTransfer}
      />

      <IPDTransferPanel
        transferVisitId={transferVisitId}
        transferForm={transferForm}
        doctors={doctors}
        rooms={rooms}
        availableBeds={availableBeds}
        onChange={setTransferForm}
        onSubmit={transferToIpd}
        onCancel={closeTransfer}
      />
    </div>
  );
};
