from __future__ import annotations

from typing import Dict, List, Tuple

import streamlit as st

from components.auth import (
    authenticate_user,
    demo_credentials_for_role,
    doctor_display_name,
    role_title,
)
from components.db import init_database, seed_sample_patients
from components.ui import load_global_styles, render_demo_ribbon
from pages.billing import render_billing_page
from pages.dashboard import render_admin_dashboard
from pages.doctors import render_doctors_page
from pages.patients import render_patients_page


APP_TITLE = "SIMS Hospital Cloud"
APP_TAGLINE = "Secure. Smart. Seamless Hospital Operations."


def _init_session_state() -> None:
    defaults = {
        "authenticated": False,
        "role": None,
        "username": None,
        "hospital_name": "",
        "latest_invoice_id": None,
    }
    for key, value in defaults.items():
        if key not in st.session_state:
            st.session_state[key] = value


def _sidebar_navigation(role: str) -> str:
    role_options = {
        "admin": ["Dashboard", "Patients", "Billing", "Doctors"],
        "doctor": ["Doctors"],
        "staff": ["Patients", "Billing"],
    }
    labels = {
        "Dashboard": "Dashboard Overview",
        "Patients": "Patient Management",
        "Billing": "Billing Module",
        "Doctors": "Doctor Workspace",
    }
    icons = {
        "Dashboard": "📊",
        "Patients": "🧾",
        "Billing": "💳",
        "Doctors": "🩺",
    }
    options = role_options.get(role, ["Dashboard"])
    return st.sidebar.radio(
        "Navigation",
        options,
        format_func=lambda item: f"{icons[item]}  {labels[item]}",
        key="main_nav",
        label_visibility="collapsed",
    )


def _render_landing_page() -> None:
    st.markdown(
        f"""
        <section class="hero-shell fade-in-up">
            <p class="hero-overline">Enterprise SaaS Platform</p>
            <h1 class="hero-title">{APP_TITLE}</h1>
            <p class="hero-subtitle">
                Unified operations for modern hospital groups with role-based workflows,
                secure billing, and clinical collaboration in one cloud-ready workspace.
            </p>
            <p class="hero-tagline">{APP_TAGLINE}</p>
        </section>
        """,
        unsafe_allow_html=True,
    )

    cta_col1, cta_col2, _ = st.columns([1, 1, 3], gap="small")
    with cta_col1:
        if st.button("Login", key="hero_login", use_container_width=True, type="primary"):
            st.info("Use the secure portal login form below.")
    with cta_col2:
        if st.button("Request Demo", key="hero_request_demo", use_container_width=True):
            st.success("Demo request captured. The SIMS enterprise team will contact you shortly.")

    st.markdown('<div id="portal-login"></div>', unsafe_allow_html=True)
    st.markdown("### Multi-Hospital Portal Login")
    hospital_name = st.text_input(
        "Hospital Name",
        placeholder="Enter hospital or network name",
        key="landing_hospital_name",
    )

    tabs = st.tabs(["Admin Login", "Doctor Login", "Staff Login"])
    tab_roles: List[Tuple[str, str]] = [("admin", "Admin"), ("doctor", "Doctor"), ("staff", "Staff")]
    for tab, (role_key, role_label) in zip(tabs, tab_roles):
        with tab:
            demo_user, demo_pass = demo_credentials_for_role(role_key)
            with st.form(f"{role_key}_login_form", clear_on_submit=False):
                username = st.text_input("Username", key=f"{role_key}_username")
                password = st.text_input("Password", type="password", key=f"{role_key}_password")
                submit = st.form_submit_button(f"Sign in as {role_label}", use_container_width=True)
            st.caption(f"Demo credentials: `{demo_user}` / `{demo_pass}`")

            if submit:
                if not hospital_name.strip():
                    st.error("Hospital Name is required for multi-hospital login.")
                    continue

                profile = authenticate_user(role_key, username, password)
                if not profile:
                    st.error("Invalid credentials. Please use the demo credentials above.")
                    continue

                st.session_state.authenticated = True
                st.session_state.role = profile.role
                st.session_state.username = profile.username
                st.session_state.hospital_name = hospital_name.strip()
                st.rerun()


def _render_sidebar_shell() -> Dict[str, str]:
    st.sidebar.markdown("### SIMS Hospital Cloud")
    st.sidebar.caption(st.session_state.hospital_name)
    st.sidebar.markdown(
        f"**Role:** {role_title(st.session_state.role)}  \n"
        f"**User:** {doctor_display_name(st.session_state.username) if st.session_state.role == 'doctor' else st.session_state.username}"
    )
    selected_page = _sidebar_navigation(st.session_state.role)
    if st.sidebar.button("Logout", use_container_width=True):
        st.session_state.authenticated = False
        st.session_state.role = None
        st.session_state.username = None
        st.session_state.latest_invoice_id = None
        st.rerun()
    return {
        "role": st.session_state.role,
        "username": st.session_state.username,
        "hospital_name": st.session_state.hospital_name,
        "selected_page": selected_page,
    }


def _render_authenticated_views(context: Dict[str, str]) -> None:
    selected_page = context["selected_page"]
    role = context["role"]

    if selected_page == "Dashboard":
        render_admin_dashboard(context)
        return
    if selected_page == "Patients":
        render_patients_page(context)
        return
    if selected_page == "Billing":
        render_billing_page(context)
        return
    if selected_page == "Doctors":
        render_doctors_page(context)
        return

    if role == "doctor":
        render_doctors_page(context)
    else:
        render_admin_dashboard(context)


def main() -> None:
    st.set_page_config(
        page_title=APP_TITLE,
        page_icon="🏥",
        layout="wide",
        initial_sidebar_state="expanded",
    )

    load_global_styles()
    init_database()
    seed_sample_patients()
    _init_session_state()

    render_demo_ribbon()

    if not st.session_state.authenticated:
        _render_landing_page()
        return

    context = _render_sidebar_shell()
    _render_authenticated_views(context)


if __name__ == "__main__":
    main()
