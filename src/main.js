import App from './App.js';

// Entry point of the application
function main() {
    const appContainer = document.getElementById('app');
    if (!appContainer) {
        console.error('Fatal Error: #app container not found in the DOM.');
        return;
    }

    // Instantiate and render the main App component
    const app = new App();
    app.render(appContainer);
}

// Run the main function once the DOM is fully loaded
document.addEventListener('DOMContentLoaded', main);