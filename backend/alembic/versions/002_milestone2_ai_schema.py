"""migration for milestone 2: AI translation, NER, terminology, symptoms & knowledge base

Revision ID: 002_milestone2_ai_schema
Revises: 001_initial_schema
Create Date: 2026-11-19 12:00:00

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '002_milestone2_ai_schema'
down_revision: Union[str, None] = '001_initial_schema'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    # 1. translation_histories
    op.create_table(
        'translation_histories',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('patient_id', sa.Integer(), sa.ForeignKey('patient_profiles.id', ondelete='CASCADE'), nullable=True),
        sa.Column('document_id', sa.Integer(), sa.ForeignKey('medical_documents.id', ondelete='SET NULL'), nullable=True),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id', ondelete='SET NULL'), nullable=True),
        sa.Column('document_title', sa.String(255), nullable=True),
        sa.Column('document_type', sa.String(50), nullable=True),
        sa.Column('source_language', sa.String(50), nullable=False, server_default='English'),
        sa.Column('target_language', sa.String(50), nullable=False),
        sa.Column('original_text', sa.Text(), nullable=False),
        sa.Column('translated_text', sa.Text(), nullable=False),
        sa.Column('confidence_score', sa.Float(), nullable=False, server_default='0.95'),
        sa.Column('translation_engine', sa.String(100), nullable=False, server_default='AarogyaSeva Neural Translator'),
        sa.Column('status', sa.String(50), nullable=False, server_default='Completed'),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index('ix_translation_histories_patient_id', 'translation_histories', ['patient_id'])
    op.create_index('ix_translation_histories_document_id', 'translation_histories', ['document_id'])

    # 2. extracted_medical_entities
    op.create_table(
        'extracted_medical_entities',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('patient_id', sa.Integer(), sa.ForeignKey('patient_profiles.id', ondelete='CASCADE'), nullable=True),
        sa.Column('document_id', sa.Integer(), sa.ForeignKey('medical_documents.id', ondelete='SET NULL'), nullable=True),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id', ondelete='SET NULL'), nullable=True),
        sa.Column('source_type', sa.String(50), nullable=False, server_default='prescription'),
        sa.Column('source_text', sa.Text(), nullable=False),
        sa.Column('diseases_json', sa.Text(), nullable=False, server_default='[]'),
        sa.Column('medications_json', sa.Text(), nullable=False, server_default='[]'),
        sa.Column('treatment_instructions_json', sa.Text(), nullable=False, server_default='[]'),
        sa.Column('symptoms_json', sa.Text(), nullable=True, server_default='[]'),
        sa.Column('medical_terms_json', sa.Text(), nullable=True, server_default='[]'),
        sa.Column('total_entities_count', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('confidence_score', sa.Float(), nullable=False, server_default='0.92'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index('ix_extracted_entities_patient_id', 'extracted_medical_entities', ['patient_id'])
    op.create_index('ix_extracted_entities_document_id', 'extracted_medical_entities', ['document_id'])

    # 3. symptom_information
    op.create_table(
        'symptom_information',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('symptom_name', sa.String(200), nullable=False, unique=True),
        sa.Column('symptom_name_hi', sa.String(200), nullable=True),
        sa.Column('symptom_name_te', sa.String(200), nullable=True),
        sa.Column('category', sa.String(100), nullable=False, server_default='General'),
        sa.Column('urgency_level', sa.String(50), nullable=False, server_default='Moderate'),
        sa.Column('description_en', sa.Text(), nullable=False),
        sa.Column('description_hi', sa.Text(), nullable=True),
        sa.Column('description_te', sa.Text(), nullable=True),
        sa.Column('possible_causes_en', sa.Text(), nullable=False),
        sa.Column('possible_causes_hi', sa.Text(), nullable=True),
        sa.Column('possible_causes_te', sa.Text(), nullable=True),
        sa.Column('self_care_advice_en', sa.Text(), nullable=True),
        sa.Column('self_care_advice_hi', sa.Text(), nullable=True),
        sa.Column('self_care_advice_te', sa.Text(), nullable=True),
        sa.Column('when_to_see_doctor_en', sa.Text(), nullable=False),
        sa.Column('when_to_see_doctor_hi', sa.Text(), nullable=True),
        sa.Column('when_to_see_doctor_te', sa.Text(), nullable=True),
        sa.Column('related_faqs_json', sa.Text(), nullable=True, server_default='[]'),
        sa.Column('is_verified', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('reference_source', sa.String(255), nullable=False, server_default='National Health Portal / WHO Guidelines'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index('ix_symptom_info_name', 'symptom_information', ['symptom_name'], unique=True)
    op.create_index('ix_symptom_info_category', 'symptom_information', ['category'])

    # 4. healthcare_knowledge_base
    op.create_table(
        'healthcare_knowledge_base',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('title_en', sa.String(255), nullable=False),
        sa.Column('title_hi', sa.String(255), nullable=True),
        sa.Column('title_te', sa.String(255), nullable=True),
        sa.Column('category', sa.String(100), nullable=False),
        sa.Column('tags', sa.String(255), nullable=True),
        sa.Column('summary_en', sa.Text(), nullable=True),
        sa.Column('summary_hi', sa.Text(), nullable=True),
        sa.Column('summary_te', sa.Text(), nullable=True),
        sa.Column('content_en', sa.Text(), nullable=False),
        sa.Column('content_hi', sa.Text(), nullable=True),
        sa.Column('content_te', sa.Text(), nullable=True),
        sa.Column('reference_source', sa.String(255), nullable=False, server_default='MoHFW / WHO Guidelines'),
        sa.Column('is_verified', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('created_by_id', sa.Integer(), sa.ForeignKey('users.id', ondelete='SET NULL'), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index('ix_hkb_title_en', 'healthcare_knowledge_base', ['title_en'])
    op.create_index('ix_hkb_category', 'healthcare_knowledge_base', ['category'])

    # 5. medical_terminology
    op.create_table(
        'medical_terminology',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('term', sa.String(200), nullable=False, unique=True),
        sa.Column('category', sa.String(100), nullable=False, server_default='General Clinical'),
        sa.Column('simple_explanation_en', sa.Text(), nullable=False),
        sa.Column('simple_explanation_hi', sa.Text(), nullable=False),
        sa.Column('simple_explanation_te', sa.Text(), nullable=False),
        sa.Column('clinical_context', sa.Text(), nullable=True),
        sa.Column('example_usage', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index('ix_med_term_term', 'medical_terminology', ['term'], unique=True)
    op.create_index('ix_med_term_category', 'medical_terminology', ['category'])

def downgrade() -> None:
    op.drop_table('medical_terminology')
    op.drop_table('healthcare_knowledge_base')
    op.drop_table('symptom_information')
    op.drop_table('extracted_medical_entities')
    op.drop_table('translation_histories')
