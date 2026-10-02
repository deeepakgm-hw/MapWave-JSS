"""Initial geospatial models migration

Revision ID: 001_initial_geospatial_models
Revises: 
Create Date: 2026-10-02 16:35:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
import geoalchemy2

# revision identifiers, used by Alembic.
revision: str = '001_initial_geospatial_models'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. users table
    op.create_table(
        'users',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('email', sa.String(), nullable=False),
        sa.Column('hashed_password', sa.String(), nullable=False),
        sa.Column('role', sa.Enum('student', 'faculty', 'admin', name='user_role'), nullable=False, server_default='student'),
        sa.Column('college_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)

    # 2. buildings table
    op.create_table(
        'buildings',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('college_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('status', sa.Enum('existing', 'proposed', name='building_status'), nullable=False, server_default='existing'),
        sa.Column('footprint', geoalchemy2.types.Geometry(geometry_type='POLYGON', srid=4326, from_text='ST_GeomFromEWKT', name='geometry'), nullable=True),
        sa.Column('height_m', sa.Float(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
    )

    # 3. floors table
    op.create_table(
        'floors',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('building_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('buildings.id', ondelete='CASCADE'), nullable=False),
        sa.Column('level_number', sa.Integer(), nullable=False),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
    )

    # 4. rooms table
    op.create_table(
        'rooms',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('floor_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('floors.id', ondelete='CASCADE'), nullable=False),
        sa.Column('room_code', sa.String(), nullable=False),
        sa.Column('name', sa.String(), nullable=True),
        sa.Column('room_type', sa.String(), nullable=False, server_default='CLASSROOM'),
        sa.Column('occupant_name', sa.String(), nullable=True),
        sa.Column('department', sa.String(), nullable=True),
        sa.Column('geom', geoalchemy2.types.Geometry(geometry_type='POLYGON', srid=4326, from_text='ST_GeomFromEWKT', name='geometry'), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
    )

    # 5. nav_nodes table
    op.create_table(
        'nav_nodes',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('floor_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('floors.id', ondelete='CASCADE'), nullable=True),
        sa.Column('node_type', sa.Enum('door', 'junction', 'stairs', 'lift', 'outdoor', name='node_type'), nullable=False),
        sa.Column('lat', sa.Float(), nullable=False),
        sa.Column('lon', sa.Float(), nullable=False),
        sa.Column('geom_local', geoalchemy2.types.Geometry(geometry_type='POINT', srid=32643, from_text='ST_GeomFromEWKT', name='geometry'), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
    )

    # 6. nav_edges table
    op.create_table(
        'nav_edges',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('from_node_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('nav_nodes.id', ondelete='CASCADE'), nullable=False),
        sa.Column('to_node_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('nav_nodes.id', ondelete='CASCADE'), nullable=False),
        sa.Column('weight', sa.Float(), nullable=False),
        sa.Column('is_accessible', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('edge_type', sa.Enum('corridor', 'stairs', 'lift', 'outdoor_path', name='edge_type'), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
    )


def downgrade() -> None:
    op.drop_table('nav_edges')
    op.drop_table('nav_nodes')
    op.drop_table('rooms')
    op.drop_table('floors')
    op.drop_table('buildings')
    op.drop_table('users')

    op.execute('DROP TYPE IF EXISTS edge_type CASCADE;')
    op.execute('DROP TYPE IF EXISTS node_type CASCADE;')
    op.execute('DROP TYPE IF EXISTS building_status CASCADE;')
    op.execute('DROP TYPE IF EXISTS user_role CASCADE;')
