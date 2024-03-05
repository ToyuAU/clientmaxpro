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
