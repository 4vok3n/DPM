// Handles export and import functionality
import { showErrorMessage } from './utils.js';

export class ExportImportManager {
    constructor(dataManager) {
        this.dataManager = dataManager;
    }
    
    setupExportImportHandlers() {
        try {
            // Setup export button
            const exportBtn = document.getElementById('export-btn');
            if (exportBtn) {
                exportBtn.addEventListener('click', this.exportData.bind(this));
            }
            
            // Setup import button
            const importBtn = document.getElementById('import-btn');
            if (importBtn) {
                importBtn.addEventListener('click', () => {
                    document.getElementById('import-file').click();
                });
            }
            
            // Setup import file change handler
            const importFile = document.getElementById('import-file');
            if (importFile) {
                importFile.addEventListener('change', this.importData.bind(this));
            }
        } catch (error) {
            console.error('Error setting up export/import handlers:', error);
            showErrorMessage('Failed to set up export/import functionality: ' + error.message);
        }
    }
    
    exportData() {
        try {
            // Create a JSON string of the data
            const dataStr = JSON.stringify(this.dataManager.data);
            
            // Create a download link
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);
            
            // Create a link element and trigger download
            const link = document.createElement('a');
            link.href = url;
            link.download = 'datacenter_power_data.json';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            alert('Data exported successfully');
        } catch (error) {
            console.error('Error exporting data:', error);
            showErrorMessage('Failed to export data: ' + error.message);
        }
    }
    
    importData(e) {
        try {
            const file = e.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            
            reader.onload = (event) => {
                try {
                    const importedData = JSON.parse(event.target.result);
                    
                    // Confirm import
                    if (confirm('This will replace your current data. Continue?')) {
                        // Update the data
                        this.dataManager.data = importedData;
                        this.dataManager.extractMetadata();
                        this.dataManager.saveData();
                        
                        alert('Data imported successfully');
                        
                        // Reset file input
                        e.target.value = '';
                    }
                } catch (parseError) {
                    console.error('Error parsing imported data:', parseError);
                    showErrorMessage('Invalid JSON file: ' + parseError.message);
                }
            };
            
            reader.readAsText(file);
        } catch (error) {
            console.error('Error importing data:', error);
            showErrorMessage('Failed to import data: ' + error.message);
        }
    }
}