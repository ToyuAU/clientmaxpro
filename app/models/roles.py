from app import db
import uuid

# permission view = 1, read/write = 2, admin = 4

class Roles(db.Model):
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()), unique=True, nullable=False)
    name = db.Column(db.String(120), nullable=False)
    permission = db.Column(db.Integer, nullable=False)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())
    updated_at = db.Column(db.DateTime, default=db.func.current_timestamp(), onupdate=db.func.current_timestamp())
    deleted_at = db.Column(db.DateTime, nullable=True)

    def __init__(self, name, permission) -> None:
        self.name = name
        self.permission = permission

    def __repr__(self) -> str:
        return f"Role('{self.name}', '{self.permission}')"
    
    def serialize(self) -> dict:
        return {
            'id': self.id,
            'name': self.name,
            'permission': self.permission,
            'created_at': self.created_at,
            'updated_at': self.updated_at,
            'deleted_at': self.deleted_at
        }
    
    def has_permission(self, permission) -> bool:
        return (self.permission & permission == permission) or (self.permission > permission)


    def add_permission(self, permission) -> None:
        self.permission |= permission

    def remove_permission(self, permission) -> None:
        self.permission &= ~permission

    def update_permission(self, permission) -> None:
        self.permission = permission

