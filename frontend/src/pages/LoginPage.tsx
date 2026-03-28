import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { getErrorMessage } from "../api/client";
import { PoweredByKansalt } from "../components/branding/PoweredByKansalt";
import { BrandLogo } from "../components/ui/BrandLogo";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { useAuth } from "../context/AuthContext";
import { useBranding } from "../context/BrandingContext";
import { buildAssetUrl, getBrandingVersion, getDefaultHospitalLogoPath } from "../utils/branding";

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login, user } = useAuth();
  const { branding } = useBranding();
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("Admin@12345");
  const [loading, setLoading] = useState(false);

  const logoSrc = useMemo(
    () => buildAssetUrl(branding?.logoPath, getBrandingVersion(branding?.updatedAt, branding?.logoPath)) ?? getDefaultHospitalLogoPath(),
    [branding?.logoPath, branding?.updatedAt],
  );

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      await login(username, password);
      toast.success(`Welcome to ${branding?.hospitalName || "SIMS Hospital"}`);
      navigate("/dashboard", { replace: true });
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (logoSrc) {
      let link = document.querySelector("link[rel='icon']") as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement("link");
        link.rel = "icon";
        document.head.appendChild(link);
      }
      link.href = logoSrc;
    }
  }, [logoSrc]);

  useEffect(() => {
    if (user) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, navigate]);

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="hidden bg-gradient-to-b from-brand-700 via-brand-600 to-slateblue p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <BrandLogo
              logoPath={branding?.logoPath}
              version={getBrandingVersion(branding?.updatedAt, branding?.logoPath)}
              hospitalName={branding?.hospitalName}
              alt="Hospital logo"
              className="h-14 w-14 rounded bg-white/10"
              imageClassName="rounded bg-white p-1"
              fallbackClassName="text-lg text-white"
            />
            <h1 className="text-4xl font-bold">{branding?.hospitalName || "SIMS Hospital"}</h1>
          </div>
          <p className="mt-4 max-w-md text-blue-100">
            Unified patient registration, OPD/IPD workflow, doctor prescription, billing, and print-ready documents.
          </p>
        </div>

        <PoweredByKansalt
          className="powered-by-kansalt--hero text-blue-100"
          labelClassName="text-blue-100"
          logoClassName="opacity-95 mix-blend-screen"
        />
      </div>

      <div className="flex items-center justify-center p-6">
        <form onSubmit={onSubmit} className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-panel">
          <div className="mb-4 flex items-center gap-3">
            <BrandLogo
              logoPath={branding?.logoPath}
              version={getBrandingVersion(branding?.updatedAt, branding?.logoPath)}
              hospitalName={branding?.hospitalName}
              alt="Hospital logo"
              className="h-12 w-12 rounded bg-brand-50"
              fallbackClassName="text-brand-700"
            />
            <div>
              <h2 className="text-2xl font-semibold text-slate-800">Sign In</h2>
              <p className="text-sm text-slate-500">Use your hospital credentials</p>
            </div>
          </div>

          <div className="mt-5 space-y-4">
            <Input label="Username" placeholder="Enter username" value={username} onChange={(e) => setUsername(e.target.value)} required />
            <Input label="Password" type="password" placeholder="Enter password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>

          <Button type="submit" className="mt-6 w-full" disabled={loading}>
            {loading ? "Signing in..." : "Login"}
          </Button>

          <div className="mt-6 rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
            <p>Default admin login: admin / Admin@12345</p>
          </div>

          <PoweredByKansalt className="mt-4 justify-center text-xs text-slate-500 lg:hidden" />
        </form>
      </div>
    </div>
  );
};
