import requests

# URL base de tu API
BASE_URL = "http://127.0.0.1:8000"

# Lista de usuarios a registrar
usuarios = [
    {
        "username": "admin01",
        "email": "admin01@school.com",
        "password": "Admin123*",
        "full_name": "Carlos Mendoza",
        "role": "ADMIN",
        "student_id": None,
        "teacher_id": None
    },
    {
        "username": "admin02",
        "email": "admin02@school.com",
        "password": "Admin123*",
        "full_name": "María Torres",
        "role": "ADMIN",
        "student_id": None,
        "teacher_id": None
    },
    {
        "username": "teacher01",
        "email": "teacher01@school.com",
        "password": "Teacher123*",
        "full_name": "Juan Pérez",
        "role": "TEACHER",
        "student_id": None,
        "teacher_id": None
    },
    {
        "username": "teacher02",
        "email": "teacher02@school.com",
        "password": "Teacher123*",
        "full_name": "Ana Rodríguez",
        "role": "TEACHER",
        "student_id": None,
        "teacher_id": None
    },
    {
        "username": "teacher03",
        "email": "teacher03@school.com",
        "password": "Teacher123*",
        "full_name": "Luis García",
        "role": "TEACHER",
        "student_id": None,
        "teacher_id": None
    },
    {
        "username": "parent01",
        "email": "parent01@school.com",
        "password": "Parent123*",
        "full_name": "Rosa Fernández",
        "role": "PARENT",
        "student_id": None,
        "teacher_id": None
    },
    {
        "username": "parent02",
        "email": "parent02@school.com",
        "password": "Parent123*",
        "full_name": "Miguel Castro",
        "role": "PARENT",
        "student_id": None,
        "teacher_id": None
    },
    {
        "username": "parent03",
        "email": "parent03@school.com",
        "password": "Parent123*",
        "full_name": "Patricia Rojas",
        "role": "PARENT",
        "student_id": None,
        "teacher_id": None
    },
    {
        "username": "parent04",
        "email": "parent04@school.com",
        "password": "Parent123*",
        "full_name": "José Huamán",
        "role": "PARENT",
        "student_id": None,
        "teacher_id": None
    },
    {
        "username": "parent05",
        "email": "parent05@school.com",
        "password": "Parent123*",
        "full_name": "Carmen Díaz",
        "role": "PARENT",
        "student_id": None,
        "teacher_id": None
    }
]

print("🚀 Registrando usuarios...")
print("=" * 50)

exitosos = 0
fallidos = 0

for usuario in usuarios:
    try:
        response = requests.post(f"{BASE_URL}/register", json=usuario)
        
        if response.status_code == 200:
            print(f"✅ {usuario['username']} - Registrado correctamente")
            exitosos += 1
        else:
            print(f"❌ {usuario['username']} - Error: {response.json().get('detail', 'Desconocido')}")
            fallidos += 1
    except Exception as e:
        print(f"❌ {usuario['username']} - Error de conexión: {e}")
        fallidos += 1

print("=" * 50)
print(f"📊 Resumen: {exitosos} exitosos, {fallidos} fallidos")