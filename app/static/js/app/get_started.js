

function inviteCodeModal() {
    var modal = document.getElementById('invite-code-modal');
    var inputs = modal.getElementsByTagName('input');
    for (var i = 0; i < inputs.length; i++) {
        inputs[i].value = '';
    }
    modal.style.display = 'flex';
    document.body.classList.add('no-scroll');    
}

function checkInviteCode() {
    var code = document.getElementById('invite-code').value;
    var csrf = document.getElementById('csrf_token').value;

    if (!code || code.length < 8 || code.length > 8 || !/^[a-zA-Z0-9]+$/.test(code)) {
        var error_ele = document.getElementById('error-message');
        error_ele.innerHTML = 'Invalid invite code.';
        error_ele.style.display = 'block';
        return;
    }

    var data = {
        invite_code: code
    };

    fetch('/app/invites/check', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrf
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        if (!data.success) {
            var error_ele = document.getElementById('error-message');
            error_ele.innerHTML = data.error;
            error_ele.style.display = 'block';
        } else {
            var parms = new URLSearchParams(window.location.search);
            var next = parms.get('next');
            if (next) {
                window.location.href = next;
                return;
            }
            window.location.href = data.redirect;
        }
    });
}

function nextPage(id) {
    var next = document.getElementById(id);
    var current = next.previousElementSibling;
    current.style.display = 'none';
    next.style.display = 'block';
}

function previousPage(id) {
    var prev = document.getElementById(id);
    var current = prev.nextElementSibling;
    current.style.display = 'none';
    prev.style.display = 'block';
}

function createBusiness() {
    var business_name = document.getElementById('business-name').value;
    var business_industry = document.getElementById('business-industry').value;
    var business_address = document.getElementById('business-address').value;
    var business_phone = document.getElementById('business-phone').value;
    var business_country = document.getElementById('business-country').value;
    var csrf = document.getElementById('csrf_token').value;

    if (!business_name || !business_industry || !business_address || !business_phone || !business_country) {
        var error_ele = document.getElementById('error-message');
        error_ele.innerHTML = 'All fields are required.';
        error_ele.style.display = 'block';
        return;
    }

    var data = {
        business_name: business_name,
        business_industry: business_industry,
        business_address: business_address,
        business_phone: business_phone,
        business_country: business_country
    };

    fetch('/app/get-started', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrf
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        if (!data.success) {
            var error_ele = document.getElementById('error-message');
            error_ele.innerHTML = data.error;
            error_ele.style.display = 'block';
        } else {
            var parms = new URLSearchParams(window.location.search);
            var next = parms.get('next');
            if (next) {
                window.location.href = next;
                return;
            }
            window.location.href = data.redirect;
        }
    });
}