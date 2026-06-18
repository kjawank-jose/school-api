from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from models import StudentDB, TeacherDB, UserDB, RolUsuario
from schemas import StudentCreate, StudentResponse, StudentBulkCreate
from dependencies import get_db, require_role, get_current_user

router = APIRouter(prefix="/students", tags=["Alumnos"])

@router.post("/", summary="Matricular un nuevo alumno (solo ADMIN)")
def create_student(
    student: StudentCreate,
    db: Session = Depends(get_db),
    current_user: UserDB = Depends(require_role([RolUsuario.ADMIN]))
):
    teacher = db.query(TeacherDB).filter(TeacherDB.id == student.teacher_id).first()
    if not teacher:
        raise HTTPException(status_code=404, detail="Profesor no encontrado")
    
    db_student = StudentDB(
        name=student.name,
        level=student.level,
        grade_level=student.grade_level,
        teacher_id=student.teacher_id
    )
    db.add(db_student)
    db.commit()
    db.refresh(db_student)
    return {"message": "Alumno matriculado", "data": db_student}

@router.post("/bulk", summary="Matricular múltiples alumnos (solo ADMIN)")
def create_students_bulk(
    data: StudentBulkCreate,
    db: Session = Depends(get_db),
    current_user: UserDB = Depends(require_role([RolUsuario.ADMIN]))
):
    created = []
    errors = []
    
    for student_data in data.students:
        teacher = db.query(TeacherDB).filter(TeacherDB.id == student_data.teacher_id).first()
        if not teacher:
            errors.append(f"Profesor ID {student_data.teacher_id} no existe para alumno {student_data.name}")
            continue
        
        db_student = StudentDB(
            name=student_data.name,
            level=student_data.level,
            grade_level=student_data.grade_level,
            teacher_id=student_data.teacher_id
        )
        db.add(db_student)
        created.append(student_data.name)
    
    db.commit()
    return {
        "message": f"{len(created)} alumnos matriculados",
        "created": created,
        "errors": errors
    }

@router.get("/", summary="Listar todos los alumnos")
def get_all_students(
    db: Session = Depends(get_db),
    current_user: UserDB = Depends(get_current_user)
):
    """
    Lista todos los alumnos del colegio con información del profesor asignado.
    """
    students = db.query(StudentDB).all()
    
    return [
        {
            "id": s.id,
            "name": s.name,
            "level": s.level.value,
            "grade_level": s.grade_level,
            "teacher_id": s.teacher_id,
            "teacher_name": s.teacher.name if s.teacher else None
        }
        for s in students
    ]

@router.get("/{student_id}", response_model=StudentResponse, summary="Ver ficha del alumno")
def get_student(
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
    
    return {
        "id": student.id,
        "name": student.name,
        "level": student.level.value,
        "grade_level": student.grade_level,
        "teacher_name": student.teacher.name if student.teacher else None,
        "grades": [{"subject": g.subject, "score": g.score, "period": g.period} for g in student.grades]
    }