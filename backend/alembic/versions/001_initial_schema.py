"""initial migration: 10 core entities for milestone 1

Revision ID: 001_initial_schema
Revises: 
Create Date: 2026-11-13 17:30:00

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '001_initial_schema'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    # 1. users
    op.create_table(
        'users',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('email', sa.String(255), nullable=False, unique=True),
        sa.Column('hashed_password', sa.String(255), nullable=False),
        sa.Column('role', sa.String(50), nullable=False, server_default='patient'),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index('ix_users_email', 'users', ['email'], unique=True)
    op.create_index('ix_users_role', 'users', ['role'])

    # 2. patient_profiles
    op.create_table(
        'patient_profiles',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, unique=True),
        sa.Column('full_name', sa.String(200), nullable=False),
        sa.Column('phone_number', sa.String(20), nullable=False),
        sa.Column('date_of_birth', sa.String(50), nullable=True),
        sa.Column('gender', sa.String(20), nullable=False),
        sa.Column('address', sa.Text(), nullable=True),
        sa.Column('village', sa.String(100), nullable=False),
        sa.Column('district', sa.String(100), nullable=False),
        sa.Column('state', sa.String(100), nullable=False),
        sa.Column('preferred_language', sa.String(50), nullable=False, server_default='English'),
        sa.Column('blood_group', sa.String(10), nullable=True),
        sa.Column('emergency_contact', sa.String(50), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index('ix_patient_profiles_full_name', 'patient_profiles', ['full_name'])
    op.create_index('ix_patient_profiles_village', 'patient_profiles', ['village'])
    op.create_index('ix_patient_profiles_district', 'patient_profiles', ['district'])

    # 3. healthcare_worker_profiles
    op.create_table(
        'healthcare_worker_profiles',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, unique=True),
        sa.Column('full_name', sa.String(200), nullable=False),
        sa.Column('phone_number', sa.String(20), nullable=False),
        sa.Column('qualification', sa.String(100), nullable=False),
        sa.Column('healthcare_facility', sa.String(200), nullable=False),
        sa.Column('designation', sa.String(100), nullable=False),
        sa.Column('license_number', sa.String(100), nullable=True),
        sa.Column('address', sa.Text(), nullable=True),
        sa.Column('preferred_language', sa.String(50), nullable=False, server_default='English'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index('ix_worker_facility', 'healthcare_worker_profiles', ['healthcare_facility'])

    # 4. medical_documents
    op.create_table(
        'medical_documents',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('patient_id', sa.Integer(), sa.ForeignKey('patient_profiles.id', ondelete='CASCADE'), nullable=False),
        sa.Column('uploaded_by_id', sa.Integer(), sa.ForeignKey('users.id', ondelete='SET NULL'), nullable=True),
        sa.Column('document_type', sa.String(50), nullable=False),
        sa.Column('title', sa.String(255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('file_name', sa.String(255), nullable=False),
        sa.Column('original_filename', sa.String(255), nullable=False),
        sa.Column('file_path', sa.String(500), nullable=False),
        sa.Column('file_size', sa.BigInteger(), nullable=False),
        sa.Column('mime_type', sa.String(100), nullable=False),
        sa.Column('status', sa.String(50), nullable=False, server_default='Verified'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index('ix_medical_documents_type', 'medical_documents', ['document_type'])

    # 5. prescriptions
    op.create_table(
        'prescriptions',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('patient_id', sa.Integer(), sa.ForeignKey('patient_profiles.id', ondelete='CASCADE'), nullable=False),
        sa.Column('document_id', sa.Integer(), sa.ForeignKey('medical_documents.id', ondelete='SET NULL'), nullable=True),
        sa.Column('doctor_name', sa.String(200), nullable=False),
        sa.Column('facility_name', sa.String(200), nullable=False),
        sa.Column('prescription_date', sa.String(50), nullable=False),
        sa.Column('diagnosis', sa.String(255), nullable=False),
        sa.Column('medications_text', sa.Text(), nullable=False),
        sa.Column('dosage_instructions', sa.Text(), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    # 6. discharge_summaries
    op.create_table(
        'discharge_summaries',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('patient_id', sa.Integer(), sa.ForeignKey('patient_profiles.id', ondelete='CASCADE'), nullable=False),
        sa.Column('document_id', sa.Integer(), sa.ForeignKey('medical_documents.id', ondelete='SET NULL'), nullable=True),
        sa.Column('hospital_name', sa.String(200), nullable=False),
        sa.Column('doctor_name', sa.String(200), nullable=False),
        sa.Column('admission_date', sa.String(50), nullable=False),
        sa.Column('discharge_date', sa.String(50), nullable=False),
        sa.Column('admission_reason', sa.String(255), nullable=True),
        sa.Column('final_diagnosis', sa.String(255), nullable=False),
        sa.Column('treatment_summary', sa.Text(), nullable=False),
        sa.Column('discharge_advice', sa.Text(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    # 7. medical_reports
    op.create_table(
        'medical_reports',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('patient_id', sa.Integer(), sa.ForeignKey('patient_profiles.id', ondelete='CASCADE'), nullable=False),
        sa.Column('document_id', sa.Integer(), sa.ForeignKey('medical_documents.id', ondelete='SET NULL'), nullable=True),
        sa.Column('lab_name', sa.String(200), nullable=False),
        sa.Column('report_type', sa.String(100), nullable=False),
        sa.Column('test_date', sa.String(50), nullable=False),
        sa.Column('key_findings', sa.Text(), nullable=False),
        sa.Column('results_summary', sa.Text(), nullable=True),
        sa.Column('is_normal', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    # 8. medical_records
    op.create_table(
        'medical_records',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('patient_id', sa.Integer(), sa.ForeignKey('patient_profiles.id', ondelete='CASCADE'), nullable=False),
        sa.Column('recorded_by_id', sa.Integer(), sa.ForeignKey('users.id', ondelete='SET NULL'), nullable=True),
        sa.Column('record_type', sa.String(100), nullable=False),
        sa.Column('diagnosis_summary', sa.String(255), nullable=False),
        sa.Column('symptoms', sa.Text(), nullable=False),
        sa.Column('vital_signs', sa.Text(), nullable=True),
        sa.Column('clinical_notes', sa.Text(), nullable=True),
        sa.Column('treatment_plan', sa.Text(), nullable=True),
        sa.Column('record_date', sa.String(50), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    # 9. patient_histories
    op.create_table(
        'patient_histories',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('patient_id', sa.Integer(), sa.ForeignKey('patient_profiles.id', ondelete='CASCADE'), nullable=False),
        sa.Column('recorded_by_id', sa.Integer(), sa.ForeignKey('users.id', ondelete='SET NULL'), nullable=True),
        sa.Column('event_type', sa.String(100), nullable=False),
        sa.Column('title', sa.String(255), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('event_date', sa.String(50), nullable=False),
        sa.Column('metadata_json', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    # 10. healthcare_content
    op.create_table(
        'healthcare_content',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('author_id', sa.Integer(), sa.ForeignKey('users.id', ondelete='SET NULL'), nullable=True),
        sa.Column('title', sa.String(255), nullable=False),
        sa.Column('category', sa.String(100), nullable=False),
        sa.Column('summary', sa.Text(), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('language', sa.String(50), nullable=False, server_default='English'),
        sa.Column('read_time_minutes', sa.Integer(), nullable=False, server_default='3'),
        sa.Column('is_published', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('tags', sa.String(255), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    # 11. activity_logs
    op.create_table(
        'activity_logs',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=True),
        sa.Column('action', sa.String(100), nullable=False),
        sa.Column('resource_type', sa.String(50), nullable=True),
        sa.Column('resource_id', sa.String(50), nullable=True),
        sa.Column('details', sa.Text(), nullable=True),
        sa.Column('ip_address', sa.String(50), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

def downgrade() -> None:
    op.drop_table('activity_logs')
    op.drop_table('healthcare_content')
    op.drop_table('patient_histories')
    op.drop_table('medical_records')
    op.drop_table('medical_reports')
    op.drop_table('discharge_summaries')
    op.drop_table('prescriptions')
    op.drop_table('medical_documents')
    op.drop_table('healthcare_worker_profiles')
    op.drop_table('patient_profiles')
    op.drop_table('users')

