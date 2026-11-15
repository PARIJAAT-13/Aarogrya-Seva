from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Boolean, func
from sqlalchemy.orm import relationship
from app.database.session import Base

class HealthcareContent(Base):
    __tablename__ = "healthcare_content"

    id = Column(Integer, primary_key=True, index=True)
    author_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    title = Column(String(255), nullable=False, index=True)
    category = Column(String(100), nullable=False, index=True) # General Healthcare, Preventive Healthcare, Maternal Health, Child Healthcare, Elderly Care, Common Diseases
    summary = Column(Text, nullable=False)
    content = Column(Text, nullable=False)
    language = Column(String(50), default="English", nullable=False, index=True)
    read_time_minutes = Column(Integer, default=3, nullable=False)
    is_published = Column(Boolean, default=True, nullable=False, index=True)
    tags = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    author = relationship("User", foreign_keys=[author_id])

