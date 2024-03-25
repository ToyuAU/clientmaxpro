from app import db
import uuid
from app.models import categories, businesses

class Products(db.Model):
    __tablename__ = 'products'
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = db.Column(db.String(100), nullable=False)
    sku = db.Column(db.String(100), nullable=True)
    description = db.Column(db.String(255), nullable=False)
    price = db.Column(db.Float, nullable=False, default=0)
    stock = db.Column(db.Integer, nullable=False, default=0)
    unlimited_stock = db.Column(db.Boolean, default=False)
    category_id = db.Column(db.String(36), nullable=True)
    business_id = db.Column(db.String(36), nullable=False)
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    updated_at = db.Column(db.DateTime, server_default=db.func.now(), server_onupdate=db.func.now())
    deleted_at = db.Column(db.DateTime, nullable=True)

    def __init__(self, name, sku, description, price, stock, unlimited_stock, category_id, business_id):
        self.name = name
        self.sku = sku
        self.description = description
        self.price = price
        self.stock = stock
        self.unlimited_stock = unlimited_stock
        self.category_id = category_id
        self.business_id = business_id
    
    def __repr__(self):
        return f'<Product {self.name}>'
    
    def serialize(self, quiet=False):
        if quiet:
            return {
                'id': self.id,
                'name': self.name,
                'sku': self.sku if self.sku else None,
                'description': self.description,
                'price': self.price,
                'stock': self.stock,
                'unlimited_stock': self.unlimited_stock,
                'category_id': self.category_id,
                'business_id': self.business_id,
                'created_at': self.created_at.isoformat(),
                'updated_at': self.updated_at.isoformat() if self.updated_at else None,
                'deleted_at': self.deleted_at.isoformat() if self.deleted_at else None
            }
        
        return {
            'id': self.id,
            'name': self.name,
            'sku': self.sku if self.sku else None,
            'description': self.description,
            'price': self.price,
            'stock': self.stock,
            'unlimited_stock': self.unlimited_stock,
            'category': categories.Categories.query.get(self.category_id).serialize() if self.category_id else None,
            'business': businesses.Businesses.query.get(self.business_id).serialize(),
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