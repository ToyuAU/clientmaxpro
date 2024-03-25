function togglePasswordView(id, element) {
    var x = document.getElementById(id);
    if (x.type === "password") {
        x.type = "text";
        element.innerHTML = "<i class='fas fa-eye-slash'></i>";
    } else {
        x.type = "password";
        element.innerHTML = "<i class='fas fa-eye'></i>";
    }
}

function validateForm() {
    const inputs = document.getElementsByClassName('account__form__content__form__input');
    for (let i = 0; i < inputs.length; i++) {
        var required = inputs[i].querySelector('label span.required');
        if (required && !inputs[i].querySelector('input').value) {
            console.log(inputs[i]);
            var error_ele = document.getElementById('error-message');
            error_ele.innerHTML = 'Please fill out all fields.';
            error_ele.style.display = 'block';
            return false;
        }
    }

    const password = document.getElementById('password').value;
    const confirm = document.getElementById('confirm-password').value;
    if (password !== confirm) {
        var error_ele = document.getElementById('error-message');
        error_ele.innerHTML = 'Passwords do not match.';
        error_ele.style.display = 'block';
        return false;
    }

    return true;
}

function signup() {
    if (!validateForm()) {
        return;
    }
    
    const url = document.getElementById('url').value;
    const firstname = document.getElementById('firstname').value;
    const lastname = document.getElementById('lastname').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const invite = document.getElementById('invite_code').value;
    const csrf = document.getElementById('csrf_token').value;
    const data = {
        firstname: firstname,
        lastname: lastname,
        email: email,
        password: password,
        invite_code: invite
    };

    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrf
        },
        body: JSON.stringify(data),
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            var error_ele = document.getElementById('error-message')
            error_ele.innerHTML = data.error;
            error_ele.style.display = 'block';
        } else {
            const urlParams = new URLSearchParams(window.location.search);
            const redirect = urlParams.get('redirect');
            if (redirect) {
                window.location.href = redirect;
                return;
            }
            window.location.href = data.redirect;
        }
    })
}

function login() {
    const url = document.getElementById('url').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const csrf = document.getElementById('csrf_token').value;
    const data = {
        email: email,
        password: password
    };

    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrf
        },
        body: JSON.stringify(data),
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            var error_ele = document.getElementById('error-message')
            error_ele.innerHTML = data.error;
            error_ele.style.display = 'block';
        } else {
            const urlParams = new URLSearchParams(window.location.search);
            const redirect = urlParams.get('redirect');
            if (redirect) {
                window.location.href = redirect;
                return;
            }
            window.location.href = data.redirect;
        }
    })
}

document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const invite = urlParams.get('invite');
    if (invite) {
        document.getElementById('invite_code').value = invite;
    }
});