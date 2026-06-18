import requests

BASE_URL = "http://127.0.0.1:8000"

# Login como admin
print("🔐 Iniciando sesión...")
login_response = requests.post(f"{BASE_URL}/login", data={
    "username": "admin",
    "password": "admin123"
})

if login_response.status_code != 200:
    print(f"❌ Error al iniciar sesión: {login_response.json()}")
    exit()

token = login_response.json()["access_token"]
headers = {"Authorization": f"Bearer {token}"}
print("✅ Login exitoso\n")

# Obtener usuarios
print("📋 Listando usuarios...\n")
response = requests.get(f"{BASE_URL}/users", headers=headers)

if response.status_code == 200:
    data = response.json()
    print(f"Total de usuarios: {data['total_users']}\n")
    print("=" * 80)
    
    for user in data['users']:
        print(f"ID: {user['id']}")
        print(f"  Username: {user['username']}")
        print(f"  Email: {user['email']}")
        print(f"  Nombre: {user['full_name']}")
        print(f"  Rol: {user['role']}")
        if user.get('student_id'):
            print(f"  Alumno vinculado: ID {user['student_id']}")
        if user.get('teacher_id'):
            print(f"  Profesor vinculado: ID {user['teacher_id']}")
        print("-" * 80)
else:
    print(f"❌ Error: {response.json()}")