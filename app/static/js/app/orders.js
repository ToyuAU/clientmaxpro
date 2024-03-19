function searchProduct(element) {
    var value = element.value.replace(/['"]+/g, '');
    const products = JSON.parse(document.getElementById('products').textContent);
    var results = products.filter(product => product.name.toLowerCase().replace(/['"]+/g, '').includes(value.toLowerCase()));
    var list = document.getElementById('order_products_list');
    list.innerHTML = '';
    results.forEach(product => {
        /* 					<div class="new__order__content__form__products__list__product">
						<div class="new__order__content__form__products__list__product__name">Product 1</div>
						<div class="new__order__content__form__products__list__product__quantity">
                            <input type="number" value="1" step="1">
                        </div>
						<div class="new__order__content__form__products__list__product__price">100.00</div>
						<div class="new__order__content__form__products__list__product__total">100.00</div>
						<div class="new__order__content__form__products__list__product__actions">
							<button class="new__order__content__form__products__list__product__actions__button"><span class="material-symbols-outlined">close</span></button>
						</div>
					</div>
        */

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
        productActionButton.appendChild(productActionButtonSpan);

        list.appendChild(productDiv);
    });
}