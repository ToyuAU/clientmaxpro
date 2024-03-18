from app import db
import uuid
from app.models import businesses
from app.models import clients

class Orders(db.Model):
    __tablename__ = 'orders'
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    business_id = db.Column(db.String(36), nullable=False)
    items = db.Column(db.JSON, nullable=False)
    total = db.Column(db.Float, nullable=False)
    client_id = db.Column(db.String(36), nullable=False)
    status = db.Column(db.String(100), nullable=False, default='pending')
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    updated_at = db.Column(db.DateTime, server_default=db.func.now(), server_onupdate=db.func.now())
    deleted_at = db.Column(db.DateTime, nullable=True)

    def __init__(self, business_id, items, total, client_id, status) -> None:
        self.business_id = business_id
        self.items = items
        self.total = total
        self.client_id = client_id
        self.status = status

    def __repr__(self):
        return f'<Order {self.id}>'
    
    def serialize(self, quiet=False):
        if quiet:
            return {
                'id': self.id,
                'business_id': self.business_id,
                'items': self.items,
                'total': self.total,
                'client': self.client_id,
                'status': self.status,
                'created_at': self.created_at,
                'updated_at': self.updated_at,
                'deleted_at': self.deleted_at
            }
        
        return {
            'id': self.id,
            'business': businesses.Businesses.query.get(self.business_id).serialize(),
            'items': self.items,
            'total': self.total,
            'client': clients.Clients.query.get(self.customer_id).serialize(),
            'status': self.status,
            'created_at': self.created_at,
            'updated_at': self.updated_at,
            'deleted_at': self.deleted_at
        }
    
    def save(self):
        db.session.add(self)
        db.session.commit()

    def delete(self):
        db.session.delete(self)
        db.session.commit()
