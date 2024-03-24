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
            closeViewOrderModal();
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

function closeViewOrderModal() {
    modal = document.getElementById('new-invite');
    modal.style.display = 'none';
    document.body.classList.remove('no-scroll')
}