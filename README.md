# SIMS Hospital Cloud (Demo)

SIMS Hospital Cloud is a premium, cloud-ready Hospital Management SaaS demo built with Streamlit + SQLite.

## Highlights

- Multi-hospital portal login with session-based role access (`admin`, `doctor`, `staff`)
- Admin dashboard with animated KPI counters and trend charts
- Patient management with add, edit, and search workflows
- Billing module with auto-generated invoices, print-friendly preview, and PDF download
- Doctor dashboard for assigned patients, diagnosis updates, and clinical notes
- Secure file upload (PDF) to local storage with Azure production banner message
- Auto-seeded 20 sample patients on first run

## Project Structure

```text
/sims_hospital
    app.py
    /pages
        dashboard.py
        patients.py
        billing.py
        doctors.py
    /components
    /assets
    /database
    /styles
    requirements.txt
    Dockerfile
```

## Run Locally

```bash
cd sims_hospital
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
streamlit run app.py
```

Demo login credentials are shown directly on the landing page for each role.

## Docker Run

```bash
cd sims_hospital
docker build -t sims-hospital-cloud:demo .
docker run -p 8501:8501 -e PORT=8501 sims-hospital-cloud:demo
```

## Azure App Service Deployment (Container)

1. Build and push container to Azure Container Registry (ACR).
2. Create Azure App Service (Linux, Web App for Containers).
3. Configure container image in App Service to your ACR image tag.
4. Add app settings:
   - `WEBSITES_PORT=8501`
   - `PORT=8501`
5. Enable persistent storage if you want local SQLite and uploaded reports to survive restarts.
6. Deploy and validate at `https://<app-name>.azurewebsites.net`.

## Azure Deployment (Source-Based Alternative)

1. Create App Service with Python 3.11 runtime.
2. Set startup command:
   - `streamlit run app.py --server.address=0.0.0.0 --server.port=${PORT}`
3. Add app settings:
   - `PORT=8000` (or any allowed port)
4. Ensure the startup command maps to the same `PORT` setting.

## Notes

- This is a demo implementation. Production architecture should externalize the database and file storage (Azure SQL + Azure Blob), and replace local credential auth with Microsoft Entra ID.
