import pytest
import io
from fastapi.testclient import TestClient
from app.main import app
from app.database.session import SessionLocal, Base, engine
from app.database.seed import seed_database

client = TestClient(app)

@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    seed_database(db)
    db.close()
    yield

def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_login_admin():
    response = client.post("/api/auth/login", json={
        "email": "admin@ruralhealth.org",
        "password": "Admin@12345"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["role"] == "admin"

def test_login_doctor():
    response = client.post("/api/auth/login", json={
        "email": "dr.rajesh@phc.in",
        "password": "Doctor@12345"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["role"] == "healthcare_worker"

def test_login_patient():
    response = client.post("/api/auth/login", json={
        "email": "ramesh.kumar@rural.in",
        "password": "Patient@12345"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["role"] == "patient"

def test_register_new_patient():
    import uuid
    dynamic_email = f"patient_{uuid.uuid4().hex[:6]}@village.org"
    response = client.post("/api/auth/register/patient", json={
        "email": dynamic_email,
        "password": "SecurePassword@123",
        "full_name": "Anita Devi",
        "phone_number": "+91 99887 76655",
        "date_of_birth": "1992-06-14",
        "gender": "Female",
        "address": "South Tola, Village Rampur",
        "village": "Rampur",
        "district": "Sitapur",
        "state": "Uttar Pradesh",
        "preferred_language": "Hindi"
    })
    assert response.status_code == 201
    data = response.json()
    assert data["user"]["full_name"] == "Anita Devi"
    assert data["user"]["role"] == "patient"

def test_dashboard_stats():
    # Login as admin
    login_res = client.post("/api/auth/login", json={
        "email": "admin@ruralhealth.org",
        "password": "Admin@12345"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    response = client.get("/api/dashboard/stats", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["total_patients"] >= 3
    assert data["total_healthcare_workers"] >= 3
    assert len(data["registration_trend"]) > 0

def test_document_upload_and_retrieval():
    # Login as worker
    login_res = client.post("/api/auth/login", json={
        "email": "dr.rajesh@phc.in",
        "password": "Doctor@12345"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Fetch patient 1
    patients_res = client.get("/api/patients/", headers=headers)
    assert patients_res.status_code == 200
    p1 = patients_res.json()["items"][0]

    # Upload dummy test file
    file_content = b"%PDF-1.4 test rural prescription document data"
    files = {
        "file": ("prescription_blood_test.pdf", io.BytesIO(file_content), "application/pdf")
    }
    form_data = {
        "document_type": "prescription",
        "title": "Hypertension Medication Sheet",
        "description": "Prescription issued by PHC Rampur",
        "patient_id": str(p1["id"]),
    }

    upload_res = client.post("/api/medical-documents/upload", headers=headers, data=form_data, files=files)
    assert upload_res.status_code == 201
    doc_data = upload_res.json()
    assert doc_data["title"] == "Hypertension Medication Sheet"
    doc_id = doc_data["id"]

    # View document inline
    view_res = client.get(f"/api/medical-documents/{doc_id}/view", headers=headers)
    assert view_res.status_code == 200
    assert view_res.content == file_content

def test_healthcare_content():
    # Login as admin
    login_res = client.post("/api/auth/login", json={
        "email": "admin@ruralhealth.org",
        "password": "Admin@12345"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # List articles
    response = client.get("/api/healthcare-content/", headers=headers)
    assert response.status_code == 200
    articles = response.json()
    assert articles["total"] >= 6
