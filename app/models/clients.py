from app import db
import uuid
from app.models.businesses import Businesses

class Clients(db.Model):
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    business_id = db.Column(db.String(36), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    address = db.Column(db.String(100), nullable=True, default=None)
    client_business_id = db.Column(db.String(36), nullable=True, default=None)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())
    updated_at = db.Column(db.DateTime, default=db.func.current_timestamp(), onupdate=db.func.current_timestamp())
    deleted_at = db.Column(db.DateTime, nullable=True)

    def __init__(self, business_id, name, email, phone, address, client_business_id=None) -> None:
        self.business_id = business_id
        self.name = name
        self.email = email
        self.phone = phone
        self.address = address
        self.client_business_id = client_business_id

    def __repr__(self):
        return '<Client %r>' % self.name
    
    def delete(self):
        db.session.delete(self)
        db.session.commit()

    def save(self):
        db.session.add(self)
        db.session.commit()

    def serialize(self):
        return {
            'id': self.id,
            'business': Businesses.query.get(self.business_id).serialize(),
            'name': self.name,
            'email': self.email,
            'phone': self.phone,
            'address': self.address,
            'client_business': Businesses.query.get(self.client_business_id).serialize() if self.client_business_id else None,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'deleted_at': self.deleted_at.isoformat() if self.deleted_at else None
        }