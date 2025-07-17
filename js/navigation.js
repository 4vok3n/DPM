// Navigation handling between views
import { showErrorMessage } from './ui.js';

export class NavigationManager {
    constructor() {
        this.currentView = 'input';
    }

    init() {
        this.setupNavigation();
    }

    setupNavigation() {
        try {
            const navLinks = document.querySelectorAll('nav a');
            const views = document.querySelectorAll('.view');

            navLinks.forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    const viewId = link.getAttribute('data-view');
                    this.switchToView(viewId);
                    
                    // Update active link
                    navLinks.forEach(l => l.classList.remove('active'));
                    link.classList.add('active');
                });
            });
            console.log('Navigation setup complete');
        } catch (error) {
            console.error('Error setting up navigation:', error);
            showErrorMessage('Error setting up navigation: ' + error.message);
        }
    }

    switchToView(viewId) {
        try {
            const views = document.querySelectorAll('.view');
            
            // Show selected view, hide others
            views.forEach(view => {
                if (view.id === `${viewId}-view`) {
                    view.classList.add('active');
                } else {
                    view.classList.remove('active');
                }
            });
            
            this.currentView = viewId;
        } catch (error) {
            console.error('Error switching view:', error);
            showErrorMessage('Error switching view: ' + error.message);
        }
    }

    getCurrentView() {
        return this.currentView;
    }
}