function newProductModal() {
    modal = document.getElementById("new-product");

    const inputs = modal.querySelectorAll('input');
    inputs.forEach(input => input.value = '');
    inputs.forEach(input => input.disabled = false);
    inputs.forEach(input => input.checked = false);

    const selects = modal.querySelectorAll('select');
    selects.forEach(select => select.selectedIndex = 0);

    const categories = modal.querySelector('#new_product_category');
    categories.innerHTML = '<option value="" disabled selected>Select a category</option><option value="0">None</option>';
    
    modal.style.display = 'flex';
    document.body.classList.add('no-scroll');
}

function viewProduct(id) {
    product = JSON.parse(document.getElementById('products').textContent).find(product => product.id === id);
    modal = document.getElementById('view-product');
    modal.querySelector('#view_product_name').value = product.name;
    modal.querySelector('#view_product_sku').value = product.sku;
    modal.querySelector('#view_product_description').value = product.description;
    modal.querySelector('#view_product_price').value = formatter.format(product.price);
    if (product.unlimited_stock) {
        modal.querySelector('#view_product_stock_unlimited').checked = true;
        modal.querySelector('#view_product_stock').disabled = true;
        modal.querySelector('#view_product_stock').value = '';
    } else {
        modal.querySelector('#view_product_stock_unlimited').checked = false;
        modal.querySelector('#view_product_stock').disabled = false;
        modal.querySelector('#view_product_stock').value = product.stock;
    }

    view_product_category = modal.querySelector('#view_product_category');
    view_product_category.innerHTML = '<option value="" disabled selected>Select a category</option><option value="0">None</option>';
    categories = JSON.parse(document.getElementById('categories').textContent);
    categories.forEach(category => {
        var option = document.createElement('option');
        option.value = category.id;
        option.textContent = category.name;
        modal.querySelector('#view_product_category').appendChild(option);
    });
    modal.querySelector('#view_product_category').value = product.category !== null ? product.category.id : 0;
    modal.style.display = 'flex';
    document.body.classList.add('no-scroll');
}

function closeViewProductModal() {
    modal = document.getElementById("view-product");
    modal.style.display = 'none';
    document.body.classList.remove('no-scroll');
}

function saveNewProduct() {
    var new_product_name = document.getElementById('new_product_name').value;
    var new_product_sku = document.getElementById('new_product_sku').value;
    var new_product_description = document.getElementById('new_product_description').value;
    var new_product_price = document.getElementById('new_product_price').value;
    var new_product_stock = document.getElementById('new_product_stock').value;
    var new_product_stock_unlimited = document.getElementById('new_product_stock_unlimited').checked;
    var new_product_category = document.getElementById('new_product_category').value;
    
    if (new_product_name === '' || (new_product_price === '' || new_product_stock_unlimited === false && new_product_stock === '') || new_product_category === '') {
        missingFieldModal();
        return;
    }

    var csrf = document.getElementById('csrf_token').value;

    fetch('/app/products/new', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrf
        },
        body: JSON.stringify({
            name: new_product_name,
            sku: new_product_sku,
            description: new_product_description,
            price: localStringToNumber(new_product_price),
            stock: new_product_stock_unlimited === false ? new_product_stock : "unlimited",
            category: new_product_category
        })
    }).then(response => response.json())
    .then(data => {
        if (data.error) {
            alert(data.error);
        } else {
            closeNewProductModal();
            var products = JSON.parse(document.getElementById('products').textContent);
            products.unshift(data.product);
            document.getElementById('products').textContent = JSON.stringify(products);
            pagination(0);
        }
    });

}

const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
});

function pagination(toggle) {
    const table = document.getElementById('data-table');
    const tbody = table.querySelector('tbody');
    const products = JSON.parse(document.getElementById('products').textContent);
    const textInputs = document.querySelectorAll('input[type=text][data-type=productSearch]');
    const search = textInputs[0].value.trim().toLowerCase();
    const offsetInput = document.getElementById('pagination_offset');
    let offset = parseInt(offsetInput.value);
    const limit = parseInt(document.getElementById('pagination_limit').value);

    if (toggle === 0 && offset > 0) {
        offset -= limit;
    } else if (toggle === 1 && offset + limit < products.length) {
        offset += limit;
    }

    const previousButton = document.getElementsByName('Previous')[0];
    const nextButton = document.getElementsByName('Next')[0];
    previousButton.disabled = offset === 0;
    nextButton.disabled = offset + limit >= products.length;

    offsetInput.value = offset;
    tbody.innerHTML = '';

    products.slice(offset, offset + limit).forEach(function (product, index) {
        const tr = document.createElement('tr');
        tr.id = product.id;
        tr.innerHTML = `
            <td>
                <div class="td-content">${offset + index + 1}</div>
            </td>
            <td>
                <div class="td-content"><input type="checkbox" value="${product.id}" data-type="productCheckbox" onchange="productSelect(this)"></div>
            </td>
            <td>
                <div class="td-content"><p>${product.name}</p></div>
            </td>
            <td>
                <div class="td-content">${formatter.format(product.price)}</div>
            </td>
            <td>
                <div class="td-content">${product.unlimited_stock === true ? 'Unlimited' : product.stock}</div>
            </td>
            <td>
                <div class="td-content">${product.category !== null ? product.category.name : "None"}</div>
            </td>
            <td>
                <div class="td-content">${formatDate(product.created_at)}</div>
            </td>
            <td>
                <div class="td-content" style="gap: 0.5rem">
                    <a href="javascript:void(0)" onclick="viewProduct('${product.id}')"><span class="material-symbols-outlined">visibility</span></a>
                    <a href="javascript:void(0)" onclick="editProduct('${product.id}')"><span class="material-symbols-outlined">edit</span></a>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}


function newCategoryModal() {
    const modal = document.getElementById('new-category');
    modal.style.display = 'flex';
    document.body.classList.add('no-scroll');
    reopenModel = document.getElementById('reopen_model');
    const productModal = document.getElementById('new-product');
    const productEditModal = document.getElementById('edit-product');

    const inputs = modal.querySelectorAll('input');
    inputs.forEach(input => input.value = '');
    inputs.forEach(input => input.disabled = false);
    inputs.forEach(input => input.checked = false);

    const selects = modal.querySelectorAll('select');
    selects.forEach(select => select.selectedIndex = 0);

    if (productModal.style.display === 'flex') {
        productModal.style.display = 'none';
        reopenModel.value = 'new-product';
    }

    if (productEditModal.style.display === 'flex') {
        productEditModal.style.display = 'none';
        reopenModel.value = 'edit-product';
    }

    const categories = JSON.parse(document.getElementById('categories').textContent);
    const select = document.getElementById('new_product_category');
    select.innerHTML = '<option value="" disabled selected>Select a category</option><option value="0">None</option>';
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.id;
        option.textContent = category.name;
        select.appendChild(option);
    });

}

function saveNewCategory() {
    const new_category_name = document.getElementById('new_category_name').value;
    if (new_category_name === '') {
        missingFieldModal();
        return;
    }

    const csrf = document.getElementById('csrf_token').value;

    fetch('/app/categories/new', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrf
        },
        body: JSON.stringify({
            name: new_category_name
        })
    }).then(response => response.json())
    .then(data => {
        if (data.error) {
            alert(data.error);
        } else {
            closeCategoryModal();
            const categories = JSON.parse(document.getElementById('categories').textContent);
            categories.unshift(data.category);
            document.getElementById('categories').textContent = JSON.stringify(categories);
            const select = document.getElementById('new_product_category');
            const option = document.createElement('option');
            option.value = data.category.id;
            option.textContent = data.category.name;
            select.appendChild(option);
        }
    });
}

function closeCategoryModal() {
    modal = document.getElementById("new-category");
    modal.style.display = 'none';

    reopenModel = document.getElementById('reopen_model');
    if (reopenModel.value.length > 0) {
        document.getElementById(reopenModel.value).style.display = 'flex';
    } else {
        document.body.classList.remove('no-scroll');
    }
}


function closeNewProductModal() {
    modal = document.getElementById("new-product");
    modal.style.display = 'none';
    document.body.classList.remove('no-scroll');
}

function localStringToNumber(s) {
    return Number(String(s).replace(/[^0-9.-]+/g, ''));
}

function onFocus(e){
    var value = e.target.value;
    e.target.value = value ? localStringToNumber(value) : ''
}

function onBlur(e){
    var value = e.target.value
  
    var options = {
        maximumFractionDigits : 2,
        currency              : "USD",
        style                 : "currency",
        currencyDisplay       : "symbol"
    }
    
    e.target.value = (value || value === 0) 
      ? localStringToNumber(value).toLocaleString(undefined, options)
      : ''
}

function editProduct(id) {
    var product = JSON.parse(document.getElementById('products').textContent).find(product => product.id === id);
    var modal = document.getElementById('edit-product');

    var categories = JSON.parse(document.getElementById('categories').textContent);
    var select = modal.querySelector('#edit_product_category');
    select.innerHTML = '<option value="" disabled selected>Select a category</option><option value="0">None</option>';
    categories.forEach(category => {
        var option = document.createElement('option');
        option.value = category.id;
        option.textContent = category.name;
        select.appendChild(option);
    });

    modal.querySelector('#edit_product_id').value = product.id;
    modal.querySelector('#edit_product_name').value = product.name;
    modal.querySelector('#edit_product_sku').value = product.sku;
    modal.querySelector('#edit_product_description').value = product.description;
    modal.querySelector('#edit_product_price').value = formatter.format(product.price);
    if (product.unlimited_stock) {
        modal.querySelector('#edit_product_stock_unlimited').checked = true;
        modal.querySelector('#edit_product_stock').disabled = true;
        modal.querySelector('#edit_product_stock').value = '';
    } else {
        modal.querySelector('#edit_product_stock_unlimited').checked = false;
        modal.querySelector('#edit_product_stock').disabled = false;
        modal.querySelector('#edit_product_stock').value = product.stock;
    }
    modal.querySelector('#edit_product_category').value = product.category !== null ? product.category.id : 0;

    modal.style.display = 'flex';
    document.body.classList.add('no-scroll');

}

function saveEditProduct() {
    var id = document.getElementById('edit_product_id').value;
    var name = document.getElementById('edit_product_name').value;
    var sku = document.getElementById('edit_product_sku').value;
    var description = document.getElementById('edit_product_description').value;
    var price = document.getElementById('edit_product_price').value;
    var stock = document.getElementById('edit_product_stock').value;
    var stock_unlimited = document.getElementById('edit_product_stock_unlimited').checked;
    var category = document.getElementById('edit_product_category').value;

    if (name === '' || (price === '' || stock_unlimited === false && stock === '') || category === '') {
        missingFieldModal();
        return;
    }

    var csrf = document.getElementById('csrf_token').value;

    fetch('/app/products/edit', {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrf
        },
        body: JSON.stringify({
            id: id,
            name: name,
            sku: sku,
            description: description,
            price: localStringToNumber(price),
            stock: stock_unlimited === false ? stock : "unlimited",
            category: category
        })
    }).then(response => response.json())
    .then(data => {
        if (data.error) {
            alert(data.error);
        } else {
            closeEditProductModal();
            var products = JSON.parse(document.getElementById('products').textContent);
            var index = products.findIndex(product => product.id === id);
            products[index] = data.product;
            document.getElementById('products').textContent = JSON.stringify(products);
            pagination(0);
        }
    });
}


function closeEditProductModal() {
    modal = document.getElementById("edit-product");
    modal.style.display = 'none';
    document.body.classList.remove('no-scroll');
}

function deleteSelected(confirmed = false) {
    const checkboxes = document.querySelectorAll('input[type=checkbox][data-type=productCheckbox]');
    const selected = Array.from(checkboxes).filter(checkbox => checkbox.checked).map(checkbox => checkbox.value);

    if (!confirmed) {
        if (selected.length > 0) {
            createConfirmation('Are you sure you want to delete the selected products/s?', 'deleteSelected', true);
        }
        return;
    }

    clearConfirmation();

    var csrf = document.getElementById('csrf_token').value;

    fetch('/app/products/delete', {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrf
        },
        body: JSON.stringify({
            selected: selected
        })
    }).then(response => response.json())
    .then(data => {
        if (data.error) {
            alert(data.error);
        } else {
            var products = JSON.parse(document.getElementById('products').textContent);
            products = products.filter(product => !ids.includes(product.id.toString()));
            document.getElementById('products').textContent = JSON.stringify(products);
            pagination(0);
            lockActions();
        }
    });

}


document.addEventListener('DOMContentLoaded', () => {
    new_product_price_globals = document.querySelectorAll('.new_product_price_global');
    new_product_price_globals.forEach(price => {
        price.addEventListener('focus', onFocus);
        price.addEventListener('blur', onBlur);
    });

    edit_product_price_globals = document.querySelectorAll('.edit_product_price_global');
    edit_product_price_globals.forEach(price => {
        price.addEventListener('focus', onFocus);
        price.addEventListener('blur', onBlur);
    });

    const unlimitedStockInput = document.getElementById('new_product_stock_unlimited');
    const stockInput = document.getElementById('new_product_stock');
    unlimitedStockInput.addEventListener('change', () => {
        if (unlimitedStockInput.checked) {
            stockInput.value = '';
            stockInput.disabled = true;
        } else {
            stockInput.disabled = false;
        }
    });

    const editUnlimitedStockInput = document.getElementById('edit_product_stock_unlimited');
    const editStockInput = document.getElementById('edit_product_stock');
    editUnlimitedStockInput.addEventListener('change', () => {
        if (editUnlimitedStockInput.checked) {
            editStockInput.value = '';
            editStockInput.disabled = true;
        } else {
            editStockInput.disabled = false;
        }
    });

    const textInputs = document.querySelectorAll('input[type=text][data-type=productSearch]');
    textInputs.forEach(textInput => {
        textInput.addEventListener('keyup', function () {
            const table = document.getElementById('data-table');
            const tbody = table.querySelector('tbody');
            const products = JSON.parse(document.getElementById('products').textContent);
            const search = textInput.value.trim().toLowerCase();
            tbody.innerHTML = '';
            let counter = 0;
            products.forEach(product => {
                if (counter >= parseInt(document.getElementById('pagination_limit').value)) return;
                if (product.name.toLowerCase().includes(search)) {
                    counter++;
                    const tr = document.createElement('tr');
                    tr.id = product.id;
                    const nameHighlighted = product.name.toLowerCase().includes(search) ? product.name.replace(new RegExp(search, 'ig'), '<span class="highlight">$&</span>') : product.name;
                    tr.innerHTML = `
                        <td>
                            <div class="td-content">${counter}</div>
                        </td>
                        <td>
                            <div class="td-content"><input type="checkbox" value="${product.id}" data-type="productCheckbox" onchange="productSelect(this)"></div>
                        </td>
                        <td>
                            <div class="td-content"><p>${nameHighlighted}</p></div>
                        </td>
                        <td>
                            <div class="td-content">${formatter.format(product.price)}</div>
                        </td>
                        <td>
                            <div class="td-content">${product.unlimited_stock === true ? 'Unlimited' : product.stock}</div>
                        </td>
                        <td>
                            <div class="td-content">${product.category !== null ? product.category.name : "None"}</div>
                        </td>
                        <td>
                            <div class="td-content">${formatDate(product.created_at)}</div>
                        </td>
                        <td>
                            <div class="td-content" style="gap: 0.5rem">
                                <a href="javascript:void(0)" onclick="viewProduct('${product.id}')"><span class="material-symbols-outlined">visibility</span></a>
                                <a href="javascript:void(0)" onclick="editProduct('${product.id}')"><span class="material-symbols-outlined">edit</span></a>
                            </div>
                        </td>
                    `;
                    tbody.appendChild(tr);
                }
            });
        });
    });
});
    

function sortBy(key, order = 'asc', element) {
    var products = JSON.parse(document.getElementById('products').textContent);
    /* sort array then update the table */
    products.sort(function (a, b) {
        if (order === 'asc') {
            return a[key] > b[key] ? 1 : -1;
        } else {
            return a[key] < b[key] ? 1 : -1;
        }
    });

    document.getElementById('products').textContent = JSON.stringify(products);
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

function toggleActions() {
    let unblock = false;
    const checkboxes = document.querySelectorAll('input[type=checkbox][data-type=productCheckbox]');
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

function productSelect(element) {
    const tr = document.getElementById(element.value);
    element.checked ? tr.classList.add('selected') : tr.classList.remove('selected');
    toggleActions();
}

function productSelectAll(element) {
    const checkboxes = document.querySelectorAll('input[type=checkbox][data-type=productCheckbox]');
    checkboxes.forEach(checkbox => {
        checkbox.checked = element.checked;
        const tr = document.getElementById(checkbox.value);
        element.checked ? tr.classList.add('selected') : tr.classList.remove('selected');
    });
    toggleActions();
}

