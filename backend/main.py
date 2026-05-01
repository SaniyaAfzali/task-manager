from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy import create_engine, Column, Integer, String, Boolean, DateTime, ForeignKey, Text, Enum
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session, relationship
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timedelta
from passlib.context import CryptContext
import jwt
import enum
from database import Base,engine 
Base.metdata.create_all(bind=engine)
DATABASE_URL = "sqlite:////tmp/taskmanager.db"
SECRET_KEY = "taskmanager-secret-key-2026"
ALGORITHM = "HS256"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class RoleEnum(str, enum.Enum):
    admin = "admin"
    member = "member"

class StatusEnum(str, enum.Enum):
    todo = "todo"
    in_progress = "in_progress"
    done = "done"

class PriorityEnum(str, enum.Enum):
    low = "low"
    medium = "medium"
    high = "high"

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(Enum(RoleEnum), default=RoleEnum.member)
    created_at = Column(DateTime, default=datetime.utcnow)
    tasks_assigned = relationship("Task", back_populates="assignee")

class Project(Base):
    __tablename__ = "projects"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    description = Column(Text, nullable=True)
    created_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    members = relationship("ProjectMember", back_populates="project")
    tasks = relationship("Task", back_populates="project")
    creator = relationship("User", foreign_keys=[created_by])

class ProjectMember(Base):
    __tablename__ = "project_members"
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    role = Column(Enum(RoleEnum), default=RoleEnum.member)
    project = relationship("Project", back_populates="members")
    user = relationship("User")

class Task(Base):
    __tablename__ = "tasks"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(Enum(StatusEnum), default=StatusEnum.todo)
    priority = Column(Enum(PriorityEnum), default=PriorityEnum.medium)
    project_id = Column(Integer, ForeignKey("projects.id"))
    assigned_to = Column(Integer, ForeignKey("users.id"), nullable=True)
    due_date = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    project = relationship("Project", back_populates="tasks")
    assignee = relationship("User", back_populates="tasks_assigned")

Base.metadata.create_all(bind=engine)

class UserCreate(BaseModel):
    name: str
    email: str
    password: str
    role: RoleEnum = RoleEnum.member

class UserLogin(BaseModel):
    email: str
    password: str

class UserOut(BaseModel):
    id: int
    name: str
    email: str
    role: RoleEnum
    class Config: from_attributes = True

class ProjectCreate(BaseModel):
    name: str
    description: Optional[str] = None

class ProjectOut(BaseModel):
    id: int
    name: str
    description: Optional[str]
    created_by: int
    created_at: datetime
    class Config: from_attributes = True

class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    status: StatusEnum = StatusEnum.todo
    priority: PriorityEnum = PriorityEnum.medium
    project_id: int
    assigned_to: Optional[int] = None
    due_date: Optional[datetime] = None

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[StatusEnum] = None
    priority: Optional[PriorityEnum] = None
    assigned_to: Optional[int] = None
    due_date: Optional[datetime] = None

class TaskOut(BaseModel):
    id: int
    title: str
    description: Optional[str]
    status: StatusEnum
    priority: PriorityEnum
    project_id: int
    assigned_to: Optional[int]
    due_date: Optional[datetime]
    created_at: datetime
    assignee: Optional[UserOut]
    class Config: from_attributes = True

class AddMember(BaseModel):
    user_id: int
    role: RoleEnum = RoleEnum.member

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)

def create_token(user_id: int) -> str:
    expire = datetime.utcnow() + timedelta(hours=24)
    return jwt.encode({"sub": str(user_id), "exp": expire}, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = int(payload["sub"])
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user

@app.post("/api/auth/signup")
def signup(data: UserCreate, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == data.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(
        name=data.name,
        email=data.email,
        hashed_password=hash_password(data.password),
        role=data.role
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return {
        "access_token": create_token(user.id),
        "user": {"id": user.id, "name": user.name, "email": user.email, "role": user.role}
    }

@app.post("/api/auth/login")
def login(data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return {
        "access_token": create_token(user.id),
        "user": {"id": user.id, "name": user.name, "email": user.email, "role": user.role}
    }

@app.get("/api/auth/me", response_model=UserOut)
def me(current_user: User = Depends(get_current_user)):
    return current_user

@app.get("/api/users", response_model=List[UserOut])
def list_users(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    return db.query(User).all()

@app.post("/api/projects", response_model=ProjectOut)
def create_project(data: ProjectCreate, db: Session = Depends(get_db),
                   current_user: User = Depends(get_current_user)):
    project = Project(name=data.name, description=data.description, created_by=current_user.id)
    db.add(project)
    db.commit()
    db.refresh(project)
    db.add(ProjectMember(project_id=project.id, user_id=current_user.id, role=RoleEnum.admin))
    db.commit()
    return project

@app.get("/api/projects", response_model=List[ProjectOut])
def list_projects(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role == RoleEnum.admin:
        return db.query(Project).all()
    member_ids = [pm.project_id for pm in db.query(ProjectMember).filter(ProjectMember.user_id == current_user.id).all()]
    return db.query(Project).filter(Project.id.in_(member_ids)).all() if member_ids else []
@app.delete("/api/projects/{project_id}")
def delete_project(project_id: int, db: Session = Depends(get_db),
                   current_user: User = Depends(get_current_user)):
    if current_user.role != RoleEnum.admin:
        raise HTTPException(status_code=403, detail="Admin only")
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    db.query(Task).filter(Task.project_id == project_id).delete()
    db.query(ProjectMember).filter(ProjectMember.project_id == project_id).delete()
    db.delete(project)
    db.commit()
    return {"message": "Project deleted"}
@app.get("/api/projects/{project_id}", response_model=ProjectOut)
def get_project(project_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project

@app.post("/api/projects/{project_id}/members")
def add_member(project_id: int, data: AddMember, db: Session = Depends(get_db),
               _: User = Depends(get_current_user)):
    existing = db.query(ProjectMember).filter(
        ProjectMember.project_id == project_id,
        ProjectMember.user_id == data.user_id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="User already a member")
    db.add(ProjectMember(project_id=project_id, user_id=data.user_id, role=data.role))
    db.commit()
    return {"message": "Member added"}

@app.get("/api/projects/{project_id}/members")
def get_members(project_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    members = db.query(ProjectMember).filter(ProjectMember.project_id == project_id).all()
    return [{"user_id": m.user_id, "role": m.role, "name": m.user.name, "email": m.user.email} for m in members]

@app.post("/api/tasks", response_model=TaskOut)
def create_task(data: TaskCreate, db: Session = Depends(get_db),
                _: User = Depends(get_current_user)):
    task = Task(**data.dict())
    db.add(task)
    db.commit()
    db.refresh(task)
    return task

@app.get("/api/tasks", response_model=List[TaskOut])
def list_tasks(project_id: Optional[int] = None, db: Session = Depends(get_db),
               current_user: User = Depends(get_current_user)):
    q = db.query(Task)
    if project_id:
        q = q.filter(Task.project_id == project_id)
    elif current_user.role != RoleEnum.admin:
        q = q.filter(Task.assigned_to == current_user.id)
    return q.all()

@app.patch("/api/tasks/{task_id}", response_model=TaskOut)
def update_task(task_id: int, data: TaskUpdate, db: Session = Depends(get_db),
                _: User = Depends(get_current_user)):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    for field, val in data.dict(exclude_unset=True).items():
        setattr(task, field, val)
    db.commit()
    db.refresh(task)
    return task

@app.delete("/api/tasks/{task_id}")
def delete_task(task_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    db.delete(task)
    db.commit()
    return {"message": "Task deleted"}

@app.get("/api/dashboard")
def dashboard(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    now = datetime.utcnow()
    if current_user.role == RoleEnum.admin:
        tasks = db.query(Task).all()
    else:
        tasks = db.query(Task).filter(Task.assigned_to == current_user.id).all()
    return {
        "total_tasks": len(tasks),
        "todo": sum(1 for t in tasks if t.status == StatusEnum.todo),
        "in_progress": sum(1 for t in tasks if t.status == StatusEnum.in_progress),
        "done": sum(1 for t in tasks if t.status == StatusEnum.done),
        "overdue": sum(1 for t in tasks if t.due_date and t.due_date < now and t.status != StatusEnum.done),
        "total_projects": db.query(Project).count() if current_user.role == RoleEnum.admin else 0,
        "total_users": db.query(User).count() if current_user.role == RoleEnum.admin else 0,
    }

@app.get("/")
def root():
    return {"message": "TaskFlow API is running!"}
