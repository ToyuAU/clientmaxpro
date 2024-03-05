function toggleActions() {
    let unblock = false;
    const checkboxes = document.querySelectorAll('input[type=checkbox][data-type=clientCheckbox]');
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

function editClient(id) {
    const clients = JSON.parse(document.getElementById('clients').textContent);
    const client = clients.find(client => client.id === id);
    const modal = document.getElementById('edit-client');

    const inputs = modal.querySelectorAll('input');
    inputs.forEach(input => input.value = '');

    const selects = modal.querySelectorAll('select');
    selects.forEach(select => select.selectedIndex = 0);

    businesses = JSON.parse(document.getElementById('businesses').textContent);
    const businessSelect = modal.querySelector('select[name=edit_client_business]');

    businessSelect.innerHTML = '<option value="" disabled selected>Select a business</option><option value="0">None</option>';
    businesses.forEach(business => {
        const option = document.createElement('option');
        option.value = business.id;
        option.textContent = business.name;
        businessSelect.appendChild(option);
    });

    modal.querySelector('input[name=edit_client_id]').value = client.id;
    modal.querySelector('input[name=edit_client_name]').value = client.name;
    modal.querySelector('input[name=edit_client_email]').value = client.email;
    modal.querySelector('input[name=edit_client_phone]').value = client.phone;
    modal.querySelector('input[name=edit_client_address_input]').value = client.address + ', ' + client.city + ' ' + client.state + ', ' + client.country;
    modal.querySelector('input[name=edit_client_address]').value = client.address;
    modal.querySelector('input[name=edit_client_city]').value = client.city;
    modal.querySelector('input[name=edit_client_state]').value = client.state;
    modal.querySelector('input[name=edit_client_zip]').value = client.zip_code;
    modal.querySelector('input[name=edit_client_country]').value = client.country;
    if (client.client_business !== null) {
        modal.querySelector('select[name=edit_client_business]').value = client.client_business.id
    } else {
        modal.querySelector('select[name=edit_client_business]').value = '0';
    }

    modal.style.display = 'flex';
    document.body.classList.add('no-scroll');
}

function closeEditClientModal() {
    const modal = document.getElementById('edit-client');
    modal.style.display = 'none';
    document.body.classList.remove('no-scroll');
}

function sortBy(key, order = 'asc', element) {
    var clients = JSON.parse(document.getElementById('clients').textContent);
    /* sort array then update the table */
    clients.sort(function (a, b) {
        if (order === 'asc') {
            return a[key] > b[key] ? 1 : -1;
        } else {
            return a[key] < b[key] ? 1 : -1;
        }
    });

    document.getElementById('clients').textContent = JSON.stringify(clients);
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

function saveEditClient() {
    var id = document.getElementById('edit_client_id').value;
    var name = document.getElementById('edit_client_name').value;
    var email = document.getElementById('edit_client_email').value;
    var phone = document.getElementById('edit_client_phone').value;
    var business = document.getElementById('edit_client_business').value;
    var address = document.getElementById('edit_client_address').value;
    var city = document.getElementById('edit_client_city').value;
    var state = document.getElementById('edit_client_state').value;
    var zip = document.getElementById('edit_client_zip').value;
    var country = document.getElementById('edit_client_country').value;

    if (name.length === 0 || email.length === 0 || phone.length === 0 || business.length === 0 || address.length === 0 || city.length === 0 || state.length === 0 || zip.length === 0 || country.length === 0) {
        alert('All fields are required.');
        return;
    }

    fetch('/app/clients/edit', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': document.getElementById('csrf_token').value
        },
        body: JSON.stringify({ id, name, email, phone, business, address, city, state, zip, country })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            const clients = JSON.parse(document.getElementById('clients').textContent);
            const index = clients.findIndex(client => client.id === id);
            clients[index] = data.client;
            document.getElementById('clients').textContent = JSON.stringify(clients);
            pagination(0);
            closeEditClientModal();
        } else {
            alert('An error occurred while updating the client.');
        }
    });
}

function clientSelect(element) {
    const tr = document.getElementById(element.value);
    element.checked ? tr.classList.add('selected') : tr.classList.remove('selected');
    toggleActions();
}

function clientSelectAll(element) {
    const checkboxes = document.querySelectorAll('input[type=checkbox][data-type=clientCheckbox]');
    checkboxes.forEach(checkbox => {
        checkbox.checked = element.checked;
        const tr = document.getElementById(checkbox.value);
        element.checked ? tr.classList.add('selected') : tr.classList.remove('selected');
    });
    toggleActions();
}

function closeBusinessModal() {
    const modal = document.getElementById('new-business');
    modal.style.display = 'none';

    reopenModel = document.getElementById('reopen_model');
    if (reopenModel.value.length > 0) {
        document.getElementById(reopenModel.value).style.display = 'flex';
    } else {
        document.body.classList.remove('no-scroll');
    }
}

function newBusinessModal() {
    const modal = document.getElementById('new-business');
    modal.style.display = 'flex';
    document.body.classList.add('no-scroll');
    reopenModel = document.getElementById('reopen_model');
    // hide the new-client modal if it's open or edit-client modal
    const clientModal = document.getElementById('new-client');
    if (clientModal.style.display === 'flex') {
        clientModal.style.display = 'none';
        reopenModel.value = 'new-client';
    }

    const editClientModal = document.getElementById('edit-client');
    if (editClientModal.style.display === 'flex') {
        editClientModal.style.display = 'none';
        reopenModel.value = 'edit-client';
    }
}

function saveNewBusiness() {
    var name = document.getElementById('business_name').value;

    if (name.length === 0) {
        alert('All fields are required.');
        return;
    }

    fetch('/app/businesses/new', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': document.getElementById('csrf_token').value
        },
        body: JSON.stringify({ name, is_client: true })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            const businesses = JSON.parse(document.getElementById('businesses').textContent);
            businesses.unshift(data.business);
            document.getElementById('businesses').textContent = JSON.stringify(businesses);
            const modal = document.getElementById('new-client');
            const businessSelect = modal.querySelector('select[name=client_business]');
            const option = document.createElement('option');
            option.value = data.business.id;
            option.textContent = data.business.name;
            businessSelect.appendChild(option);

            const editModal = document.getElementById('edit-client');
            const editBusinessSelect = editModal.querySelector('select[name=edit_client_business]');
            const editOption = document.createElement('option');
            editOption.value = data.business.id;
            editOption.textContent = data.business.name;
            editBusinessSelect.appendChild(editOption);

            closeBusinessModal();
        } else {
            alert('An error occurred while adding the new business.');
        }
    });
}

function pagination(toggle) {
    const table = document.getElementById('data-table');
    const tbody = table.querySelector('tbody');
    const clients = JSON.parse(document.getElementById('clients').textContent);
    const textInputs = document.querySelectorAll('input[type=text][data-type=clientSearch]');
    const search = textInputs[0].value.trim().toLowerCase();
    const offsetInput = document.getElementById('pagination_offset');
    let offset = parseInt(offsetInput.value);
    const limit = parseInt(document.getElementById('pagination_limit').value);

    if (toggle === 0 && offset > 0) {
        offset -= limit;
    } else if (toggle === 1 && offset + limit < clients.length) {
        offset += limit;
    }

    const previousButton = document.getElementsByName('Previous')[0];
    const nextButton = document.getElementsByName('Next')[0];
    previousButton.disabled = offset === 0;
    nextButton.disabled = offset + limit >= clients.length;

    offsetInput.value = offset;
    tbody.innerHTML = '';

    clients.slice(offset, offset + limit).forEach(function (client, index) {
        const tr = document.createElement('tr');
        tr.id = client.id;
        tr.innerHTML = `
            <td><div class="td-content"><p>${offset + index + 1}</p></div></td>
            <td><div class="td-content"><input type="checkbox" value="${client.id}" data-type="clientCheckbox" onchange="clientSelect(this)"></div></td>
            <td><div class="td-content"><p>${client.name}</p></div></td>
            <td><div class="td-content">
                <div class="contact-details">
                    <div><p>${client.email}</p><a href="emailto:${client.email}"><span class="material-symbols-outlined">email</span></a></div>
                    <div><p>${client.phone}</p><a href="tel:${client.phone}"><span class="material-symbols-outlined">phone</span></a></div>
                </div>
            </div></td>
            <td><div class="td-content"><p>${client.client_business ? client.client_business.name : 'None'}</p></div></td>
            <td><div class="td-content"><p>${formatDate(client.created_at)}</p></div></td>
            <td><div class="td-content"><a href="javascript:void(0)" onclick="editClient('${client.id}')"><span class="material-symbols-outlined">edit</span></a></div></td>
        `;
        tbody.appendChild(tr);
    });
}

function newClientModal() {
    const modal = document.getElementById('new-client');

    const inputs = modal.querySelectorAll('input');
    inputs.forEach(input => input.value = '');

    const selects = modal.querySelectorAll('select');
    selects.forEach(select => select.selectedIndex = 0);

    businesses = JSON.parse(document.getElementById('businesses').textContent);
    const businessSelect = modal.querySelector('select[name=client_business]');
    businessSelect.innerHTML = '<option value="" disabled selected>Select a business</option><option value="0">None</option>';
    businesses.forEach(business => {
        const option = document.createElement('option');
        option.value = business.id;
        option.textContent = business.name;
        businessSelect.appendChild(option);
    });

    modal.style.display = 'flex';
    document.body.classList.add('no-scroll');
}

function reopenClientModal() {
    const modal = document.getElementById('new-client');
    modal.style.display = 'flex';
    document.body.classList.add('no-scroll');
}

function closeClientModal() {
    const modal = document.getElementById('new-client');
    modal.style.display = 'none';
    document.body.classList.remove('no-scroll');
}

function saveNewClient() {
    var name = document.getElementById('client_name').value;
    var email = document.getElementById('client_email').value;
    var phone = document.getElementById('client_phone').value;
    var business = document.getElementById('client_business').value;
    var address = document.getElementById('client_address').value;
    var city = document.getElementById('client_city').value;
    var state = document.getElementById('client_state').value;
    var zip = document.getElementById('client_zip').value;
    var country = document.getElementById('client_country').value;

    if (name.length === 0 || email.length === 0 || phone.length === 0 || business.length === 0 || address.length === 0 || city.length === 0 || state.length === 0 || zip.length === 0 || country.length === 0) {
        alert('All fields are required.');
        return;
    }

    fetch('/app/clients/new', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': document.getElementById('csrf_token').value
        },
        body: JSON.stringify({ name, email, phone, business, address, city, state, zip, country })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            const clients = JSON.parse(document.getElementById('clients').textContent);
            clients.unshift(data.client);
            document.getElementById('clients').textContent = JSON.stringify(clients);
            pagination(1);
            closeClientModal();
        } else {
            alert('An error occurred while adding the new client.');
        }
    });
}

function deleteSelected(confirmed = false) {
    const checkboxes = document.querySelectorAll('input[type=checkbox][data-type=clientCheckbox]');
    const selected = Array.from(checkboxes).filter(checkbox => checkbox.checked).map(checkbox => checkbox.value);

    if (!confirmed) {
        if (selected.length > 0) {
            createConfirmation('Are you sure you want to delete the selected client/s?', 'deleteSelected', true);
        }
        return;
    }

    clearConfirmation();

    if (selected.length > 0) {
        fetch('/app/clients/delete', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': document.getElementById('csrf_token').value
            },
            body: JSON.stringify({ selected })
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    const clients = JSON.parse(document.getElementById('clients').textContent);
                    const updatedClients = clients.filter(client => !selected.includes(client.id.toString()));
                    document.getElementById('clients').textContent = JSON.stringify(updatedClients);
                    pagination(0);
                } else {
                    alert('An error occurred while deleting the selected clients.');
                }
            });
    }
}

function downloadSelected() {
    const checkboxes = document.querySelectorAll('input[type=checkbox][data-type=clientCheckbox]');
    const selected = Array.from(checkboxes).filter(checkbox => checkbox.checked).map(checkbox => checkbox.value);

    if (selected.length > 0) {
        const clients = JSON.parse(document.getElementById('clients').textContent);
        const selectedClients = clients.filter(client => selected.includes(client.id.toString()));
        const csvData = convertToCSV(selectedClients);
        const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
        downloadCSV(csvData, `clients_${timestamp}.csv`);
    }
}

document.addEventListener('DOMContentLoaded', function () {
    const csvButton = document.getElementsByClassName('dashboard__content__table__header__right__button')[0];
    csvButton.addEventListener('click', function () {
        const csvData = convertToCSV(JSON.parse(document.getElementById('clients').textContent));
        const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
        downloadCSV(csvData, `clients_${timestamp}.csv`);
    });

    const addressInput = document.getElementById('client_address_input');
    var autocomplete = new google.maps.places.Autocomplete(addressInput);
    google.maps.event.addListener(autocomplete, 'place_changed', function () {
        var place = autocomplete.getPlace();
        var address = '';
        if (place.address_components) {
            place.address_components.forEach(function (component) {
                if (component.types.includes('locality')) {
                    document.getElementById('client_city').value = component.long_name;
                } else if (component.types.includes('administrative_area_level_1')) {
                    document.getElementById('client_state').value = component.short_name;
                } else if (component.types.includes('postal_code')) {
                    document.getElementById('client_zip').value = component.long_name;
                } else if (component.types.includes('country')) {
                    document.getElementById('client_country').value = component.long_name;
                } else if (component.types.includes('street_number')) {
                    // check if any text is already in the address string
                    if (address.length > 0) {
                        address += ' ' + component.long_name;
                    } else {
                        address += component.long_name;
                    }
                } else if (component.types.includes('route')) {
                    if (address.length > 0) {
                        address += ' ' + component.long_name;
                    } else {
                        address += component.long_name;
                    }
                }
            }
            );
        }
        document.getElementById('client_address').value = address;
    });

    const textInputs = document.querySelectorAll('input[type=text][data-type=clientSearch]');
    textInputs.forEach(textInput => {
        textInput.addEventListener('keyup', function () {
            const table = document.getElementById('data-table');
            const tbody = table.querySelector('tbody');
            const clients = JSON.parse(document.getElementById('clients').textContent);
            const search = textInput.value.trim().toLowerCase();
            tbody.innerHTML = '';
            let counter = 0;
            clients.forEach(client => {
                if (counter >= parseInt(document.getElementById('pagination_limit').value)) return;
                if (client.name.toLowerCase().includes(search) || client.email.toLowerCase().includes(search)) {
                    counter++;
                    const tr = document.createElement('tr');
                    tr.id = client.id;
                    const nameHighlighted = client.name.toLowerCase().includes(search) ? client.name.replace(new RegExp(search, 'ig'), '<span class="highlight">$&</span>') : client.name;
                    const emailHighlighted = client.email.toLowerCase().includes(search) ? client.email.replace(new RegExp(search, 'ig'), '<span class="highlight">$&</span>') : client.email;
                    tr.innerHTML = `
                        <td><div class="td-content"><p>${counter}</p></div></td>
                        <td><div class="td-content"><input type="checkbox" value="${client.id}" data-type="clientCheckbox" onchange="clientSelect(this)"></div></td>
                        <td><div class="td-content"><p>${nameHighlighted}</p></div></td>
                        <td><div class="td-content">
                            <div class="contact-details">
                                <div><p>${emailHighlighted}</p><a href="mailto:${client.email}"><span class="material-symbols-outlined">email</span></a></div>
                                <div><p>${client.phone}</p><a href="tel:${client.phone}"><span class="material-symbols-outlined">phone</span></a></div>
                            </div>
                        </div></td>
                        <td><div class="td-content"><p>${client.client_business ? client.client_business.name : 'None'}</p></div></td>
                        <td><div class="td-content"><p>${formatDate(client.created_at)}</p></div></td>
                        <td><div class="td-content"><a href="javascript:void(0)" onclick="editClient('${client.id}')"><span class="material-symbols-outlined">edit</span></a></div></td>
                    `;
                    tbody.appendChild(tr);
                }
            });
        });
    });
});
