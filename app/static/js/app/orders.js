function removeProduct(element) {
    var product = element.parentElement.parentElement.parentElement;
    product.remove();
    //updateTotal();
}

function addProduct(id) {
    // hide the product results
    var list = document.getElementById('order_product_results');
    list.innerHTML = '';
    list.style.display = 'none';
    // clear input
    var input = document.getElementById('order_product_search');
    input.value = '';
    

    const products = JSON.parse(document.getElementById('products').textContent);
    var product = products.find(product => product.id === id);

    var list = document.getElementById('order_products_list');
    // check if the product is already in the list
    var productDiv = list.querySelector('input[value="' + product.id + '"]');
    if (productDiv) {
        var productQuantityInput = productDiv.parentElement.querySelector('.new__order__content__form__products__list__product__quantity input');
        productQuantityInput.value = parseInt(productQuantityInput.value) + 1;
        productQuantityInput.dispatchEvent(new Event('input'));
        return;
    }
    
    var productDiv = document.createElement('div');
    productDiv.classList.add('new__order__content__form__products__list__product');

    var productId = document.createElement('input');
    productId.type = 'hidden';
    productId.value = product.id;
    productDiv.appendChild(productId);

    var productName = document.createElement('div');
    productName.classList.add('new__order__content__form__products__list__product__name');
    productName.textContent = product.name;
    productDiv.appendChild(productName);

    var productQuantity = document.createElement('div');
    productQuantity.classList.add('new__order__content__form__products__list__product__quantity');
    productDiv.appendChild(productQuantity);

    var productQuantityInput = document.createElement('input');
    productQuantityInput.type = 'text';
    productQuantityInput.value = 1;
    productQuantityInput.onkeyup = function(e) {
        if (e.which < 48 || e.which > 57) {
            e.preventDefault();
        }

    }
    // add a listener to the input to update the total
    productQuantityInput.addEventListener('input', function() {
        var price = product.price;
        var quantity = productQuantityInput.value;
        try {
            if (quantity === '') {
                quantity = 0;
            }
            quantity = parseInt(quantity);
        } catch (e) {
            quantity = 0;
        }

        if (quantity > product.stock && product.unlimited_stock === false) {
            quantity = product.stock;
            productQuantityInput.value = quantity;
        }
        var total = price * quantity;
        productTotal.textContent = formatter.format(total);
    });
    productQuantity.appendChild(productQuantityInput);

    var productPrice = document.createElement('div');
    productPrice.classList.add('new__order__content__form__products__list__product__price');
    productPrice.textContent = formatter.format(product.price);
    productDiv.appendChild(productPrice);

    var productTotal = document.createElement('div');
    productTotal.classList.add('new__order__content__form__products__list__product__total');
    productTotal.textContent = formatter.format(product.price);
    productDiv.appendChild(productTotal);

    var productActions = document.createElement('div');
    productActions.classList.add('new__order__content__form__products__list__product__actions');
    productDiv.appendChild(productActions);

    var productActionButton = document.createElement('button');
    productActionButton.classList.add('new__order__content__form__products__list__product__actions__button');
    productActions.appendChild(productActionButton);

    var productActionButtonSpan = document.createElement('span');
    productActionButtonSpan.classList.add('material-symbols-outlined');
    productActionButtonSpan.textContent = 'close';
    productActionButtonSpan.onclick = function() {
        removeProduct(this);
    }
    productActionButton.appendChild(productActionButtonSpan);


    list.appendChild(productDiv);
}

function addProductEdit(id) {
    // hide the product results
    var list = document.getElementById('edit_order_product_results');
    list.innerHTML = '';
    list.style.display = 'none';
    // clear input
    var input = document.getElementById('edit_order_product_search');
    input.value = '';

    const products = JSON.parse(document.getElementById('products').textContent);
    var product = products.find(product => product.id === id);

    var list = document.getElementById('edit_order_products_list');
    // check if the product is already in the list
    var productDiv = list.querySelector('input[value="' + product.id + '"]');
    if (productDiv) {
        var productQuantityInput = productDiv.parentElement.querySelector('.new__order__content__form__products__list__product__quantity input');
        productQuantityInput.value = parseInt(productQuantityInput.value) + 1;
        productQuantityInput.dispatchEvent(new Event('input'));
        return;
    }

    var productDiv = document.createElement('div');
    productDiv.classList.add('new__order__content__form__products__list__product');

    var productId = document.createElement('input');
    productId.type = 'hidden';
    productId.value = product.id;
    productDiv.appendChild(productId);

    var productName = document.createElement('div');
    productName.classList.add('new__order__content__form__products__list__product__name');
    productName.textContent = product.name;
    productDiv.appendChild(productName);

    var productQuantity = document.createElement('div');
    productQuantity.classList.add('new__order__content__form__products__list__product__quantity');
    productDiv.appendChild(productQuantity);

    var productQuantityInput = document.createElement('input');
    productQuantityInput.type = 'text';
    productQuantityInput.value = 1;
    productQuantityInput.onkeyup = function(e) {
        if (e.which < 48 || e.which > 57) {
            e.preventDefault();
        }
        
    }
    // add a listener to the input to update the total
    productQuantityInput.addEventListener('input', function() {
        var price = product.price;
        var quantity = productQuantityInput.value;
        try {
            if (quantity === '') {
                quantity = 0;
            }
            quantity = parseInt(quantity);
        } catch (e) {
            quantity = 0;
        }

        if (quantity > product.stock && product.unlimited_stock === false) {
            quantity = product.stock;
            productQuantityInput.value = quantity;
        }
        var total = price * quantity;
        productTotal.textContent = formatter.format(total);
    });
    productQuantity.appendChild(productQuantityInput);

    var productPrice = document.createElement('div');
    productPrice.classList.add('new__order__content__form__products__list__product__price');
    productPrice.textContent = formatter.format(product.price);
    productDiv.appendChild(productPrice);
    
    var productTotal = document.createElement('div');
    productTotal.classList.add('new__order__content__form__products__list__product__total');
    productTotal.textContent = formatter.format(product.price);
    productDiv.appendChild(productTotal);

    var productActions = document.createElement('div');
    productActions.classList.add('new__order__content__form__products__list__product__actions');
    productDiv.appendChild(productActions);

    var productActionButton = document.createElement('button');
    productActionButton.classList.add('new__order__content__form__products__list__product__actions__button');
    productActions.appendChild(productActionButton);

    var productActionButtonSpan = document.createElement('span');
    productActionButtonSpan.classList.add('material-symbols-outlined');
    productActionButtonSpan.textContent = 'close';
    productActionButtonSpan.onclick = function() {
        removeProduct(this);
    }
    productActionButton.appendChild(productActionButtonSpan);

    list.appendChild(productDiv);
}


function searchProduct(element) {
    var value = element.value.replace(/['"]+/g, '');
    var list = document.getElementById('order_product_results');
    if (value === '') {
        list.innerHTML = '';
        list.style.display = 'none';
        return;
    }
    const products = JSON.parse(document.getElementById('products').textContent);
    var results = products.filter(product => product.name.toLowerCase().replace(/['"]+/g, '').includes(value.toLowerCase()));
    if (results.length === 0) {
        list.innerHTML = '';
        list.style.display = 'none';
        return;
    }

    if (list.style.display === 'none') {
        list.style.display = 'block';
    }

    list.innerHTML = '';

    results.forEach(product => {
        var productDiv = document.createElement('div');
        productDiv.classList.add('new__order__content__form__input__product__result');

        var productName = document.createElement('div');
        productName.classList.add('new__order__content__form__input__product__result__name');
        productName.textContent = product.name;
        productDiv.appendChild(productName);

        var productPrice = document.createElement('div');
        productPrice.classList.add('new__order__content__form__input__product__result__price');
        productPrice.textContent = formatter.format(product.price);
        productDiv.appendChild(productPrice);

        var productQuantity = document.createElement('div');
        productQuantity.classList.add('new__order__content__form__input__product__result__quantity');
        productQuantity.textContent = 'Qty: ' + (product.unlimited_stock === false ? product.stock : 'Unlimited');
        productDiv.appendChild(productQuantity);

        var productActions = document.createElement('div');
        productActions.classList.add('new__order__content__form__input__product__result__actions');
        productDiv.appendChild(productActions);

        var productActionButton = document.createElement('button');
        productActionButton.classList.add('new__order__content__form__input__product__result__actions__button');
        productActionButton.onclick = function() {
            addProduct(product.id);
        }
        productActions.appendChild(productActionButton);

        var productActionButtonSpan = document.createElement('span');
        productActionButtonSpan.classList.add('material-symbols-outlined');
        productActionButtonSpan.textContent = 'add';
        productActionButton.appendChild(productActionButtonSpan);

        list.appendChild(productDiv);
    });
}

function searchProductEdit(element) {
    var value = element.value.replace(/['"]+/g, '');
    var list = document.getElementById('edit_order_product_results');
    if (value === '') {
        list.innerHTML = '';
        list.style.display = 'none';
        return;
    }
    const products = JSON.parse(document.getElementById('products').textContent);
    var results = products.filter(product => product.name.toLowerCase().replace(/['"]+/g, '').includes(value.toLowerCase()));
    if (results.length === 0) {
        list.innerHTML = '';
        list.style.display = 'none';
        return;
    }

    if (list.style.display === 'none') {
        list.style.display = 'block';
    }

    list.innerHTML = '';

    results.forEach(product => {
        var productDiv = document.createElement('div');
        productDiv.classList.add('new__order__content__form__input__product__result');

        var productName = document.createElement('div');
        productName.classList.add('new__order__content__form__input__product__result__name');
        productName.textContent = product.name;
        productDiv.appendChild(productName);

        var productPrice = document.createElement('div');
        productPrice.classList.add('new__order__content__form__input__product__result__price');
        productPrice.textContent = formatter.format(product.price);
        productDiv.appendChild(productPrice);

        var productQuantity = document.createElement('div');
        productQuantity.classList.add('new__order__content__form__input__product__result__quantity');
        productQuantity.textContent = 'Qty: ' + (product.unlimited_stock === false ? product.stock : 'Unlimited');
        productDiv.appendChild(productQuantity);

        var productActions = document.createElement('div');
        productActions.classList.add('new__order__content__form__input__product__result__actions');
        productDiv.appendChild(productActions);

        var productActionButton = document.createElement('button');
        productActionButton.classList.add('new__order__content__form__input__product__result__actions__button');
        productActionButton.onclick = function() {
            addProductEdit(product.id);
        }
        productActions.appendChild(productActionButton);

        var productActionButtonSpan = document.createElement('span');
        productActionButtonSpan.classList.add('material-symbols-outlined');
        productActionButtonSpan.textContent = 'add';
        productActionButton.appendChild(productActionButtonSpan);

        list.appendChild(productDiv);
    });
}

function newOrderModal() {
    var modal = document.getElementById('new-order');
    document.body.classList.add('no-scroll');

    const inputs = modal.querySelectorAll('input');
    inputs.forEach(input => input.value = '');

    const selects = modal.querySelectorAll('select');
    selects.forEach(select => select.selectedIndex = 0);

    const list = document.getElementById('order_products_list');
    list.innerHTML = '';

    const textarea = modal.querySelector('textarea');
    textarea.value = '';

    const clients = JSON.parse(document.getElementById('clients').textContent);
    var select = modal.querySelector('#order_client');
    select.innerHTML = '<option value="" disabled selected>Select a client</option><option value="0">Walk-in</option>';
    clients.forEach(client => {
        var option = document.createElement('option');
        option.value = client.id;
        option.textContent = client.name;
        select.appendChild(option);
    });

    modal.style.display = 'flex';
}

function closeOrderModal() {
    var modal = document.getElementById('new-order');
    document.body.classList.remove('no-scroll');
    modal.style.display = 'none';
}

function saveNewOrder() {
    var modal = document.getElementById('new-order');
    var client = modal.querySelector('#order_client').value;
    var products = [];
    var list = modal.querySelector('#order_products_list');
    var productDivs = list.querySelectorAll('.new__order__content__form__products__list__product');
    productDivs.forEach(productDiv => {
        var productId = productDiv.querySelector('input').value;
        var productQuantity = productDiv.querySelector('.new__order__content__form__products__list__product__quantity input').value;
        products.push({id: productId, quantity: productQuantity});
    });
    var notes = modal.querySelector('#order_notes').value;
    var status = modal.querySelector('#order_status').value;

    if (client === '' || products.length === 0 || status === '' || status === '0') {
        missingFieldModal();
        return;
    }

    var csrf = document.getElementById('csrf_token').value;

    fetch('/app/orders/new', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrf
        },
        body: JSON.stringify({
            client: client,
            products: products,
            notes: notes,
            status: status
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            alert(data.error);
        } else {
            closeOrderModal();
            var orders = JSON.parse(document.getElementById('orders').textContent);
            orders.unshift(data.order);
            document.getElementById('orders').textContent = JSON.stringify(orders);
            pagination(0);
        }
    })
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function viewOrder(id) {
    var modal = document.getElementById('view-order');
    document.body.classList.add('no-scroll');
    modal.style.display = 'flex';

    orders = JSON.parse(document.getElementById('orders').textContent);
    products = JSON.parse(document.getElementById('products').textContent);
    var order = orders.find(order => order.id === id);
    var list = modal.querySelector('#view_order_products_list');
    list.innerHTML = '';

    view_order_client = modal.querySelector('#view_order_client');
    view_order_client.value = order.client.name

    order.items.forEach(item => {
        product = products.find(p => p.id === item.id);
        var productDiv = document.createElement('div');
        productDiv.classList.add('new__order__content__form__products__list__product');

        var productName = document.createElement('div');
        productName.classList.add('new__order__content__form__products__list__product__name');
        productName.textContent = product.name;
        productDiv.appendChild(productName);

        var productQuantity = document.createElement('div');
        productQuantity.classList.add('new__order__content__form__products__list__product__quantity');
        productDiv.appendChild(productQuantity);

        var productQuantityInput = document.createElement('input');
        productQuantityInput.type = 'text';
        productQuantityInput.value = parseInt(item.quantity);
        productQuantityInput.disabled = true;
        productQuantity.appendChild(productQuantityInput);

        var productPrice = document.createElement('div');
        productPrice.classList.add('new__order__content__form__products__list__product__price');
        productPrice.textContent = formatter.format(product.price);
        productDiv.appendChild(productPrice);

        var productTotal = document.createElement('div');
        productTotal.classList.add('new__order__content__form__products__list__product__total');
        productTotal.textContent = formatter.format(product.price * item.quantity);
        productDiv.appendChild(productTotal);

        list.appendChild(productDiv);
    });

    var notes = modal.querySelector('#view_order_notes');
    notes.value = order.notes;

    var status = modal.querySelector('#view_order_status');
    status.value = capitalizeFirstLetter(order.status);
}

function closeViewOrderModal() {
    var modal = document.getElementById('view-order');
    document.body.classList.remove('no-scroll');
    modal.style.display = 'none';
}

function editOrder(id) {
    var modal = document.getElementById('edit-order');
    document.body.classList.add('no-scroll');
    modal.style.display = 'flex';

    orders = JSON.parse(document.getElementById('orders').textContent);
    products = JSON.parse(document.getElementById('products').textContent);
    var order = orders.find(order => order.id === id);
    var list = modal.querySelector('#edit_order_products_list');
    list.innerHTML = '';

    // add all clients to the select
    const clients = JSON.parse(document.getElementById('clients').textContent);
    var select = modal.querySelector('#edit_order_client');
    select.innerHTML = '<option value="" disabled>Select a client</option><option value="0">Walk-in</option>';
    clients.forEach(client => {
        var option = document.createElement('option');
        option.value = client.id;
        option.textContent = client.name;
        select.appendChild(option);
    });
    select.value = order.client.id

    order.items.forEach(item => {
        product = products.find(p => p.id === item.id);
        var productDiv = document.createElement('div');
        productDiv.classList.add('new__order__content__form__products__list__product');

        var productId = document.createElement('input');
        productId.type = 'hidden';
        productId.value = product.id;
        productDiv.appendChild(productId);

        var productName = document.createElement('div');
        productName.classList.add('new__order__content__form__products__list__product__name');
        productName.textContent = product.name;
        productDiv.appendChild(productName);

        var productQuantity = document.createElement('div');
        productQuantity.classList.add('new__order__content__form__products__list__product__quantity');
        productDiv.appendChild(productQuantity);

        var productQuantityInput = document.createElement('input');
        productQuantityInput.type = 'text';
        productQuantityInput.value = parseInt(item.quantity);
        productQuantityInput.onkeyup = function(e) {
            if (e.which < 48 || e.which > 57) {
                e.preventDefault();
            }
        }

        productQuantityInput.addEventListener('input', function() {
            var price = product.price;
            var quantity = productQuantityInput.value;
            try {
                if (quantity === '') {
                    quantity = 0;
                }
                quantity = parseInt(quantity);
            } catch (e) {
                quantity = 0;
            }

            if (quantity > product.stock && product.unlimited_stock === false) {
                quantity = product.stock;
                productQuantityInput.value = quantity;
            }
            var total = price * quantity;
            productTotal.textContent = formatter.format(total);
        });
        productQuantity.appendChild(productQuantityInput);

        var productPrice = document.createElement('div');
        productPrice.classList.add('new__order__content__form__products__list__product__price');
        productPrice.textContent = formatter.format(product.price);
        productDiv.appendChild(productPrice);

        var productTotal = document.createElement('div');
        productTotal.classList.add('new__order__content__form__products__list__product__total');
        productTotal.textContent = formatter.format(product.price * item.quantity);
        productDiv.appendChild(productTotal);

        list.appendChild(productDiv);
    });

    var notes = modal.querySelector('#edit_order_notes');
    notes.value = order.notes;

    var status = modal.querySelector('#edit_order_status');
    status.value = order.status;

    var orderId = modal.querySelector('#edit_order_id');
    orderId.value = order.id;
}

function closeEditOrderModal() {
    var modal = document.getElementById('edit-order');
    document.body.classList.remove('no-scroll');
    modal.style.display = 'none';
}

function saveEditOrder() {
    var modal = document.getElementById('edit-order');
    var client = modal.querySelector('#edit_order_client').value;
    var products = [];
    var list = modal.querySelector('#edit_order_products_list');
    var productDivs = list.querySelectorAll('.new__order__content__form__products__list__product');
    productDivs.forEach(productDiv => {
        var productId = productDiv.querySelector('input').value;
        var productQuantity = productDiv.querySelector('.new__order__content__form__products__list__product__quantity input').value;
        products.push({id: productId, quantity: productQuantity});
    });
    var notes = modal.querySelector('#edit_order_notes').value;
    var status = modal.querySelector('#edit_order_status').value;
    var orderId = modal.querySelector('#edit_order_id').value;

    if (client === '' || products.length === 0 || status === '' || status === '0') {
        missingFieldModal();
        return;
    }

    var csrf = document.getElementById('csrf_token').value;

    fetch('/app/orders/edit', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrf
        },
        body: JSON.stringify({
            id: orderId,
            client: client,
            products: products,
            notes: notes,
            status: status
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            alert(data.error);
        } else {
            closeEditOrderModal();
            var orders = JSON.parse(document.getElementById('orders').textContent);
            var index = orders.findIndex(order => order.id === id);
            order[index] = data.order;
            document.getElementById('orders').textContent = JSON.stringify(order);
            pagination(0);

        }
    })
}

function pagination(toggle) {
    const table = document.getElementById('data-table');
    const tbody = table.querySelector('tbody');
    const orders = JSON.parse(document.getElementById('orders').textContent);
    const textInputs = document.querySelectorAll('input[type=text][data-type=orderSearch]');
    const search = textInputs[0].value.trim().toLowerCase();
    const offsetInput = document.getElementById('pagination_offset');
    let offset = parseInt(offsetInput.value);
    const limit = parseInt(document.getElementById('pagination_limit').value);

    if (toggle === 0 && offset > 0) {
        offset -= limit;
    } else if (toggle === 1 && offset + limit < orders.length) {
        offset += limit;
    }

    const previousButton = document.getElementsByName('Previous')[0];
    const nextButton = document.getElementsByName('Next')[0];
    previousButton.disabled = offset === 0;
    nextButton.disabled = offset + limit >= orders.length;

    offsetInput.value = offset;
    tbody.innerHTML = '';
    products = JSON.parse(document.getElementById('products').textContent);

    orders.slice(offset, offset + limit).forEach(function (order, index) {
        const tr = document.createElement('tr');
        tr.id = order.id;
        tr.innerHTML = `
            <td><div class="td-content">${offset + index + 1}</div></td>
            <td><div class="td-content"><input type="checkbox" value="${order.id}" data-type="orderCheckbox" onchange="orderSelect(this)"></div></td>
            <td><div class="td-content">${order.order_number}</div></td>
            <td><div class="td-content">${order.client.name}</div></td>
            <td><div class="td-content">${formatter.format(order.total)}</div></td>
            <td><div class="td-content">${capitalizeFirstLetter(order.status)}</div></td>
            <td><div class="td-content">${formatDate(order.created_at)}</div></td>
            <td><div class="td-content" style="gap: 0.5rem;">
                <a href="javascript:void(0)" onclick="viewOrder('${order.id}')"><span class="material-symbols-outlined">visibility</span></a>
                <a href="javascript:void(0)" onclick="editOrder('${order.id}')"><span class="material-symbols-outlined">edit</span></a>
            </div></td>
        `
        tbody.appendChild(tr);

    });
}

function toggleActions() {
    let unblock = false;
    const checkboxes = document.querySelectorAll('input[type=checkbox][data-type=orderCheckbox]');
    checkboxes.forEach(checkbox => {
        if (checkbox.checked) {
            unblock = true;
        }
    });

    unblock ? unlockActions() : lockActions();
}

function unlockActions() {
    const actions = document.querySelectorAll('.dashboard__content__table__actions__button');
    actions.forEach(action => {
        if (action.disabled) {
            action.disabled = false;
        }
    });
}

function lockActions() {
    const actions = document.querySelectorAll('.dashboard__content__table__actions__button');
    actions.forEach(action => {
        action.disabled = true;
    });
}

function orderSelect(element) {
    const tr = document.getElementById(element.value);
    element.checked ? tr.classList.add('selected') : tr.classList.remove('selected');
    toggleActions();
}

function orderSelectAll(element) {
    const checkboxes = document.querySelectorAll('input[type=checkbox][data-type=orderCheckbox]');
    checkboxes.forEach(checkbox => {
        checkbox.checked = element.checked;
        const tr = document.getElementById(checkbox.value);
        element.checked ? tr.classList.add('selected') : tr.classList.remove('selected');
    });
    toggleActions();
}

function sortBy(key, order = 'asc', element) {
    var orders = JSON.parse(document.getElementById('orders').textContent);
    /* sort array then update the table */
    orders.sort(function (a, b) {
        if (order === 'asc') {
            return a[key] > b[key] ? 1 : -1;
        } else {
            return a[key] < b[key] ? 1 : -1;
        }
    });

    document.getElementById('orders').textContent = JSON.stringify(orders);
    pagination(0);

    /* update the arrow icons */
    const arrows = document.querySelectorAll('.sort-by');
    arrows.forEach(arrow => {
        if (arrow !== element) {
            arrow.classList.remove('up', 'down');
        }
    });

    if (order === 'asc') {
        element.classList.remove('down');
        element.classList.add('up');
        element.setAttribute('onclick', `sortBy('${key}', 'desc', this)`);
    }

    if (order === 'desc') {
        element.classList.remove('up');
        element.classList.add('down');
        element.setAttribute('onclick', `sortBy('${key}', 'asc', this)`);
    }

}