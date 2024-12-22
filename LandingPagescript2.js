let progressData = JSON.parse(localStorage.getItem('progressData')) || [];
document.getElementById("add-sub").addEventListener("submit", function (e) {
    e.preventDefault();
    const subject = document.getElementById("subject").value.trim();
    const totalHours = parseFloat(document.getElementById("total-hours").value);
    const newEntry = {
        subject,
        hoursStudied:0,
        totalHours,
        hoursRemaining:0,
        completionPercent:0
    };
    let notExist=true;
    progressData.forEach(user=>{
        if(user.subject === subject){
            user.hoursStudied = 0;
            user.hoursRemaining = totalHours;
            user.completionPercent = 0;
            user.totalHours=totalHours;
            notExist=false;
        }
    })
    if(notExist){
        progressData.push(newEntry);
    }
    localStorage.setItem('progressData', JSON.stringify(progressData));
    addRowToTable(newEntry);
    const selecSub=document.getElementById("selSubject");
    selecSub.innerHTML = '<option value="" disabled selected>Select subject</option>';
    progressData.forEach(user=>
    {
        const option=document.createElement("option");
        option.value=user.subject;
        option.textContent=user.subject;
        selecSub.appendChild(option);
    })
    // progressData.length=0
})

document.getElementById("study-form").addEventListener("submit", function (e) {
    e.preventDefault();
    const subject = document.getElementById("selSubject").value
    const hoursStudied = parseFloat(document.getElementById("hours").value);
    if(hoursStudied<0||hoursStudied>24||isNaN(hoursStudied)) {
        alert("Please enter valid input values!");
        return;
    }
    for(let i of progressData){
        if(i.subject==subject){
            i.hoursStudied=hoursStudied+i.hoursStudied;
            i.hoursRemaining=i.totalHours - i.hoursStudied;
            i.completionPercent=((i.hoursStudied / i.totalHours) * 100).toFixed(1);
            localStorage.setItem('progressData', JSON.stringify(progressData));
            addRowToTable(i);
            break;
        }
    }
    document.getElementById("study-form").reset();
    showNotification('Progress added successfully!');
})

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
    const selecSub=document.getElementById("selSubject");
    selecSub.innerHTML = '<option value="" disabled selected>Select subject</option>';
    progressData.forEach(user=>
    {
        const option=document.createElement("option");
        option.value=user.subject;
        option.textContent=user.subject;
        selecSub.appendChild(option);
    })
    progressData.forEach(entry => addRowToTable(entry));
});

document.getElementById("reset-button").addEventListener("click", function () {
    progressData.length=0
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
    localStorage.setItem("loginUser",null)
    window.location.href='login.html';
}
