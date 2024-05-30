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

document.addEventListener('DOMContentLoaded', () => {
    loadHeader();
    loadContent('/src/home.html');

    window.loadContent = loadContent;
})