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

    window.sendForm = sendForm;
    window.loadContent = loadContent;

})

function sendForm() {
    event.preventDefault();
    emailjs.init('I6XAeZBxH6tn7Dqg3')

    const serviceID = 'service_dvofvzg';
    const templateID = 'template_1qbyhbf';

    emailjs.sendForm(serviceID, templateID, '#contact-form')
        .then(() => {
            alert('Sent!');
        }, (err) => {
            alert(JSON.stringify(err));
        });
}