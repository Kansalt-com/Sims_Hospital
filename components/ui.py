from __future__ import annotations

from pathlib import Path
from uuid import uuid4

import streamlit as st
import streamlit.components.v1 as components


BASE_DIR = Path(__file__).resolve().parents[1]
CSS_PATH = BASE_DIR / "styles" / "premium.css"

RIBBON_TEXT = (
    "Demo Version - Production includes Azure Secure Storage, Entra ID Authentication, "
    "Auto Backups & CI/CD Managed Upgrades"
)


def load_global_styles() -> None:
    if CSS_PATH.exists():
        st.markdown(f"<style>{CSS_PATH.read_text(encoding='utf-8')}</style>", unsafe_allow_html=True)


def render_demo_ribbon() -> None:
    st.markdown(
        f"""
        <div class="top-ribbon">
            {RIBBON_TEXT}
        </div>
        """,
        unsafe_allow_html=True,
    )


def format_currency(value: float) -> str:
    return f"${value:,.2f}"


def render_animated_metric_card(
    title: str,
    value: float,
    subtitle: str = "",
    prefix: str = "",
    suffix: str = "",
    decimals: int = 0,
) -> None:
    card_id = f"metric-{uuid4().hex[:8]}"
    target = float(value)
    html = f"""
    <div class="metric-card-shell">
        <div class="metric-title">{title}</div>
        <div class="metric-value" id="{card_id}">{prefix}0{suffix}</div>
        <div class="metric-subtitle">{subtitle}</div>
    </div>
    <style>
      .metric-card-shell {{
          background: linear-gradient(145deg, #fffefb 0%, #fff8ea 100%);
          border: 1px solid rgba(201, 168, 106, 0.35);
          border-radius: 12px;
          box-shadow: 0 12px 24px rgba(32, 33, 36, 0.08);
          padding: 18px 16px;
          min-height: 124px;
          transition: transform 180ms ease, box-shadow 180ms ease;
      }}
      .metric-card-shell:hover {{
          transform: translateY(-2px);
          box-shadow: 0 14px 28px rgba(32, 33, 36, 0.12);
      }}
      .metric-title {{
          color: #5f4d30;
          font-size: 0.86rem;
          letter-spacing: 0.03em;
          text-transform: uppercase;
          font-family: Inter, Poppins, sans-serif;
      }}
      .metric-value {{
          margin-top: 8px;
          color: #2f2414;
          font-size: 2rem;
          line-height: 1.1;
          font-weight: 700;
          font-family: Inter, Poppins, sans-serif;
      }}
      .metric-subtitle {{
          margin-top: 6px;
          color: #8a7a5b;
          font-size: 0.8rem;
          font-family: Inter, Poppins, sans-serif;
      }}
    </style>
    <script>
      (() => {{
        const element = window.parent.document.getElementById("{card_id}");
        if (!element) return;
        const target = {target};
        const decimals = {decimals};
        const prefix = "{prefix}";
        const suffix = "{suffix}";
        let current = 0;
        const frames = 42;
        const increment = target / frames;
        const formatNumber = (num) => {{
            const fixed = Number(num).toFixed(decimals);
            return Number(fixed).toLocaleString(undefined, {{
                minimumFractionDigits: decimals,
                maximumFractionDigits: decimals,
            }});
        }};
        const tick = () => {{
            current += increment;
            if (current < target) {{
                element.textContent = `${{prefix}}${{formatNumber(current)}}${{suffix}}`;
                requestAnimationFrame(tick);
            }} else {{
                element.textContent = `${{prefix}}${{formatNumber(target)}}${{suffix}}`;
            }}
        }};
        tick();
      }})();
    </script>
    """
    components.html(html, height=140)
