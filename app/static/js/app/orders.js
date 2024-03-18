function searchProduct(element) {
    var value = element.value.replace(/['"]+/g, '');
    const products = JSON.parse(document.getElementById('products').textContent);
    var results = products.filter(product => product.name.toLowerCase().replace(/['"]+/g, '').includes(value.toLowerCase()));
    var list = document.getElementById('order_products_list');
    list.innerHTML = '';
    results.forEach(product => {
        var li = document.createElement('li');
        li.innerHTML = product.name;
        li.setAttribute('onclick', 'addProductToOrder(this)');
        list.appendChild(li);
    });
}