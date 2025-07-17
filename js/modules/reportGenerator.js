// Handles report generation and visualization
import { showErrorMessage } from './utils.js';
import { formatDate } from './utils.js';

export class ReportGenerator {
    constructor(dataManager) {
        this.dataManager = dataManager;
    }
    
    setupReportHandlers() {
        try {
            const generateReportBtn = document.getElementById('generate-report-btn');
            if (generateReportBtn) {
                generateReportBtn.addEventListener('click', this.generateReport.bind(this));
            }
            
            // Setup other report-related event listeners
        } catch (error) {
            console.error('Error setting up report handlers:', error);
            showErrorMessage('Failed to set up report functionality: ' + error.message);
        }
    }
    
    generateReport() {
        try {
            const datacenter = document.getElementById('report-datacenter-select').value;
            const supplier = document.getElementById('report-supplier-select').value;
            
            if (!datacenter && !supplier) {
                alert('Please select at least a datacenter or supplier');
                return;
            }
            
            let reportData = [];
            
            if (datacenter) {
                // Filter by datacenter
                reportData = this.dataManager.getDatacenterData(datacenter);
            } else {
                // Combine data from all datacenters
                reportData = Object.values(this.dataManager.data).flat();
            }
            
            // Apply supplier filter if specified
            if (supplier) {
                reportData = reportData.filter(entry => entry.supplier === supplier);
            }
            
            // Store the last generated date
            this.dataManager.lastGeneratedDate = new Date();
            
            // Display the report
            this.displayReport(reportData);
            
        } catch (error) {
            console.error('Error generating report:', error);
            showErrorMessage('Failed to generate report: ' + error.message);
        }
    }
    
    displayReport(reportData) {
        try {
            const reportTable = document.getElementById('report-table');
            const reportTableBody = document.getElementById('report-table-body');
            const reportContainer = document.getElementById('report-container');
            
            if (!reportTable || !reportTableBody || !reportContainer) {
                throw new Error('Report elements not found in DOM');
            }
            
            // Clear existing rows
            reportTableBody.innerHTML = '';
            
            if (reportData.length === 0) {
                reportContainer.innerHTML = '<p>No data available for the selected criteria.</p>';
                return;
            }
            
            // Create table rows
            reportData.forEach(entry => {
                const row = document.createElement('tr');
                
                // Add cells for each data point
                row.innerHTML = `
                    <td>${entry.datacenter || ''}</td>
                    <td>${entry.supplier || ''}</td>
                    <td>${entry.cabinetRack || ''}</td>
                    <td>${entry.circuit || ''}</td>
                    <td>${entry.powerCapacity || 0}</td>
                    <td>${entry.powerUsage || 0}</td>
                    <td>${formatDate(entry.date) || ''}</td>
                `;
                
                reportTableBody.appendChild(row);
            });
            
            // Show the report container
            reportContainer.style.display = 'block';
            
        } catch (error) {
            console.error('Error displaying report:', error);
            showErrorMessage('Failed to display report: ' + error.message);
        }
    }
}