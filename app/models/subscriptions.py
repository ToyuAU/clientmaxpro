from app import db
import uuid
from app.models.businesses import Businesses
from app.models.users import Users

# subscription type 0 = monthly, 1 = yearly
# subscription status 0 = active,  1 = ending, 2 = expired, 3 = inactive
# subscription plan 0 = basic, 1 = premium, 2 = enterprise

class Subscriptions(db.Model):
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()), unique=True, nullable=False)
    business_id = db.Column(db.String(36), nullable=False, unique=True)
    type = db.Column(db.Integer, nullable=False)
    status = db.Column(db.Integer, nullable=False)
    plan = db.Column(db.Integer, nullable=False)
    stripe_id = db.Column(db.String(28), nullable=True)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())
    updated_at = db.Column(db.DateTime, default=db.func.current_timestamp(), onupdate=db.func.current_timestamp())
    deleted_at = db.Column(db.DateTime, nullable=True)

    def __init__(self, user_id, type, status, plan) -> None:
        self.user_id = user_id
        self.type = type
        self.status = status
        self.plan = plan

    def __repr__(self) -> str:
        return f"Subscription('{self.user_id}', '{self.type}', '{self.status}', '{self.plan}')"
    
    def serialize(self) -> dict:
        return {
            'id': self.id,
            'user': Users.query.get(self.user_id).serialize(),
            'business': Businesses.query.get(self.business_id).serialize(),
            'type': self.type,
            'status': self.status,
            'plan': self.plan,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'deleted_at': self.deleted_at.isoformat() if self.deleted_at else None
        }
    
    def is_allowed(self) -> bool:
        return any([self.is_active(), self.is_ending()])
    
    def is_active(self) -> bool:
        return self.status == 0
    
    def is_ending(self) -> bool:
        return self.status == 1
    
    def is_expired(self) -> bool:
        return self.status == 2
    
    def is_inactive(self) -> bool:
        return self.status == 3
    
    def activate(self) -> None:
        self.status = 0
    
    def deactivate(self) -> None:
        self.status = 1
    
    def ending(self) -> None:
        self.status = 2
    
    def expire(self) -> None:
        self.status = 3
    
    def ending(self) -> None:
        self.status = 2
    
    def expire(self) -> None:
        self.status = 3


