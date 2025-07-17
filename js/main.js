// Main application entry point
import { DataManager } from './data.js';
import { NavigationManager } from './navigation.js';
import { FormManager } from './forms.js';
import { ReportsManager } from './reports.js';
import { ExportImportManager } from './exportImport.js';
import { showErrorMessage, hideErrorMessage } from './ui.js';

class DatacenterPowerApp {
    constructor() {
        this.dataManager = new DataManager();
        this.navigationManager = new NavigationManager();
        this.formManager = new FormManager(this.dataManager);
        this.reportsManager = new ReportsManager(this.dataManager);
        this.exportImportManager = new ExportImportManager(this.dataManager);
    }

    init() {
        try {
            // Initialize data
            this.dataManager.loadData();
            
            // Initialize components
            this.navigationManager.init();
            this.formManager.init();
            this.reportsManager.init();
            this.exportImportManager.init();
            
            // Successfully initialized
            window.appInitialized = true;
        } catch (error) {
            console.error('Error in init:', error);
            showErrorMessage('Error initializing: ' + error.message);
            throw error; // Re-throw to allow the outer try-catch to handle it
        }
    }
}

// Initialize application when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    try {
        console.log('Initializing application...');
        // Initialize application
        const app = new DatacenterPowerApp();
        app.init();
        window.appInitialized = true;
        console.log('Application initialized successfully');
        
        // Hide error message if it was shown
        hideErrorMessage();
    } catch (error) {
        console.error('Error initializing application:', error);
        showErrorMessage('Failed to initialize application: ' + error.message);
    }
});