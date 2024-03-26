from app import db
import uuid

class Businesses(db.Model):
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()), unique=True, nullable=False)
    name = db.Column(db.String(120), nullable=False)
    industry = db.Column(db.String(120), nullable=True) 
    address = db.Column(db.Text, nullable=True)
    phone = db.Column(db.String(20), nullable=True)
    county = db.Column(db.String(120), nullable=True)
    is_client = db.Column(db.Boolean, nullable=False, default=False)
    business_id = db.Column(db.String(36), nullable=True)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())
    updated_at = db.Column(db.DateTime, default=db.func.current_timestamp(), onupdate=db.func.current_timestamp())
    deleted_at = db.Column(db.DateTime, nullable=True)

    def __init__(self, name, industry=None, address=None, phone=None, county=None, is_client=False, business_id=None) -> None:
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
            'industry': self.industry,
            'address': self.address,
            'phone': self.phone,
            'county': self.county,
            'is_client': self.is_client,
            'business': Businesses.query.get(self.business_id).serialize() if self.business_id else None,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'deleted_at': self.deleted_at.isoformat() if self.deleted_at else None
        }
