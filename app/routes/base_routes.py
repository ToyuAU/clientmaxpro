from app import app
from flask import render_template, request, redirect, url_for, flash
from flask_login import login_user
from app.models import users, invites, businesses, roles

@app.route('/')
def index():
    return 'Hello, World!'


@app.route('/login', methods=['GET', 'POST'])
def app_login():
    if request.method == 'POST':
        data = request.get_json()
        email = data['email']
        password = data['password']
        user = users.Users.query.filter_by(email=email).first()
        if user and user.check_password(password):
            login_user(user)
            return redirect(url_for('app_dashboard'))
        else:
            return {'success': False, 'error': 'Invalid email or password'}
    
    return render_template('login.html')

@app.route('/signup', methods=['GET', 'POST'])
def app_sign_up():
    if request.method == 'POST':
        data = request.get_json()
        firstname = data['firstname']
        lastname = data['lastname']
        email = data['email']

        user = users.Users.query.filter_by(email=email).first()
        if user:
            return {'success': False, 'error': 'Email already in use'}
        password = data['password']
        invite_code = data['invite_code']
        invite = invites.Invites.query.filter_by(id=invite_code).first()
        if invite and not invite.used:
            business = businesses.Businesses.query.filter_by(id=invite.business_id).first()
            role = roles.Roles.query.filter_by(id=invite.role_id).first()
            user = users.Users(firstname, lastname, email, password, business.id, role.id)
            invite.activate()
            login_user(user)
            return redirect(url_for('app_dashboard'))
        else:
            user = users.Users(firstname, lastname, email, password, None, None)
            login_user(user)
            return redirect(url_for('app_get_started'))
    
    return render_template('signup.html')

@app.route('/app/get-started', methods=['GET', 'POST'])
def app_get_started():
    if request.method == 'POST':
        business_name = request.form['business_name']
        business = businesses.Businesses(business_name)
        business.save()
        user = users.Users.query.get(1)
        user.business_id = business.id
        user.save()
        return redirect(url_for('app_dashboard'))
    
    return render_template('app/get_started.html')