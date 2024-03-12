from app import db
import uuid

class Categories(db.Model):
    __tablename__ = 'categories'
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(255), nullable=False)
    business_id = db.Column(db.String(36), nullable=False)
    
    def __init__(self, name, description, business_id) -> None:
        self.name = name
        self.description = description
        self.business_id = business_id
    
    def __repr__(self):
        return f'<Category {self.name}>'
    
    def serialize(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'business_id': self.business_id
        }
    
    def save(self):
        db.session.add(self)
        db.session.commit()

    def delete(self):
        db.session.delete(self)
        db.session.commit()