from __future__ import annotations

from datetime import date, datetime
from typing import Dict, List

import pandas as pd
import streamlit as st

from components.db import add_patient, fetch_patients, get_unique_doctors, update_patient


def _doctor_options() -> List[str]:
    doctors = get_unique_doctors()
    if not doctors:
        return ["Dr. Meera Nair", "Dr. Arjun Rao", "Dr. Priya Menon", "Dr. S. Khan"]
    return doctors


def _format_patient_label(patient: Dict[str, str]) -> str:
    return f"#{patient['id']} - {patient['name']} ({patient['doctor_assigned']})"


def render_patients_page(context: Dict[str, str]) -> None:
    st.markdown("## Patient Management")
    st.caption(f"{context['hospital_name']} | Add, edit, and search patient records")

    search_term = st.text_input(
        "Search patients by name, phone, diagnosis, or assigned doctor",
        placeholder="Type to filter records",
    )

    records = fetch_patients(search_term)
    if records:
        table = pd.DataFrame(records)[
            [
                "id",
                "name",
                "age",
                "gender",
                "phone",
                "diagnosis",
                "doctor_assigned",
                "billing_amount",
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
            "Doctor Assigned",
            "Billing Amount",
            "Payment Status",
            "Appointment Date",
        ]
        st.dataframe(table, use_container_width=True, hide_index=True)
    else:
        st.warning("No patients found for the current search criteria.")

    left, right = st.columns(2, gap="large")
    doctors = _doctor_options()

    with left:
        st.markdown("### Add Patient")
        with st.form("add_patient_form", clear_on_submit=True):
            name = st.text_input("Name")
            age = st.number_input("Age", min_value=0, max_value=120, value=30)
            gender = st.selectbox("Gender", ["Male", "Female", "Other"])
            phone = st.text_input("Phone")
            address = st.text_input("Address")
            diagnosis = st.text_input("Diagnosis")
            doctor_assigned = st.selectbox("Doctor Assigned", doctors)
            billing_amount = st.number_input("Billing Amount", min_value=0.0, value=5000.0, step=100.0)
            payment_status = st.selectbox("Payment Status", ["Pending", "Paid", "Partially Paid"])
            appointment_date = st.date_input("Appointment Date", value=date.today())

            add_submit = st.form_submit_button("Add Patient", use_container_width=True)

        if add_submit:
            if not name.strip() or not phone.strip() or not diagnosis.strip():
                st.error("Name, phone, and diagnosis are required.")
            else:
                add_patient(
                    {
                        "name": name.strip(),
                        "age": int(age),
                        "gender": gender,
                        "phone": phone.strip(),
                        "address": address.strip() or "Not Provided",
                        "diagnosis": diagnosis.strip(),
                        "doctor_assigned": doctor_assigned,
                        "billing_amount": float(billing_amount),
                        "payment_status": payment_status,
                        "appointment_date": appointment_date.isoformat(),
                    }
                )
                st.success(f"Patient record created for {name.strip()}.")
                st.rerun()

    with right:
        st.markdown("### Edit Patient")
        all_records = fetch_patients()
        if not all_records:
            st.info("No patients available to edit.")
            return

        option_labels = [_format_patient_label(patient) for patient in all_records]
        selected_label = st.selectbox("Select Patient", option_labels)
        selected_patient = all_records[option_labels.index(selected_label)]

        appointment_value = date.today()
        if selected_patient.get("appointment_date"):
            try:
                appointment_value = datetime.strptime(
                    selected_patient["appointment_date"], "%Y-%m-%d"
                ).date()
            except ValueError:
                appointment_value = date.today()

        with st.form("edit_patient_form", clear_on_submit=False):
            edit_name = st.text_input("Name", value=selected_patient["name"])
            edit_age = st.number_input(
                "Age",
                min_value=0,
                max_value=120,
                value=int(selected_patient["age"]),
            )
            gender_idx = ["Male", "Female", "Other"].index(selected_patient["gender"]) if selected_patient["gender"] in ["Male", "Female", "Other"] else 0
            edit_gender = st.selectbox("Gender", ["Male", "Female", "Other"], index=gender_idx)
            edit_phone = st.text_input("Phone", value=selected_patient["phone"])
            edit_address = st.text_input("Address", value=selected_patient["address"])
            edit_diagnosis = st.text_input("Diagnosis", value=selected_patient["diagnosis"])
            doctor_idx = doctors.index(selected_patient["doctor_assigned"]) if selected_patient["doctor_assigned"] in doctors else 0
            edit_doctor = st.selectbox("Doctor Assigned", doctors, index=doctor_idx)
            edit_billing = st.number_input(
                "Billing Amount",
                min_value=0.0,
                value=float(selected_patient["billing_amount"]),
                step=100.0,
            )
            status_options = ["Pending", "Paid", "Partially Paid"]
            status_idx = status_options.index(selected_patient["payment_status"]) if selected_patient["payment_status"] in status_options else 0
            edit_status = st.selectbox("Payment Status", status_options, index=status_idx)
            edit_appointment = st.date_input("Appointment Date", value=appointment_value)

            edit_submit = st.form_submit_button("Update Patient", use_container_width=True)

        if edit_submit:
            update_patient(
                int(selected_patient["id"]),
                {
                    "name": edit_name.strip(),
                    "age": int(edit_age),
                    "gender": edit_gender,
                    "phone": edit_phone.strip(),
                    "address": edit_address.strip() or "Not Provided",
                    "diagnosis": edit_diagnosis.strip(),
                    "doctor_assigned": edit_doctor,
                    "billing_amount": float(edit_billing),
                    "payment_status": edit_status,
                    "appointment_date": edit_appointment.isoformat(),
                },
            )
            st.success("Patient record updated successfully.")
            st.rerun()
