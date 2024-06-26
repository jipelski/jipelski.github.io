/**
 *
 */
function modifyNavbar() {
    const navbar = document.getElementById('navbar');
    const burger = document.createElement('div');
    burger.className = 'burger';
    burger.innerHTML = '&#9776;';

    function outsideClickListener( event) {
        const isClickInsideNavbar = navbar.contains(event.target);
        const isClickInsideBurger = burger.contains(event.target);

        if (!isClickInsideNavbar && !isClickInsideBurger) {
            navbar.classList.remove('show');
            burger.style.display = 'block';
            enableOutsideEvents();
        } else {
        }
    }

    function disableOutsideEvents() {
        document.addEventListener('click', outsideClickListener, true);
    }

    function enableOutsideEvents() {
        document.removeEventListener('click', outsideClickListener, true);
    }

    if (isMobile()) {
        navbar.classList.add('navbar-vertical');
        burger.style.display = 'block';

        document.body.appendChild(burger);

        burger.addEventListener('click', function() {
            navbar.classList.toggle('show');
            if (navbar.classList.contains('show')) {
                burger.style.display = 'none';
                disableOutsideEvents();
            } else {
                enableOutsideEvents();
            }
        });

    } else {
        navbar.classList.add('navbar-horizontal');
    }
}



/***
 * loadHeader() is used to load the header component into the page from the navbar.html file.
 */
function loadHeader() {
    fetch('/src/navbar.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('header').innerHTML = data;
        })
        .then(data => {
            modifyNavbar();
        })
        .catch(error => console.error('Error loading the content of navbar', error));
}

/***
 * loadFooter() is used to load the footer component into the page from the footer.html file.
 */
function loadFooter() {
    fetch('/src/footer.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('footer').innerHTML = data;
        })
        .catch(error => console.error('Error loading the content of footer', error));
}

/***
 * loadContent(@page, @number) is used to load the main component into the page from the dedicated .html file.
 * @param page - the location where the main component html resides
 * @param number - a variable relating to the number of the content section
 */
function loadContent(page, number) {
    fetch(page)
        .then(response => response.text())
        .then(data => {
            const section = document.createElement('section');
            section.classList.add('section');
            section.setAttribute('id', `section${number}`)
            section.innerHTML = data;
            document.getElementById('content').appendChild(section);
        })
        .catch(error => console.error('Error loading the content of ' + page, error));
}
/***
 * loadContentSequentially(@pages) is used to load all the given components into the main content component.
 * @param pages - an array of view source urls
 */
async function loadContentSequentially(pages) {
    const contentDiv = document.getElementById('content');
    let number = 0;
    for (const page of pages) {
        try {
            const response = await fetch(page);
            if(!response.ok) {
                console.error('Error loading the content of ' + page + ' response not ok.');
            }

            const data = await response.text();
            const section = document.createElement('section');
            section.classList.add('section');
            section.setAttribute('id', `section${number}`);
            section.innerHTML = data;
            contentDiv.appendChild(section);
            number += 1;

        } catch (err) {
            console.error('Error loading the content of sequentially' + page, err);
        }
    }
    initializeModal();
}

/***
 * Adding a DOMContentLoaded event listener to the document to ensure the subsequent function calls are called after
 * the static html components are loaded. It also exposes multiple functions globally.
 */
document.addEventListener('DOMContentLoaded', () => {
    const pages = ['../src/home.html', '../src/projects.html', '../src/platforms.html', '../src/contact.html']
    loadContentSequentially(pages)
        .then(animateName)
        .then(() => {
            loadHeader();
            loadFooter();
            return fetchRepoJson();
        })
        .then(result => {
            displayRepos(result);
            smoothScroll();
        })
        .catch(error => {
            console.error('Error:', error);
        });


    window.sendForm = sendForm;
    window.loadContent = loadContent;
})

/***
 * sendForm() is used to send a form using the emailjs API. It validates the input fields of the form,
 * then sends the form's content to the emailjs API using *my* public key, service id, and template id.
 * Replace the public key, service id, and template id values with your own values which can be generated by visiting
 * and registering to https://www.emailjs.com/
 */
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

/***
 * fetchRepoJson() is used to retrieve a json file containing the existing repos of a user.
 * This is done to go around the need for server-side scripting.
 */
async function fetchRepoJson() {
    const url = `https://api.github.com/repos/jipelski/jipelski.github.io/contents/res/files/repos_data.json`;
    const response = await fetch(url);
    if (response.ok) {
        const repoContent = await response.json();
        const rawFileResponse = await fetch(repoContent.download_url);
        if (rawFileResponse.ok) {
            return rawFileResponse.json();
        } else {
            console.error('Error loading the raw file');
        }
    } else {
        console.log()
        return []
    }
}

/***
 * displayRepos() populates a grid div element with the repositories of a GitHub user. For each repository
 * a div element is created, to which an icon, title and button are added.
 */
function displayRepos(repos) {
    const grid = document.getElementById('github_repo');

    for(let repoName in repos) {
        const repo = repos[repoName];
        const repoItem = document.createElement('div');
        repoItem.classList.add('repo_item');

        const repoImage = document.createElement('img');
        if (repo.image) {
            repoImage.src = `data:image/jpeg;base64,${repo.image}`;
        } else {
            repoImage.src = '../res/images/default_repo_image.jpg';
        }
        repoImage.alt = repo.name;
        repoImage.setAttribute('class', 'repo_image');

        const repoTitle = document.createElement('p');
        repoTitle.textContent = repo.name;
        repoTitle.setAttribute('class', 'repo_title');

        const repoDescription = document.createElement('p');
        repoDescription.textContent = repo.description || 'A repository';
        repoDescription.setAttribute('class', 'repo_description');

        const repoLanguage = document.createElement('p');
        repoLanguage.textContent = repo.language || 'none';
        repoLanguage.setAttribute('class', 'repo_language');

        const repoButton = document.createElement('button');
        repoButton.classList.add('button');
        repoButton.textContent = 'View Further';
        repoButton.setAttribute('class', 'button');
        repoButton.setAttribute('type', 'button');
        repoButton.addEventListener('click', (event) => {
            event.preventDefault();
            window.open(`https://github.com/jipelski/${repo.name}`, '_blank');
        })

        const repoImageContainer = document.createElement('div');
        repoImageContainer.classList.add('repo_image_container');
        repoImageContainer.appendChild(repoImage);
        repoItem.appendChild(repoImageContainer);

        const repoDataContainer = document.createElement('div');
        repoDataContainer.classList.add('repo_data_container');
        const repoDataContainerUpper = document.createElement('div');
        repoDataContainerUpper.classList.add('repo_data_container_upper');
        const repoDataContainerLower = document.createElement('div');
        repoDataContainerLower.classList.add('repo_data_container_lower');

        repoDataContainerUpper.appendChild(repoTitle);
        repoDataContainerUpper.appendChild(repoLanguage);
        repoDataContainerLower.appendChild(repoDescription);
        repoDataContainerLower.appendChild(repoButton);

        repoDataContainer.appendChild(repoDataContainerUpper);
        repoDataContainer.appendChild(repoDataContainerLower);

        repoItem.appendChild(repoDataContainer);
        grid.appendChild(repoItem);
    }
}

/***
 * Function to check if the device is mobile.
 */
function isMobile() {
    const isMobileDevice = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    console.log('isMobile:', isMobileDevice);
    return isMobileDevice;
}

/***
 * initializeModal() is used to add on click listeners to review resume button and close span.
 */
function initializeModal() {
    const modal = document.getElementById("resume_modal");
    const btn = document.getElementById("view_resume_button");
    const span = document.getElementsByClassName("close")[0];

    if (btn) {
        btn.onclick = function() {
            console.log("Clicked")
            modal.style.display = "block";
            let resumeContainer = document.getElementById("resume_container");
            if (isMobile()) {
                // Provide a link for mobile users
                resumeContainer.innerHTML = '<p>Mobile users, please <a href="../res/files/JipaClaudiuCV.pdf">click here to view the PDF</a>.</p>';
            } else {
                // Embed the PDF for desktop users
                resumeContainer.innerHTML = '<embed src="../res/files/JipaClaudiuCV.pdf" type="application/pdf" width="100%" height="100%">';
            }
        }
    }

    if (span) {
        span.onclick = function() {
            modal.style.display = "none";
        }
    }

    window.onclick = function(event) {
        if (event.target === modal) {
            modal.style.display = "none";
        }
    }
}

//ANIMATE NAME
function animateName() {
    const animation = lottie.loadAnimation({
        container: document.getElementById('lottie_animation'),
        renderer: 'svg',
        loop: false,
        autoplay: true,
        path: 'res/files/JipelskiAnimation.json',
        rendererSettings: {
            preserveAspectRatio: 'xMidYMid meet'
        }
    });

    animation.addEventListener('complete', function() {
        let totalFrames = animation.totalFrames;
        animation.goToAndStop(totalFrames - 1, true);
    });
}

//Smooth Scroll
function smoothScroll() {
    const links = document.querySelectorAll('nav a[href^="#"]');

    for (const link of links) {
        link.addEventListener("click", function(event) {
            event.preventDefault();

            const targetId = this.getAttribute("href");
            const targetElement = document.querySelector(targetId);

            window.scrollTo({
                top: targetElement.offsetTop - 50, // Adjust the value as needed
                behavior: "smooth"
            });
        });
    }
}