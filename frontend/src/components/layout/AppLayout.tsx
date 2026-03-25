import {
  Activity,
  BedDouble,
  ClipboardPlus,
  CreditCard,
  FileBarChart2,
  FlaskConical,
  LayoutDashboard,
  LogOut,
  Scissors,
  Settings,
  Stethoscope,
  Users,
  UserSquare2,
} from "lucide-react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { HospitalBrand } from "../branding/HospitalBrand";
import { Footer } from "./Footer";
import { useAuth } from "../../context/AuthContext";
import type { Role } from "../../types";

type NavItem = {
  to: string;
  label: string;
  roles: Role[];
  icon: React.ReactNode;
};

const navItems: NavItem[] = [
  { to: "/dashboard", label: "Dashboard", roles: ["ADMIN", "RECEPTION", "DOCTOR", "BILLING", "PHARMACY", "LAB_TECHNICIAN"], icon: <LayoutDashboard size={18} /> },
  { to: "/reports", label: "Reports", roles: ["ADMIN", "RECEPTION", "DOCTOR", "BILLING", "PHARMACY", "LAB_TECHNICIAN"], icon: <FileBarChart2 size={18} /> },
  { to: "/patients", label: "Patients", roles: ["ADMIN", "RECEPTION", "DOCTOR"], icon: <Users size={18} /> },
  { to: "/visits", label: "OPD", roles: ["ADMIN", "RECEPTION"], icon: <Activity size={18} /> },
  { to: "/ipd", label: "IPD", roles: ["ADMIN", "RECEPTION", "DOCTOR"], icon: <BedDouble size={18} /> },
  { to: "/invoices", label: "Billing", roles: ["ADMIN", "RECEPTION", "DOCTOR", "BILLING", "PHARMACY"], icon: <CreditCard size={18} /> },
  { to: "/labs", label: "Labs", roles: ["ADMIN", "RECEPTION", "DOCTOR", "BILLING", "LAB_TECHNICIAN"], icon: <FlaskConical size={18} /> },
  { to: "/ot", label: "OT Module", roles: ["ADMIN", "RECEPTION", "DOCTOR", "BILLING"], icon: <Scissors size={18} /> },
  { to: "/prescriptions", label: "Prescription", roles: ["ADMIN", "RECEPTION", "DOCTOR"], icon: <ClipboardPlus size={18} /> },
  { to: "/doctor", label: "Doctor Portal", roles: ["DOCTOR"], icon: <Stethoscope size={18} /> },
  { to: "/doctors", label: "Doctors", roles: ["ADMIN"], icon: <Stethoscope size={18} /> },
  { to: "/admin/users", label: "Users", roles: ["ADMIN"], icon: <UserSquare2 size={18} /> },
  { to: "/admin/settings", label: "Settings", roles: ["ADMIN"], icon: <Settings size={18} /> },
];

export const AppLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const allowedItems = navItems.filter((item) => item.roles.includes(user!.role));

  return (
    <div className="flex min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.12),_transparent_28%),linear-gradient(180deg,_rgba(248,250,252,0.96),_rgba(241,245,249,0.96))]">
      <aside className="w-72 border-r border-slate-200/80 bg-white/90 p-5 backdrop-blur-xl">
        <nav className="space-y-1">
          {allowedItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                [
                  "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-slate-900 text-white shadow-lg shadow-slate-900/10"
                    : "text-slate-600 hover:bg-slate-100/90 hover:text-slate-900",
                ].join(" ")
              }
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Signed In</p>
          <p className="mt-2 text-sm font-semibold text-slate-900">{user?.name}</p>
          <p className="text-xs font-medium text-slate-500">{user?.role.replace("_", " ")}</p>
          <button
            className="mt-4 inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100"
            onClick={() => {
              logout();
              navigate("/login");
            }}
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <main className="flex min-h-screen flex-1 flex-col">
        <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/80 px-6 py-4 backdrop-blur-xl">
          <HospitalBrand compact />
        </header>

        <section className="flex-1 p-6">
          <Outlet />
        </section>

        <Footer />
      </main>
    </div>
  );
};
