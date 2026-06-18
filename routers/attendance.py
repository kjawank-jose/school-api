from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from models import AttendanceDB, StudentDB, UserDB, RolUsuario, EstadoAsistencia
from schemas import AttendanceCreate, AttendanceBulkCreate
from dependencies import get_db, require_role, get_current_user
from datetime import date

router = APIRouter(prefix="/attendance", tags=["Asistencia"])

@router.post("/", summary="Marcar asistencia (solo TEACHER o ADMIN)")
def create_attendance(
    record: AttendanceCreate,
    db: Session = Depends(get_db),
    current_user: UserDB = Depends(require_role([RolUsuario.TEACHER, RolUsuario.ADMIN]))
):
    student = db.query(StudentDB).filter(StudentDB.id == record.student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Alumno no encontrado")
    
    existing = db.query(AttendanceDB).filter(
        AttendanceDB.student_id == record.student_id,
        AttendanceDB.date == record.date
    ).first()
    if existing:
        raise HTTPException(
            status_code=400,
            detail=f"Ya existe un registro de asistencia para este alumno en {record.date}"
        )
    
    db_record = AttendanceDB(
        student_id=record.student_id,
        date=record.date,
        status=record.status,
        observations=record.observations
    )
    db.add(db_record)
    db.commit()
    db.refresh(db_record)
    return {"message": "Asistencia registrada", "data": db_record}

@router.post("/bulk", summary="Marcar asistencia masiva (solo TEACHER o ADMIN)")
def create_attendance_bulk(
    data: AttendanceBulkCreate,
    db: Session = Depends(get_db),
    current_user: UserDB = Depends(require_role([RolUsuario.TEACHER, RolUsuario.ADMIN]))
):
    created = []
    errors = []
    
    for item in data.records:
        student = db.query(StudentDB).filter(StudentDB.id == item.student_id).first()
        if not student:
            errors.append(f"Alumno ID {item.student_id} no existe")
            continue
        
        existing = db.query(AttendanceDB).filter(
            AttendanceDB.student_id == item.student_id,
            AttendanceDB.date == data.date
        ).first()
        if existing:
            errors.append(f"Alumno ID {item.student_id} ya tiene registro en {data.date}")
            continue
        
        db_record = AttendanceDB(
            student_id=item.student_id,
            date=data.date,
            status=item.status,
            observations=item.observations
        )
        db.add(db_record)
        created.append(item.student_id)
    
    db.commit()
    return {
        "message": f"Asistencia procesada: {len(created)} registros creados",
        "created": created,
        "errors": errors
    }

@router.get("/student/{student_id}", summary="Ver historial de asistencia")
def get_student_attendance(
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
    
    records = db.query(AttendanceDB).filter(
        AttendanceDB.student_id == student_id
    ).order_by(AttendanceDB.date.desc()).all()
    
    total = len(records)
    presentes = sum(1 for r in records if r.status == EstadoAsistencia.PRESENTE)
    faltas = sum(1 for r in records if r.status == EstadoAsistencia.FALTA)
    tardanzas = sum(1 for r in records if r.status == EstadoAsistencia.TARDANZA)
    justificados = sum(1 for r in records if r.status == EstadoAsistencia.JUSTIFICADO)
    porcentaje = (presentes / total * 100) if total > 0 else 0
    
    return {
        "student": student.name,
        "stats": {
            "total_dias": total,
            "presentes": presentes,
            "faltas": faltas,
            "tardanzas": tardanzas,
            "justificados": justificados,
            "porcentaje_asistencia": round(porcentaje, 2)
        },
        "records": [
            {"date": str(r.date), "status": r.status.value, "observations": r.observations}
            for r in records
        ]
    }

@router.get("/date/{fecha}", summary="Ver asistencia de un día (solo TEACHER o ADMIN)")
def get_attendance_by_date(
    fecha: date,
    db: Session = Depends(get_db),
    current_user: UserDB = Depends(require_role([RolUsuario.TEACHER, RolUsuario.ADMIN]))
):
    records = db.query(AttendanceDB).filter(AttendanceDB.date == fecha).all()
    return {
        "date": str(fecha),
        "total_registros": len(records),
        "records": [
            {
                "student_id": r.student_id,
                "student_name": r.student.name,
                "level": r.student.level.value,
                "grade": r.student.grade_level,
                "status": r.status.value,
                "observations": r.observations
            }
            for r in records
        ]
    }