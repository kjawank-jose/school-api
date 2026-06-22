from sqlalchemy import Column, Integer, String, Float, Enum, ForeignKey, Date
from sqlalchemy.orm import relationship
from database import Base
import enum

class NivelEscolar(str, enum.Enum):
    INICIAL = "INICIAL"
    PRIMARIA = "PRIMARIA"
    SECUNDARIA = "SECUNDARIA"

class EstadoAsistencia(str, enum.Enum):
    PRESENTE = "PRESENTE"
    FALTA = "FALTA"
    TARDANZA = "TARDANZA"
    JUSTIFICADO = "JUSTIFICADO"

class RolUsuario(str, enum.Enum):
    ADMIN = "ADMIN"
    TEACHER = "TEACHER"
    PARENT = "PARENT"

class UserDB(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    full_name = Column(String)
    role = Column(Enum(RolUsuario))
    student_id = Column(Integer, ForeignKey("students.id"), nullable=True)
    teacher_id = Column(Integer, ForeignKey("teachers.id"), nullable=True)

class TeacherDB(Base):
    __tablename__ = "teachers"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    subject = Column(String)
    students = relationship("StudentDB", back_populates="teacher")
    user = relationship("UserDB", back_populates="teacher_profile", uselist=False)

class StudentDB(Base):
    __tablename__ = "students"
    id = Column(Integer, primary_key=True, index=True)
    dni = Column(String(8), unique=True, index=True, nullable=False)  # 🆕 DNI del estudiante
    name = Column(String, index=True)
    level = Column(Enum(NivelEscolar))
    grade_level = Column(String)
    teacher_id = Column(Integer, ForeignKey("teachers.id"))
    
    teacher = relationship("TeacherDB", back_populates="students")
    grades = relationship("GradeDB", back_populates="student")
    attendance = relationship("AttendanceDB", back_populates="student")
    parent_user = relationship("UserDB", back_populates="student_profile", uselist=False)

class GradeDB(Base):
    __tablename__ = "grades"
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"))
    subject = Column(String)
    score = Column(Float)
    period = Column(String)
    student = relationship("StudentDB", back_populates="grades")

class AttendanceDB(Base):
    __tablename__ = "attendance"
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"))
    date = Column(Date, index=True)
    status = Column(Enum(EstadoAsistencia))
    observations = Column(String, nullable=True)
    student = relationship("StudentDB", back_populates="attendance")

# Relaciones inversas
UserDB.teacher_profile = relationship("TeacherDB", back_populates="user", foreign_keys=[UserDB.teacher_id])
UserDB.student_profile = relationship("StudentDB", back_populates="parent_user", foreign_keys=[UserDB.student_id])