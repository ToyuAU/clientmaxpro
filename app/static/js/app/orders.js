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
    select.innerHTML = '<option value="">Select a client</option><option value="0">Walk-in</option>';
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
            location.reload();
        }
    })
}