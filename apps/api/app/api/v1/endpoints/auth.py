# TODO: JWT Authentication and RBAC endpoints
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from app.schemas.user import Token, UserResponse, UserCreate

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

@router.post("/register", response_model=UserResponse)
def register(user_in: UserCreate):
    # TODO: Create user with hashed password in database
    return {"id": "placeholder-user-id", "email": user_in.email, "name": user_in.name, "role": user_in.role}

@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    # TODO: Verify credentials and issue JWT bearer token
    return {"access_token": "placeholder-jwt-token", "token_type": "bearer"}

@router.get("/me", response_model=UserResponse)
def get_current_user(token: str = Depends(oauth2_scheme)):
    # TODO: Decode token and return authenticated user details
    return {"id": "placeholder-user-id", "email": "user@campus.edu", "name": "Campus User", "role": "STUDENT"}
