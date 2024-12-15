document.getElementById("study-form").addEventListener("submit", function (e) {
    e.preventDefault();

    const subject = document.getElementById("subject").value.trim();
    const hoursStudied = parseFloat(document.getElementById("hours").value);
    const totalHours = parseFloat(document.getElementById("total-hours").value);

    if (hoursStudied < 0 || hoursStudied > 24 || isNaN(hoursStudied) || isNaN(totalHours) || totalHours <= 0) {
        alert("Please enter valid input values!");
        return;
    }

    const hoursRemaining = totalHours - hoursStudied;
    const completionPercent = ((hoursStudied / totalHours) * 100).toFixed(1);

    const newEntry = {
        subject,
        hoursStudied,
        totalHours,
        hoursRemaining: hoursRemaining < 0 ? 0 : hoursRemaining,
        completionPercent
    };

    let progressData = JSON.parse(localStorage.getItem('progressData')) || [];
    progressData.push(newEntry);
    localStorage.setItem('progressData', JSON.stringify(progressData));

    addRowToTable(newEntry);

    document.getElementById("study-form").reset();
    showNotification('Progress added successfully!');
});

function addRowToTable(entry) {
    const table = document.getElementById("progress-table");
    const row = table.insertRow();

    row.innerHTML = `
        <td>${entry.subject}</td>
        <td>${entry.hoursStudied}</td>
        <td>${entry.totalHours}</td>
        <td>${entry.hoursRemaining}</td>
        <td class="${getProgressClass(entry.completionPercent)}">${entry.completionPercent}%</td>
    `;
}

function getProgressClass(percent) {
    if (percent >= 75) return "progress-green";
    if (percent >= 50) return "progress-orange";
    return "progress-red";
}

document.addEventListener('DOMContentLoaded', () => {
    const progressData = JSON.parse(localStorage.getItem('progressData')) || [];
    progressData.forEach(entry => addRowToTable(entry));
});

document.getElementById("reset-button").addEventListener("click", function () {
    localStorage.removeItem('progressData');
    document.getElementById("progress-table").innerHTML = "";
    document.getElementById("study-form").reset();
    showNotification('All progress has been reset.');
});


function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.innerText = message;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => document.body.removeChild(notification), 1000);
    }, 3000);
}
function signOut(event)
{
    event.preventDefault();
    localStorage.removeItem("loginUser");
    window.location.href='login.html';
}
