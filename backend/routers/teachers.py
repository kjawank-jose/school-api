from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from models import TeacherDB, UserDB
from schemas import TeacherCreate, TeacherResponse, TeacherBulkCreate
from dependencies import get_db, require_role, get_current_user
from models import RolUsuario

router = APIRouter(prefix="/teachers", tags=["Profesores"])

@router.post("/", summary="Registrar un nuevo profesor (solo ADMIN)")
def create_teacher(
    teacher: TeacherCreate,
    db: Session = Depends(get_db),
    current_user: UserDB = Depends(require_role([RolUsuario.ADMIN]))
):
    db_teacher = TeacherDB(name=teacher.name, subject=teacher.subject)
    db.add(db_teacher)
    db.commit()
    db.refresh(db_teacher)
    return {"message": "Profesor registrado", "data": db_teacher}

@router.post("/bulk", summary="Registrar múltiples profesores (solo ADMIN)")
def create_teachers_bulk(
    data: TeacherBulkCreate,
    db: Session = Depends(get_db),
    current_user: UserDB = Depends(require_role([RolUsuario.ADMIN]))
):
    created = []
    for teacher_data in data.teachers:
        db_teacher = TeacherDB(name=teacher_data.name, subject=teacher_data.subject)
        db.add(db_teacher)
        created.append(teacher_data.name)
    
    db.commit()
    return {
        "message": f"{len(created)} profesores registrados",
        "created": created
    }

@router.get("/", summary="Listar todos los profesores")
def get_teachers(
    db: Session = Depends(get_db),
    current_user: UserDB = Depends(get_current_user)
):
    return db.query(TeacherDB).all()