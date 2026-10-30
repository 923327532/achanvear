"""HTTP smoke checks for the isolated local stack; never contacts a payment provider."""
import json
import secrets
import subprocess
import urllib.error
import urllib.request
import uuid
from decimal import Decimal, ROUND_HALF_UP
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
API = "http://127.0.0.1:8081/api/v1"
CONTAINER = "achanvear-local-postgres"


def sql(statement):
    owner = subprocess.check_output(
        ["docker", "inspect", CONTAINER, "--format", '{{index .Config.Labels "com.docker.compose.project"}}'], text=True
    ).strip()
    if owner != "achanvear-local":
        raise RuntimeError("Refusing to modify a database outside the isolated local stack")
    result = subprocess.run(
        ["docker", "exec", "-i", CONTAINER, "psql", "-qAt", "-v", "ON_ERROR_STOP=1", "-U", "postgres", "-d", "achanvear"],
        input=statement, text=True, capture_output=True, check=False,
    )
    if result.returncode:
        raise RuntimeError("Local SQL verification failed; sensitive SQL arguments are withheld")
    return result.stdout.strip()


def quote(value):
    return "'" + str(value).replace("'", "''") + "'"


def request(method, path, data=None, token=None, expected=200):
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = "Bearer " + token
    req = urllib.request.Request(API + path, data=json.dumps(data).encode() if data is not None else None, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=45) as response:
            status, payload = response.status, json.load(response)
    except urllib.error.HTTPError as error:
        status, payload = error.code, json.load(error)
    allowed = (expected,) if isinstance(expected, int) else expected
    if status not in allowed:
        raise RuntimeError(f"{method} {path}: HTTP {status}; expected {expected}. {payload.get('message', '')}")
    return payload.get("data", payload)


def main():
    credential_file = ROOT / ".env.docker.smoke.json"
    if not credential_file.exists():
        accounts = {
            key: {"id": str(uuid.uuid4()), "email": f"docker.{key}.{uuid.uuid4().hex[:8]}@example.invalid", "password": secrets.token_urlsafe(20)}
            for key in ("company", "professional")
        }
        accounts["company"]["companyId"] = str(uuid.uuid4())
        credential_file.write_text(json.dumps(accounts, indent=2), encoding="utf-8")
    accounts = json.loads(credential_file.read_text(encoding="utf-8"))
    seed = "CREATE EXTENSION IF NOT EXISTS pgcrypto;\n"
    for key, role in (("company", "COMPANY"), ("professional", "FREELANCER")):
        user = accounts[key]
        seed += f"INSERT INTO users(id,email,password_hash,role,status,full_name,created_at,updated_at) VALUES({quote(user['id'])},{quote(user['email'])},crypt({quote(user['password'])},gen_salt('bf',10)),{quote(role)},{quote('ACTIVE')},{quote('Docker Local ' + key)},CURRENT_TIMESTAMP,CURRENT_TIMESTAMP) ON CONFLICT(id) DO NOTHING;\n"
    company, professional = accounts["company"], accounts["professional"]
    seed += f"INSERT INTO companies(id,owner_user_id,business_name,legal_name,industry,specialty,company_size,biography,address,payment_method_type,company_plan,representative_dni,status,created_at,updated_at) VALUES({quote(company['companyId'])},{quote(company['id'])},'Empresa Docker Local','Empresa Docker Local','Software','Java','SMALL_BUSINESS','Empresa ficticia para validacion local','Lima, Peru','CREDIT_CARD','FREE','12345678','VALIDATED',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP) ON CONFLICT(id) DO UPDATE SET company_size=EXCLUDED.company_size,address=EXCLUDED.address;"
    sql(seed)
    assert sql("SELECT count(*) FROM flyway_schema_history WHERE success") == "75"
    assert request("GET", "/actuator/health")["status"] == "UP"
    print("PASS: backend health and 75 Flyway migrations")
    for origin in ("http://localhost:3001", "http://localhost:3000"):
        preflight = urllib.request.Request(API + "/auth/login", headers={"Origin": origin, "Access-Control-Request-Method": "POST"}, method="OPTIONS")
        with urllib.request.urlopen(preflight, timeout=10) as response:
            assert response.status == 200 and response.headers.get("Access-Control-Allow-Origin") == origin
    print("PASS: browser CORS for local ports 3000 and 3001")
    tokens = {}
    for key, account in accounts.items():
        tokens[key] = request("POST", "/auth/login", {"email": account["email"], "password": account["password"]})["accessToken"]
    client, worker = tokens["company"], tokens["professional"]
    print("PASS: company and professional authentication")
    service = request("POST", "/services?publish=true", {
        "title": "Servicio Docker " + uuid.uuid4().hex[:8], "description": "Servicio ficticio para comprobar la contratacion local completa.",
        "category": "DESIGN", "basePrice": 100, "deliveryDays": 3, "currency": "PEN",
    }, worker, expected=201)
    conversation = request("POST", "/chat/conversations", {"freelancerUserId": professional["id"]}, client, expected=(200, 201))
    request("POST", f"/services/conversations/{conversation['id']}/origins/{service['id']}", token=client)
    body = {"conversationId": conversation["id"], "serviceId": service["id"], "planId": None, "idempotencyKey": str(uuid.uuid4())}
    contract = request("POST", "/services/contracts", body, client)
    assert request("POST", "/services/contracts", body, client)["id"] == contract["id"]
    milestone_id = contract["milestoneId"]
    request("POST", f"/payments/milestones/{milestone_id}/process-culqi-payment", {"token": "tok_local_smoke", "email": company["email"]}, client, expected=400)
    request("POST", f"/services/contracts/{contract['id']}/accept", token=worker)
    print("PASS: service, chat origin, idempotent contract, acceptance and funding guard")
    initial = Decimal(str(request("GET", "/payments/freelancer/wallet-summary", token=worker)["availableForWithdrawal"]))
    rate = Decimal(sql(f"SELECT platform_percentage FROM project_commission_agreements WHERE project_id={quote(contract['projectId'])}"))
    platform_fee = (rate * Decimal("100") / 100).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
    processor_fee = Decimal("4.49")
    net = Decimal("100") - platform_fee - processor_fee
    # Simulate provider-confirmed funds only in the local database. No charge API is called.
    sql(f"INSERT INTO escrow(id,milestone_id,project_id,client_user_id,freelancer_user_id,amount,platform_commission,mp_commission,freelancer_amount,status,held_at) VALUES({quote(uuid.uuid4())},{quote(milestone_id)},{quote(contract['projectId'])},{quote(company['id'])},{quote(professional['id'])},100,{platform_fee},{processor_fee},{net},'HELD',CURRENT_TIMESTAMP); UPDATE milestones SET status='FUNDED',funded_at=CURRENT_TIMESTAMP WHERE id={quote(milestone_id)};")
    request("POST", f"/payments/milestones/{milestone_id}/start", token=worker)
    request("POST", f"/payments/milestones/{milestone_id}/submit-review", token=worker)
    released = request("POST", f"/payments/milestones/{milestone_id}/release", {}, client)
    assert Decimal(str(released["freelancerNetAmount"])) == net
    request("POST", f"/payments/milestones/{milestone_id}/release", {}, client, expected=400)
    assert Decimal(str(request("GET", "/payments/freelancer/wallet-summary", token=worker)["availableForWithdrawal"])) == initial + net
    request("POST", f"/services/contracts/{contract['id']}/review", {"stars": 5, "comment": "Validacion local, no es un testimonio real."}, client)
    assert len(request("GET", f"/services/{service['id']}/reviews", token=client)) == 1
    detail = request("GET", f"/services/{service['id']}", token=worker)
    assert detail["sales"] == 1 and detail["reviewCount"] == 1
    inbox = request("GET", "/notifications/in-app", token=worker)
    assert inbox
    request("PATCH", f"/notifications/{inbox[0]['id']}/read", token=worker)
    print("PASS: execution, delivery, release, wallet, duplicate-release guard, sale, verified review and notifications")
    with urllib.request.urlopen("http://127.0.0.1:3001/", timeout=20) as response:
        assert response.status == 200 and "Escuchar bienvenida" in response.read().decode()
    print("PASS: Docker frontend serves the updated home on port 3001")
    print("No registration emails or real payments were sent. Local test credentials remain in .env.docker.smoke.json.")


if __name__ == "__main__":
    main()
