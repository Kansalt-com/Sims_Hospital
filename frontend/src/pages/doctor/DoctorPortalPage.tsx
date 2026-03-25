import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { getErrorMessage } from "../../api/client";
import { visitApi } from "../../api/services";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { EmptyState } from "../../components/ui/EmptyState";
import { Input } from "../../components/ui/Input";
import { Loader } from "../../components/ui/Loader";
import { Textarea } from "../../components/ui/Textarea";
import { formatDate, formatDateTime } from "../../utils/format";

type PrescriptionItem = {
  medicine: string;
  dosage: string;
  frequency: string;
  durationDays: string;
  instruction: string;
};

const emptyPrescription = (): PrescriptionItem => ({
  medicine: "",
  dosage: "",
  frequency: "",
  durationDays: "5",
  instruction: "",
});

export const DoctorPortalPage = () => {
  const [queue, setQueue] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [detail, setDetail] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [note, setNote] = useState("");
  const [prescription, setPrescription] = useState<PrescriptionItem[]>([emptyPrescription()]);

  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const loadQueue = async () => {
    setLoading(true);
    try {
      const res = await visitApi.list({ date: today, page: 1, pageSize: 30 });
      setQueue(res.data.data);
      if (!selectedId && res.data.data.length > 0) {
        setSelectedId(res.data.data[0].id);
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const loadVisit = async (visitId: number) => {
    setDetailLoading(true);
    try {
      const res = await visitApi.get(visitId);
      const visit = res.data.data;
      setDetail(visit);
      const items = (() => {
        if (!visit.prescription?.itemsJson) return [emptyPrescription()];
        try {
          return (JSON.parse(visit.prescription.itemsJson) as any[]).map((item) => ({
            medicine: item.medicine ?? "",
            dosage: item.dosage ?? "",
            frequency: item.frequency ?? "",
            durationDays: String(item.durationDays ?? "5"),
            instruction: item.instruction ?? "",
          }));
        } catch {
          return [emptyPrescription()];
        }
      })();
      setPrescription(items.length ? items : [emptyPrescription()]);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setDetailLoading(false);
    }
  };

  useEffect(() => {
    loadQueue();
  }, []);

  useEffect(() => {
    if (selectedId) {
      loadVisit(selectedId);
    }
  }, [selectedId]);

  const submitNote = async () => {
    if (!selectedId || !note.trim()) return;
    try {
      await visitApi.addNote(selectedId, note.trim());
      setNote("");
      toast.success("Note saved");
      await loadVisit(selectedId);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const submitPrescription = async () => {
    if (!selectedId) return;
    const items = prescription
      .filter((item) => item.medicine && item.dosage && item.frequency)
      .map((item) => ({
        medicine: item.medicine,
        dosage: item.dosage,
        frequency: item.frequency,
        durationDays: Number(item.durationDays || 1),
        instruction: item.instruction,
      }));

    if (items.length === 0) {
      toast.error("Add at least one valid medicine");
      return;
    }

    try {
      await visitApi.savePrescription(selectedId, { items });
      toast.success("Prescription updated");
      await loadVisit(selectedId);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const markCompleted = async () => {
    if (!selectedId) return;
    try {
      await visitApi.updateStatus(selectedId, "COMPLETED");
      toast.success("Visit marked completed");
      await Promise.all([loadQueue(), loadVisit(selectedId)]);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">Doctor Portal</h1>
        <p className="text-sm text-slate-500">Today’s appointments, notes, diagnosis and prescriptions.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        <Card className="h-fit">
          <h2 className="mb-3 text-lg font-semibold">Today Queue</h2>
          {loading ? (
            <Loader />
          ) : queue.length === 0 ? (
            <EmptyState text="No appointments for today." />
          ) : (
            <div className="space-y-2">
              {queue.map((visit) => (
                <button
                  key={visit.id}
                  className={`w-full rounded-lg border p-3 text-left transition-all ${selectedId === visit.id ? "border-brand-500 bg-brand-50" : "border-slate-200 hover:bg-slate-50"}`}
                  onClick={() => setSelectedId(visit.id)}
                >
                  <p className="font-medium">{visit.patient.name}</p>
                  <p className="text-xs text-slate-500">{formatDate(visit.scheduledAt)}</p>
                  <div className="mt-2">
                    <Badge tone={visit.status === "COMPLETED" ? "success" : visit.status === "IN_PROGRESS" ? "warning" : "default"}>
                      {visit.status}
                    </Badge>
                  </div>
                </button>
              ))}
            </div>
          )}
        </Card>

        <Card>
          {detailLoading ? (
            <Loader text="Loading chart..." />
          ) : !detail ? (
            <EmptyState text="Select an appointment." />
          ) : (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold">{detail.patient.name}</h2>
                  <p className="text-sm text-slate-500">
                    {detail.patient.gender}, Age {detail.patient.age || "-"} • {detail.patient.phone}
                  </p>
                </div>
                <Button onClick={markCompleted} disabled={detail.status === "COMPLETED"}>Mark Completed</Button>
              </div>

              <div className="grid gap-3 rounded-lg border border-slate-200 p-4 md:grid-cols-3">
                <div>
                  <p className="text-xs uppercase text-slate-500">Visit ID</p>
                  <p className="text-sm font-medium">#{detail.id}</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-slate-500">Reason</p>
                  <p className="text-sm font-medium">{detail.reason || "-"}</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-slate-500">Status</p>
                  <p className="text-sm font-medium">{detail.status}</p>
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <div className="space-y-3 rounded-lg border border-slate-200 p-4">
                  <h3 className="font-semibold">Clinical Notes</h3>
                  <Textarea placeholder="Add examination notes, diagnosis, plan" value={note} onChange={(e) => setNote(e.target.value)} />
                  <Button onClick={submitNote}>Save Note</Button>

                  <div className="space-y-2">
                    {(detail.notes || []).map((entry: any) => (
                      <div key={entry.id} className="rounded bg-slate-50 p-2 text-sm">
                        <p>{entry.text}</p>
                        <p className="mt-1 text-xs text-slate-500">{formatDateTime(entry.createdAt)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3 rounded-lg border border-slate-200 p-4">
                  <h3 className="font-semibold">Prescription</h3>
                  <div className="space-y-3">
                    {prescription.map((item, index) => (
                      <div key={index} className="grid gap-2 rounded-lg border border-slate-100 p-3">
                        <Input
                          label="Medicine"
                          value={item.medicine}
                          onChange={(e) =>
                            setPrescription((prev) =>
                              prev.map((row, idx) => (idx === index ? { ...row, medicine: e.target.value } : row)),
                            )
                          }
                        />
                        <div className="grid gap-2 md:grid-cols-3">
                          <Input
                            label="Dosage"
                            value={item.dosage}
                            onChange={(e) =>
                              setPrescription((prev) =>
                                prev.map((row, idx) => (idx === index ? { ...row, dosage: e.target.value } : row)),
                              )
                            }
                          />
                          <Input
                            label="Frequency"
                            value={item.frequency}
                            onChange={(e) =>
                              setPrescription((prev) =>
                                prev.map((row, idx) => (idx === index ? { ...row, frequency: e.target.value } : row)),
                              )
                            }
                          />
                          <Input
                            label="Days"
                            type="number"
                            min={1}
                            value={item.durationDays}
                            onChange={(e) =>
                              setPrescription((prev) =>
                                prev.map((row, idx) => (idx === index ? { ...row, durationDays: e.target.value } : row)),
                              )
                            }
                          />
                        </div>
                        <Input
                          label="Instruction"
                          value={item.instruction}
                          onChange={(e) =>
                            setPrescription((prev) =>
                              prev.map((row, idx) => (idx === index ? { ...row, instruction: e.target.value } : row)),
                            )
                          }
                        />
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button variant="secondary" onClick={() => setPrescription((prev) => [...prev, emptyPrescription()])}>
                      + Add Medicine
                    </Button>
                    <Button onClick={submitPrescription}>Save Prescription</Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
