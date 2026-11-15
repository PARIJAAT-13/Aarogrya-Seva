from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel

class ContentCreate(BaseModel):
    title: str
    category: str # General Healthcare, Preventive Healthcare, Maternal Health, Child Healthcare, Elderly Care, Common Diseases
    summary: str
    content: str
    language: str = "English"
    read_time_minutes: int = 3
    is_published: bool = True
    tags: Optional[str] = None

class ContentUpdate(BaseModel):
    title: Optional[str] = None
    category: Optional[str] = None
    summary: Optional[str] = None
    content: Optional[str] = None
    language: Optional[str] = None
    read_time_minutes: Optional[int] = None
    is_published: Optional[bool] = None
    tags: Optional[str] = None

class ContentResponse(BaseModel):
    id: int
    author_id: Optional[int] = None
    author_name: Optional[str] = None
    title: str
    category: str
    summary: str
    content: str
    language: str
    read_time_minutes: int
    is_published: bool
    tags: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class ContentListResponse(BaseModel):
    total: int
    items: List[ContentResponse]

