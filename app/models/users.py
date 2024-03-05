from app import db, bycrypt, login_manager
import uuid
from flask_login import UserMixin
from app.models.roles import Roles
from app.models.businesses import Businesses

class Users(db.Model, UserMixin):
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()), unique=True, nullable=False)
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(120), nullable=False)
    business_id = db.Column(db.String(36), nullable=True)
    role_id = db.Column(db.String(36), nullable=True)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())
    updated_at = db.Column(db.DateTime, default=db.func.current_timestamp(), onupdate=db.func.current_timestamp())
    deleted_at = db.Column(db.DateTime, nullable=True)

    def __init__(self, first_name, last_name, email, password, business, role) -> None:
        self.first_name = first_name
        self.last_name = last_name
        self.email = email
        self.password = bycrypt.generate_password_hash(password).decode('utf-8')
        self.business = business
        self.role = role

    def __repr__(self) -> str:
        return f"User('{self.first_name}', '{self.last_name}', '{self.email}', '{self.business}', '{self.role}')"
    
    def check_password(self, password) -> bool:
        return bycrypt.check_password_hash(self.password, password)
    
    def update_password(self, password) -> None:
        self.password = bycrypt.generate_password_hash(password).decode('utf-8')

    def is_admin(self) -> bool:
        role = Roles.query.get(self.role_id)
        return role.has_permission(4)
    
    def serialize(self) -> dict:
        return {
            'id': self.id,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'email': self.email,
            'business': Businesses.query.get(self.business_id).serialize(),
            'role': Roles.query.get(self.role_id).serialize(),
            'created_at': self.created_at,
            'updated_at': self.updated_at,
            'deleted_at': self.deleted_at
        }
    
@login_manager.user_loader
def load_user(user_id):
    user = Users.query.get(user_id)
    return user

