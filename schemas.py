from pydantic import BaseModel, ConfigDict
from typing import List, Optional
from datetime import date
from models import NivelEscolar, EstadoAsistencia, RolUsuario

# Usuarios
class UserCreate(BaseModel):
    username: str
    email: str
    password: str
    full_name: str
    role: RolUsuario
    student_id: Optional[int] = None
    teacher_id: Optional[int] = None

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    full_name: str
    role: str
    model_config = ConfigDict(from_attributes=True)

class Token(BaseModel):
    access_token: str
    token_type: str

# Profesores
class TeacherCreate(BaseModel):
    name: str
    subject: str

class TeacherResponse(BaseModel):
    id: int
    name: str
    subject: str
    model_config = ConfigDict(from_attributes=True)

# Alumnos
class StudentCreate(BaseModel):
    name: str
    level: NivelEscolar
    grade_level: str
    teacher_id: int

class StudentResponse(BaseModel):
    id: int
    name: str
    level: str
    grade_level: str
    teacher_name: Optional[str] = None
    grades: List[dict] = []
    model_config = ConfigDict(from_attributes=True)

# Calificaciones
class GradeCreate(BaseModel):
    subject: str
    score: float
    period: str

class GradeResponse(BaseModel):
    id: int
    subject: str
    score: float
    period: str
    model_config = ConfigDict(from_attributes=True)

# Asistencia
class AttendanceCreate(BaseModel):
    student_id: int
    date: date
    status: EstadoAsistencia
    observations: Optional[str] = None

class AttendanceBulkItem(BaseModel):
    student_id: int
    status: EstadoAsistencia
    observations: Optional[str] = None

class AttendanceBulkCreate(BaseModel):
    date: date
    records: List[AttendanceBulkItem]

# Registros masivos
class TeacherBulkCreate(BaseModel):
    teachers: List[TeacherCreate]

class StudentBulkCreate(BaseModel):
    students: List[StudentCreate]

class GradeBulkItem(BaseModel):
    student_id: int
    subject: str
    score: float
    period: str

class GradeBulkCreate(BaseModel):
    grades: List[GradeBulkItem]