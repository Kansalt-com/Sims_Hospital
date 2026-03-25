import { Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AppLayout } from "./components/layout/AppLayout";
import { AdminSettingsPage } from "./pages/admin/AdminSettingsPage";
import { AdminUsersPage } from "./pages/admin/AdminUsersPage";
import { ChangePasswordPage } from "./pages/ChangePasswordPage";
import { DashboardPage } from "./pages/DashboardPage";
import { LoginPage } from "./pages/LoginPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { DoctorPortalPage } from "./pages/doctor/DoctorPortalPage";
import { DoctorsPage } from "./pages/doctors/DoctorsPage";
import { IpdPage } from "./pages/ipd/IpdPage";
import { InvoicePrintPage } from "./pages/invoices/InvoicePrintPage";
import { InvoicesPage } from "./pages/invoices/InvoicesPage";
import { LabsPage } from "./pages/labs/LabsPage";
import { OtPage } from "./pages/ot/OtPage";
import { PatientProfilePage } from "./pages/patients/PatientProfilePage";
import { PatientsPage } from "./pages/patients/PatientsPage";
import { PrescriptionPage } from "./pages/prescriptions/PrescriptionPage";
import { PrescriptionPrintPage } from "./pages/prescriptions/PrescriptionPrintPage";
import { ReportsPage } from "./pages/reports/ReportsPage";
import { VisitsPage } from "./pages/visits/VisitsPage";

export const App = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/change-password" element={<ChangePasswordPage />} />
        <Route path="/invoices/:id/print" element={<InvoicePrintPage />} />
        <Route path="/prescriptions/:visitId/print" element={<PrescriptionPrintPage />} />

        <Route element={<AppLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/patients" element={<PatientsPage />} />
          <Route path="/patients/:id" element={<PatientProfilePage />} />
          <Route path="/invoices" element={<InvoicesPage />} />
          <Route path="/labs" element={<LabsPage />} />
          <Route path="/ot" element={<OtPage />} />
          <Route path="/ipd" element={<IpdPage />} />
          <Route path="/prescriptions" element={<PrescriptionPage />} />

          <Route element={<ProtectedRoute roles={["ADMIN", "RECEPTION"]} />}>
            <Route path="/visits" element={<VisitsPage />} />
          </Route>

          <Route element={<ProtectedRoute roles={["DOCTOR"]} />}>
            <Route path="/doctor" element={<DoctorPortalPage />} />
          </Route>

          <Route element={<ProtectedRoute roles={["ADMIN"]} />}>
            <Route path="/doctors" element={<DoctorsPage />} />
            <Route path="/admin/users" element={<AdminUsersPage />} />
            <Route path="/admin/settings" element={<AdminSettingsPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};
