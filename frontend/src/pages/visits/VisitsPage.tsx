import { useNavigate } from "react-router-dom";
import { IPDTransferPanel } from "./IPDTransferPanel";
import { VisitQueueTable } from "./VisitQueueTable";
import { VisitRegistrationForm } from "./VisitRegistrationForm";
import { useVisits } from "./useVisits";

export const VisitsPage = () => {
  const navigate = useNavigate();
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
    changeStatus,
    openTransfer,
    transferToIpd,
    closeTransfer,
  } = useVisits();

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">OPD Workflow</h1>
        <p className="text-sm text-slate-500">Register patients, collect consultation billing, print prescriptions, and admit to IPD using bed-aware allocation.</p>
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
          await createVisit();
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
        onChangeStatus={changeStatus}
        onCreateBill={(visitId) => navigate(`/invoices?visitId=${visitId}`, { state: { backTo: "/visits" } })}
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
