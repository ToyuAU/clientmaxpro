from app import db
import uuid
from app.models import businesses
from app.models import clients

class Orders(db.Model):
    __tablename__ = 'orders'
    id = db.Column(db.String(36), default=lambda: str(uuid.uuid4()))
    business_id = db.Column(db.String(36), nullable=False)
    order_number = db.Column(db.Integer, nullable=False, primary_key=True, autoincrement=True)
    items = db.Column(db.JSON, nullable=False)
    total = db.Column(db.Float, nullable=False)
    client_id = db.Column(db.String(36), nullable=False)
    status = db.Column(db.String(100), nullable=False, default='processing')
    notes = db.Column(db.Text, nullable=True, default=None)
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    updated_at = db.Column(db.DateTime, server_default=db.func.now(), server_onupdate=db.func.now())
    deleted_at = db.Column(db.DateTime, nullable=True)

    def __init__(self, business_id, items, total, client_id, notes, status='processing') -> None:
        self.business_id = business_id
        self.items = items
        self.total = total
        self.client_id = client_id
        self.status = status
        self.notes = notes

    def __repr__(self):
        return f'<Order {self.id}>'
    
    def serialize(self, quiet=False):

        if quiet:
            return {
                'id': self.id,
                'business_id': self.business_id,
                'order_number': self.order_number,
                'items': self.items,
                'total': self.total,
                'client': self.client_id,
                'status': self.status,
                'notes': self.notes if self.notes else '',
                'created_at': self.created_at.isoformat(),
                'updated_at': self.updated_at.isoformat() if self.updated_at else None,
                'deleted_at': self.deleted_at.isoformat() if self.deleted_at else None
            }

        client_obj = clients.Clients.query.get(self.client_id)

        return {
            'id': self.id,
            'business': businesses.Businesses.query.get(self.business_id).serialize(),
            'order_number': self.order_number,
            'items': self.items,
            'total': self.total,
            'client': client_obj.serialize() if (client_obj and self.client_id != "" and str(self.client_id) != '0') else {'id': "0", 'name': 'Walk-in'},
            'status': self.status,
            'notes': self.notes if self.notes else '',
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'deleted_at': self.deleted_at.isoformat() if self.deleted_at else None
        }
    
    def save(self):
        db.session.add(self)
        db.session.commit()

    def delete(self):
        db.session.delete(self)
        db.session.commit()
