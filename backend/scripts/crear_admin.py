import requests

BASE_URL = "http://127.0.0.1:8000"

print("🔧 Creando usuario admin...")

response = requests.post(f"{BASE_URL}/register", json={
    "username": "admin",
    "email": "admin@school.com",
    "password": "admin123",
    "full_name": "Administrador",
    "role": "ADMIN",
    "student_id": None,
    "teacher_id": None
})

if response.status_code == 200:
    print("✅ Usuario admin creado correctamente")
    print("👉 Ahora puedes iniciar sesión en el frontend con:")
    print("   Usuario: admin")
    print("   Contraseña: admin123")
else:
    print(f"❌ Error: {response.json()}")
    