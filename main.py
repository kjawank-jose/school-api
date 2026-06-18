from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routers import auth, teachers, students, grades, attendance, reports

# Crear tablas
Base.metadata.create_all(bind=engine)

# Crear aplicación
app = FastAPI(
    title="Sistema de Gestión Escolar",
    version="4.0",
    description="API para gestión de colegio con autenticación y reportes"
)

# 🔥 CORS MIDDLEWARE - MUY IMPORTANTE
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir routers
app.include_router(auth.router)
app.include_router(teachers.router)
app.include_router(students.router)
app.include_router(grades.router)
app.include_router(attendance.router)
app.include_router(reports.router)

@app.get("/", tags=["Root"])
def root():
    return {
        "message": "Sistema de Gestión Escolar API",
        "version": "4.0",
        "docs": "/docs"
    }