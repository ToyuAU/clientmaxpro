function createNewInvite() {
    var role = document.getElementById('new_invite_role').value;

    if (!role || role === '') {
        missingFieldModal();
        return;
    }
    
    var csrf = document.getElementById('csrf_token').value;

    fetch('/app/invites/new', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrf
        },
        body: JSON.stringify({
            role: role
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            closeViewemployeeModal();
            document.getElementById('share_link').value = data.invite.id;
            document.getElementById('share_link_input').value = window.location.origin + '/signup' + '?invite=' + data.invite.id;
            document.getElementById('share_link_input').select();
            document.getElementById('share-link').style.display = 'flex';
            document.body.classList.add('no-scroll');
        } else {
            console.log(data);
        }
    });
}

function closeShareLinkModal() {
    document.getElementById('share-link').style.display = 'none';
    document.body.classList.remove('no-scroll');
}

function copyLink() {
    var copyText = document.getElementById('share_link_input');
    copyText.select();
    copyText.setSelectionRange(0, 99999);
    document.execCommand('copy');
}

function toggleActions() {
    let unblock = false;
    const checkboxes = document.querySelectorAll('input[type=checkbox][data-type=employeeCheckbox]');
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

function pagination(toggle) {
    const table = document.getElementById('data-table');
    const tbody = table.querySelector('tbody');
    const employees = JSON.parse(document.getElementById('employees').textContent);
    const textInputs = document.querySelectorAll('input[type=text][data-type=employeeSearch]');
    const search = textInputs[0].value.trim().toLowerCase();
    const offsetInput = document.getElementById('pagination_offset');
    let offset = parseInt(offsetInput.value);
    const limit = parseInt(document.getElementById('pagination_limit').value);

    if (toggle === 0 && offset > 0) {
        offset -= limit;
    } else if (toggle === 1 && offset + limit < employees.length) {
        offset += limit;
    }

    const previousButton = document.getElementsByName('Previous')[0];
    const nextButton = document.getElementsByName('Next')[0];
    previousButton.disabled = offset === 0;
    nextButton.disabled = offset + limit >= employees.length;

    offsetInput.value = offset;
    tbody.innerHTML = '';

    employees.slice(offset, offset + limit).forEach(function (employee, index) {
        const tr = document.createElement('tr');
        tr.id = employee.id;
        tr.innerHTML = `
            <td><div class="td-content">${offset + index + 1}</div></td>
            <td><div class="td-content"><input type="checkbox" value="${employee.id}" data-type="employeeCheckbox" onchange="employeeSelect(this)"></div></td>
            <td><div class="td-content">${employee.first_name} ${employee.last_name}</div></td>
            <td><div class="td-content">${employee.email}</div></td>
            <td><div class="td-content">${employee.role.name}</div></td>
            <td><div class="td-content">${formatDate(employee.created_at)}</div></td>
            <td><div class="td-content" style="gap: 0.5rem;">
                <a href="javascript:void(0)" onclick="viewEmployee('${employee.id}')"><span class="material-symbols-outlined">visibility</span></a>
                <a href="javascript:void(0)" onclick="editEmployee('${employee.id}')"><span class="material-symbols-outlined">edit</span></a>
            </div></td>
        `
        tbody.appendChild(tr);

    });
}

function shareLinkApp(app) {
    switch (app) {
        case 'twitter':
            window.open('https://twitter.com/intent/tweet?text=Join%20our%20team%20on%20' + document.getElementById('share_link_input').value, '_blank');
            break;
        case 'linkedin':
            window.open('https://www.linkedin.com/sharing/share-offsite/?url=' + document.getElementById('share_link_input').value, '_blank');
            break;
        case 'email':
            window.open('mailto:?subject=Join%20our%20team&body=Join%20our%20team%20on%20' + document.getElementById('share_link_input').value, '_blank');
            break;
        case 'whatsapp':
            window.open('https://api.whatsapp.com/send?text=Join%20our%20team%20on%20' + document.getElementById('share_link_input').value, '_blank');
            break;
        case 'facebook':
            window.open('https://www.facebook.com/sharer/sharer.php?u=' + document.getElementById('share_link_input').value, '_blank');
            break;
        case 'text':
            window.open('sms:?&body=Join%20our%20team%20on%20' + document.getElementById('share_link_input').value, '_blank');
            break;
    }
}
    

function createNewInviteModal() { 
    modal = document.getElementById('new-invite');

    var select = modal.querySelector('#new_invite_role');
    select.innerHTML = '<option value="" disabled selected>Select a role</option>';
    var roles = JSON.parse(document.getElementById('roles').textContent);
    roles.forEach(role => {
        var option = document.createElement('option');
        option.value = role.id;
        option.text = role.name;
        select.appendChild(option);
    });

    modal.style.display = 'flex';
    document.body.classList.add('no-scroll')
}

function closeViewemployeeModal() {
    modal = document.getElementById('new-invite');
    modal.style.display = 'none';
    document.body.classList.remove('no-scroll')
}



function employeeSelect(element) {
    const tr = document.getElementById(element.value);
    element.checked ? tr.classList.add('selected') : tr.classList.remove('selected');
    toggleActions();
}

function employeeSelectAll(element) {
    const checkboxes = document.querySelectorAll('input[type=checkbox][data-type=employeeCheckbox]');
    checkboxes.forEach(checkbox => {
        checkbox.checked = element.checked;
        const tr = document.getElementById(checkbox.value);
        element.checked ? tr.classList.add('selected') : tr.classList.remove('selected');
    });
    toggleActions();
}

function sortBy(key, employee = 'asc', element) {
    var employees = JSON.parse(document.getElementById('employees').textContent);
    /* sort array then update the table */
    if (key === 'created_at') {
        employees.sort(function (a, b) {
            if (employee === 'asc') {
                return new Date(a[key]) - new Date(b[key]);
            } else {
                return new Date(b[key]) - new Date(a[key]);
            }
        });
    }
    else {
        employees.sort(function (a, b) {
            if (employee === 'asc') {
                return a[key] > b[key] ? 1 : -1;
            } else {
                return a[key] < b[key] ? 1 : -1;
            }
        });
    }

    document.getElementById('employees').textContent = JSON.stringify(employees);
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
    if (employee === 'asc') {
        element.classList.remove('down');
        element.classList.add('up');
        element.setAttribute('onclick', `sortBy('${key}', 'desc', this)`);
    }

    if (employee === 'desc') {
        element.classList.remove('up');
        element.classList.add('down');
        element.setAttribute('onclick', `sortBy('${key}', 'asc', this)`);
    }

}

function deleteSelected(confirmed = false) {
    const checkboxes = document.querySelectorAll('input[type=checkbox][data-type=employeeCheckbox]');
    const selected = Array.from(checkboxes).filter(checkbox => checkbox.checked).map(checkbox => checkbox.value);

    if (!confirmed) {
        if (selected.length > 0) {
            createConfirmation('Are you sure you want to delete the selected employee/s?', 'deleteSelected', true);
        }
        return;
    }

    clearConfirmation();

    if (selected.length > 0) {
        fetch('/app/employees/delete', {
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
                    const employees = JSON.parse(document.getElementById('employees').textContent);
                    const updatedemployees = employees.filter(employee => !selected.includes(employee.id.toString()));
                    document.getElementById('employees').textContent = JSON.stringify(updatedemployees);
                    pagination(0);
                } else {
                    alert('An error occurred while deleting the selected employees.');
                }
            });
    }
}

document.addEventListener('DOMContentLoaded', function() {
    pagination(0);
});