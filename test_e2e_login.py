import urllib.request
import urllib.error
import json
import sys

BASE_URL = "http://127.0.0.1:5173"

def http_req(endpoint, method="GET", data=None, token=None):
    url = f"{BASE_URL}{endpoint}"
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    
    req_data = json.dumps(data).encode("utf-8") if data else None
    req = urllib.request.Request(url, data=req_data, headers=headers, method=method)
    
    try:
        with urllib.request.urlopen(req) as resp:
            content = resp.read().decode("utf-8")
            return resp.status, json.loads(content) if content else {}
    except urllib.error.HTTPError as e:
        err_content = e.read().decode("utf-8")
        try:
            parsed = json.loads(err_content)
        except:
            parsed = {"detail": err_content}
        return e.code, parsed

print(f"=== E2E TESTING VIA VITE PROXY ({BASE_URL}) ===\n")

# 1. Test frontend HTML serving
print("1. Testing Vite HTML Serving...")
try:
    with urllib.request.urlopen(BASE_URL) as resp:
        html = resp.read().decode("utf-8")
        assert "<div id=\"root\"></div>" in html or "id=\"root\"" in html
        print(f"   [PASS] Vite Dev Server responded with 200 OK ({len(html)} bytes HTML)")
except Exception as e:
    print(f"   [FAIL] Could not connect to Vite: {e}")
    sys.exit(1)

# 2. Test Admin Login and dashboard access through Vite proxy
print("\n2. Testing Admin Login & Dashboard via Vite Proxy...")
status_code, body = http_req("/api/auth/login", method="POST", data={
    "email": "admin@ruralhealth.org",
    "password": "Admin@12345"
})
assert status_code == 200, f"Admin login failed: {status_code} {body}"
admin_token = body["access_token"]
admin_role = body["user"]["role"]
assert admin_role == "admin"
print(f"   [PASS] Admin logged in -> Token received, Role: {admin_role}")

# Admin accesses /api/dashboard/stats
s_code, stats = http_req("/api/dashboard/stats", token=admin_token)
assert s_code == 200
print(f"   [PASS] Admin Dashboard Stats: Total Patients: {stats.get('total_patients')}, Total Workers: {stats.get('total_healthcare_workers')}, Documents: {stats.get('total_medical_documents')}")

# Admin accesses /api/users/
u_code, users = http_req("/api/users/", token=admin_token)
assert u_code == 200
print(f"   [PASS] Admin Users Management: {len(users)} user accounts retrieved")


# 3. Test Healthcare Worker Login and clinical access through Vite proxy
print("\n3. Testing Healthcare Worker Login & Access via Vite Proxy...")
status_code, body = http_req("/api/auth/login", method="POST", data={
    "email": "dr.rajesh@phc.in",
    "password": "Doctor@12345"
})
assert status_code == 200, f"Worker login failed: {status_code} {body}"
worker_token = body["access_token"]
worker_role = body["user"]["role"]
worker_name = body["user"]["full_name"]
assert worker_role == "healthcare_worker"
print(f"   [PASS] Healthcare Worker logged in -> Name: {worker_name}, Role: {worker_role}")

# Worker accesses /api/patients
p_code, patients = http_req("/api/patients", token=worker_token)
assert p_code == 200
print(f"   [PASS] Worker Patient Access: {len(patients.get('items', []))} patients listed for clinical review")

# Worker attempts admin-only /api/users/ (Must be rejected with 403 Forbidden)
u_code, _ = http_req("/api/users/", token=worker_token)
assert u_code == 403, f"Worker was unexpectedly permitted to access admin user directory! Status: {u_code}"
print("   [PASS] Worker correctly forbidden (403) from accessing admin User Management endpoint")


# 4. Test Patient Login and personal health records access through Vite proxy
print("\n4. Testing Patient Login & Personal Dashboard via Vite Proxy...")
status_code, body = http_req("/api/auth/login", method="POST", data={
    "email": "ramesh.kumar@rural.in",
    "password": "Patient@12345"
})
assert status_code == 200, f"Patient login failed: {status_code} {body}"
patient_token = body["access_token"]
patient_role = body["user"]["role"]
patient_name = body["user"]["full_name"]
assert patient_role == "patient"
print(f"   [PASS] Patient logged in -> Name: {patient_name}, Role: {patient_role}")

# Patient accesses own dashboard stats
s_code, p_stats = http_req("/api/dashboard/stats", token=patient_token)
assert s_code == 200
print(f"   [PASS] Patient Dashboard Stats: Prescriptions: {p_stats.get('total_prescriptions')}, Documents: {p_stats.get('total_medical_documents')}")

# Patient accesses personal documents
d_code, p_docs = http_req("/api/medical-documents/", token=patient_token)
assert d_code == 200
print(f"   [PASS] Patient Personal Documents: {len(p_docs)} documents securely retrieved (scoped to patient)")

# Patient attempts worker-only /api/patients (Must be rejected with 403 Forbidden)
pat_denied_code, _ = http_req("/api/patients", token=patient_token)
assert pat_denied_code == 403, f"Patient was unexpectedly permitted to access all patients list! Status: {pat_denied_code}"
print("   [PASS] Patient correctly forbidden (403) from accessing all-patients clinical directory")


# 5. Test Invalid Credentials
print("\n5. Testing Invalid Credentials Handling...")
bad_code, bad_resp = http_req("/api/auth/login", method="POST", data={
    "email": "admin@ruralhealth.org",
    "password": "WrongPassword123"
})
assert bad_code == 401, f"Expected 401, got {bad_code}"
assert "Invalid email address or password" in bad_resp.get("detail", "")
print(f"   [PASS] Invalid login rejected with HTTP 401 and descriptive message: \"{bad_resp.get('detail')}\"")

# 6. Test Non-existent Email
bad_email_code, bad_email_resp = http_req("/api/auth/login", method="POST", data={
    "email": "nonexistent.user@ruralhealth.org",
    "password": "AnyPassword123"
})
assert bad_email_code == 401, f"Expected 401, got {bad_email_code}"
assert "Invalid email address or password" in bad_email_resp.get("detail", "")
print(f"   [PASS] Non-existent email rejected with HTTP 401: \"{bad_email_resp.get('detail')}\"")

print("\n=======================================================")
print("ALL E2E LIVE LOGIN & ROLE-BASED ACCESS CHECKS PASSED!")
print("=======================================================\n")
