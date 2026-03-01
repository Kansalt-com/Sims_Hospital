from __future__ import annotations

import sqlite3
from datetime import date, datetime, timedelta
from pathlib import Path
from typing import Any, Dict, Iterable, List, Optional


BASE_DIR = Path(__file__).resolve().parents[1]
DB_PATH = BASE_DIR / "database" / "hospital.db"


def _connect() -> sqlite3.Connection:
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    connection = sqlite3.connect(DB_PATH)
    connection.row_factory = sqlite3.Row
    return connection


def _rows_to_dicts(rows: Iterable[sqlite3.Row]) -> List[Dict[str, Any]]:
    return [dict(row) for row in rows]


def init_database() -> None:
    with _connect() as conn:
        conn.executescript(
            """
            CREATE TABLE IF NOT EXISTS patients (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                age INTEGER NOT NULL,
                gender TEXT NOT NULL,
                phone TEXT NOT NULL,
                address TEXT NOT NULL,
                diagnosis TEXT NOT NULL,
                doctor_assigned TEXT NOT NULL,
                billing_amount REAL NOT NULL,
                payment_status TEXT NOT NULL,
                appointment_date TEXT NOT NULL,
                notes TEXT DEFAULT '',
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS invoices (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                patient_id INTEGER NOT NULL,
                invoice_number TEXT UNIQUE NOT NULL,
                amount REAL NOT NULL,
                status TEXT NOT NULL,
                issued_on TEXT NOT NULL,
                due_date TEXT NOT NULL,
                created_by TEXT NOT NULL,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (patient_id) REFERENCES patients (id)
            );

            CREATE TABLE IF NOT EXISTS report_uploads (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                patient_id INTEGER NOT NULL,
                doctor_username TEXT NOT NULL,
                file_name TEXT NOT NULL,
                file_path TEXT NOT NULL,
                uploaded_at TEXT NOT NULL,
                FOREIGN KEY (patient_id) REFERENCES patients (id)
            );
            """
        )


def seed_sample_patients() -> None:
    with _connect() as conn:
        existing = conn.execute("SELECT COUNT(*) AS count FROM patients").fetchone()
        if existing and existing["count"] > 0:
            return

        today = date.today()
        samples = [
            ("Aarav Sharma", 34, "Male", "9876501201", "Chennai", "Hypertension", "Dr. Meera Nair", 14800, "Paid", 0),
            ("Diya Nair", 27, "Female", "9876501202", "Kochi", "Migraine", "Dr. Priya Menon", 6200, "Pending", 0),
            ("Rohan Iyer", 42, "Male", "9876501203", "Bengaluru", "Type 2 Diabetes", "Dr. Arjun Rao", 18300, "Paid", 1),
            ("Kavya Reddy", 31, "Female", "9876501204", "Hyderabad", "Thyroid Disorder", "Dr. Priya Menon", 9400, "Pending", -1),
            ("Aditya Menon", 56, "Male", "9876501205", "Coimbatore", "Cardiac Arrhythmia", "Dr. S. Khan", 31200, "Paid", 0),
            ("Neha Verma", 23, "Female", "9876501206", "Mumbai", "Viral Fever", "Dr. Meera Nair", 4200, "Paid", 2),
            ("Sanjay Das", 63, "Male", "9876501207", "Kolkata", "COPD", "Dr. S. Khan", 22100, "Pending", 0),
            ("Aisha Patel", 39, "Female", "9876501208", "Ahmedabad", "Gastritis", "Dr. Arjun Rao", 7600, "Paid", -2),
            ("Harish K", 48, "Male", "9876501209", "Madurai", "Arthritis", "Dr. Priya Menon", 11800, "Paid", 3),
            ("Ishita Rao", 29, "Female", "9876501210", "Pune", "Anemia", "Dr. Meera Nair", 8300, "Pending", 0),
            ("Naveen P", 51, "Male", "9876501211", "Trivandrum", "Kidney Stones", "Dr. S. Khan", 19750, "Paid", -3),
            ("Pooja Sen", 37, "Female", "9876501212", "Delhi", "Bronchitis", "Dr. Meera Nair", 9900, "Pending", 1),
            ("Rahul Gupta", 45, "Male", "9876501213", "Noida", "Back Pain", "Dr. Arjun Rao", 6800, "Paid", 0),
            ("Sonia Roy", 32, "Female", "9876501214", "Kolkata", "PCOS", "Dr. Priya Menon", 10400, "Pending", 2),
            ("Vikram S", 59, "Male", "9876501215", "Mysuru", "High Cholesterol", "Dr. S. Khan", 12700, "Paid", -1),
            ("Tanvi Joshi", 26, "Female", "9876501216", "Surat", "Dermatitis", "Dr. Meera Nair", 5400, "Paid", 4),
            ("Yash Malhotra", 41, "Male", "9876501217", "Lucknow", "Fatty Liver", "Dr. Arjun Rao", 16500, "Pending", 0),
            ("Rekha N", 52, "Female", "9876501218", "Salem", "Vertigo", "Dr. Priya Menon", 8900, "Paid", -4),
            ("Kiran Babu", 36, "Male", "9876501219", "Vizag", "Sinusitis", "Dr. S. Khan", 7300, "Pending", 1),
            ("Megha Kapoor", 33, "Female", "9876501220", "Jaipur", "UTI", "Dr. Meera Nair", 6100, "Paid", 0),
        ]

        payload = []
        for name, age, gender, phone, address, diagnosis, doctor, amount, status, day_offset in samples:
            appointment = (today + timedelta(days=day_offset)).isoformat()
            payload.append(
                (
                    name,
                    age,
                    gender,
                    phone,
                    address,
                    diagnosis,
                    doctor,
                    amount,
                    status,
                    appointment,
                )
            )

        conn.executemany(
            """
            INSERT INTO patients (
                name,
                age,
                gender,
                phone,
                address,
                diagnosis,
                doctor_assigned,
                billing_amount,
                payment_status,
                appointment_date
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            payload,
        )


def fetch_patients(search_term: str = "") -> List[Dict[str, Any]]:
    with _connect() as conn:
        query = "SELECT * FROM patients"
        params: List[Any] = []
        if search_term.strip():
            query += (
                " WHERE name LIKE ? OR phone LIKE ? OR diagnosis LIKE ? OR doctor_assigned LIKE ?"
            )
            pattern = f"%{search_term.strip()}%"
            params = [pattern, pattern, pattern, pattern]
        query += " ORDER BY appointment_date DESC, id DESC"
        rows = conn.execute(query, params).fetchall()
        return _rows_to_dicts(rows)


def get_patient_by_id(patient_id: int) -> Optional[Dict[str, Any]]:
    with _connect() as conn:
        row = conn.execute("SELECT * FROM patients WHERE id = ?", (patient_id,)).fetchone()
        return dict(row) if row else None


def add_patient(payload: Dict[str, Any]) -> int:
    with _connect() as conn:
        cursor = conn.execute(
            """
            INSERT INTO patients (
                name,
                age,
                gender,
                phone,
                address,
                diagnosis,
                doctor_assigned,
                billing_amount,
                payment_status,
                appointment_date
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                payload["name"],
                payload["age"],
                payload["gender"],
                payload["phone"],
                payload["address"],
                payload["diagnosis"],
                payload["doctor_assigned"],
                payload["billing_amount"],
                payload["payment_status"],
                payload["appointment_date"],
            ),
        )
        return int(cursor.lastrowid)


def update_patient(patient_id: int, payload: Dict[str, Any]) -> None:
    with _connect() as conn:
        conn.execute(
            """
            UPDATE patients
            SET name = ?,
                age = ?,
                gender = ?,
                phone = ?,
                address = ?,
                diagnosis = ?,
                doctor_assigned = ?,
                billing_amount = ?,
                payment_status = ?,
                appointment_date = ?,
                updated_at = ?
            WHERE id = ?
            """,
            (
                payload["name"],
                payload["age"],
                payload["gender"],
                payload["phone"],
                payload["address"],
                payload["diagnosis"],
                payload["doctor_assigned"],
                payload["billing_amount"],
                payload["payment_status"],
                payload["appointment_date"],
                datetime.now().isoformat(timespec="seconds"),
                patient_id,
            ),
        )


def get_dashboard_metrics() -> Dict[str, Any]:
    today_iso = date.today().isoformat()
    with _connect() as conn:
        total_patients = conn.execute("SELECT COUNT(*) AS count FROM patients").fetchone()["count"]
        today_appointments = conn.execute(
            "SELECT COUNT(*) AS count FROM patients WHERE appointment_date = ?", (today_iso,)
        ).fetchone()["count"]
        total_revenue = conn.execute(
            "SELECT COALESCE(SUM(billing_amount), 0) AS revenue FROM patients"
        ).fetchone()["revenue"]
        doctors_on_duty = conn.execute(
            """
            SELECT COUNT(DISTINCT doctor_assigned) AS count
            FROM patients
            WHERE appointment_date = ?
            """,
            (today_iso,),
        ).fetchone()["count"]
    return {
        "total_patients": int(total_patients),
        "today_appointments": int(today_appointments),
        "total_revenue": float(total_revenue),
        "doctors_on_duty": int(doctors_on_duty),
    }


def get_unique_doctors() -> List[str]:
    with _connect() as conn:
        rows = conn.execute(
            "SELECT DISTINCT doctor_assigned FROM patients ORDER BY doctor_assigned"
        ).fetchall()
        return [row["doctor_assigned"] for row in rows]


def get_patients_for_doctor(doctor_name: str) -> List[Dict[str, Any]]:
    with _connect() as conn:
        rows = conn.execute(
            """
            SELECT * FROM patients
            WHERE doctor_assigned = ?
            ORDER BY appointment_date DESC, id DESC
            """,
            (doctor_name,),
        ).fetchall()
        return _rows_to_dicts(rows)


def append_doctor_note(patient_id: int, doctor_name: str, diagnosis: str, note: str) -> None:
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M")
    new_line = f"[{timestamp}] {doctor_name}: {note.strip()}"
    with _connect() as conn:
        row = conn.execute("SELECT notes FROM patients WHERE id = ?", (patient_id,)).fetchone()
        existing_notes = row["notes"] if row and row["notes"] else ""
        updated_notes = f"{existing_notes}\n{new_line}".strip() if existing_notes else new_line
        conn.execute(
            """
            UPDATE patients
            SET diagnosis = ?,
                notes = ?,
                updated_at = ?
            WHERE id = ?
            """,
            (
                diagnosis,
                updated_notes,
                datetime.now().isoformat(timespec="seconds"),
                patient_id,
            ),
        )


def _next_invoice_number(conn: sqlite3.Connection) -> str:
    code = datetime.now().strftime("%Y%m%d")
    pattern = f"SIMS-{code}-%"
    count = conn.execute(
        "SELECT COUNT(*) AS count FROM invoices WHERE invoice_number LIKE ?",
        (pattern,),
    ).fetchone()["count"]
    return f"SIMS-{code}-{count + 1:04d}"


def create_invoice(patient_id: int, created_by: str) -> Dict[str, Any]:
    issued_on = date.today()
    due_date = issued_on + timedelta(days=15)
    with _connect() as conn:
        patient = conn.execute("SELECT * FROM patients WHERE id = ?", (patient_id,)).fetchone()
        if not patient:
            raise ValueError("Patient record not found")

        invoice_number = _next_invoice_number(conn)
        cursor = conn.execute(
            """
            INSERT INTO invoices (
                patient_id,
                invoice_number,
                amount,
                status,
                issued_on,
                due_date,
                created_by
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (
                patient_id,
                invoice_number,
                float(patient["billing_amount"]),
                patient["payment_status"],
                issued_on.isoformat(),
                due_date.isoformat(),
                created_by,
            ),
        )
        invoice_id = int(cursor.lastrowid)
    invoice = get_invoice(invoice_id)
    if not invoice:
        raise RuntimeError("Invoice generation failed")
    return invoice


def get_invoice(invoice_id: int) -> Optional[Dict[str, Any]]:
    with _connect() as conn:
        row = conn.execute(
            """
            SELECT i.*,
                   p.name AS patient_name,
                   p.phone AS patient_phone,
                   p.address AS patient_address,
                   p.diagnosis AS patient_diagnosis,
                   p.doctor_assigned AS patient_doctor
            FROM invoices i
            INNER JOIN patients p ON p.id = i.patient_id
            WHERE i.id = ?
            """,
            (invoice_id,),
        ).fetchone()
        return dict(row) if row else None


def list_recent_invoices(limit: int = 25) -> List[Dict[str, Any]]:
    with _connect() as conn:
        rows = conn.execute(
            """
            SELECT i.id, i.invoice_number, i.amount, i.status, i.issued_on, p.name AS patient_name
            FROM invoices i
            INNER JOIN patients p ON p.id = i.patient_id
            ORDER BY i.id DESC
            LIMIT ?
            """,
            (limit,),
        ).fetchall()
        return _rows_to_dicts(rows)


def record_report_upload(
    patient_id: int, doctor_username: str, file_name: str, file_path: str
) -> None:
    with _connect() as conn:
        conn.execute(
            """
            INSERT INTO report_uploads (
                patient_id,
                doctor_username,
                file_name,
                file_path,
                uploaded_at
            ) VALUES (?, ?, ?, ?, ?)
            """,
            (
                patient_id,
                doctor_username,
                file_name,
                file_path,
                datetime.now().isoformat(timespec="seconds"),
            ),
        )


def list_report_uploads(patient_id: Optional[int] = None) -> List[Dict[str, Any]]:
    with _connect() as conn:
        query = """
            SELECT r.id,
                   r.file_name,
                   r.file_path,
                   r.uploaded_at,
                   r.doctor_username,
                   p.name AS patient_name
            FROM report_uploads r
            INNER JOIN patients p ON p.id = r.patient_id
        """
        params: List[Any] = []
        if patient_id is not None:
            query += " WHERE r.patient_id = ?"
            params.append(patient_id)
        query += " ORDER BY r.id DESC"
        rows = conn.execute(query, params).fetchall()
        return _rows_to_dicts(rows)
