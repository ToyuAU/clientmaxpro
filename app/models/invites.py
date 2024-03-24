from app import db
import string
import random

def create_invite_code():
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))

class Invites(db.Model):
    id = db.Column(db.String(8), primary_key=True, default=lambda: create_invite_code(), unique=True, nullable=False)
    role_id = db.Column(db.Integer, nullable=False)
    business_id = db.Column(db.String(36), nullable=False)
    used = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())
    updated_at = db.Column(db.DateTime, default=db.func.current_timestamp(), onupdate=db.func.current_timestamp())
    deleted_at = db.Column(db.DateTime, nullable=True)

    def __init__(self, role_id, business_id) -> None:
        self.role_id = role_id
        self.business_id = business_id

    def __repr__(self) -> str:
        return f"Invite('{self.role_id}', '{self.business_id}')"
    
    def serialize(self) -> dict:
        return {
            'id': self.id,
            'role_id': self.role_id,
            'business_id': self.business_id,
            'created_at': self.created_at,
            'updated_at': self.updated_at,
            'deleted_at': self.deleted_at
        }
    
    def save(self) -> None:
        db.session.add(self)
        db.session.commit()

    def delete(self) -> None:
        db.session.delete(self)
        db.session.commit()
    
    def is_active(self) -> bool:
        return self.deleted_at is None and not self.used
    
    def activate(self) -> None:
        self.used = True

    def deactivate(self) -> None:
        self.deleted_at = db.func.current_timestamp()

    def update_role(self, role_id) -> None:
        self.role_id = role_id


