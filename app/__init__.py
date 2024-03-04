from flask import Flask, render_template
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_login import LoginManager
from flask_moment import Moment
from faker import Faker
from flask_wtf.csrf import CSRFProtect

app = Flask(__name__)
app.config.from_object('config.Config')
db = SQLAlchemy(app)
bycrypt = Bcrypt(app)
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'app/login'
moment = Moment(app)
fake = Faker()
csrf = CSRFProtect(app)

from app.routes import app_routes, base_routes
from app.models import users, clients, roles, businesses, subscriptions, invites


with app.app_context():
    db.create_all()





