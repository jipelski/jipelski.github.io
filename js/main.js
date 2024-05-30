function loadHeader() {
    fetch('/src/navbar.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('header').innerHTML = data;
        })
        .catch(error => console.error('Error loading the content of navbar', error));
}

function loadContent(page) {
    fetch(page)
        .then(response => response.text())
        .then(data => {
            document.getElementById('content').innerHTML = data;
        })
        .catch(error => console.error('Error loading the content of ' + page, error));
}

function updateCounters() {
    fetchLeetCode("jipelski")
        .then(r => {
            document.getElementById('leetcode-total-counter').innerHTML = r;
        })
        .catch(e => {
            console.error("Error fetching leetcode data",e);
            document.getElementById('leetcode-total-counter').innerHTML = 'Error';
        })
}

async function fetchLeetCode(username){
    const response = await fetch(`https://leetcode-stats-api.herokuapp.com/${username}`);

    if (!response.ok) {
        throw new Error(response.statusText);
    }

    const data = await response.json();
    console.log(data.totalSolved);
    return data.totalSolved;
}

document.addEventListener('DOMContentLoaded', () => {
    loadHeader();
    loadContent('/src/home.html');

    window.loadContent = loadContent;
    window.updateCounters = updateCounters;
})