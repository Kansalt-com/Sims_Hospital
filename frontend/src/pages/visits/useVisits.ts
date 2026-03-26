import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { getErrorMessage } from "../../api/client";
import { doctorApi, patientApi, roomApi, visitApi } from "../../api/services";
import type { Bed, Room } from "../../types";
import type { DoctorOption, PatientOption, TransferFormState, VisitFormState, VisitQueueItem } from "./visitTypes";

const getAvailableBeds = (room?: Room | null) =>
  (room?.beds ?? []).filter((bed) => bed.status === "AVAILABLE" || bed.status === "RESERVED");

const initialVisitForm: VisitFormState = {
  visitPurpose: "CONSULTATION",
  patientId: "",
  doctorId: "",
  selectedCatalogItemId: "",
  consultationFee: "500",
  reason: "",
  scheduledAt: "",
  newName: "",
  newAge: "",
  newGender: "MALE",
  newPhone: "",
  newAddress: "",
  newIdProof: "",
};

export const useVisits = () => {
  const [rows, setRows] = useState<VisitQueueItem[]>([]);
  const [doctors, setDoctors] = useState<DoctorOption[]>([]);
  const [patients, setPatients] = useState<PatientOption[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pageError, setPageError] = useState("");
  const [query, setQuery] = useState("");
  const [patientMode, setPatientMode] = useState<"existing" | "new">("existing");
  const [transferVisitId, setTransferVisitId] = useState<number | null>(null);
  const [transferForm, setTransferForm] = useState<TransferFormState>({
    attendingDoctorId: "",
    roomId: "",
    bedId: "",
    ward: "General",
    room: "101",
    bed: "A",
    diagnosis: "",
    reason: "",
    notes: "",
  });
  const [form, setForm] = useState<VisitFormState>(initialVisitForm);

  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const selectedTransferRoom = useMemo(
    () => rooms.find((room) => String(room.id) === transferForm.roomId),
    [rooms, transferForm.roomId],
  );
  const availableBeds = useMemo(() => getAvailableBeds(selectedTransferRoom), [selectedTransferRoom]);

  const load = async (search = query) => {
    setLoading(true);
    setPageError("");
    try {
      const [visitsRes, doctorsRes, patientsRes, roomsRes] = await Promise.all([
        visitApi.list({ date: today, q: search, type: "OPD", page: 1, pageSize: 50 }),
        doctorApi.list({ active: true }),
        patientApi.list({ page: 1, pageSize: 200, q: "" }),
        roomApi.list(),
      ]);

      setRows(visitsRes.data.data);
      setDoctors(doctorsRes.data.data);
      setPatients(patientsRes.data.data);
      setRooms(roomsRes.data.data);
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
    const selectedBed = availableBeds.find((bed) => String(bed.id) === transferForm.bedId);
    if (!selectedTransferRoom) return;
    setTransferForm((prev) => ({
      ...prev,
      ward: selectedTransferRoom.ward,
      room: selectedTransferRoom.name,
      bed: selectedBed?.bedNumber ?? prev.bed,
    }));
  }, [selectedTransferRoom, transferForm.bedId, availableBeds]);

  const createVisit = async () => {
    setSaving(true);
    try {
      const payload = {
        doctorId: Number(form.doctorId || doctors[0]?.id || 0),
        consultationFee: form.visitPurpose === "LAB_ONLY" ? 0 : Number(form.consultationFee || 0),
        reason:
          form.visitPurpose === "LAB_ONLY"
            ? `LAB_ONLY::${form.selectedCatalogItemId || "manual"}::${form.reason || "Lab billing only"}`
            : form.reason,
        type: "OPD" as const,
        scheduledAt: form.scheduledAt ? new Date(form.scheduledAt).toISOString() : undefined,
        ...(patientMode === "existing"
          ? { patientId: Number(form.patientId) }
          : {
              patient: {
                name: form.newName,
                age: form.newAge ? Number(form.newAge) : undefined,
                gender: form.newGender,
                phone: form.newPhone,
                address: form.newAddress,
                idProof: form.newIdProof || undefined,
              },
            }),
      };

      await visitApi.create(payload);
      toast.success("OPD visit created");
      setForm((prev) => ({
        ...prev,
        visitPurpose: "CONSULTATION",
        doctorId: "",
        selectedCatalogItemId: "",
        consultationFee: "500",
        reason: "",
        scheduledAt: "",
        patientId: "",
        newName: "",
        newAge: "",
        newPhone: "",
        newAddress: "",
        newIdProof: "",
      }));
      await load();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const changeStatus = async (visitId: number, status: string) => {
    try {
      await visitApi.updateStatus(visitId, status);
      toast.success("Status updated");
      await load();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const openTransfer = (visit: VisitQueueItem) => {
    const defaultRoom = rooms[0];
    const defaultBed = getAvailableBeds(defaultRoom)[0];
    setTransferVisitId(visit.id);
    setTransferForm({
      attendingDoctorId: String(visit.doctorId),
      roomId: defaultRoom ? String(defaultRoom.id) : "",
      bedId: defaultBed ? String(defaultBed.id) : "",
      ward: defaultRoom?.ward ?? "General",
      room: defaultRoom?.name ?? "101",
      bed: defaultBed?.bedNumber ?? "A",
      diagnosis: visit.reason || "",
      reason: visit.reason || "",
      notes: "",
    });
  };

  const transferToIpd = async () => {
    if (!transferVisitId) return;
    try {
      const selectedBed = availableBeds.find((bed: Bed) => String(bed.id) === transferForm.bedId);
      await visitApi.transferToIpd(transferVisitId, {
        attendingDoctorId: transferForm.attendingDoctorId ? Number(transferForm.attendingDoctorId) : undefined,
        roomId: transferForm.roomId ? Number(transferForm.roomId) : undefined,
        bedId: transferForm.bedId ? Number(transferForm.bedId) : undefined,
        ward: transferForm.ward,
        room: transferForm.room,
        bed: selectedBed?.bedNumber ?? transferForm.bed,
        diagnosis: transferForm.diagnosis || undefined,
        reason: transferForm.reason || undefined,
        notes: transferForm.notes || undefined,
      });
      toast.success("Patient admitted to IPD");
      setTransferVisitId(null);
      await load();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return {
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
    closeTransfer: () => setTransferVisitId(null),
  };
};
