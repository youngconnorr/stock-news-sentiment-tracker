from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app.routes import news

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Stock News Aggregator")

# Register routers
app.include_router(news.router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Update for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {"message": "Stock News Aggregator API"}


@app.get("/api/health")
async def health():
    return {"status": "healthy"}
