// Main application entry point
import { showErrorMessage } from './modules/utils.js';
import { DataManager } from './modules/dataManager.js';
import { UIController } from './modules/uiController.js';
import { ReportGenerator } from './modules/reportGenerator.js';
import { ExportImportManager } from './modules/exportImport.js';

class DatacenterPowerApp {
    constructor() {
        this.dataManager = new DataManager();
        this.uiController = new UIController(this.dataManager);
        this.reportGenerator = new ReportGenerator(this.dataManager);
        this.exportImportManager = new ExportImportManager(this.dataManager);
    }

    init() {
        try {
            this.dataManager.loadData();
            this.uiController.setupNavigation();
            this.uiController.setupFormHandlers();
            this.reportGenerator.setupReportHandlers();
            this.exportImportManager.setupExportImportHandlers();
            this.uiController.populateSelects();
            
            // Successfully initialized
            window.appInitialized = true;
        } catch (error) {
            console.error('Error in init:', error);
            showErrorMessage('Error initializing: ' + error.message);
            throw error; // Re-throw to allow the outer try-catch to handle it
        }
    }
}

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    try {
        console.log('Initializing application...');
        // Initialize application
        const app = new DatacenterPowerApp();
        app.init();
        window.appInitialized = true;
        console.log('Application initialized successfully');
        
        // Hide error message if it was shown
        document.getElementById('error-container').style.display = 'none';
    } catch (error) {
        console.error('Error initializing application:', error);
        showErrorMessage('Failed to initialize application: ' + error.message);
    }
});