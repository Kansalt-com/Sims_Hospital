import { Suspense, lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AppLayout } from "./components/layout/AppLayout";
import { Loader } from "./components/ui/Loader";

const AdminSettingsPage = lazy(() => import("./pages/admin/AdminSettingsPage").then((module) => ({ default: module.AdminSettingsPage })));
const AdminUsersPage = lazy(() => import("./pages/admin/AdminUsersPage").then((module) => ({ default: module.AdminUsersPage })));
const ChangePasswordPage = lazy(() => import("./pages/ChangePasswordPage").then((module) => ({ default: module.ChangePasswordPage })));
const DashboardPage = lazy(() => import("./pages/DashboardPage").then((module) => ({ default: module.DashboardPage })));
const LoginPage = lazy(() => import("./pages/LoginPage").then((module) => ({ default: module.LoginPage })));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage").then((module) => ({ default: module.NotFoundPage })));
const DoctorPortalPage = lazy(() => import("./pages/doctor/DoctorPortalPage").then((module) => ({ default: module.DoctorPortalPage })));
const DoctorsPage = lazy(() => import("./pages/doctors/DoctorsPage").then((module) => ({ default: module.DoctorsPage })));
const IpdPage = lazy(() => import("./pages/ipd/IpdPage").then((module) => ({ default: module.IpdPage })));
const InvoicePrintPage = lazy(() => import("./pages/invoices/InvoicePrintPage").then((module) => ({ default: module.InvoicePrintPage })));
const InvoicesPage = lazy(() => import("./pages/invoices/InvoicesPage").then((module) => ({ default: module.InvoicesPage })));
const LabsPage = lazy(() => import("./pages/labs/LabsPage").then((module) => ({ default: module.LabsPage })));
const OtPage = lazy(() => import("./pages/ot/OtPage").then((module) => ({ default: module.OtPage })));
const PatientProfilePage = lazy(() => import("./pages/patients/PatientProfilePage").then((module) => ({ default: module.PatientProfilePage })));
const PatientsPage = lazy(() => import("./pages/patients/PatientsPage").then((module) => ({ default: module.PatientsPage })));
const PrescriptionPage = lazy(() => import("./pages/prescriptions/PrescriptionPage").then((module) => ({ default: module.PrescriptionPage })));
const PrescriptionPrintPage = lazy(() => import("./pages/prescriptions/PrescriptionPrintPage").then((module) => ({ default: module.PrescriptionPrintPage })));
const ReportsPage = lazy(() => import("./pages/reports/ReportsPage").then((module) => ({ default: module.ReportsPage })));
const VisitsPage = lazy(() => import("./pages/visits/VisitsPage").then((module) => ({ default: module.VisitsPage })));

export const App = () => {
  return (
    <Suspense fallback={<div className="p-6"><Loader text="Loading..." /></div>}>
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
    </Suspense>
  );
};
