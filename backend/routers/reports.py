from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from models import StudentDB, GradeDB, AttendanceDB, TeacherDB, UserDB, RolUsuario, EstadoAsistencia
from dependencies import get_db, require_role, get_current_user
from datetime import date

router = APIRouter(prefix="/reports", tags=["Reportes"])

@router.get("/student/{student_id}/average", summary="Promedio general de un alumno")
def get_student_average(
    student_id: int,
    db: Session = Depends(get_db),
    current_user: UserDB = Depends(get_current_user)
):
    if current_user.role == RolUsuario.PARENT:
        if current_user.student_id != student_id:
            raise HTTPException(status_code=403, detail="No tienes permiso para ver este alumno")
    
    student = db.query(StudentDB).filter(StudentDB.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Alumno no encontrado")
    
    grades = db.query(GradeDB).filter(GradeDB.student_id == student_id).all()
    
    if not grades:
        return {
            "student_id": student_id,
            "student_name": student.name,
            "total_grades": 0,
            "average": 0,
            "status": "Sin calificaciones"
        }
    
    total = sum(g.score for g in grades)
    average = total / len(grades)
    
    if average >= 18:
        status = "Excelente"
    elif average >= 14:
        status = "Bueno"
    elif average >= 11:
        status = "Regular"
    else:
        status = "Bajo rendimiento"
    
    return {
        "student_id": student_id,
        "student_name": student.name,
        "level": student.level.value,
        "grade": student.grade_level,
        "total_grades": len(grades),
        "average": round(average, 2),
        "status": status
    }

@router.get("/low-performing-students", summary="Alumnos con bajo rendimiento")
def get_low_performing_students(
    threshold: float = 11.0,
    db: Session = Depends(get_db),
    current_user: UserDB = Depends(require_role([RolUsuario.ADMIN, RolUsuario.TEACHER]))
):
    students = db.query(StudentDB).all()
    low_performing = []
    
    for student in students:
        grades = db.query(GradeDB).filter(GradeDB.student_id == student.id).all()
        
        if not grades:
            continue
        
        average = sum(g.score for g in grades) / len(grades)
        
        if average < threshold:
            low_performing.append({
                "student_id": student.id,
                "student_name": student.name,
                "level": student.level.value,
                "grade": student.grade_level,
                "teacher": student.teacher.name if student.teacher else "Sin asignar",
                "average": round(average, 2),
                "total_grades": len(grades)
            })
    
    low_performing.sort(key=lambda x: x["average"])
    
    return {
        "threshold": threshold,
        "total_students": len(low_performing),
        "students": low_performing
    }

@router.get("/top-students", summary="Mejores alumnos del colegio")
def get_top_students(
    limit: int = 10,
    db: Session = Depends(get_db),
    current_user: UserDB = Depends(get_current_user)
):
    students = db.query(StudentDB).all()
    rankings = []
    
    for student in students:
        grades = db.query(GradeDB).filter(GradeDB.student_id == student.id).all()
        
        if not grades or len(grades) < 3:
            continue
        
        average = sum(g.score for g in grades) / len(grades)
        
        rankings.append({
            "student_id": student.id,
            "student_name": student.name,
            "level": student.level.value,
            "grade": student.grade_level,
            "average": round(average, 2),
            "total_grades": len(grades)
        })
    
    rankings.sort(key=lambda x: x["average"], reverse=True)
    
    return {
        "limit": limit,
        "total_students": len(rankings[:limit]),
        "students": rankings[:limit]
    }

@router.get("/attendance-summary", summary="Resumen de asistencia por período")
def get_attendance_summary(
    start_date: date,
    end_date: date,
    db: Session = Depends(get_db),
    current_user: UserDB = Depends(require_role([RolUsuario.ADMIN, RolUsuario.TEACHER]))
):
    records = db.query(AttendanceDB).filter(
        AttendanceDB.date >= start_date,
        AttendanceDB.date <= end_date
    ).all()
    
    if not records:
        return {
            "period": f"{start_date} a {end_date}",
            "total_records": 0,
            "summary": {}
        }
    
    total = len(records)
    presentes = sum(1 for r in records if r.status == EstadoAsistencia.PRESENTE)
    faltas = sum(1 for r in records if r.status == EstadoAsistencia.FALTA)
    tardanzas = sum(1 for r in records if r.status == EstadoAsistencia.TARDANZA)
    justificados = sum(1 for r in records if r.status == EstadoAsistencia.JUSTIFICADO)
    
    return {
        "period": f"{start_date} a {end_date}",
        "total_records": total,
        "summary": {
            "presentes": {
                "count": presentes,
                "percentage": round((presentes / total * 100), 2)
            },
            "faltas": {
                "count": faltas,
                "percentage": round((faltas / total * 100), 2)
            },
            "tardanzas": {
                "count": tardanzas,
                "percentage": round((tardanzas / total * 100), 2)
            },
            "justificados": {
                "count": justificados,
                "percentage": round((justificados / total * 100), 2)
            }
        }
    }

@router.get("/students-by-level", summary="Estadísticas por nivel educativo")
def get_students_by_level(
    db: Session = Depends(get_db),
    current_user: UserDB = Depends(get_current_user)
):
    levels = {
        "INICIAL": {"count": 0, "students": []},
        "PRIMARIA": {"count": 0, "students": []},
        "SECUNDARIA": {"count": 0, "students": []}
    }
    
    students = db.query(StudentDB).all()
    
    for student in students:
        level_name = student.level.value
        levels[level_name]["count"] += 1
        levels[level_name]["students"].append({
            "id": student.id,
            "name": student.name,
            "grade": student.grade_level
        })
    
    return {
        "total_students": len(students),
        "by_level": levels
    }

@router.get("/teacher-students/{teacher_id}", summary="Alumnos asignados a un profesor")
def get_teacher_students(
    teacher_id: int,
    db: Session = Depends(get_db),
    current_user: UserDB = Depends(get_current_user)
):
    teacher = db.query(TeacherDB).filter(TeacherDB.id == teacher_id).first()
    if not teacher:
        raise HTTPException(status_code=404, detail="Profesor no encontrado")
    
    students = db.query(StudentDB).filter(StudentDB.teacher_id == teacher_id).all()
    
    return {
        "teacher_id": teacher_id,
        "teacher_name": teacher.name,
        "subject": teacher.subject,
        "total_students": len(students),
        "students": [
            {
                "id": s.id,
                "name": s.name,
                "level": s.level.value,
                "grade": s.grade_level
            }
            for s in students
        ]
    }