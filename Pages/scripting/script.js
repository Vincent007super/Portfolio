document.addEventListener('DOMContentLoaded', function() {
    // Get references to form elements
    const form = document.getElementById('projectForm');
    const titleInput = document.getElementById('title');
    const descriptionInput = document.getElementById('description');
    const urlInput = document.getElementById('url');
    const fileInput = document.getElementById('file');
 
    // Add event listener to form submission
    form.addEventListener('submit', function (event) {
        event.preventDefault(); // Prevent the form from submitting normally
 
        // Create a JavaScript object to represent the project
        const project = {
            title: titleInput.value,
            description: descriptionInput.value,
            url: urlInput.value,
            // You can add more properties as needed
        };
 
        // Save the project data to Local Storage
        saveProject(project);
 
        // Redirect to the project page
        window.location.href = '/Pages/html/projectpage.html';
    });
 
    // Function to save project data to Local Storage
    function saveProject(project) {
        // Get existing projects from Local Storage (if any)
        let projects = JSON.parse(localStorage.getItem('projects')) || [];
 
        // Add the new project to the array
        projects.push(project);
 
        // Save the updated array back to Local Storage
        localStorage.setItem('projects', JSON.stringify(projects));
    }
 
    // Rest of your code for retrieving and displaying projects goes here
 });

// Retrieve saved projects from Local Storage
const savedProjects = JSON.parse(localStorage.getItem('projects')) || [];

// Iterate through saved projects and generate HTML elements
const wrapper2 = document.getElementById('wrapper2');

savedProjects.forEach((project, index) => {
    const hyperDiv = document.createElement('div');
    hyperDiv.classList.add('hyper');

    // Create elements for title and description
    const titleElement = document.createElement('h1');
    titleElement.textContent = project.title;
    const descriptionElement = document.createElement('p');
    descriptionElement.textContent = project.description;

    hyperDiv.appendChild(titleElement);
    hyperDiv.appendChild(descriptionElement);

    // Add this project to the wrapper
    wrapper2.appendChild(hyperDiv);
});
