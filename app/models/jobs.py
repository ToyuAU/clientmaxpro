from app import db
import uuid
from app.models.businesses import Businesses
from app.models.clients import Clients

class Jobs(db.Model):
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()), unique=True, nullable=False)
    client_id = db.Column(db.String(36), nullable=False)
    business_id = db.Column(db.String(36), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(255), nullable=True)
    status = db.Column(db.String(20), nullable=True, default='active')
    notes = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())
    updated_at = db.Column(db.DateTime, default=db.func.current_timestamp(), onupdate=db.func.current_timestamp())
    completed_at = db.Column(db.DateTime, nullable=True)
    deleted_at = db.Column(db.DateTime, nullable=True)

    def __init__(self, client_id, business_id, name, description=None, status='active', notes=None) -> None:
        self.client_id = client_id
        self.business_id = business_id
        self.name = name
        self.description = description
        self.status = status
        self.notes = notes

    def __repr__(self):
        return '<Job %r>' % self.name
    
    def delete(self):
        db.session.delete(self)
        db.session.commit()

    def save(self):
        db.session.add(self)
        db.session.commit()

    def serialize(self):
        return {
            'id': self.id,
            'client': Clients.query.get(self.client_id).serialize(),
            'business': Businesses.query.get(self.business_id).serialize(),
            'name': self.name,
            'description': self.description,
            'status': self.status,
            'notes': self.notes,
            'created_at': self.created_at,
            'updated_at': self.updated_at,
            'completed_at': self.completed_at,
            'deleted_at': self.deleted_at
        }
    
