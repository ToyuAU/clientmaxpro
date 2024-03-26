function newRoleModal() {
    const modal = document.getElementById('new-role');

    document.body.classList.add('no-scroll');

    const inputs = modal.querySelectorAll('input');
    inputs.forEach(input => input.value = '');

    const selects = modal.querySelectorAll('select');
    selects.forEach(select => select.selectedIndex = 0);

    modal.style.display = 'flex';

}

function closeNewRoleModal() {
    const modal = document.getElementById('new-role');
    modal.style.display = 'none';
    document.body.classList.remove('no-scroll');
}

function saveNewRole() {
    var modal = document.getElementById('new-role');
    
    var name = modal.querySelector('#role_name').value;
    var permission = modal.querySelector('#role_permission').value;

    if (name == "" || permission == "" || permission == "0") {
        missingFieldModal();
        return;
    }

    // id csrf_token
    var csrf = document.getElementById('csrf_token').value;

    fetch('/app/roles/new', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrf
        },
        body: JSON.stringify({
            name: name,
            permission: permission
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            closeNewRoleModal();
            var roles = JSON.parse(document.getElementById('roles').textContent);
            roles.unshift(data.role);
            document.getElementById('roles').textContent = JSON.stringify(roles);
            pagination(0)
        } else {
            alert(data.error)
        }
    });
}

function viewRole(id) {
    var role = JSON.parse(document.getElementById('roles').textContent).find(role => role.id === id);
    var modal = document.getElementById('view-role');

    modal.querySelector('#view_role_name').value = role.name;
    modal.querySelector('#view_role_permission').value = role.permission === 1 ? "View" : role.permission === 2 ? "Edit" : role.permission === 4 ? "Admin" : "Unknown";

    modal.style.display = 'flex';
    document.body.classList.add('no-scroll');
}

function closeViewRoleModal() {
    var modal = document.getElementById('view-role');
    modal.style.display = 'none';
    document.body.classList.remove('no-scroll');
}

function editRole(id) {
    var role = JSON.parse(document.getElementById('roles').textContent).find(role => role.id === id);
    var modal = document.getElementById('edit-role');

    modal.querySelector('#edit_role_id').value = role.id;
    modal.querySelector('#edit_role_name').value = role.name;
    modal.querySelector('#edit_role_permission').value = role.permission;

    modal.style.display = 'flex';
    document.body.classList.add('no-scroll');
}

function closeEditRoleModal() {
    var modal = document.getElementById('edit-role');
    modal.style.display = 'none';
    document.body.classList.remove('no-scroll');
}

function saveEditRole() {
    var modal = document.getElementById('edit-role');

    var id = modal.querySelector('#edit_role_id').value;
    var name = modal.querySelector('#edit_role_name').value;
    var permission = modal.querySelector('#edit_role_permission').value;

    if (name == "" || permission == "" || permission == "0") {
        missingFieldModal();
        return;
    }

    var csrf = document.getElementById('csrf_token').value;

    fetch('/app/roles/edit', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrf
        },
        body: JSON.stringify({
            id: id,
            name: name,
            permission: permission
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            closeEditRoleModal();
            var roles = JSON.parse(document.getElementById('roles').textContent);
            var index = roles.findIndex(role => role.id === id);
            roles[index] = data.role;
            document.getElementById('roles').textContent = JSON.stringify(roles);
            pagination(0);
        } else {
            alert(data.error);
        }
    });
}


function pagination(toggle) {
    const table = document.getElementById('data-table');
    const tbody = table.querySelector('tbody');
    const roles = JSON.parse(document.getElementById('roles').textContent);
    const textInputs = document.querySelectorAll('input[type=text][data-type=roleSearch]');
    const search = textInputs[0].value.trim().toLowerCase();
    const offsetInput = document.getElementById('pagination_offset');
    let offset = parseInt(offsetInput.value);
    const limit = parseInt(document.getElementById('pagination_limit').value);

    if (toggle === 0 && offset > 0) {
        offset -= limit;
    } else if (toggle === 1 && offset + limit < roles.length) {
        offset += limit;
    }

    const previousButton = document.getElementsByName('Previous')[0];
    const nextButton = document.getElementsByName('Next')[0];
    previousButton.disabled = offset === 0;
    nextButton.disabled = offset + limit >= roles.length;

    offsetInput.value = offset;
    tbody.innerHTML = '';

    roles.slice(offset, offset + limit).forEach(function (role, index) {
        const tr = document.createElement('tr');
        tr.id = role.id;
        tr.innerHTML = `
            <td>
                <div class="td-content">${ offset + index + 1 }</div>
            </td>
            <td>
                <div class="td-content"><input type="checkbox" value="${role.id}" data-type="roleCheckbox" onchange="roleSelect(this)"></div>
            </td>
            <td>
                <div class="td-content">${role.name}</div>
            </td>
            <td>
                <div class="td-content">
                    ${
                        role.permission === 1 ? "View" :
                        role.permission === 2 ? "Edit" :
                        role.permission === 4 ? "Admin" :
                        "Unknown"
                    }
                </div>
            </td>
            <td>
                <div class="td-content">${formatDate(role.created_at)}</div>
            </td>
            <td>
                <div class="td-content" style="gap: 0.5rem">
                    <a href="javascript:void(0)" onclick="viewRole('${role.id}')"><span class="material-symbols-outlined">visibility</span></a>
                    <a href="javascript:void(0)" onclick="editRole('${role.id}')"><span class="material-symbols-outlined">edit</span></a>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function toggleActions() {
    let unblock = false;
    const checkboxes = document.querySelectorAll('input[type=checkbox][data-type=roleCheckbox]');
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

function roleSelect(element) {
    const tr = document.getElementById(element.value);
    element.checked ? tr.classList.add('selected') : tr.classList.remove('selected');
    toggleActions();
}

function roleSelectAll(element) {
    const checkboxes = document.querySelectorAll('input[type=checkbox][data-type=roleCheckbox]');
    checkboxes.forEach(checkbox => {
        checkbox.checked = element.checked;
        const tr = document.getElementById(checkbox.value);
        element.checked ? tr.classList.add('selected') : tr.classList.remove('selected');
    });
    toggleActions();
}

function sortBy(key, order = 'asc', element) {
    var roles = JSON.parse(document.getElementById('roles').textContent);
    /* sort array then update the table */
    if (key === 'created_at') {
        roles.sort(function (a, b) {
            if (order === 'asc') {
                return new Date(a[key]) - new Date(b[key]);
            } else {
                return new Date(b[key]) - new Date(a[key]);
            }
        });
    }
    else {
        roles.sort(function (a, b) {
            if (order === 'asc') {
                return a[key] > b[key] ? 1 : -1;
            } else {
                return a[key] < b[key] ? 1 : -1;
            }
        });
    }

    document.getElementById('roles').textContent = JSON.stringify(roles);
    pagination(0);

    /* update the arrow icons */
    const arrows = document.querySelectorAll('.sort-by');
    arrows.forEach(arrow => {
        if (arrow !== element) {
            arrow.classList.remove('up', 'down');
        }
    });
    if (!element) {
        return;
    }
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

function deleteSelected(confirmed = false) {
    const checkboxes = document.querySelectorAll('input[type=checkbox][data-type=roleCheckbox]');
    const selected = Array.from(checkboxes).filter(checkbox => checkbox.checked).map(checkbox => checkbox.value);

    if (!confirmed) {
        if (selected.length > 0) {
            createConfirmation('Are you sure you want to delete the selected role/s?', 'deleteSelected', true);
        }
        return;
    }

    clearConfirmation();

    var csrf = document.getElementById('csrf_token').value;

    fetch('/app/roles/delete', {
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
        if (data.success) {
            var roles = JSON.parse(document.getElementById('roles').textContent);
            roles = roles.filter(role => !selected.includes(role.id.toString()));
            document.getElementById('roles').textContent = JSON.stringify(roles);
            pagination(0);
            lockActions();
        } else {
            alert(data.error);
        }
    });

}

document.addEventListener('DOMContentLoaded', function () {
    pagination(0);
});