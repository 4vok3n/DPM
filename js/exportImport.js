// Export/import functionality
import { showErrorMessage, downloadFile } from './ui.js';

export class ExportImportManager {
    constructor(dataManager) {
        this.dataManager = dataManager;
    }

    init() {
        this.setupExportImportHandlers();
    }

    setupExportImportHandlers() {
        try {
            const exportCsvBtn = document.getElementById('export-csv');
            if (exportCsvBtn) {
                exportCsvBtn.addEventListener('click', () => this.exportData('csv'));
            }
            
            const exportJsonBtn = document.getElementById('export-json');
            if (exportJsonBtn) {
                exportJsonBtn.addEventListener('click', () => this.exportData('json'));
            }
            
            const importBtn = document.getElementById('import-data');
            if (importBtn) {
                importBtn.addEventListener('click', () => this.importData());
            }
            console.log('Export/Import handlers setup complete');
        } catch (error) {
            console.error('Error setting up export/import handlers:', error);
        }
    }

    exportData(format) {
        try {
            const datacenter = document.getElementById('export-datacenter').value;
            const allData = this.dataManager.getAllData();
            
            let dataToExport = {};
            
            if (datacenter === 'all') {
                dataToExport = allData;
            } else {
                dataToExport[datacenter] = allData[datacenter] || [];
            }
            
            if (format === 'json') {
                // Export as JSON
                const jsonStr = JSON.stringify(dataToExport, null, 2);
                downloadFile(jsonStr, 'datacenter_power_data.json', 'application/json');
            } else {
                // Export as CSV
                let csv = 'Datacenter,Date,Supplier,Cabinet/Rack,Circuit,Primary kW,Primary A,Redundant kW,Redundant A,Notes\n';
                
                for (const dc in dataToExport) {
                    if (Array.isArray(dataToExport[dc])) {
                        dataToExport[dc].forEach(entry => {
                            if (entry) {
                                csv += `${dc},${entry.date || ''},${entry.supplier || ''},${entry.cabinetRack || ''},${entry.circuit || ''},${entry.primaryKw || 0},${entry.primaryA || 0},${entry.redundantKw || 0},${entry.redundantA || 0},"${entry.notes || ''}"\n`;
                            }
                        });
                    }
                }
                
                downloadFile(csv, 'datacenter_power_data.csv', 'text/csv');
            }
        } catch (error) {
            console.error('Error exporting data:', error);
            showErrorMessage('Error exporting data: ' + error.message);
        }
    }

    importData() {
        try {
            const fileInput = document.getElementById('import-file');
            const statusDiv = document.getElementById('import-status');
            
            if (!fileInput.files || fileInput.files.length === 0) {
                if (statusDiv) {
                    statusDiv.innerHTML = 'Please select a file to import';
                    statusDiv.className = 'error-message';
                } else {
                    alert('Please select a file to import');
                }
                return;
            }
            
            const file = fileInput.files[0];
            const reader = new FileReader();
            
            reader.onload = (e) => {
                try {
                    if (file.name.endsWith('.json')) {
                        // Import JSON
                        const importedData = JSON.parse(e.target.result);
                        
                        // Merge with existing data
                        const allData = this.dataManager.getAllData();
                        for (const datacenter in importedData) {
                            if (!allData[datacenter]) {
                                allData[datacenter] = [];
                            }
                            
                            if (Array.isArray(importedData[datacenter])) {
                                allData[datacenter] = allData[datacenter].concat(importedData[datacenter]);
                            }
                        }
                        
                        // Update data manager
                        this.dataManager.data = allData;
                        this.dataManager.saveData();
                        this.dataManager.extractMetadata();
                        
                        if (statusDiv) {
                            statusDiv.innerHTML = 'JSON data imported successfully!';
                            statusDiv.className = 'success-message';
                        } else {
                            alert('JSON data imported successfully!');
                        }
                    } else if (file.name.endsWith('.csv')) {
                        // Import CSV
                        const csvData = e.target.result;
                        this.importCSV(csvData);
                        
                        if (statusDiv) {
                            statusDiv.innerHTML = 'CSV data imported successfully!';
                            statusDiv.className = 'success-message';
                        } else {
                            alert('CSV data imported successfully!');
                        }
                    } else {
                        if (statusDiv) {
                            statusDiv.innerHTML = 'Unsupported file format. Please use JSON or CSV.';
                            statusDiv.className = 'error-message';
                        } else {
                            alert('Unsupported file format. Please use JSON or CSV.');
                        }
                    }
                } catch (parseError) {
                    console.error('Error parsing file:', parseError);
                    if (statusDiv) {
                        statusDiv.innerHTML = 'Error parsing file: ' + parseError.message;
                        statusDiv.className = 'error-message';
                    } else {
                        alert('Error parsing file: ' + parseError.message);
                    }
                }
            };
            
            reader.readAsText(file);
        } catch (error) {
            console.error('Error importing data:', error);
            const statusDiv = document.getElementById('import-status');
            if (statusDiv) {
                statusDiv.innerHTML = 'Error importing data: ' + error.message;
                statusDiv.className = 'error-message';
            } else {
                showErrorMessage('Error importing data: ' + error.message);
            }
        }
    }
    
    importCSV(csvData) {
        try {
            const lines = csvData.split('\n');
            const headers = lines[0].split(',');
            const allData = this.dataManager.getAllData();
            
            // Skip header row
            for (let i = 1; i < lines.length; i++) {
                const line = lines[i].trim();
                if (line) {
                    const values = line.split(',');
                    
                    if (values.length >= 10) {
                        const datacenter = values[0];
                        const date = values[1];
                        const supplier = values[2];
                        const cabinetRack = values[3];
                        const circuit = values[4];
                        const primaryKw = parseFloat(values[5]) || 0;
                        const primaryA = parseFloat(values[6]) || 0;
                        const redundantKw = parseFloat(values[7]) || 0;
                        const redundantA = parseFloat(values[8]) || 0;
                        const notes = values[9] ? values[9].replace(/"/g, '') : '';
                        
                        // Create entry
                        const entry = {
                            date,
                            supplier,
                            cabinetRack,
                            circuit,
                            primaryKw,
                            primaryA,
                            redundantKw,
                            redundantA,
                            notes
                        };
                        
                        // Add to data
                        if (!allData[datacenter]) {
                            allData[datacenter] = [];
                        }
                        
                        allData[datacenter].push(entry);
                    }
                }
            }
            
            // Update data manager
            this.dataManager.data = allData;
            this.dataManager.saveData();
            this.dataManager.extractMetadata();
        } catch (error) {
            console.error('Error importing CSV:', error);
            throw error;
        }
    }
}