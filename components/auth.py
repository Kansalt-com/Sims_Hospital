from __future__ import annotations

from dataclasses import dataclass
from typing import Dict, Optional, Tuple


@dataclass(frozen=True)
class UserProfile:
    role: str
    username: str
    display_name: str


DEMO_USERS: Dict[str, Dict[str, str]] = {
    "admin": {
        "admin.sims": "Admin@123",
    },
    "doctor": {
        "dr.meera": "Doctor@123",
        "dr.arjun": "Doctor@123",
        "dr.khan": "Doctor@123",
        "dr.priya": "Doctor@123",
    },
    "staff": {
        "staff.frontdesk": "Staff@123",
    },
}


DOCTOR_DIRECTORY: Dict[str, str] = {
    "dr.meera": "Dr. Meera Nair",
    "dr.arjun": "Dr. Arjun Rao",
    "dr.khan": "Dr. S. Khan",
    "dr.priya": "Dr. Priya Menon",
}


def role_title(role: Optional[str]) -> str:
    titles = {"admin": "Admin", "doctor": "Doctor", "staff": "Staff"}
    return titles.get(role or "", "User")


def doctor_display_name(username: Optional[str]) -> str:
    if not username:
        return ""
    return DOCTOR_DIRECTORY.get(username, username)


def demo_credentials_for_role(role: str) -> Tuple[str, str]:
    if role not in DEMO_USERS or not DEMO_USERS[role]:
        return "", ""
    username, password = next(iter(DEMO_USERS[role].items()))
    return username, password


def authenticate_user(role: str, username: str, password: str) -> Optional[UserProfile]:
    normalized_username = username.strip().lower()
    if role not in DEMO_USERS:
        return None
    expected_password = DEMO_USERS[role].get(normalized_username)
    if expected_password != password:
        return None
    display_name = doctor_display_name(normalized_username) if role == "doctor" else normalized_username
    return UserProfile(role=role, username=normalized_username, display_name=display_name)
