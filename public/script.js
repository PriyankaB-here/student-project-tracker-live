
const form = document.querySelector('#project-form');
const nameInput = document.querySelector('#name');
const statusInput = document.querySelector('#status');
const projectList = document.querySelector('#project-list');
const emptyState = document.querySelector('#empty-state');
const saveButton = document.querySelector('#save-button');
const cancelButton = document.querySelector('#cancel-button');
const formTitle = document.querySelector('#form-title');
const message = document.querySelector('#message');

const projects = [];
let editingId = null;
let busy = false;

function showMessage(text) {
    message.textContent = text;
}

async function getError(response) {
    try {
        const data = await response.json();
        return data.message || data.error ||
            `Request failed (${response.status}).`;
    } catch {
        return `Request failed (${response.status}).`;
    }
}

async function loadProjects() {
    try {
        showMessage('Loading projects...');

        const response = await fetch('/api/projects');

        if (!response.ok) {
            throw new Error(await getError(response));
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
            throw new Error('Invalid project data received.');
        }

        projects.splice(0, projects.length, ...data);
        renderProjects();
        showMessage('Projects loaded.');
        return true;
    } catch (error) {
        showMessage('Could not load projects: ' + error.message);
        return false;
    }
}

function resetForm() {
    form.reset();
    editingId = null;
    saveButton.textContent = 'Save Project';
    cancelButton.hidden = true;
    formTitle.textContent = 'Add a Project';
}

function renderProjects() {
    projectList.textContent = '';

    for (const project of projects) {
        const item = document.createElement('li');
        const name = document.createElement('span');
        const status = document.createElement('span');
        const actions = document.createElement('div');
        const editButton = document.createElement('button');
        const deleteButton = document.createElement('button');

        name.textContent = project.name;
        status.textContent = ' — ' + project.status;

        actions.style.display = 'inline-flex';
        actions.style.gap = '8px';
        actions.style.marginLeft = '12px';

        editButton.type = 'button';
        editButton.textContent = 'Edit';
        editButton.disabled = busy;

        editButton.addEventListener('click', () => {
            editingId = project.id;
            nameInput.value = project.name;
            statusInput.value = project.status;

            saveButton.textContent = 'Save changes';
            cancelButton.hidden = false;
            formTitle.textContent = 'Edit a Project';
            nameInput.focus();
        });

        deleteButton.type = 'button';
        deleteButton.textContent = 'Delete';
        deleteButton.disabled = busy;
        deleteButton.style.backgroundColor = '#fee2e2';
        deleteButton.style.color = '#b91c1c';

        deleteButton.addEventListener('click', async () => {
            const confirmed = confirm(
                `Delete "${project.name}"? This cannot be undone.`
            );

            if (!confirmed || busy) return;

            busy = true;
            updateButtons();

            try {
                const response = await fetch(
                    `/api/projects/${encodeURIComponent(project.id)}`,
                    { method: 'DELETE' }
                );

                if (!response.ok) {
                    throw new Error(await getError(response));
                }

                if (editingId === project.id) {
                    resetForm();
                }

                const loaded = await loadProjects();

                if (!loaded) {
                    showMessage('Project deleted, but the list could not refresh. Reload the page.');
                } else {
                    showMessage('Project deleted successfully.');
                }
            } catch (error) {
                showMessage('Could not delete project: ' + error.message);
            } finally {
                busy = false;
                updateButtons();
                renderProjects();
            }
        });

        actions.append(editButton, deleteButton);
        item.append(name, status, actions);
        projectList.appendChild(item);
    }

    if (emptyState) {
        emptyState.hidden = projects.length > 0;
    }
}

function updateButtons() {
    saveButton.disabled = busy;
    cancelButton.disabled = busy;
    renderProjects();
}

form.addEventListener('submit', async event => {
    event.preventDefault();

    if (busy) return;

    const name = nameInput.value.trim();
    const status = statusInput.value;

    if (!name) {
        nameInput.focus();
        showMessage('Please enter a project name.');
        return;
    }

    busy = true;
    updateButtons();
    showMessage('Saving project...');

    try {
        const isEditing = editingId !== null;
        const url = isEditing
            ? `/api/projects/${encodeURIComponent(editingId)}`
            : '/api/projects';

        const response = await fetch(url, {
            method: isEditing ? 'PUT' : 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, status })
        });

        if (!response.ok) {
            throw new Error(await getError(response));
        }

        resetForm();

        const loaded = await loadProjects();

        if (loaded) {
            showMessage(
                isEditing
                    ? 'Project updated successfully.'
                    : 'Project added successfully.'
            );
        } else {
            showMessage('Saved successfully, but the project list could not refresh. Reload the page.');
        }

        nameInput.focus();
    } catch (error) {
        showMessage('Could not save project: ' + error.message);
    } finally {
        busy = false;
        updateButtons();
    }
});

cancelButton.addEventListener('click', () => {
    if (busy) return;
    resetForm();
    showMessage('Edit cancelled.');
    nameInput.focus();
});

loadProjects();
