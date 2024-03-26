from flask import Flask, render_template
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_login import LoginManager
from flask_moment import Moment
from flask_socketio import SocketIO
from flask_wtf.csrf import CSRFProtect

app = Flask(__name__)
app.config.from_object('config.Config')
db = SQLAlchemy(app)
bycrypt = Bcrypt(app)
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'app_login'
moment = Moment(app)
csrf = CSRFProtect(app)
socketio = SocketIO(app)

from app.routes import app_routes, base_routes
from app.models import users, clients, roles, businesses, subscriptions, invites

with app.app_context():
    db.create_all()

    #user_admin = users.Users.query.filter_by(
    #    email="baylinjmol@outlook.com"
    #).first()
#
    #if not user_admin:
    #    #first_name, last_name, email, password, business, role
    #    user_admin = users.Users(
    #        first_name="Baylin",
    #        last_name="Molloy",
    #        email="baylinjmol@outlook.com",
    #        password="password",
    #        business=None,
    #        role=None
    #    )
    #    user_admin.save()
#
    #    user_business = businesses.Businesses.query.filter_by(
    #        name="Baylin's Business"
    #    ).first()
#
    #    if not user_business:
    #        business = businesses.Businesses(
    #            name="Baylin's Business"
    #        )
    #        business.save()
#
    #    user_admin.business_id = business.id
#
    #    user_role = roles.Roles.query.filter_by(
    #        name="Admin"
    #    ).first()
    #    if not user_role:
    #        role = roles.Roles(
    #            name="Admin",
    #            permission=4
    #        )
    #        role.save()
#
    #    user_admin.role_id = role.id
    #    user_admin.save()
#







