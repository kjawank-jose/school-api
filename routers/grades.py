from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from models import GradeDB, StudentDB, UserDB, RolUsuario
from schemas import GradeCreate, GradeBulkCreate
from dependencies import get_db, require_role

router = APIRouter(prefix="/grades", tags=["Calificaciones"])

@router.post("/", summary="Registrar una calificación (solo TEACHER o ADMIN)")
def create_grade(
    grade: GradeCreate,
    student_id: int,
    db: Session = Depends(get_db),
    current_user: UserDB = Depends(require_role([RolUsuario.TEACHER, RolUsuario.ADMIN]))
):
    if not (0 <= grade.score <= 20):
        raise HTTPException(status_code=400, detail="La nota debe estar entre 0 y 20")
    
    student = db.query(StudentDB).filter(StudentDB.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Alumno no encontrado")
    
    db_grade = GradeDB(
        student_id=student_id,
        subject=grade.subject,
        score=grade.score,
        period=grade.period
    )
    db.add(db_grade)
    db.commit()
    db.refresh(db_grade)
    return {"message": "Calificación registrada", "data": db_grade}

@router.post("/bulk", summary="Registrar múltiples calificaciones (solo TEACHER o ADMIN)")
def create_grades_bulk(
    data: GradeBulkCreate,
    db: Session = Depends(get_db),
    current_user: UserDB = Depends(require_role([RolUsuario.TEACHER, RolUsuario.ADMIN]))
):
    created = []
    errors = []
    
    for grade_data in data.grades:
        if not (0 <= grade_data.score <= 20):
            errors.append(f"Nota inválida para alumno {grade_data.student_id}")
            continue
        
        student = db.query(StudentDB).filter(StudentDB.id == grade_data.student_id).first()
        if not student:
            errors.append(f"Alumno ID {grade_data.student_id} no existe")
            continue
        
        db_grade = GradeDB(
            student_id=grade_data.student_id,
            subject=grade_data.subject,
            score=grade_data.score,
            period=grade_data.period
        )
        db.add(db_grade)
        created.append(f"Alumno {grade_data.student_id} - {grade_data.subject}")
    
    db.commit()
    return {
        "message": f"{len(created)} calificaciones registradas",
        "created": created,
        "errors": errors
    }