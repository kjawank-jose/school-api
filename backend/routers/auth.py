from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from models import UserDB
from schemas import UserCreate, UserResponse, Token
from models import UserDB, RolUsuario
from dependencies import get_db, get_password_hash, verify_password, create_access_token, get_current_user, require_role

router = APIRouter(tags=["Autenticación"])

@router.post("/register", response_model=UserResponse, summary="Registrar un nuevo usuario")
def register(user: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(UserDB).filter(UserDB.username == user.username).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="El nombre de usuario ya existe")
    
    existing_email = db.query(UserDB).filter(UserDB.email == user.email).first()
    if existing_email:
        raise HTTPException(status_code=400, detail="El email ya está registrado")
    
    hashed_password = get_password_hash(user.password)
    db_user = UserDB(
        username=user.username,
        email=user.email,
        hashed_password=hashed_password,
        full_name=user.full_name,
        role=user.role,
        student_id=user.student_id,
        teacher_id=user.teacher_id
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@router.post("/register/bulk", summary="Registrar múltiples usuarios (solo ADMIN)")
def register_bulk(
    users: list[UserCreate],
    db: Session = Depends(get_db),
    current_user: UserDB = Depends(get_current_user)
):
    if current_user.role.value != "ADMIN":
        raise HTTPException(status_code=403, detail="Solo administradores pueden registrar usuarios masivamente")
    
    resultados = {"exitosos": [], "fallidos": []}
    
    for user_data in users:
        existing = db.query(UserDB).filter(
            (UserDB.username == user_data.username) | (UserDB.email == user_data.email)
        ).first()
        
        if existing:
            resultados["fallidos"].append({
                "username": user_data.username,
                "error": "Usuario o email ya existe"
            })
            continue
        
        hashed_password = get_password_hash(user_data.password)
        db_user = UserDB(
            username=user_data.username,
            email=user_data.email,
            hashed_password=hashed_password,
            full_name=user_data.full_name,
            role=user_data.role,
            student_id=user_data.student_id,
            teacher_id=user_data.teacher_id
        )
        db.add(db_user)
        resultados["exitosos"].append(user_data.username)
    
    db.commit()
    
    return {
        "message": f"Proceso completado: {len(resultados['exitosos'])} exitosos, {len(resultados['fallidos'])} fallidos",
        "resultados": resultados
    }

@router.post("/login", response_model=Token, summary="Iniciar sesión")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(UserDB).filter(UserDB.username == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario o contraseña incorrectos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(
        data={"sub": user.username, "role": user.role.value}
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/users", summary="Listar todos los usuarios (solo ADMIN)")
def get_all_users(
    db: Session = Depends(get_db),
    current_user: UserDB = Depends(require_role([RolUsuario.ADMIN]))
):
    """
    Lista todos los usuarios registrados en el sistema.
    Solo accesible para administradores.
    """
    users = db.query(UserDB).all()
    
    return {
        "total_users": len(users),
        "users": [
            {
                "id": u.id,
                "username": u.username,
                "email": u.email,
                "full_name": u.full_name,
                "role": u.role.value,
                "student_id": u.student_id,
                "teacher_id": u.teacher_id
            }
            for u in users
        ]
    }

@router.get("/me", response_model=UserResponse, summary="Ver información del usuario actual")
def get_me(current_user: UserDB = Depends(get_current_user)):
    return current_user

@router.post("/login/student", summary="Iniciar sesión como estudiante (DNI)")
def login_student(
    dni: str,
    password: str,
    db: Session = Depends(get_db)
):
    """
    Login de estudiantes usando su DNI como usuario.
    La contraseña por defecto es el DNI.
    """
    from models import StudentDB
    
    student = db.query(StudentDB).filter(StudentDB.dni == dni).first()
    
    if not student:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="DNI no encontrado",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # La contraseña por defecto es el DNI
    if password != dni:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Contraseña incorrecta",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(
        data={"sub": student.dni, "role": "STUDENT", "student_id": student.id}
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "student": {
            "id": student.id,
            "dni": student.dni,
            "name": student.name,
            "level": student.level.value,
            "grade": student.grade_level
        }
    }