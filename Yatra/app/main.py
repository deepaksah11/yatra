from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import Settings
from app.db.base import Base
from app.db.session import engine
from app.api.routes.auth import router as auth_router
from app.api.routes.totp import router as totp_router
from app.api.routes.otp import router as otp_router

settings = Settings()
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)
app.include_router(auth_router)
app.include_router(totp_router)
app.include_router(otp_router)

@app.get("/")
def home():
    return {"message": "Backend Working"}
