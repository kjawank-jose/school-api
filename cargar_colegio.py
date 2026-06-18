import requests
import json

BASE_URL = "http://127.0.0.1:8000"

# Paso 1: Login
print("🔐 Iniciando sesión...")
login_response = requests.post(f"{BASE_URL}/login", data={
    "username": "admin",
    "password": "admin123"
})

if login_response.status_code != 200:
    print("❌ Error al iniciar sesión. Verifica que el usuario admin exista.")
    exit()

token = login_response.json()["access_token"]
headers = {"Authorization": f"Bearer {token}"}
print("✅ Login exitoso\n")

# Paso 2: Crear profesores
print("👨‍🏫 Registrando 15 profesores...")
teachers_data = {
    "teachers": [
        {"name": "María García", "subject": "Matemáticas"},
        {"name": "Juan Pérez", "subject": "Comunicación"},
        {"name": "Ana Rodríguez", "subject": "Ciencias"},
        {"name": "Carlos López", "subject": "Historia"},
        {"name": "Lucía Martínez", "subject": "Inglés"},
        {"name": "Pedro Sánchez", "subject": "Educación Física"},
        {"name": "Rosa Torres", "subject": "Arte"},
        {"name": "Miguel Castro", "subject": "Música"},
        {"name": "Carmen Díaz", "subject": "Religión"},
        {"name": "José Huamán", "subject": "Computación"},
        {"name": "Elena Rojas", "subject": "Aula 1ro Primaria"},
        {"name": "Luis Vargas", "subject": "Aula 2do Primaria"},
        {"name": "Patricia Flores", "subject": "Aula 3ro Primaria"},
        {"name": "Roberto Mendoza", "subject": "Aula 4to Primaria"},
        {"name": "Sandra Jiménez", "subject": "Aula 5to Primaria"}
    ]
}

response = requests.post(f"{BASE_URL}/teachers/bulk", json=teachers_data, headers=headers)
print(f"✅ {response.json()['message']}\n")

# Paso 3: Crear alumnos (10 alumnos de ejemplo en 3ro Primaria)
print("👨‍🎓 Registrando 10 alumnos en 3ro Primaria...")
students_data = {
    "students": [
        {"name": "Diego Ramírez", "level": "PRIMARIA", "grade_level": "3ro", "teacher_id": 13},
        {"name": "Sofía Vargas", "level": "PRIMARIA", "grade_level": "3ro", "teacher_id": 13},
        {"name": "Mateo López", "level": "PRIMARIA", "grade_level": "3ro", "teacher_id": 13},
        {"name": "Valentina Torres", "level": "PRIMARIA", "grade_level": "3ro", "teacher_id": 13},
        {"name": "Sebastián Castro", "level": "PRIMARIA", "grade_level": "3ro", "teacher_id": 13},
        {"name": "Isabella Rojas", "level": "PRIMARIA", "grade_level": "3ro", "teacher_id": 13},
        {"name": "Nicolás Díaz", "level": "PRIMARIA", "grade_level": "3ro", "teacher_id": 13},
        {"name": "Camila Huamán", "level": "PRIMARIA", "grade_level": "3ro", "teacher_id": 13},
        {"name": "Alejandro Mendoza", "level": "PRIMARIA", "grade_level": "3ro", "teacher_id": 13},
        {"name": "Mariana Jiménez", "level": "PRIMARIA", "grade_level": "3ro", "teacher_id": 13}
    ]
}

response = requests.post(f"{BASE_URL}/students/bulk", json=students_data, headers=headers)
print(f"✅ {response.json()['message']}\n")

# Paso 4: Crear calificaciones
print("📝 Registrando calificaciones...")
grades_data = {
    "grades": [
        {"student_id": 1, "subject": "Matemáticas", "score": 18, "period": "Bimestre 1"},
        {"student_id": 1, "subject": "Comunicación", "score": 17, "period": "Bimestre 1"},
        {"student_id": 1, "subject": "Ciencias", "score": 19, "period": "Bimestre 1"},
        {"student_id": 2, "subject": "Matemáticas", "score": 15, "period": "Bimestre 1"},
        {"student_id": 2, "subject": "Comunicación", "score": 16, "period": "Bimestre 1"},
        {"student_id": 2, "subject": "Ciencias", "score": 14, "period": "Bimestre 1"},
        {"student_id": 3, "subject": "Matemáticas", "score": 9, "period": "Bimestre 1"},
        {"student_id": 3, "subject": "Comunicación", "score": 10, "period": "Bimestre 1"},
        {"student_id": 3, "subject": "Ciencias", "score": 8, "period": "Bimestre 1"},
        {"student_id": 4, "subject": "Matemáticas", "score": 12, "period": "Bimestre 1"},
        {"student_id": 4, "subject": "Comunicación", "score": 13, "period": "Bimestre 1"},
        {"student_id": 5, "subject": "Matemáticas", "score": 20, "period": "Bimestre 1"},
        {"student_id": 5, "subject": "Comunicación", "score": 19, "period": "Bimestre 1"},
        {"student_id": 5, "subject": "Ciencias", "score": 20, "period": "Bimestre 1"}
    ]
}

response = requests.post(f"{BASE_URL}/grades/bulk", json=grades_data, headers=headers)
print(f"✅ {response.json()['message']}\n")

# Paso 5: Crear asistencia
print("📅 Registrando asistencia...")
attendance_data = {
    "date": "2026-06-18",
    "records": [
        {"student_id": 1, "status": "PRESENTE"},
        {"student_id": 2, "status": "PRESENTE"},
        {"student_id": 3, "status": "TARDANZA", "observations": "Llegó 15 min tarde"},
        {"student_id": 4, "status": "FALTA"},
        {"student_id": 5, "status": "JUSTIFICADO", "observations": "Cita médica"},
        {"student_id": 6, "status": "PRESENTE"},
        {"student_id": 7, "status": "PRESENTE"},
        {"student_id": 8, "status": "PRESENTE"},
        {"student_id": 9, "status": "TARDANZA", "observations": "Problemas con el bus"},
        {"student_id": 10, "status": "PRESENTE"}
    ]
}

response = requests.post(f"{BASE_URL}/attendance/bulk", json=attendance_data, headers=headers)
print(f"✅ {response.json()['message']}\n")

print("🎉 ¡Carga completa! Ya tienes datos para probar los reportes.")
print("👉 Ve a http://127.0.0.1:8000/docs para ver los endpoints de reportes.")