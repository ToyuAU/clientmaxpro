from app import db
import uuid
from app.models import categories, businesses

class Products(db.Model):
    __tablename__ = 'products'
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(255), nullable=False)
    price = db.Column(db.Float, nullable=False, default=0)
    stock = db.Column(db.Integer, nullable=False, default=0)
    unlimited_stock = db.Column(db.Boolean, default=False)
    category_id = db.Column(db.String(36), nullable=True)
    business_id = db.Column(db.String(36), nullable=False)

    def __init__(self, name, description, price, stock, image, category_id, business_id) -> None:
        self.name = name
        self.description = description
        self.price = price
        self.stock = stock
        self.image = image
        self.category_id = category_id
        self.business_id = business_id
    
    def __repr__(self):
        return f'<Product {self.name}>'
    
    def serialize(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'price': self.price,
            'stock': self.stock,
            'image': self.image,
            'category': categories.Categories.query.get(self.category_id).serialize(),
            'business': businesses.Businesses.query.get(self.business_id).serialize()
        }
    
    def save(self):
        db.session.add(self)
        db.session.commit()

    def delete(self):
        db.session.delete(self)
        db.session.commit()