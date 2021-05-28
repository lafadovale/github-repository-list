import api from './api';
let repositories = JSON.parse(localStorage.getItem('repositories')) || [];

class App {
    // Constructor
    constructor(){
        // Form
        this.form = document.querySelector('form');

        // List
        this.list = document.querySelector('.list-group');

        // Form events registry method
        this.registerEvents();

        // Load saved list in the client
        this.loadSavedList();
    }

    registerEvents(){
        this.form.onsubmit = event => this.addRepository(event);
    }

    async addRepository(event){
        // Avoid page reload
        event.preventDefault();

        // Recover the input value
        let input = this.form.querySelector('input[id=repository]').value;

        // If input returns empty, leave app
        if(input.length === 0){
            return; // return always leaves the function
        };

        // Show searching status
        this.showSearching();

        try{
            let response = await api.get(input);

            // console.log(response);

            let { name, description, html_url, owner: { avatar_url } } = response.data;

            // Add repository to the list
            repositories.push({
                name,
                description,
                avatar_url,
                link: html_url,
            });

            // Render screen
            this.renderScreen();

            // Save repositories list on the browser
            this.saveList();
        }catch(error){
            // Clear search warning
            this.list.removeChild(document.querySelector('.list-group-item-warning'));
            
            // Remove existing errors
            let err = this.list.querySelector('.list-group-item-danger');
            if(err !== null){
                this.list.removeChild(err);
            }

            // <li>
            let li = document.createElement('li');
            li.setAttribute('class', 'list-group-item list-group-item-danger');
            let txtError = document.createTextNode(`The ${input} repository was not found or does not exist.`);
            li.appendChild(txtError);
            this.list.appendChild(li);
        }
    }

    showSearching(){
        // <li>
        let li = document.createElement('li');
        li.setAttribute('class', 'list-group-item list-group-item-warning');
        let txtSearching = document.createTextNode(`Searching the repository. Please wait...`);
        li.appendChild(txtSearching);
        this.list.appendChild(li);
    };

    renderScreen(){
        // Clear list
        this.list.innerHTML = '';
        // Scroll through the list and create the elements
        repositories.forEach(repository => {
            // <ul>
            let ul = document.querySelector('.list-group');

            // <li>
            let li = document.createElement('li');
            li.setAttribute('class', 'list-group-item list-group-item-action');

            // <img>
            let img = document.createElement('img');
            img.setAttribute('src', repository.avatar_url);
            img.setAttribute('alt', 'Repository image');
            li.appendChild(img);

            // <strong>
            let strong = document.createElement('strong');
            let txtName = document.createTextNode(repository.name);
            strong.appendChild(txtName);
            li.appendChild(strong);

            // <p>
            let p = document.createElement('p');
            let txtDescription = document.createTextNode(repository.description);
            p.appendChild(txtDescription);
            li.appendChild(p);

            // <a>
            let a = document.createElement('a');
            a.setAttribute('target', '_blank');
            a.setAttribute('href', repository.link);
            let txtA = document.createTextNode('More info');
            a.appendChild(txtA);
            li.appendChild(a);

            // Remove button
            let removeButton = document.createElement('button');
            removeButton.setAttribute('type', 'button');
            removeButton.setAttribute('class', 'btn btn-danger');
            let txtButton = document.createTextNode('Remove');
            removeButton.appendChild(txtButton);
            li.appendChild(removeButton);
            removeButton.onclick = function(){
                ul.removeChild(li);
                // Remove the selected object and keep the others in the repositories array
                repositories = repositories.filter(function(el){
                    return el != repository;
                });
                // Save the changes in the local storage
                localStorage.setItem('repositories', JSON.stringify(repositories));
            };

            // Add <li> to <ul>
            this.list.appendChild(li);

            // Clear the input content
            this.form.querySelector('input[id=repository]').value = '';

            // Focus on input
            this.form.querySelector('input[id=repository]').focus();
        });        
    };

    saveList(){
        // Save the list in the local storage
        localStorage.setItem('repositories', JSON.stringify(repositories));
    };

    loadSavedList(){
        repositories !== [] ? this.renderScreen() : this.list.innerHTML = '';
    };
};

new App();