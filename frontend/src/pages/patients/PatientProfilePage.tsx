import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { getErrorMessage } from "../../api/client";
import { patientApi } from "../../api/services";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { EmptyState } from "../../components/ui/EmptyState";
import { Loader } from "../../components/ui/Loader";
import type { Patient, Visit } from "../../types";
import { formatCurrency, formatDateTime } from "../../utils/format";

type PrescriptionRow = {
  id: number;
  visitId: number;
  createdAt: string;
  printedAt?: string | null;
  doctor: {
    name: string;
    doctorProfile?: {
      qualification?: string;
      specialization?: string;
    } | null;
  };
  visit?: { id: number; scheduledAt: string; status: string; type: string } | null;
  invoice?: { id: number; invoiceNo: string; dueAmount: number } | null;
};

type PatientDetails = Patient & {
  visits: Array<
    Visit & {
      notes?: Array<{ id: number; text: string }>;
      prescription?: { itemsJson: string; symptoms?: string | null; diagnosis?: string | null; advice?: string | null } | null;
      invoice?: { id: number; invoiceNo: string; total: number; dueAmount?: number } | null;
      ipdAdmission?: { id: number; ward: string; room: string; bed: string; status: string; admittedAt: string; dischargedAt?: string | null } | null;
    }
  >;
  prescriptions?: PrescriptionRow[];
};

export const PatientProfilePage = () => {
  const params = useParams();
  const patientId = Number(params.id);
  const [loading, setLoading] = useState(true);
  const [patient, setPatient] = useState<PatientDetails | null>(null);
  const [activeTab, setActiveTab] = useState<"visits" | "prescriptions">("visits");

  const load = async () => {
    setLoading(true);
    try {
      const res = await patientApi.get(patientId);
      setPatient(res.data.data as PatientDetails);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (patientId) {
      load();
    }
  }, [patientId]);

  const totalBilled = useMemo(() => {
    if (!patient) return 0;
    return patient.visits.reduce((sum, visit) => sum + (visit.invoice?.total ?? 0), 0);
  }, [patient]);

  if (loading) {
    return <Loader />;
  }

  if (!patient) {
    return <EmptyState text="Patient not found." />;
  }

  const prescriptionRows = patient.prescriptions || [];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{patient.name}</h1>
          <p className="text-sm text-slate-500">MRN: {patient.mrn}</p>
        </div>
        <Link to="/patients">
          <Button variant="secondary">Back</Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <p className="text-xs uppercase text-slate-500">Phone</p>
          <p className="mt-1 font-semibold">{patient.phone}</p>
        </Card>
        <Card>
          <p className="text-xs uppercase text-slate-500">Gender</p>
          <p className="mt-1 font-semibold">{patient.gender}</p>
        </Card>
        <Card>
          <p className="text-xs uppercase text-slate-500">Age</p>
          <p className="mt-1 font-semibold">{patient.age || "-"}</p>
        </Card>
        <Card>
          <p className="text-xs uppercase text-slate-500">Total Billed</p>
          <p className="mt-1 font-semibold">{formatCurrency(totalBilled)}</p>
        </Card>
      </div>

      <Card>
        <h2 className="text-lg font-semibold">Address</h2>
        <p className="mt-2 text-sm text-slate-600">{patient.address}</p>
      </Card>

      <Card>
        <div className="mb-4 flex gap-2">
          <Button variant={activeTab === "visits" ? "primary" : "secondary"} onClick={() => setActiveTab("visits")}>Visit History</Button>
          <Button variant={activeTab === "prescriptions" ? "primary" : "secondary"} onClick={() => setActiveTab("prescriptions")}>Prescriptions</Button>
        </div>

        {activeTab === "visits" ? (
          <>
            <h2 className="mb-4 text-lg font-semibold">Visit History</h2>
            {patient.visits.length === 0 ? (
              <EmptyState text="No visits yet." />
            ) : (
              <div className="space-y-4">
                {patient.visits.map((visit) => {
                  const prescriptionItems = (() => {
                    if (!visit.prescription?.itemsJson) return [];
                    try {
                      return JSON.parse(visit.prescription.itemsJson) as Array<{
                        medicine: string;
                        dosage: string;
                        frequency: string;
                      }>;
                    } catch {
                      return [];
                    }
                  })();

                  return (
                    <div key={visit.id} className="rounded-lg border border-slate-200 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <p className="font-semibold">Visit #{visit.id}</p>
                          <p className="text-sm text-slate-500">{visit.type} � Dr. {visit.doctor.name} � {formatDateTime(visit.scheduledAt)}</p>
                        </div>
                        <div className="flex gap-2">
                          {visit.invoice ? (
                            <Link to={`/invoices/${visit.invoice.id}/print`} state={{ backTo: `/patients/${patient.id}` }}>
                              <Button variant="secondary" className="h-8 px-3 py-1 text-xs">Print Bill</Button>
                            </Link>
                          ) : null}
                          {visit.prescription && visit.invoice && Number(visit.invoice.dueAmount || 0) <= 0 ? (
                            <Link to={`/prescriptions/${visit.id}/print`} state={{ backTo: `/patients/${patient.id}` }}>
                              <Button variant="secondary" className="h-8 px-3 py-1 text-xs">Print Prescription</Button>
                            </Link>
                          ) : null}
                        </div>
                      </div>

                      <div className="mt-3 grid gap-3 md:grid-cols-2">
                        <div>
                          <p className="text-xs uppercase text-slate-500">Status</p>
                          <p className="text-sm">{visit.status}</p>
                        </div>
                        <div>
                          <p className="text-xs uppercase text-slate-500">Consultation Fee</p>
                          <p className="text-sm">{formatCurrency(visit.consultationFee)}</p>
                        </div>
                      </div>

                      {visit.notes && visit.notes.length > 0 ? (
                        <div className="mt-3 rounded-md bg-slate-50 p-3 text-sm">
                          <p className="font-medium text-slate-700">Clinical Notes</p>
                          <ul className="mt-1 list-disc pl-5 text-slate-600">
                            {visit.notes.map((note) => (
                              <li key={note.id}>{note.text}</li>
                            ))}
                          </ul>
                        </div>
                      ) : null}

                      {prescriptionItems.length > 0 ? (
                        <div className="mt-3 rounded-md bg-blue-50 p-3 text-sm">
                          <p className="font-medium text-slate-700">Prescription</p>
                          <ul className="mt-1 list-disc pl-5 text-slate-600">
                            {prescriptionItems.map((item, index) => (
                              <li key={index}>{item.medicine} - {item.dosage}, {item.frequency}</li>
                            ))}
                          </ul>
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        ) : (
          <>
            <h2 className="mb-4 text-lg font-semibold">Prescription Sheets</h2>
            {prescriptionRows.length === 0 ? (
              <EmptyState text="No prescription sheets generated yet." />
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500">
                      <th className="py-2">Date</th>
                      <th className="py-2">Doctor</th>
                      <th className="py-2">Visit</th>
                      <th className="py-2">Printed</th>
                      <th className="py-2">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {prescriptionRows.map((row) => (
                      <tr key={row.id} className="border-b border-slate-100">
                        <td className="py-3">{formatDateTime(row.createdAt)}</td>
                        <td className="py-3">
                          <p className="font-medium">Dr. {row.doctor.name}</p>
                          <p className="text-xs text-slate-500">{row.doctor.doctorProfile?.qualification || ""}</p>
                        </td>
                        <td className="py-3">#{row.visitId}</td>
                        <td className="py-3">{row.printedAt ? formatDateTime(row.printedAt) : "Not yet"}</td>
                        <td className="py-3">
                          <Link to={`/prescriptions/${row.visitId}/print`} state={{ backTo: `/patients/${patient.id}` }}>
                            <Button variant="secondary" className="h-8 px-3 py-1 text-xs">Print</Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
};
