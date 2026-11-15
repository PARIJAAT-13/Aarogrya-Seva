import sys
import os

# Add backend directory to sys.path
backend_dir = os.path.dirname(os.path.abspath(__file__))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.core.config import settings
print(f"DATABASE_URL: {settings.DATABASE_URL}")
print(f"CORS_ORIGINS: {settings.CORS_ORIGINS}")

from app.database.session import SessionLocal, Base, engine
from app.database.seed import seed_database
from app.models.user import User
from app.core.security import verify_password, create_access_token, decode_access_token
from fastapi.testclient import TestClient
from app.main import app

# Ensure tables and seed
Base.metadata.create_all(bind=engine)
db = SessionLocal()
try:
    seed_database(db)
    users = db.query(User).all()
    print(f"\nTotal users in DB: {len(users)}")
    for u in users:
        print(f"  User id={u.id}, email={u.email}, role={u.role}, active={u.is_active}")
finally:
    db.close()

# Test direct password verification and token generation
test_accounts = [
    ("admin@ruralhealth.org", "Admin@12345", "admin"),
    ("dr.rajesh@phc.in", "Doctor@12345", "healthcare_worker"),
    ("ramesh.kumar@rural.in", "Patient@12345", "patient")
]

print("\n--- Testing Direct Password & Token Verification ---")
db = SessionLocal()
try:
    for email, pwd, expected_role in test_accounts:
        user = db.query(User).filter(User.email == email).first()
        assert user is not None, f"User {email} not found in DB!"
        assert user.role == expected_role, f"Expected role {expected_role}, got {user.role}"
        valid = verify_password(pwd, user.hashed_password)
        assert valid, f"Password verification failed for {email}!"
        token = create_access_token(subject=user.id, role=user.role)
        decoded = decode_access_token(token)
        assert decoded is not None and decoded.get("sub") == str(user.id), "JWT decode failed!"
        print(f"  [PASS] {email} ({expected_role}) verified + JWT valid")
finally:
    db.close()

print("\n--- Testing API Login Endpoint via TestClient ---")
client = TestClient(app)

for email, pwd, expected_role in test_accounts:
    resp = client.post("/api/auth/login", json={"email": email, "password": pwd})
    assert resp.status_code == 200, f"Login failed for {email}: {resp.status_code} {resp.text}"
    body = resp.json()
    assert "access_token" in body, "Missing access_token"
    assert body["user"]["role"] == expected_role, f"Role mismatch: {body['user']['role']}"
    assert body["user"]["email"] == email, "Email mismatch"
    print(f"  [PASS] POST /api/auth/login for {email} -> 200 OK, token issued, role={body['user']['role']}")

# Test invalid password
bad_resp = client.post("/api/auth/login", json={"email": "admin@ruralhealth.org", "password": "WrongPassword!"})
assert bad_resp.status_code == 401, f"Expected 401, got {bad_resp.status_code}"
assert "Invalid email address or password" in bad_resp.json()["detail"]
print("  [PASS] Invalid password rejected with 401 and descriptive error message")

# Test /api/auth/me for each user
print("\n--- Testing /api/auth/me Profile Route ---")
for email, pwd, expected_role in test_accounts:
    login_resp = client.post("/api/auth/login", json={"email": email, "password": pwd})
    token = login_resp.json()["access_token"]
    me_resp = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_resp.status_code == 200, f"/auth/me failed for {email}: {me_resp.text}"
    me_data = me_resp.json()
    assert me_data["email"] == email
    print(f"  [PASS] GET /api/auth/me for {email} -> 200 OK (name: {me_data['full_name']}, lang: {me_data['preferred_language']})")

# Test CORS headers for port 5174
print("\n--- Testing CORS Preflight for Port 5174 & 5175 ---")
options_resp = client.options("/api/auth/login", headers={
    "Origin": "http://localhost:5174",
    "Access-Control-Request-Method": "POST",
})
assert options_resp.status_code == 200, f"CORS preflight failed: {options_resp.status_code}"
assert options_resp.headers.get("access-control-allow-origin") == "http://localhost:5174"
print("  [PASS] CORS preflight OPTIONS from http://localhost:5174 -> 200 OK (Access-Control-Allow-Origin: http://localhost:5174)")

print("\nALL BACKEND AUTHENTICATION AND API VERIFICATION CHECKS PASSED SUCCESSFULLY!\n")

