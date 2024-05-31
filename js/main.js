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
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const message = document.getElementById('message').value;

    if (name === '') {
        alert("Please enter your name");
    }
    else if(email === '' || !email.includes("@") || !email.includes(".")) {
        alert("Please enter a valid email");
    }
    else if(message === '') {
        alert("Please enter your message");
    }
    else{
        event.preventDefault()
        emailjs.init('I6XAeZBxH6tn7Dqg3')

        const serviceID = 'service_dvofvzg';
        const templateID = 'template_1qbyhbf';

        emailjs.sendForm(serviceID, templateID, "#contact_form")
            .then(() => {
                alert('Sent!');
            }, (err) => {
                alert(JSON.stringify(err));
            });
    }
}