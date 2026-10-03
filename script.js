// Sample emergency data
var emergencies = [
    {
        id: 1,
        type: 'fire',
        location: 'Andheri',
        severity: 'critical',
        description: 'Major fire reported in commercial building, 5th floor',
        status: 'active',
        createdAt: '2026-10-01T14:30:00',
        resolvedAt: null
    },
    {
        id: 2,
        type: 'medical',
        location: 'Bandra',
        severity: 'high',
        description: 'Multiple injuries at construction site',
        status: 'active',
        createdAt: '2026-10-01T15:45:00',
        resolvedAt: null
    },
    {
        id: 3,
        type: 'accident',
        location: 'Dadar',
        severity: 'medium',
        description: 'Vehicle collision on Western Express Highway',
        status: 'responding',
        createdAt: '2026-10-01T16:10:00',
        resolvedAt: null
    },
    {
        id: 4,
        type: 'flood',
        location: 'Sion',
        severity: 'high',
        description: 'Waterlogging in residential area, families stranded',
        status: 'resolved',
        createdAt: '2026-10-01T10:00:00',
        resolvedAt: '2026-10-01T12:30:00'
    }
];

// Sample activity log
var activities = [
    { message: '🚨 Team dispatched to Dadar', type: 'respond', time: '2026-10-01T16:25:00' },
    { message: '🚗 New Accident emergency in Dadar', type: 'create', time: '2026-10-01T16:10:00' },
    { message: '🚑 New Medical emergency in Bandra', type: 'create', time: '2026-10-01T15:45:00' },
    { message: '🔥 New Fire emergency in Andheri', type: 'create', time: '2026-10-01T14:30:00' },
    { message: '✅ Flood in Sion resolved', type: 'resolve', time: '2026-10-01T12:30:00' },
    { message: '🌊 New Flood emergency in Sion', type: 'create', time: '2026-10-01T10:00:00' }
];

var nextId = 5;
var currentFilter = 'all';
var searchQuery = '';
var currentSort = 'newest';

var typeIcons = { fire: '🔥', medical: '🚑', accident: '🚗', flood: '🌊', gas: '💨', other: '⚠️' };
var typeNames = { fire: 'Fire', medical: 'Medical', accident: 'Accident', flood: 'Flood', gas: 'Gas Leak', other: 'Other' };
var severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };


// Capitalizes first letter of a string
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Formats a date string into "2:30 PM"
function formatTime(dateStr) {
    var date = new Date(dateStr);
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    if (hours === 0) hours = 12;
    if (minutes < 10) minutes = '0' + minutes;
    return hours + ':' + minutes + ' ' + ampm;
}

// Formats a date string into "Oct 1, 2:30 PM"
function formatDateTime(dateStr) {
    var date = new Date(dateStr);
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[date.getMonth()] + ' ' + date.getDate() + ', ' + formatTime(dateStr);
}

// Counts emergencies by status and updates the stat cards
function updateStats() {
    var active = 0, critical = 0, responding = 0, resolved = 0;

    for (var i = 0; i < emergencies.length; i++) {
        var em = emergencies[i];
        if (em.status === 'active') active++;
        if (em.status === 'responding') responding++;
        if (em.status === 'resolved') resolved++;
        if (em.severity === 'critical' && em.status !== 'resolved') critical++;
    }

    document.getElementById('stat-active').textContent = active;
    document.getElementById('stat-critical').textContent = critical;
    document.getElementById('stat-responding').textContent = responding;
    document.getElementById('stat-resolved').textContent = resolved;
}

// Renders all sections at once
function renderAll() {
    updateStats();
    renderEmergencies();
    renderHistory();
    renderActivities();
}

// Renders active/responding emergency cards in the main grid
function renderEmergencies() {
    var grid = document.getElementById('emergencies-grid');
    var noResults = document.getElementById('no-results');
    grid.innerHTML = '';

    var filtered = getFilteredEmergencies();

    if (filtered.length === 0) {
        noResults.style.display = 'block';
    } else {
        noResults.style.display = 'none';
    }

    for (var i = 0; i < filtered.length; i++) {
        grid.appendChild(createCard(filtered[i]));
    }
}

// Renders resolved emergencies in the history section
function renderHistory() {
    var grid = document.getElementById('history-grid');
    var noHistory = document.getElementById('no-history');
    grid.innerHTML = '';

    var resolved = [];
    for (var i = 0; i < emergencies.length; i++) {
        if (emergencies[i].status === 'resolved') resolved.push(emergencies[i]);
    }

    resolved.sort(function (a, b) {
        return new Date(b.resolvedAt || b.createdAt) - new Date(a.resolvedAt || a.createdAt);
    });

    if (resolved.length === 0) {
        noHistory.style.display = 'block';
    } else {
        noHistory.style.display = 'none';
    }

    for (var i = 0; i < resolved.length; i++) {
        grid.appendChild(createHistoryCard(resolved[i]));
    }
}

// Renders the last 10 activity log entries
function renderActivities() {
    var list = document.getElementById('activity-list');
    list.innerHTML = '';

    if (activities.length === 0) {
        list.innerHTML = '<p class="activity-empty">No activity yet.</p>';
        return;
    }

    var count = Math.min(activities.length, 10);
    for (var i = 0; i < count; i++) {
        var act = activities[i];
        var item = document.createElement('div');
        item.className = 'activity-item activity-' + act.type;
        item.innerHTML =
            '<span class="activity-dot">●</span>' +
            '<div class="activity-content">' +
            '  <span class="activity-time">' + formatTime(act.time) + '</span>' +
            '  <span class="activity-message">' + act.message + '</span>' +
            '</div>';
        list.appendChild(item);
    }
}

// Builds an emergency card element for the main grid
function createCard(emergency) {
    var card = document.createElement('div');
    card.className = 'emergency-card';
    var html = '';

    html += '<div class="card-header">';
    html += '  <span class="card-type">' + typeIcons[emergency.type] + ' ' + typeNames[emergency.type] + '</span>';
    html += '  <span class="badge status-' + emergency.status + '">' + emergency.status.toUpperCase() + '</span>';
    html += '</div>';

    html += '<div class="card-body">';
    html += '  <p class="card-location">📍 ' + emergency.location + '</p>';
    html += '  <p class="card-severity">Severity: <span class="badge severity-badge-' + emergency.severity + '">' + capitalize(emergency.severity) + '</span></p>';
    html += '  <p class="card-time">🕐 ' + formatTime(emergency.createdAt) + '</p>';
    if (emergency.description) {
        html += '  <p class="card-desc">' + emergency.description + '</p>';
    }
    html += '</div>';

    html += buildProgressBar(emergency.status);

    html += '<div class="card-actions">';
    html += '  <button class="btn btn-details" onclick="showDetails(' + emergency.id + ')">Details</button>';
    if (emergency.status === 'active') {
        html += '  <button class="btn btn-respond" onclick="respondEmergency(' + emergency.id + ')">Respond</button>';
        html += '  <button class="btn btn-resolve" onclick="resolveEmergency(' + emergency.id + ')">Resolve</button>';
    } else if (emergency.status === 'responding') {
        html += '  <button class="btn btn-resolve" onclick="resolveEmergency(' + emergency.id + ')">Resolve</button>';
    }
    html += '</div>';

    card.innerHTML = html;
    return card;
}

// Builds a resolved emergency card for the history section
function createHistoryCard(emergency) {
    var card = document.createElement('div');
    card.className = 'history-card';
    var html = '';

    html += '<div class="card-header">';
    html += '  <span class="card-type">' + typeIcons[emergency.type] + ' ' + typeNames[emergency.type] + '</span>';
    html += '  <span class="badge status-resolved">RESOLVED</span>';
    html += '</div>';

    html += '<div class="card-body">';
    html += '  <p class="card-location">📍 ' + emergency.location + '</p>';
    html += '  <p class="card-severity">Severity: <span class="badge severity-badge-' + emergency.severity + '">' + capitalize(emergency.severity) + '</span></p>';
    html += '  <p class="card-time">🕐 Created: ' + formatTime(emergency.createdAt) + '</p>';
    if (emergency.resolvedAt) {
        html += '  <p class="card-time">✅ Resolved: ' + formatTime(emergency.resolvedAt) + '</p>';
    }
    if (emergency.description) {
        html += '  <p class="card-desc">' + emergency.description + '</p>';
    }
    html += '</div>';

    html += '<div class="card-actions">';
    html += '  <button class="btn btn-details" onclick="showDetails(' + emergency.id + ')">Details</button>';
    html += '</div>';

    card.innerHTML = html;
    return card;
}

// Builds the status progress bar showing Active -> Responding -> Resolved
function buildProgressBar(status) {
    var html = '<div class="status-progress">';

    if (status === 'active') {
        html += '<span class="progress-step step-active">● Active</span>';
    } else {
        html += '<span class="progress-step step-done">✓ Active</span>';
    }

    html += '<span class="progress-line' + (status !== 'active' ? ' line-done' : '') + '"></span>';

    if (status === 'responding') {
        html += '<span class="progress-step step-responding">● Responding</span>';
    } else if (status === 'resolved') {
        html += '<span class="progress-step step-done">✓ Responding</span>';
    } else {
        html += '<span class="progress-step step-pending">○ Responding</span>';
    }

    html += '<span class="progress-line' + (status === 'resolved' ? ' line-done' : '') + '"></span>';

    if (status === 'resolved') {
        html += '<span class="progress-step step-resolved">● Resolved</span>';
    } else {
        html += '<span class="progress-step step-pending">○ Resolved</span>';
    }

    html += '</div>';
    return html;
}

// Reads form values, creates a new emergency, and updates the page
function createEmergency(event) {
    event.preventDefault();

    var type = document.getElementById('emergency-type').value;
    var location = document.getElementById('emergency-location').value;
    var severity = document.getElementById('emergency-severity').value;
    var description = document.getElementById('emergency-desc').value;

    var newEmergency = {
        id: nextId,
        type: type,
        location: location,
        severity: severity,
        description: description,
        status: 'active',
        createdAt: new Date().toISOString(),
        resolvedAt: null
    };

    emergencies.unshift(newEmergency);
    nextId++;

    addActivity(typeIcons[type] + ' New ' + capitalize(severity) + ' ' + typeNames[type] + ' emergency in ' + location, 'create');
    renderAll();
    showNotification(typeIcons[type] + ' New ' + capitalize(severity) + ' ' + typeNames[type] + ' emergency in ' + location, severity);
    document.getElementById('emergency-form').reset();
}

// Changes an emergency's status to "responding"
function respondEmergency(id) {
    for (var i = 0; i < emergencies.length; i++) {
        if (emergencies[i].id === id) {
            emergencies[i].status = 'responding';
            addActivity('🚨 Team dispatched to ' + emergencies[i].location, 'respond');
            break;
        }
    }
    renderAll();
    showNotification('🚨 Team dispatched — responding to emergency', 'info');
}

// Changes an emergency's status to "resolved" and records the time
function resolveEmergency(id) {
    for (var i = 0; i < emergencies.length; i++) {
        if (emergencies[i].id === id) {
            emergencies[i].status = 'resolved';
            emergencies[i].resolvedAt = new Date().toISOString();
            addActivity('✅ ' + typeNames[emergencies[i].type] + ' in ' + emergencies[i].location + ' resolved', 'resolve');
            break;
        }
    }
    renderAll();
    showNotification('✅ Emergency resolved successfully', 'success');
}

// Returns filtered and sorted emergencies (excludes resolved)
function getFilteredEmergencies() {
    var result = [];

    for (var i = 0; i < emergencies.length; i++) {
        var em = emergencies[i];
        if (em.status === 'resolved') continue;

        var matchesFilter = false;
        var matchesSearch = false;

        if (currentFilter === 'all') {
            matchesFilter = true;
        } else if (currentFilter === 'critical') {
            matchesFilter = (em.severity === 'critical');
        } else {
            matchesFilter = (em.status === currentFilter);
        }

        if (searchQuery === '') {
            matchesSearch = true;
        } else {
            var query = searchQuery.toLowerCase();
            matchesSearch =
                em.location.toLowerCase().indexOf(query) !== -1 ||
                typeNames[em.type].toLowerCase().indexOf(query) !== -1 ||
                em.description.toLowerCase().indexOf(query) !== -1;
        }

        if (matchesFilter && matchesSearch) result.push(em);
    }

    return sortEmergencies(result);
}

// Sorts emergencies by the current sort setting
function sortEmergencies(arr) {
    var sorted = arr.slice();

    if (currentSort === 'newest') {
        sorted.sort(function (a, b) { return new Date(b.createdAt) - new Date(a.createdAt); });
    } else if (currentSort === 'oldest') {
        sorted.sort(function (a, b) { return new Date(a.createdAt) - new Date(b.createdAt); });
    } else if (currentSort === 'severity-high') {
        sorted.sort(function (a, b) { return severityOrder[b.severity] - severityOrder[a.severity]; });
    } else if (currentSort === 'severity-low') {
        sorted.sort(function (a, b) { return severityOrder[a.severity] - severityOrder[b.severity]; });
    }

    return sorted;
}

// Sets the active filter and re-renders
function setFilter(filter, buttonElement) {
    currentFilter = filter;
    var buttons = document.querySelectorAll('.filter-btn');
    for (var i = 0; i < buttons.length; i++) buttons[i].classList.remove('active');
    buttonElement.classList.add('active');
    renderEmergencies();
}

// Reads the search input and re-renders
function applyFilters() {
    searchQuery = document.getElementById('search-input').value;
    renderEmergencies();
}

// Reads the sort dropdown and re-renders
function applySort() {
    currentSort = document.getElementById('sort-select').value;
    renderEmergencies();
}

// Adds an entry to the activity log array
function addActivity(message, type) {
    activities.unshift({ message: message, type: type, time: new Date().toISOString() });
    if (activities.length > 20) activities = activities.slice(0, 20);
}

// Opens the details modal for a specific emergency
function showDetails(id) {
    var emergency = null;
    for (var i = 0; i < emergencies.length; i++) {
        if (emergencies[i].id === id) { emergency = emergencies[i]; break; }
    }
    if (!emergency) return;

    document.getElementById('modal-title').textContent =
        typeIcons[emergency.type] + ' ' + typeNames[emergency.type] + ' Incident';

    var html = '';
    html += '<div class="modal-detail"><span class="modal-label">📍 Location</span><span class="modal-value">' + emergency.location + '</span></div>';
    html += '<div class="modal-detail"><span class="modal-label">⚠ Severity</span><span class="modal-value"><span class="badge severity-badge-' + emergency.severity + '">' + capitalize(emergency.severity) + '</span></span></div>';
    html += '<div class="modal-detail"><span class="modal-label">🕐 Reported</span><span class="modal-value">' + formatDateTime(emergency.createdAt) + '</span></div>';
    if (emergency.description) {
        html += '<div class="modal-detail"><span class="modal-label">📝 Description</span><span class="modal-value">' + emergency.description + '</span></div>';
    }
    html += '<div class="modal-detail"><span class="modal-label">Status</span><span class="modal-value"><span class="badge status-' + emergency.status + '">' + emergency.status.toUpperCase() + '</span></span></div>';
    html += buildProgressBar(emergency.status);
    if (emergency.resolvedAt) {
        html += '<div class="modal-detail"><span class="modal-label">✅ Resolved At</span><span class="modal-value">' + formatDateTime(emergency.resolvedAt) + '</span></div>';
    }
    document.getElementById('modal-body').innerHTML = html;

    var actionsHtml = '';
    if (emergency.status === 'active') {
        actionsHtml += '<button class="btn btn-respond" onclick="respondEmergency(' + emergency.id + '); closeModal();">Respond</button>';
        actionsHtml += '<button class="btn btn-resolve" onclick="resolveEmergency(' + emergency.id + '); closeModal();">Resolve</button>';
    } else if (emergency.status === 'responding') {
        actionsHtml += '<button class="btn btn-resolve" onclick="resolveEmergency(' + emergency.id + '); closeModal();">Resolve</button>';
    } else {
        actionsHtml += '<span class="resolved-text">✓ Emergency Resolved</span>';
    }
    document.getElementById('modal-actions').innerHTML = actionsHtml;
    document.getElementById('modal-overlay').classList.add('active');
}

// Closes the details modal
function closeModal() {
    document.getElementById('modal-overlay').classList.remove('active');
}

// Shows a toast notification that auto-dismisses after 3 seconds
function showNotification(message, type) {
    var container = document.getElementById('notification-container');
    var notification = document.createElement('div');
    notification.className = 'notification notification-' + type;
    notification.textContent = message;
    container.appendChild(notification);

    setTimeout(function () {
        notification.classList.add('notification-hide');
        setTimeout(function () {
            if (notification.parentNode) notification.parentNode.removeChild(notification);
        }, 300);
    }, 3000);
}

// Toggles dark/light mode by adding or removing the class on body
function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    var isDark = document.body.classList.contains('dark-mode');
    document.getElementById('theme-toggle').textContent = isDark ? '☀️' : '🌙';
}

// Updates the live clock in the navbar every second
function updateClock() {
    var now = new Date();
    var hours = now.getHours();
    var minutes = now.getMinutes();
    var seconds = now.getSeconds();
    var ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    if (hours === 0) hours = 12;
    if (minutes < 10) minutes = '0' + minutes;
    if (seconds < 10) seconds = '0' + seconds;
    document.getElementById('system-clock').textContent = hours + ':' + minutes + ':' + seconds + ' ' + ampm;
}

// Initializes the app on page load
function initApp() {
    renderAll();
    updateClock();
    setInterval(updateClock, 1000);
    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape') closeModal();
    });
}

initApp();
