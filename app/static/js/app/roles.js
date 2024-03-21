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

    var csrf = document.getElementsByID("csrf_token").value;

    fetch('/app/roles/edit', {
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