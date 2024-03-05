function newJobModal() {
    const modal = document.getElementById('new-job');

    const inputs = modal.querySelectorAll('input');
    inputs.forEach(input => input.value = '');

    const selects = modal.querySelectorAll('select');
    selects.forEach(select => select.selectedIndex = 0);

    clients = JSON.parse(document.getElementById('clients').textContent);
    const clientSelect = modal.querySelector('select[name=client-name]');
    clientSelect.innerHTML = '<option value="" disabled selected>Select a client</option>';
    clients.forEach(client => {
        const option = document.createElement('option');
        option.value = client.id;
        option.textContent = client.name;
        clientSelect.appendChild(option);
    });

    modal.style.display = 'flex';
    document.body.classList.add('no-scroll');
}


function closeJobModal() {
    const modal = document.getElementById('new-job');
    modal.style.display = 'none';
    document.body.classList.remove('no-scroll');
}

function saveNewJob() {
    var client = document.getElementById('client-name').value;
    var name = document.getElementById('job-name').value;
    var description = document.getElementById('job-description').value;
    var notes = document.getElementById('job-notes').value;
    var status = document.getElementById('job-status').value;

    if (client === '' || name === '' || description === '' || status === '' || status == '0') {
        alert('All fields are required');
        return;
    }

    var csrf = document.getElementById('csrf_token').value;

    fetch('/app/jobs/new', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrf
        },
        body: JSON.stringify({
            client: client,
            name: name,
            description: description,
            notes: notes,
            status: status
        })
    })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                alert(data.error);
            } else {
                location.reload();
            }
        });
}

function toggleActions() {
    let unblock = false;
    const checkboxes = document.querySelectorAll('input[type=checkbox][data-type=jobCheckbox]');
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

function downloadSelected() {
    const checkboxes = document.querySelectorAll('input[type=checkbox][data-type=jobCheckbox]');
    const selected = Array.from(checkboxes).filter(checkbox => checkbox.checked).map(checkbox => checkbox.value);

    if (selected.length > 0) {
        const jobs = JSON.parse(document.getElementById('jobs').textContent);
        const selectedjobs = jobs.filter(job => selected.includes(job.id.toString()));
        const csvData = convertToCSV(selectedjobs);
        const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
        downloadCSV(csvData, `jobs_${timestamp}.csv`);
    }
}

function deleteSelected(confirmed = false) {
    const checkboxes = document.querySelectorAll('input[type=checkbox][data-type=jobCheckbox]');
    const selected = Array.from(checkboxes).filter(checkbox => checkbox.checked).map(checkbox => checkbox.value);

    if (!confirmed) {
        if (selected.length > 0) {
            createConfirmation('Are you sure you want to delete the selected jobs/s?', 'deleteSelected', true);
        }
        return;
    }

    clearConfirmation();

    if (selected.length > 0) {
        fetch('/app/jobs/delete', {
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
                    const jobs = JSON.parse(document.getElementById('jobs').textContent);
                    const updatedJobs = jobs.filter(job => !selected.includes(job.id.toString()));
                    document.getElementById('jobs').textContent = JSON.stringify(updatedJobs);
                    pagination(0);
                } else {
                    alert('An error occurred while deleting the selected clients.');
                }
            });
    }
}


function jobSelect(element) {
    const tr = document.getElementById(element.value);
    element.checked ? tr.classList.add('selected') : tr.classList.remove('selected');
    toggleActions();
}

function jobSelectAll(element) {
    const checkboxes = document.querySelectorAll('input[type=checkbox][data-type=jobCheckbox]');
    checkboxes.forEach(checkbox => {
        checkbox.checked = element.checked;
        const tr = document.getElementById(checkbox.value);
        element.checked ? tr.classList.add('selected') : tr.classList.remove('selected');
    });
    toggleActions();
}

function pagination(toggle) {
    const table = document.getElementById('data-table');
    const tbody = table.querySelector('tbody');
    const jobs = JSON.parse(document.getElementById('jobs').textContent);
    const textInputs = document.querySelectorAll('input[type=text][data-type=jobSearch]');
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

    jobs.slice(offset, offset + limit).forEach(function (job, index) {
        const tr = document.createElement('tr');
        tr.id = job.id;
        job_status = job.status
        if (job_status == 1) {
            formatted_status = '<span class="status grey">Not Started</span>'
        } else if (job_status == 2) {
            formatted_status = '<span class="status yellow">In Progress</span>'
        } else if (job_status == 3) {
            formatted_status = '<span class="status green">Completed</span>'
        } else if (job_status == 4) {
            formatted_status = '<span class="status red">Canceled</span>'
        } else {
            formatted_status = '<span class="status grey">Unknown</span>'
        }

        tr.innerHTML = `
            <td>
                <div class="td-content">${index+1}</div>
            </td>
            <td>
                <div class="td-content"><input type="checkbox" value="${job.id}" data-type="jobCheckbox" onchange="jobSelect(this)"></div>
            </td>
            <td>
                <div class="td-content"><p>${job.name}</p></div>
            </td>
            <td>
                <div class="td-content"><p>${job.client.name}</p></div>
            </td>
            <td>
                <div class="td-content">${formatted_status}</div>
            </td>
            <td>
                <div class="td-content">${formatDate(job.created_at)}</div>
            </td>
            <td>
                <div class="td-content"><a href="javascript:void(0)" onclick="editJob('${job.id}')"><span class="material-symbols-outlined">edit</span></a></div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function editJob(id) {
    const jobs = JSON.parse(document.getElementById('jobs').textContent);
    const clients = JSON.parse(document.getElementById('clients').textContent);
    const job = jobs.find(job => job.id === id);
    const modal = document.getElementById('edit-job');

    const inputs = modal.querySelectorAll('input');
    inputs.forEach(input => input.value = '');

    const selects = modal.querySelectorAll('select');
    selects.forEach(select => select.selectedIndex = 0);

    const clientSelect = modal.querySelector('select[name=edit_job_client]');
    clientSelect.innerHTML = '<option value="" disabled selected>Select a client</option>';
    clients.forEach(client => {
        const option = document.createElement('option');
        option.value = client.id;
        option.textContent = client.name;
        clientSelect.appendChild(option);
    });

    modal.querySelector('input[name=edit_job_id]').value = job.id;
    modal.querySelector('input[name=edit_job_name]').value = job.name;
    modal.querySelector('input[name=edit_job_description]').value = job.description;
    modal.querySelector('textarea[name=edit_job_notes]').value = job.notes;
    modal.querySelector('select[name=edit_job_client]').value = job.client.id;
    modal.querySelector('select[name=edit_job_status]').value = job.status;
    modal.style.display = 'flex';
    document.body.classList.add('no-scroll');
}

function adjustTextarea(textarea) {
    textarea.style.height = 'auto'; // Reset the height to auto
    textarea.style.height = textarea.scrollHeight + 'px'; // Set the height to match the content
    textarea.style.resize = 'none'; // Disable resizing
}

function viewJob(id) {
    const jobs = JSON.parse(document.getElementById('jobs').textContent);
    const job = jobs.find(job => job.id === id);
    const modal = document.getElementById('view-job');

    job_status = job.status
    if (job_status == 1) {
        formatted_status = 'Not Started'
    } else if (job_status == 2) {
        formatted_status = 'In Progress'
    } else if (job_status == 3) {
        formatted_status = 'Completed'
    } else if (job_status == 4) {
        formatted_status = 'Canceled'
    } else {
        formatted_status = 'Unknown'
    }

    modal.querySelector('input[name=view_job_id]').value = job.id;
    modal.querySelector('input[name=view_job_name]').value = job.name;
    modal.querySelector('input[name=view_job_description]').value = job.description;
    modal.querySelector('textarea[name=view_job_notes]').value = job.notes;
    modal.querySelector('input[name=view_job_status]').value = formatted_status;
    modal.querySelector('input[name=view_client_name]').value = job.client.name;
    modal.style.display = 'flex';
    document.body.classList.add('no-scroll');

    textarea = modal.querySelector('textarea[name=view_job_notes]');
    textarea.addEventListener('load', adjustTextarea(textarea));
}

function closeViewJobModal() {
    const modal = document.getElementById('view-job');
    modal.style.display = 'none';
    document.body.classList.remove('no-scroll');
}



function closeEditJobModal() {
    const modal = document.getElementById('edit-job');
    modal.style.display = 'none';
    document.body.classList.remove('no-scroll');
}

function saveEditJob() {
    const id = document.getElementById('edit_job_id').value;
    const name = document.getElementById('edit_job_name').value;
    const description = document.getElementById('edit_job_description').value;
    const notes = document.getElementById('edit_job_notes').value;
    const client = document.getElementById('edit_job_client').value;
    const status = document.getElementById('edit_job_status').value;

    if (name === '' || description === '' || client === '' || status === '' || status == '0') {
        alert('All fields are required');
        return;
    }

    fetch('/app/jobs/edit', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': document.getElementById('csrf_token').value
        },
        body: JSON.stringify({ id, name, description, notes, client, status })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            const jobs = JSON.parse(document.getElementById('jobs').textContent);
            const index = jobs.findIndex(job => job.id === id);
            jobs[index] = data.job;
            document.getElementById('jobs').textContent = JSON.stringify(jobs);
            pagination(0);
            closeEditJobModal();
        } else {
            alert('An error occurred while updating the client.');
        }
    });
}

function sortBy(key, order = 'asc', element) {
    var jobs = JSON.parse(document.getElementById('jobs').textContent);
    /* sort array then update the table */
    jobs.sort(function (a, b) {
        if (order === 'asc') {
            return a[key] > b[key] ? 1 : -1;
        } else {
            return a[key] < b[key] ? 1 : -1;
        }
    });

    document.getElementById('jobs').textContent = JSON.stringify(jobs);
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

document.addEventListener('DOMContentLoaded', function () {
    const csvButton = document.getElementsByClassName('dashboard__content__table__header__right__button')[0];
    csvButton.addEventListener('click', function () {
        const csvData = convertToCSV(JSON.parse(document.getElementById('jobs').textContent));
        const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
        downloadCSV(csvData, `clients_${timestamp}.csv`);
    });

    const textInputs = document.querySelectorAll('input[type=text][data-type=jobSearch]');
    textInputs.forEach(textInput => {
        textInput.addEventListener('keyup', function () {
            const table = document.getElementById('data-table');
            const tbody = table.querySelector('tbody');
            const jobs = JSON.parse(document.getElementById('jobs').textContent);
            const search = textInput.value.trim().toLowerCase();
            tbody.innerHTML = '';
            let counter = 0;
            jobs.forEach(job => {
                if (counter >= parseInt(document.getElementById('pagination_limit').value)) return;
                if (job.name.toLowerCase().includes(search) || job.client.name.toLowerCase().includes(search)) {
                    counter++;
                    const tr = document.createElement('tr');
                    tr.id = job.id;
                    const nameHighlighted = job.client.name.toLowerCase().includes(search) ? job.client.name.replace(new RegExp(search, 'ig'), '<span class="highlight">$&</span>') : job.client.name;
                    const jobHighlighted = job.name.toLowerCase().includes(search) ? job.name.replace(new RegExp(search, 'ig'), '<span class="highlight">$&</span>') : job.name;
                    job_status = job.status
                    if (job_status == 1) {
                        formatted_status = '<span class="status grey">Not Started</span>'
                    } else if (job_status == 2) {
                        formatted_status = '<span class="status yellow">In Progress</span>'
                    } else if (job_status == 3) {
                        formatted_status = '<span class="status green">Completed</span>'
                    } else if (job_status == 4) {
                        formatted_status = '<span class="status red">Canceled</span>'
                    } else {
                        formatted_status = '<span class="status grey">Unknown</span>'
                    }

                    tr.innerHTML = `
                        <td>
                            <div class="td-content">${counter}</div>
                        </td>
                        <td>
                            <div class="td-content"><input type="checkbox" value="${job.id}" data-type="jobCheckbox" onchange="jobSelect(this)"></div>
                        </td>
                        <td>
                            <div class="td-content"><p>${jobHighlighted}</p></div>
                        </td>
                        <td>
                            <div class="td-content"><p>${nameHighlighted}</p></div>
                        </td>
                        <td>
                            <div class="td-content">${formatted_status}</div>
                        </td>
                        <td>
                            <div class="td-content">${formatDate(job.created_at)}</div>
                        </td>
                        <td>
                            <div class="td-content"><a href="javascript:void(0)" onclick="editJob('${job.id}')"><span class="material-symbols-outlined">edit</span></a></div>
                        </td>
                    `;
                    tbody.appendChild(tr);
                }
            });
        });
    });
});
