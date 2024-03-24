function createConfirmation(question, action, data) {
    const confirmation = document.createElement('div');
    confirmation.id = 'confirmation';
    confirmation.classList.add('confirmation');
    confirmation.innerHTML = `
        <div class="confirmation__content">
            <p>${question}</p>
            <div class="confirmation__content__buttons">
                <button onclick="${action}(${data})" class="confirm">Confirm</button>
                <button onclick="clearConfirmation()">Cancel</button>
            </div>
        </div>
    `;
    document.body.classList.add('no-scroll');
    document.body.appendChild(confirmation);
}

function clearConfirmation() {
    const confirmation = document.getElementById('confirmation');
    if (confirmation) {
        document.body.classList.remove('no-scroll');
        confirmation.remove();
    }
}

function convertToCSV(data) {
    const csv = [Object.keys(data[0]).join(',')];

    data.forEach(item => {
        const values = Object.values(item).map(value => {
            if (typeof value === 'string') {
                value = value.replace(/"/g, '""');
                if (value.includes(',')) {
                    value = `"${value}"`;
                }
            }
            return value;
        });
        csv.push(values.join(','));
    });

    return csv.join('\n');
}

function downloadCSV(csv, filename) {
    const csvFile = new Blob([csv], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(csvFile);
    link.download = filename;
    link.click();
}

function formatDate(dateString) {
    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const date = new Date(dateString);
    var month = months[date.getMonth()];
    var day = date.getDate();
    var year = date.getFullYear();

    // add leading zero to day
    if (day < 10) {
        day = `0${day}`;
    }

    return `${month} ${day}, ${year}`;
}

function missingFieldModal() {
    body = document.body;

    // create modal
    const modal = document.createElement('div');
    modal.id = 'missing-field';
    modal.classList.add('missing-field');
    modal.innerHTML = `
        <div class="missing-field__content">
            <p>Please fill out all required fields.</p>
            <button onclick="closeMissingFieldModal()">Close</button>
        </div>
    `;
    body.appendChild(modal);

}

function closeMissingFieldModal() {
    body = document.body;
    modal = document.getElementById('missing-field');
    modal.remove();
}


const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
});

function playAudio() {
    //const settings = JSON.parse(document.getElementById('settings').textContent);
    //if (!settings.notification_sound) {
    //    return;
    //}
    const audio = document.getElementById('notification-sound');
    audio.currentTime = 0;
    audio.volume = 0.05;
    audio.play();
}

function createNotification(message) {
    const notifications = document.getElementById('notifications');
    const notification = document.createElement('div');
    notification.classList.add('notifications__item');
    notification.style.transform = 'translateX(100%)';
    notification.innerHTML = `
        <p class="notifications__item__text">${message}</p>
        <button class="notifications__item__close" onclick="closeNotification(this)"><span class="material-symbols-outlined">close</span></button>
    `;
    notifications.appendChild(notification);

    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
        playAudio();
    }, 100);

    setTimeout(() => {
        notification.style.transform = 'translateX(110%)';
        setTimeout(() => {
            notification.remove();
        }, 500);
    }, 5000);
}

function closeNotification(button) {
    const notification = button.parentElement;
    notification.style.transform = 'translateX(110%)';
    setTimeout(() => {
        notification.remove();
    }, 500);

}

const socket = io.connect('http://' + document.domain + ':' + location.port);
socket.on('connect', () => {
    console.log('Connected to the server');
    socket.emit('join');
});

socket.on('update', data => {
    console.log(data);
    createNotification(data.message);
});



