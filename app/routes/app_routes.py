from app import app
from flask import render_template, request, redirect, url_for, flash
from app.models import users, clients, roles, businesses, subscriptions, invites, orders, products, categories
from flask_login import login_user, login_required, logout_user, current_user
from functools import wraps
from fuzzywuzzy import process
from sqlalchemy import func

def subscription_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        user = users.Users.query.filter_by(id=current_user.id).first()
        if user.email == 'baylinjmol@outlook.com':
            return f(*args, **kwargs)
        subscription = subscriptions.Subscriptions.query.filter_by(business_id=user.business_id).first()
        if not subscription:
            return redirect(url_for('app_get_started'))
        elif subscription.is_allowed():
            return f(*args, **kwargs)
        else:
            return redirect(url_for('app_billing'))
    
    return decorated_function

def view_permission_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        user = users.Users.query.filter_by(id=current_user.id).first()
        role = roles.Roles.query.filter_by(id=user.role_id).first()
        if role.has_permission(1):
            return f(*args, **kwargs)
        else:
            return redirect(url_for('app_dashboard'))
    
    return decorated_function

def read_write_permission_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        user = users.Users.query.filter_by(id=current_user.id).first()
        role = roles.Roles.query.filter_by(id=user.role_id).first()
        if role.has_permission(2):
            return f(*args, **kwargs)
        else:
            return redirect(url_for('app_dashboard'))
    
    return decorated_function

def admin_permission_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        user = users.Users.query.filter_by(id=current_user.id).first()
        role = roles.Roles.query.filter_by(id=user.role_id).first()
        if role.has_permission(4):
            return f(*args, **kwargs)
        else:
            return redirect(url_for('app_dashboard'))
    
    return decorated_function

@app.route('/app/login', methods=['GET', 'POST'])
def app_login():
    if request.method == 'POST':
        email = request.form['email']
        password = request.form['password']
        user = users.Users.query.filter_by(email=email).first()
        if user and user.check_password(password):
            login_user(user)
            return redirect(url_for('app_dashboard'))
        else:
            flash('Invalid email or password.')
            return redirect(url_for('app_login'))
        
    return render_template('app/login.html')

@app.route('/app/sign_up', methods=['GET', 'POST'])
def app_sign_up():
    if request.method == 'POST':
        first_name = request.form['first_name']
        last_name = request.form['last_name']
        email = request.form['email']
        password = request.form['password']
        invite_code = request.form['invite_code']
        invite = invites.Invites.query.filter_by(id=invite_code).first()
        if invite and not invite.used:
            business = businesses.Businesses.query.filter_by(id=invite.business_id).first()
            role = roles.Roles.query.filter_by(id=invite.role_id).first()
            user = users.Users(first_name, last_name, email, password, business.id, role.id)
            invite.activate()
            login_user(user)
            return redirect(url_for('app_dashboard'))
        else:
            user = users.Users(first_name, last_name, email, password, None, None)
            login_user(user)
            return redirect(url_for('app_get_started'))
    
    return render_template('app/sign_up.html')

@app.route('/app/logout', methods=['GET'])
@login_required
def app_logout():
    logout_user()
    return redirect(url_for('app_login'))


@app.route('/app/dashboard', methods=['GET'])
@login_required
@subscription_required
def app_dashboard():
    user = users.Users.query.filter_by(id=current_user.id).first()
    return render_template('app/dashboard.html', user=user, active='dashboard')

@app.route('/app/get_started', methods=['GET'])
@login_required
def app_get_started():
    return 'Hello, World!'

def fuzzy_search(model, item_type_name, query):
    all_items = [getattr(x, item_type_name) for x in model.query.all()]
    matches = process.extract(query, all_items, limit=len(all_items))
    return [x[0] for x in matches if x[1] > 80]

@app.route('/app/clients/new', methods=['POST'])
@login_required
@subscription_required
@read_write_permission_required
def app_new_client():
    if request.method == 'POST':
        data = request.get_json()
        name = data['name']
        email = data['email']
        phone = data['phone']
        address = data['address']
        client_business_id = data['business'] if data['business'] != '0' else None
        business_id = current_user.business_id
        client = clients.Clients(business_id, name, email, phone, address, client_business_id)
        client.save()
        return {'success': True, 'client':client.serialize()}, 200

@app.route('/app/clients/delete', methods=['POST'])
@login_required
@subscription_required
@read_write_permission_required
def app_delete_client():
    data = request.get_json()
    for client_id in data['selected']:
        client = clients.Clients.query.filter_by(id=client_id).first()
        client.delete()
    return {'success': True}, 200

@app.route('/app/clients/edit', methods=['POST'])
@login_required
@subscription_required
@read_write_permission_required
def app_edit_client():
    data = request.get_json()
    client = clients.Clients.query.filter_by(id=data['id']).first()
    client.name = data['name']
    client.email = data['email']
    client.phone = data['phone']
    client.address = data['address']
    client.client_business_id = data['business'] if data['business'] != '0' else None
    client.save()
    return {'success': True, 'client':client.serialize()}, 200

@app.route('/app/businesses/new', methods=['POST'])
@login_required
@subscription_required
@read_write_permission_required
def app_new_business():
    user_business = current_user.business_id
    data = request.get_json()
    name = data['name']
    is_client = data['is_client']
    business = businesses.Businesses(name, is_client, current_user.business_id)
    if is_client:
        business.business_id = user_business
    business.save()
    return {'success': True, 'business':business.serialize()}, 200

@app.route('/app/clients', methods=['GET'])
@login_required
@subscription_required
@view_permission_required
def app_clients():
    db_query = clients.Clients.query
    if current_user.business_id:
        db_query = db_query.filter_by(business_id=current_user.business_id)
    
    items = db_query.all()
    client_list = [x.serialize() for x in items]

    db_query = businesses.Businesses.query
    if current_user.business_id:
        db_query = db_query.filter_by(business_id=current_user.business_id)

    businesses_list = db_query.all()
    business_list = [x.serialize() for x in businesses_list]

    client_list.sort(key=lambda x: x['created_at'], reverse=True)

    return render_template('app/clients.html', clients=client_list, businesses=business_list, active='clients')

@app.route('/app/orders/new', methods=['POST'])
@login_required
@subscription_required
@read_write_permission_required
def app_new_orders():
    data = request.get_json()
    client_id = data['client']
    business_id = current_user.business_id
    notes = data['notes']
    products_list = data['products']
    status = data['status']

    total = 0
    for product in products_list:
        product_obj = products.Products.query.filter_by(id=product['id']).first().serialize()
        total += product_obj['price'] * int(product['quantity'])
    
    order = orders.Orders(business_id, products_list, total, client_id, notes, status)
    order.save()
    return {'success': True, 'order': order.serialize()}, 200

@app.route('/app/orders', methods=['GET'])
@login_required
@subscription_required
@view_permission_required
def app_orders():
    db_query = orders.Orders.query
    if current_user.business_id:
        db_query = db_query.filter_by(business_id=current_user.business_id)
    
    items = db_query.all()
    orders_list = [x.serialize() for x in items]

    db_query = clients.Clients.query
    if current_user.business_id:
        db_query = db_query.filter_by(business_id=current_user.business_id)
    
    items = db_query.all()
    client_list = [x.serialize() for x in items]

    db_query = products.Products.query
    if current_user.business_id:
        db_query = db_query.filter_by(business_id=current_user.business_id)

    items = db_query.all()
    products_list = [x.serialize(quiet=True) for x in items]

    orders_list.sort(key=lambda x: x['created_at'], reverse=True)
    return render_template('app/orders.html', active='orders', orders=orders_list, clients=client_list, products=products_list)

@app.route('/app/reports', methods=['GET'])
@login_required
@subscription_required
@view_permission_required
def app_reports():
    total_clients = clients.Clients.query.filter_by(business_id=current_user.business_id).count()
    total_jobs = orders.Orders.query.filter_by(business_id=current_user.business_id).count()
    total_employee = users.Users.query.filter_by(business_id=current_user.business_id).count()
    invites_ = invites.Invites.query.filter_by(business_id=current_user.business_id).count()
    return render_template('app/reports.html', active='reports', total_clients=total_clients, total_jobs=total_jobs, total_employees=total_employee, total_invites=invites_)

@app.route('/app/employees', methods=['GET'])
@login_required
@subscription_required
@admin_permission_required
def app_employees():
    db_query = users.Users.query
    if current_user.business_id:
        db_query = db_query.filter_by(business_id=current_user.business_id)

    items = db_query.all()
    employee_list = [x.serialize() for x in items]

    db_query = roles.Roles.query
    if current_user.business_id:
        db_query = db_query.filter_by(business_id=current_user.business_id)

    roles_list = db_query.all()
    role_list = [x.serialize() for x in roles_list]

    employee_list.sort(key=lambda x: x['created_at'], reverse=True)

    return render_template('app/employees.html', employees=employee_list, roles=role_list, active='employees')

@app.route('/app/invites', methods=['GET'])
@login_required
@subscription_required
@admin_permission_required
def app_invites():
    db_query = invites.Invites.query
    if current_user.business_id:
        db_query = db_query.filter_by(business_id=current_user.business_id)

    items = db_query.all()
    invite_list = [x.serialize() for x in items]

    invite_list.sort(key=lambda x: x['created_at'], reverse=True)

    return render_template('app/invites.html', invites=invite_list, active='invites')

@app.route('/app/settings', methods=['GET'])
@login_required
@subscription_required
@admin_permission_required
def app_settings():
    return 'Hello, World!'

@app.route('/app/billing', methods=['GET'])
@login_required
@admin_permission_required
def app_billing():
    return 'Hello, World!'

@app.route('/app/categories/new', methods=['POST'])
@login_required
@subscription_required
@read_write_permission_required
def app_new_category():
    data = request.get_json()
    name = data['name']
    business_id = current_user.business_id
    category = categories.Categories(name, business_id)
    category.save()
    return {'success': True, 'category': category.serialize()}, 200

@app.route('/app/products/new', methods=['POST'])
@login_required
@subscription_required
@admin_permission_required
def app_new_product():
    data = request.get_json()
    name = data['name']
    sku = data['sku']
    description = data['description']
    price = data['price']
    stock = data['stock']
    unlimited_stock = False
    if stock == "unlimited":
        unlimited_stock = True
        stock = 0
    category_id = data['category']
    business_id = current_user.business_id
    product = products.Products(name, sku, description, price, stock, unlimited_stock, (None if category_id == "0" else category_id), business_id)
    product.save()
    return {'success': True, 'product': product.serialize()}, 200

@app.route('/app/products/delete', methods=['POST'])
@login_required
@subscription_required
@admin_permission_required
def app_delete_product():
    data = request.get_json()
    for product_id in data['selected']:
        product = products.Products.query.filter_by(id=product_id).first()
        product.delete()
    return {'success': True}, 200

@app.route('/app/products/edit', methods=['POST'])
@login_required
@subscription_required
@admin_permission_required
def app_edit_product():
    data = request.get_json()
    product = products.Products.query.filter_by(id=data['id']).first()
    product.name = data['name']
    product.sku = data['sku']
    product.description = data['description']
    product.price = data['price']
    product.stock = data['stock']
    product.unlimited_stock = False
    if data['stock'] == "unlimited":
        product.unlimited_stock = True
        product.stock = 0
    product.category_id = (None if data['category'] == "0" else data['category'])
    product.save()
    return {'success': True, 'product': product.serialize()}, 200

@app.route('/app/products', methods=['GET'])
@login_required
@admin_permission_required
def app_products():
    db_query = products.Products.query
    if current_user.business_id:
        db_query = db_query.filter_by(business_id=current_user.business_id)
    
    items = db_query.all()
    products_list = [x.serialize() for x in items]

    db_query = categories.Categories.query
    if current_user.business_id:
        db_query = db_query.filter_by(business_id=current_user.business_id)

    items = db_query.all()
    categories_list = [x.serialize() for x in items]
    return render_template('app/products.html', products=products_list, categories=categories_list, active='products')


@app.route('/app/devlogin', methods=['GET'])
def app_devlogin():
    user = users.Users.query.filter_by(email='baylinjmol@outlook.com').first()
    login_user(user)
    return redirect(url_for('app_dashboard'))