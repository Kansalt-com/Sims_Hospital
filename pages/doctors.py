from __future__ import annotations

import re
from datetime import date, datetime
from pathlib import Path
from typing import Dict, List

import pandas as pd
import streamlit as st

from components.auth import doctor_display_name
from components.db import (
    append_doctor_note,
    get_patients_for_doctor,
    get_unique_doctors,
    list_report_uploads,
    record_report_upload,
)


BASE_DIR = Path(__file__).resolve().parents[1]
UPLOAD_DIR = BASE_DIR / "assets" / "uploads"


def _sanitize_filename(file_name: str) -> str:
    cleaned = re.sub(r"[^A-Za-z0-9._-]", "_", file_name).strip("._")
    return cleaned or "report.pdf"


def _doctor_from_context(context: Dict[str, str], doctors: List[str]) -> str:
    if context["role"] == "doctor":
        mapped_name = doctor_display_name(context["username"])
        if mapped_name in doctors:
            return mapped_name
    return doctors[0]


def render_doctors_page(context: Dict[str, str]) -> None:
    st.markdown("## Doctor Dashboard")
    st.caption(f"{context['hospital_name']} | Assigned caseload and clinical notes")

    doctors = get_unique_doctors()
    if not doctors:
        st.info("No doctors are available in records.")
        return

    doctor_name = _doctor_from_context(context, doctors)
    if context["role"] != "doctor":
        doctor_name = st.selectbox("Select Doctor", doctors)
    else:
        st.markdown(f"**Doctor:** {doctor_name}")

    assigned_patients = get_patients_for_doctor(doctor_name)
    if not assigned_patients:
        st.warning("No patients currently assigned to this doctor.")
    else:
        table = pd.DataFrame(assigned_patients)[
            [
                "id",
                "name",
                "age",
                "gender",
                "phone",
                "diagnosis",
                "payment_status",
                "appointment_date",
            ]
        ]
        table.columns = [
            "ID",
            "Name",
            "Age",
            "Gender",
            "Phone",
            "Diagnosis",
            "Payment Status",
            "Appointment Date",
        ]
        st.dataframe(table, use_container_width=True, hide_index=True)

        labels = [f"#{patient['id']} - {patient['name']}" for patient in assigned_patients]
        selected_label = st.selectbox("Patient for Notes/Diagnosis Update", labels)
        selected_patient = assigned_patients[labels.index(selected_label)]

        with st.form("doctor_notes_form"):
            updated_diagnosis = st.text_input(
                "Update Diagnosis",
                value=selected_patient["diagnosis"],
            )
            note = st.text_area(
                "Clinical Note",
                placeholder="Add consultation notes, treatment updates, or care observations",
            )
            submit_note = st.form_submit_button("Save Clinical Update", use_container_width=True)

        if submit_note:
            if not note.strip():
                st.error("Clinical note is required.")
            else:
                author = doctor_name if context["role"] == "doctor" else context["username"]
                append_doctor_note(
                    int(selected_patient["id"]),
                    author,
                    updated_diagnosis.strip(),
                    note.strip(),
                )
                st.success("Clinical note and diagnosis updated.")
                st.rerun()

    st.markdown("### Secure File Storage (Demo Only)")
    st.info("Production version uses Azure Blob Secure Storage")

    upload_candidates = assigned_patients if assigned_patients else []
    if not upload_candidates and context["role"] != "doctor":
        all_for_admin = []
        for doctor in doctors:
            all_for_admin.extend(get_patients_for_doctor(doctor))
        upload_candidates = all_for_admin

    if not upload_candidates:
        st.warning("No patients available for report uploads.")
        return

    upload_labels = [f"#{item['id']} - {item['name']}" for item in upload_candidates]
    upload_target_label = st.selectbox("Patient for Report Upload", upload_labels)
    upload_target = upload_candidates[upload_labels.index(upload_target_label)]

    uploaded_file = st.file_uploader("Upload report (PDF)", type=["pdf"])
    if st.button("Upload Report", use_container_width=True):
        if uploaded_file is None:
            st.error("Select a PDF report before uploading.")
        else:
            UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
            safe_name = _sanitize_filename(uploaded_file.name)
            timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
            file_name = f"{timestamp}_{safe_name}"
            target_path = UPLOAD_DIR / file_name
            target_path.write_bytes(uploaded_file.getbuffer())

            relative_path = str(target_path.relative_to(BASE_DIR))
            record_report_upload(
                int(upload_target["id"]),
                context["username"] or "doctor",
                uploaded_file.name,
                relative_path,
            )
            st.success(f"Report uploaded for {upload_target['name']}.")
            st.rerun()

    st.markdown("### Uploaded Reports")
    reports = list_report_uploads(int(upload_target["id"]))
    if not reports:
        st.caption("No reports uploaded for this patient yet.")
        return

    report_table = pd.DataFrame(reports)[
        ["id", "patient_name", "file_name", "doctor_username", "uploaded_at", "file_path"]
    ]
    report_table.columns = [
        "ID",
        "Patient Name",
        "File Name",
        "Uploaded By",
        "Uploaded At",
        "Stored Path",
    ]
    st.dataframe(report_table, use_container_width=True, hide_index=True)
