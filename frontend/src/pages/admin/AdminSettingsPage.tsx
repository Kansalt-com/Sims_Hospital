import { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { getErrorMessage } from "../../api/client";
import { settingsApi } from "../../api/services";
import { Button } from "../../components/ui/Button";
import { BrandLogo } from "../../components/ui/BrandLogo";
import { Card } from "../../components/ui/Card";
import { FormSection } from "../../components/ui/FormSection";
import { Input } from "../../components/ui/Input";
import { Loader } from "../../components/ui/Loader";
import { Textarea } from "../../components/ui/Textarea";
import { useBranding } from "../../context/BrandingContext";
import type { HospitalSettings } from "../../types";
import { buildAssetUrl, formatAcceptedImageTypes, getBrandingVersion, isValidImageFile } from "../../utils/branding";

const MAX_LOGO_SIZE_BYTES = 3 * 1024 * 1024;

const emptyErrors = {
  hospitalName: "",
  address: "",
  phone: "",
  defaultConsultationFee: "",
  invoicePrefix: "",
  invoiceSequence: "",
};

export const AdminSettingsPage = () => {
  const { updateBranding } = useBranding();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [settings, setSettings] = useState<HospitalSettings | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState(emptyErrors);
  const [form, setForm] = useState({
    hospitalName: "",
    address: "",
    phone: "",
    gstin: "",
    defaultConsultationFee: "500",
    invoicePrefix: "SIMS",
    invoiceSequence: "1",
    footerNote: "",
  });
  const logoInputRef = useRef<HTMLInputElement | null>(null);

  const applySettings = (data: HospitalSettings) => {
    setSettings(data);
    setForm({
      hospitalName: data.hospitalName,
      address: data.address,
      phone: data.phone,
      gstin: data.gstin || "",
      defaultConsultationFee: String(data.defaultConsultationFee),
      invoicePrefix: data.invoicePrefix,
      invoiceSequence: String(data.invoiceSequence || 1),
      footerNote: data.footerNote || "",
    });
    setLogoPreview(buildAssetUrl(data.logoPath, data.updatedAt ?? Date.now()));
  };

  const broadcastBranding = (data: HospitalSettings) => {
    updateBranding(data);
    window.dispatchEvent(new CustomEvent("branding:updated", { detail: data }));
  };

  const load = async () => {
    setLoading(true);
    try {
      const res = await settingsApi.get();
      applySettings(res.data.data);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const validateForm = () => {
    const nextErrors = { ...emptyErrors };

    if (!form.hospitalName.trim()) nextErrors.hospitalName = "Hospital name is required";
    if (!form.address.trim()) nextErrors.address = "Address is required";
    if (!form.phone.trim()) nextErrors.phone = "Phone number is required";
    if (!/^\d+(\.\d+)?$/.test(form.defaultConsultationFee)) nextErrors.defaultConsultationFee = "Enter a valid consultation fee";
    if (!form.invoicePrefix.trim()) nextErrors.invoicePrefix = "Invoice prefix is required";
    if (!/^\d+$/.test(form.invoiceSequence) || Number(form.invoiceSequence) < 1) nextErrors.invoiceSequence = "Sequence must be 1 or higher";

    setErrors(nextErrors);
    return !Object.values(nextErrors).some(Boolean);
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validateForm() || saving) {
      return;
    }

    setSaving(true);
    try {
      const res = await settingsApi.update({
        hospitalName: form.hospitalName.trim(),
        address: form.address.trim(),
        phone: form.phone.trim(),
        gstin: form.gstin.trim() || null,
        defaultConsultationFee: Number(form.defaultConsultationFee),
        invoicePrefix: form.invoicePrefix.trim().toUpperCase(),
        invoiceSequence: Number(form.invoiceSequence || 1),
        footerNote: form.footerNote.trim() || null,
      });
      applySettings(res.data.data);
      broadcastBranding(res.data.data);
      toast.success("Settings updated");
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const validateUpload = (file: File) => {
    if (!isValidImageFile(file)) {
      toast.error(`Unsupported file format. Use ${formatAcceptedImageTypes()}.`);
      return false;
    }
    if (file.size > MAX_LOGO_SIZE_BYTES) {
      toast.error("Image size must be 3 MB or less.");
      return false;
    }
    return true;
  };

  const uploadLogo = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !validateUpload(file)) {
      event.target.value = "";
      return;
    }

    const localPreview = URL.createObjectURL(file);
    setLogoPreview(localPreview);
    setUploading(true);

    try {
      const res = await settingsApi.uploadLogo(file);
      applySettings(res.data.data);
      broadcastBranding(res.data.data);
      toast.success("Hospital logo uploaded");
    } catch (error) {
      toast.error(getErrorMessage(error));
      if (settings) {
        applySettings(settings);
      }
    } finally {
      URL.revokeObjectURL(localPreview);
      setUploading(false);
      event.target.value = "";
    }
  };

  const hospitalLogoStatus = useMemo(
    () => (uploading ? "Uploading hospital logo..." : logoPreview ? "Hospital logo active" : "No hospital logo uploaded"),
    [logoPreview, uploading],
  );

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Hospital Settings</h1>
        <p className="text-sm text-slate-500">Manage organization details, invoice numbering, and the hospital logo used across the application and print layouts.</p>
      </div>

      <Card>
        <form onSubmit={save} className="space-y-5">
          <FormSection title="Hospital Profile" description="These details appear in the application header and printed hospital documents.">
            <div className="grid gap-4 md:grid-cols-2">
              <Input label="Hospital Name" placeholder="Enter hospital legal name" value={form.hospitalName} onChange={(e) => setForm((prev) => ({ ...prev, hospitalName: e.target.value }))} error={errors.hospitalName} required />
              <Input label="Phone Number" placeholder="Enter primary contact number" value={form.phone} onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))} error={errors.phone} required />
              <Input label="Hospital Address" placeholder="Enter complete hospital address" value={form.address} onChange={(e) => setForm((prev) => ({ ...prev, address: e.target.value }))} error={errors.address} required />
              <Input label="GSTIN" placeholder="Enter GSTIN if applicable" value={form.gstin} onChange={(e) => setForm((prev) => ({ ...prev, gstin: e.target.value }))} />
            </div>
          </FormSection>

          <FormSection title="Billing Defaults" description="Control default consultation pricing and invoice numbering used by reception and billing staff.">
            <div className="grid gap-4 md:grid-cols-3">
              <Input label="Default Consultation Fee" type="number" min={0} prefix="Rs" placeholder="e.g. 500" value={form.defaultConsultationFee} onChange={(e) => setForm((prev) => ({ ...prev, defaultConsultationFee: e.target.value }))} error={errors.defaultConsultationFee} />
              <Input label="Invoice Prefix" placeholder="e.g. SIMS" value={form.invoicePrefix} onChange={(e) => setForm((prev) => ({ ...prev, invoicePrefix: e.target.value.toUpperCase() }))} error={errors.invoicePrefix} required />
              <Input label="Next Invoice Sequence" type="number" min={1} placeholder="e.g. 1" value={form.invoiceSequence} onChange={(e) => setForm((prev) => ({ ...prev, invoiceSequence: e.target.value }))} error={errors.invoiceSequence} />
            </div>
          </FormSection>

          <FormSection title="Print Footer" description="Shown in invoice and print layouts when a footer note is needed.">
            <Textarea label="Footer Note" placeholder="Enter a short message for printed documents" value={form.footerNote} onChange={(e) => setForm((prev) => ({ ...prev, footerNote: e.target.value }))} />
          </FormSection>

          <div className="flex flex-wrap gap-3">
            <Button type="submit" disabled={saving}>{saving ? "Saving Settings..." : "Save Settings"}</Button>
          </div>
        </form>
      </Card>

      <Card>
        <div className="mb-5">
          <h2 className="text-lg font-semibold">Brand Assets</h2>
          <p className="mt-1 text-sm text-slate-500">Accepted formats: {formatAcceptedImageTypes()}. Maximum file size: 3 MB.</p>
        </div>

        <div className="grid gap-5">
          <FormSection title="Hospital Logo" description="Used in the app header, invoices, and prescription print layouts.">
            <div className="flex flex-col gap-4">
              <div className="flex h-40 items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white">
                {logoPreview ? (
                  <img src={logoPreview} alt="Hospital logo preview" className="max-h-28 max-w-full object-contain" />
                ) : (
                  <div className="text-center text-sm text-slate-500">
                    <BrandLogo
                      logoPath={settings?.logoPath}
                      version={getBrandingVersion(settings?.updatedAt, settings?.logoPath)}
                      hospitalName={settings?.hospitalName}
                      alt="Hospital logo preview"
                      className="mx-auto mb-2 h-14 w-14 rounded-2xl bg-brand-50"
                      fallbackClassName="text-brand-700"
                    />
                    <p className="font-medium text-slate-700">No hospital logo uploaded</p>
                    <p>A fallback text header will be shown.</p>
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-3">
                <input ref={logoInputRef} type="file" accept=".png,.jpg,.jpeg,.svg,image/png,image/jpeg,image/svg+xml" className="hidden" onChange={uploadLogo} />
                <Button variant="secondary" onClick={() => logoInputRef.current?.click()} disabled={uploading}>
                  {uploading ? "Uploading..." : "Upload Hospital Logo"}
                </Button>
              </div>
              <p className="text-xs text-slate-500">{hospitalLogoStatus}</p>
            </div>
          </FormSection>
        </div>
      </Card>
    </div>
  );
};
