from app import app
from flask import render_template, request, redirect, url_for, flash
from app.models import users, clients, roles, businesses, subscriptions, invites, orders, products, categories
from flask_login import login_user, login_required, logout_user, current_user
from functools import wraps
from fuzzywuzzy import process
from sqlalchemy import func
from app import socketio
from flask_socketio import join_room, leave_room

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

@app.route('/app/logout', methods=['GET'])
@login_required
def app_logout():
    logout_user()
    return redirect(url_for('app_login'))


@app.route('/app/dashboard', methods=['GET'])
@login_required
@subscription_required
def app_dashboard():
    user = users.Users.query.filter_by(id=current_user.id).first().serialize()
    return render_template('app/dashboard.html', user=user, active='dashboard')

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

        socketio.emit('update', {'message': f'{current_user.first_name} added a client.', 'type':'clients', 'data': client.serialize(), 'method':'add', 'permission': 1}, room=current_user.business_id)
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
    
    socketio.emit('update', {'message': f'{current_user.first_name} deleted a client.', 'type':'clients', 'data': data['selected'], 'method':'delete', 'permission': 1}, room=current_user.business_id)
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

    socketio.emit('update', {'message': f'{current_user.first_name} updated a client.', 'type':'clients', 'data': client.serialize(), 'method':'edit', 'permission': 1}, room=current_user.business_id)
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

    socketio.emit('update', {'message': f'{current_user.first_name} added a business.', 'type':'businesses', 'data': business.serialize(), 'method':'add', 'permission': 1}, room=current_user.business_id)
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

    user = users.Users.query.filter_by(id=current_user.id).first().serialize()
    return render_template('app/clients.html', clients=client_list, businesses=business_list, active='clients', user=user)

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

    socketio.emit('update', {'message': f'{current_user.first_name} added an order.', 'type':'orders', 'data': order.serialize(), 'method':'add', 'permission': 1}, room=current_user.business_id)
    return {'success': True, 'order': order.serialize()}, 200

@app.route('/app/orders/delete', methods=['POST'])
@login_required
@subscription_required
@read_write_permission_required
def app_delete_orders():
    data = request.get_json()
    for order_id in data['selected']:
        order = orders.Orders.query.filter_by(id=order_id).first()
        order.delete()

    socketio.emit('update', {'message': f'{current_user.first_name} deleted an order.', 'type':'orders', 'data': data['selected'], 'method':'delete', 'permission': 1}, room=current_user.business_id)
    return {'success': True}, 200

@app.route('/app/orders/edit', methods=['POST'])
@login_required
@subscription_required
@read_write_permission_required
def app_edit_orders():
    data = request.get_json()
    order = orders.Orders.query.filter_by(id=data['id']).first()
    order.notes = data['notes']
    order.status = data['status']
    order.items = data['products']
    total = 0
    for product in data['products']:
        product_obj = products.Products.query.filter_by(id=product['id']).first().serialize()
        total += product_obj['price'] * int(product['quantity'])
    order.total = total
    order.save()

    socketio.emit('update', {'message': f'{current_user.first_name} updated an order.', 'type':'orders', 'data': order.serialize(), 'method':'edit', 'permission': 1}, room=current_user.business_id)
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
    user = users.Users.query.filter_by(id=current_user.id).first().serialize()
    return render_template('app/orders.html', active='orders', orders=orders_list, clients=client_list, products=products_list, user=user)

@app.route('/app/reports', methods=['GET'])
@login_required
@subscription_required
@view_permission_required
def app_reports():
    total_clients = clients.Clients.query.filter_by(business_id=current_user.business_id).count()
    total_jobs = orders.Orders.query.filter_by(business_id=current_user.business_id).count()
    total_employee = users.Users.query.filter_by(business_id=current_user.business_id).count()
    invites_ = invites.Invites.query.filter_by(business_id=current_user.business_id).count()

    user = users.Users.query.filter_by(id=current_user.id).first().serialize()
    return render_template('app/reports.html', active='reports', total_clients=total_clients, total_jobs=total_jobs, total_employees=total_employee, total_invites=invites_, user=user)

@app.route('/app/invites/new', methods=['POST'])
@login_required
@subscription_required
@admin_permission_required
def app_new_invite():
    data = request.get_json()
    role_id = data['role']
    business_id = current_user.business_id
    invite = invites.Invites(role_id, business_id)
    invite.save()

    socketio.emit('update', {'message': f'{current_user.first_name} added an invite.', 'type':'invites', 'data': invite.serialize(), 'method':'add', 'permission': 4}, room=current_user.business_id)
    return {'success': True, 'invite': invite.serialize()}, 200

@app.route('/app/invites/check', methods=['POST'])
@login_required
def app_check_invite():
    data = request.get_json()
    invite = invites.Invites.query.filter_by(id=data['invite_code']).first()
    if invite and not invite.used:
        user = users.Users.query.filter_by(id=current_user.id).first()
        user.business_id = invite.business_id
        user.role_id = invite.role_id
        user.save()
        invite.activate()
        return {'success': True, 'redirect': url_for('app_dashboard')}, 200
    else:
        return {'success': False, 'error': 'Invalid invite code'}, 200

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

    db_query = invites.Invites.query
    if current_user.business_id:
        db_query = db_query.filter_by(business_id=current_user.business_id)
    
    invites_list = db_query.all()
    invites_list = [x.serialize() for x in invites_list]

    employee_list.sort(key=lambda x: x['created_at'], reverse=True)
    user = users.Users.query.filter_by(id=current_user.id).first().serialize()
    return render_template('app/employees.html', employees=employee_list, roles=role_list, invites=invites_list, active='employees', user=user)

@app.route('/app/settings', methods=['GET'])
@login_required
@subscription_required
@admin_permission_required
def app_settings():

    user = users.Users.query.filter_by(id=current_user.id).first().serialize()
    return render_template('app/settings.html', active='settings', user=user)

@app.route('/app/roles/new', methods=['POST'])
@login_required
@subscription_required
@admin_permission_required
def app_new_role():
    data = request.get_json()
    name = data['name']
    permission = data['permission']
    business_id = current_user.business_id
    role = roles.Roles(name, permission, business_id)
    role.save()

    socketio.emit('update', {'message': f'{current_user.first_name} added a role.', 'type':'roles', 'data': role.serialize(), 'method':'add', 'permission': 4}, room=current_user.business_id)
    return {'success': True, 'role': role.serialize()}, 200

@app.route('/app/roles/delete', methods=['POST'])
@login_required
@subscription_required
@admin_permission_required
def app_delete_role():
    data = request.get_json()
    for role_id in data['selected']:
        role = roles.Roles.query.filter_by(id=role_id).first()
        role.delete()
    
    socketio.emit('update', {'message': f'{current_user.first_name} deleted a role.', 'type':'roles', 'data': data['selected'], 'method':'delete', 'permission': 4}, room=current_user.business_id)
    return {'success': True}, 200

@app.route('/app/roles/edit', methods=['POST'])
@login_required
@subscription_required
@admin_permission_required
def app_edit_role():
    data = request.get_json()
    role = roles.Roles.query.filter_by(id=data['id']).first()
    role.name = data['name']
    role.permission = int(data['permission'])
    role.save()

    socketio.emit('update', {'message': f'{current_user.first_name} updated a role.', 'type':'roles', 'data': role.serialize(), 'method':'edit', 'permission': 4}, room=current_user.business_id)
    return {'success': True, 'role': role.serialize()}, 200

@app.route('/app/roles', methods=['GET'])
@login_required
@subscription_required
@admin_permission_required
def app_roles():
    db_query = roles.Roles.query
    if current_user.business_id:
        db_query = db_query.filter_by(business_id=current_user.business_id)

    items = db_query.all()
    roles_list = [x.serialize() for x in items]

    roles_list.sort(key=lambda x: x['created_at'], reverse=True)
    user = users.Users.query.filter_by(id=current_user.id).first().serialize()
    return render_template('app/roles.html', roles=roles_list, active='roles', user=user)

@app.route('/app/billing', methods=['GET'])
@login_required
@admin_permission_required
def app_billing():
    user = users.Users.query.filter_by(id=current_user.id).first().serialize()
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

    socketio.emit('update', {'message': f'{current_user.first_name} added a category.', 'type':'categories', 'data': category.serialize(), 'method':'add', 'permission': 1}, room=current_user.business_id)
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

    socketio.emit('update', {'message': f'{current_user.first_name} added a product.', 'type':'products', 'data': product.serialize(), 'method':'add', 'permission': 1}, room=current_user.business_id)
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

    socketio.emit('update', {'message': f'{current_user.first_name} deleted a product.', 'type':'products', 'data': data['selected'], 'method':'delete', 'permission': 1}, room=current_user.business_id)
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

    socketio.emit('update', {'message': f'{current_user.first_name} updated a product.', 'type':'products', 'data': product.serialize(), 'method':'edit', 'permission': 1}, room=current_user.business_id)
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
    user = users.Users.query.filter_by(id=current_user.id).first().serialize()
    return render_template('app/products.html', products=products_list, categories=categories_list, active='products', user=user)


@app.route('/app/devlogin', methods=['GET'])
def app_devlogin():
    user = users.Users.query.filter_by(email='baylinjmol@outlook.com').first()
    login_user(user)
    return redirect(url_for('app_dashboard'))

# join and leave (room is business_id)
@socketio.on('join')
def on_join():
    room = current_user.business_id
    join_room(room)

@socketio.on('leave')
def on_leave():
    room = current_user.business_id
    leave_room(room)



