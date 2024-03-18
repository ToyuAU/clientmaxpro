from app import db
import uuid

class Businesses(db.Model):
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()), unique=True, nullable=False)
    name = db.Column(db.String(120), nullable=False)
    is_client = db.Column(db.Boolean, nullable=False, default=False)
    business_id = db.Column(db.String(36), nullable=True)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())
    updated_at = db.Column(db.DateTime, default=db.func.current_timestamp(), onupdate=db.func.current_timestamp())
    deleted_at = db.Column(db.DateTime, nullable=True)

    def __init__(self, name, is_client=False, business_id=None) -> None:
        self.name = name
        self.is_client = is_client
        self.business_id = business_id

    def __repr__(self) -> str:
        return f"Business('{self.name}')"
    
    def save(self) -> None:
        db.session.add(self)
        db.session.commit()
    
    def delete(self) -> None:
        db.session.delete(self)
        db.session.commit()

    def serialize(self) -> dict:
        return {
            'id': self.id,
            'name': self.name,
            'is_client': self.is_client,
            'business': Businesses.query.get(self.business_id).serialize() if self.business_id else None,
            'created_at': self.created_at,
            'updated_at': self.updated_at,
            'deleted_at': self.deleted_at
        }
