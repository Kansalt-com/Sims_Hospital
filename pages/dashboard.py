from __future__ import annotations

from typing import Dict

import pandas as pd
import plotly.express as px
import streamlit as st

from components.db import get_dashboard_metrics
from components.ui import format_currency, render_animated_metric_card


def _monthly_revenue_frame() -> pd.DataFrame:
    return pd.DataFrame(
        {
            "Month": ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
            "Revenue": [124000, 138500, 146000, 151300, 162200, 174500, 169800, 183600, 194200, 208400, 218900, 231500],
        }
    )


def _patient_visits_frame() -> pd.DataFrame:
    return pd.DataFrame(
        {
            "Month": ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
            "Visits": [620, 675, 712, 748, 805, 844, 821, 878, 903, 951, 990, 1024],
        }
    )


def render_admin_dashboard(context: Dict[str, str]) -> None:
    st.markdown("## Executive Dashboard")
    st.caption(f"{context['hospital_name']} | Enterprise Operations Console")

    metrics = get_dashboard_metrics()
    m1, m2, m3, m4 = st.columns(4, gap="medium")

    with m1:
        render_animated_metric_card("Total Patients", metrics["total_patients"], "Registered in system")
    with m2:
        render_animated_metric_card("Today Appointments", metrics["today_appointments"], "Scheduled for today")
    with m3:
        render_animated_metric_card(
            "Total Revenue",
            metrics["total_revenue"],
            "Current cumulative billing",
            prefix="$",
            decimals=0,
        )
    with m4:
        render_animated_metric_card("Doctors On Duty", metrics["doctors_on_duty"], "Live active roster")

    revenue_df = _monthly_revenue_frame()
    visits_df = _patient_visits_frame()

    left, right = st.columns(2, gap="large")
    with left:
        st.markdown("### Monthly Revenue")
        revenue_chart = px.area(
            revenue_df,
            x="Month",
            y="Revenue",
            markers=True,
            color_discrete_sequence=["#c9a86a"],
        )
        revenue_chart.update_layout(
            paper_bgcolor="rgba(0,0,0,0)",
            plot_bgcolor="rgba(0,0,0,0)",
            margin=dict(l=10, r=10, t=10, b=10),
            xaxis_title="",
            yaxis_title="USD",
        )
        revenue_chart.update_traces(line=dict(width=3), fillcolor="rgba(201,168,106,0.28)")
        st.plotly_chart(revenue_chart, use_container_width=True)

    with right:
        st.markdown("### Patient Visits")
        visits_chart = px.bar(
            visits_df,
            x="Month",
            y="Visits",
            color_discrete_sequence=["#8d7749"],
        )
        visits_chart.update_layout(
            paper_bgcolor="rgba(0,0,0,0)",
            plot_bgcolor="rgba(0,0,0,0)",
            margin=dict(l=10, r=10, t=10, b=10),
            xaxis_title="",
            yaxis_title="Visit Count",
        )
        visits_chart.update_traces(marker_line_width=0, opacity=0.9)
        st.plotly_chart(visits_chart, use_container_width=True)

    st.markdown("### Enterprise Summary")
    s1, s2, s3 = st.columns(3, gap="medium")
    with s1:
        st.markdown(
            f"""
            <div class="insight-card">
                <h4>Revenue Run Rate</h4>
                <p>{format_currency(metrics['total_revenue'])} tracked against active billing records.</p>
            </div>
            """,
            unsafe_allow_html=True,
        )
    with s2:
        st.markdown(
            f"""
            <div class="insight-card">
                <h4>Clinical Throughput</h4>
                <p>{metrics['today_appointments']} appointments are currently listed for today's sessions.</p>
            </div>
            """,
            unsafe_allow_html=True,
        )
    with s3:
        st.markdown(
            """
            <div class="insight-card">
                <h4>Cloud Readiness</h4>
                <p>Containerized architecture aligned for Azure App Service deployment.</p>
            </div>
            """,
            unsafe_allow_html=True,
        )
