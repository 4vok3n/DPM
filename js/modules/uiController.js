// UI management functionality
import { showErrorMessage, showSuccessMessage } from './utils.js';

export class UIController {
    constructor(dataManager) {
        this.dataManager = dataManager;
        this.currentView = 'input';
    }
    
    setupNavigation() {
        try {
            const navLinks = document.querySelectorAll('nav a');
            
            navLinks.forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    
                    // Remove active class from all links
                    navLinks.forEach(l => l.classList.remove('active'));
                    
                    // Add active class to clicked link
                    e.target.classList.add('active');
                    
                    // Show selected view
                    const view = e.target.getAttribute('data-view');
                    this.showView(view);
                });
            });
        } catch (error) {
            console.error('Error setting up navigation:', error);
            showErrorMessage('Failed to set up navigation: ' + error.message);
        }
    }
    
    showView(view) {
        try {
            // Hide all views
            const views = document.querySelectorAll('.view');
            views.forEach(v => v.classList.remove('active'));
            
            // Show selected view
            const selectedView = document.getElementById(view + '-view');
            if (selectedView) {
                selectedView.classList.add('active');
                this.currentView = view;
            } else {
                throw new Error('View not found: ' + view);
            }
        } catch (error) {
            console.error('Error showing view:', error);
            showErrorMessage('Failed to show view: ' + error.message);
        }
    }
    
    setupFormHandlers() {
        try {
            // Set up form submit handler
            const powerDataForm = document.getElementById('power-data-form');
            if (powerDataForm) {
                powerDataForm.addEventListener('submit', this.handleFormSubmit.bind(this));
            }
            
            // Set up add manual row handler
            const addManualRowBtn = document.getElementById('add-manual-row');
            if (addManualRowBtn) {
                addManualRowBtn.addEventListener('click', this.addManualRow.bind(this));
            }
            
            // Set up input field events for power conversions
            document.addEventListener('input', this.handlePowerInputChange.bind(this));
            
            // Set up clear form handler
            const clearFormBtn = document.getElementById('clear-form');
            if (clearFormBtn) {
                clearFormBtn.addEventListener('click', () => {
                    powerDataForm.reset();
                    document.getElementById('data-rows').innerHTML = '';
                });
            }
            
            // Set up generate rows handler
            const generateRowsBtn = document.getElementById('generate-rows');
            if (generateRowsBtn) {
                generateRowsBtn.addEventListener('click', this.generateRows.bind(this));
            }
            
            // Set up custom rows input visibility
            const numRowsSelect = document.getElementById('num-rows');
            const customNumRows = document.getElementById('custom-num-rows');
            if (numRowsSelect && customNumRows) {
                numRowsSelect.addEventListener('change', (e) => {
                    customNumRows.classList.toggle('hidden', e.target.value !== 'custom');
                });
            }
        } catch (error) {
            console.error('Error setting up form handlers:', error);
            showErrorMessage('Failed to set up form functionality: ' + error.message);
        }
    }
    
    handlePowerInputChange(e) {
        // Check if the changed input is a power-related field
        if (e.target && e.target.classList.contains('power-input')) {
            const row = e.target.closest('tr');
            if (!row) return;
            
            const inputType = e.target.dataset.type;
            const circuit = e.target.dataset.circuit;
            
            // Get the input values from this row
            const kwInput = row.querySelector(`.kw-input[data-circuit="${circuit}"]`);
            const ampsInput = row.querySelector(`.amps-input[data-circuit="${circuit}"]`);
            const voltsInput = row.querySelector(`.volts-input[data-circuit="${circuit}"]`);
            
            if (!kwInput || !ampsInput || !voltsInput) return;
            
            const kw = parseFloat(kwInput.value) || 0;
            const amps = parseFloat(ampsInput.value) || 0;
            const volts = parseFloat(voltsInput.value) || 0;
            
            // Skip the calculation if we don't have enough values
            if (inputType === 'kw' && volts > 0) {
                // Calculate amps from kW and volts
                ampsInput.value = this.dataManager.calculateAmpsFromKWVolts(kw, volts).toFixed(2);
            } else if (inputType === 'amps' && volts > 0) {
                // Calculate kW from amps and volts
                kwInput.value = this.dataManager.calculateKWFromAmpsVolts(amps, volts).toFixed(2);
            } else if (inputType === 'volts') {
                if (amps > 0) {
                    // Calculate kW from amps and volts
                    kwInput.value = this.dataManager.calculateKWFromAmpsVolts(amps, volts).toFixed(2);
                } else if (kw > 0) {
                    // Calculate amps from kW and volts
                    ampsInput.value = this.dataManager.calculateAmpsFromKWVolts(kw, volts).toFixed(2);
                }
            }
            
            // Update total usage percentage
            this.updateUsagePercentage(row);
        }
    }
    
    updateUsagePercentage(row) {
        // Calculate and update the total usage percentage
        const primaryKwInput = row.querySelector('.kw-input[data-circuit="primary"]');
        const redundantKwInput = row.querySelector('.kw-input[data-circuit="redundant"]');
        const usagePercentCell = row.querySelector('.usage-percent');
        
        if (primaryKwInput && redundantKwInput && usagePercentCell) {
            const primaryKw = parseFloat(primaryKwInput.value) || 0;
            const redundantKw = parseFloat(redundantKwInput.value) || 0;
            
            // Calculate percentage based on the higher of the two values
            const maxKw = Math.max(primaryKw, redundantKw);
            // Assuming the circuit capacity is stored elsewhere, you would use that value here
            // For now, we'll use a placeholder value
            const circuitCapacity = 10; // kW
            
            const usagePercent = (maxKw / circuitCapacity) * 100;
            usagePercentCell.textContent = usagePercent.toFixed(1) + '%';
            
            // Apply color coding based on usage
            if (usagePercent > 80) {
                usagePercentCell.className = 'usage-percent high-usage';
            } else if (usagePercent > 60) {
                usagePercentCell.className = 'usage-percent medium-usage';
            } else {
                usagePercentCell.className = 'usage-percent low-usage';
            }
        }
    }
    
    handleFormSubmit(e) {
        e.preventDefault();
        
        try {
            const rows = document.querySelectorAll('#data-rows tr');
            const datacenter = document.getElementById('datacenter-select').value || document.getElementById('new-datacenter').value;
            const supplier = document.getElementById('supplier-select').value || document.getElementById('new-supplier').value;
            
            if (!datacenter) {
                alert('Please select or enter a datacenter');
                return;
            }
            
            if (!supplier) {
                alert('Please select or enter a supplier');
                return;
            }
            
            if (rows.length === 0) {
                alert('Please add at least one row of data');
                return;
            }
            
            // Process each row and create entries
            rows.forEach(row => {
                const date = row.querySelector('.date-input').value;
                const cabinetRack = row.querySelector('.cabinet-input').value;
                const circuit = row.querySelector('.circuit-input').value;
                
                // Primary circuit
                const primaryKW = parseFloat(row.querySelector('.kw-input[data-circuit="primary"]').value) || 0;
                const primaryAmps = parseFloat(row.querySelector('.amps-input[data-circuit="primary"]').value) || 0;
                const primaryVolts = parseFloat(row.querySelector('.volts-input[data-circuit="primary"]').value) || 0;
                
                // Redundant circuit
                const redundantKW = parseFloat(row.querySelector('.kw-input[data-circuit="redundant"]').value) || 0;
                const redundantAmps = parseFloat(row.querySelector('.amps-input[data-circuit="redundant"]').value) || 0;
                const redundantVolts = parseFloat(row.querySelector('.volts-input[data-circuit="redundant"]').value) || 0;
                
                const notes = row.querySelector('.notes-input').value;
                
                // Create the entry object
                const entry = {
                    date,
                    supplier,
                    cabinetRack,
                    circuit,
                    primaryKW,
                    primaryAmps,
                    primaryVolts,
                    redundantKW,
                    redundantAmps,
                    redundantVolts,
                    notes
                };
                
                // Add the entry to the data manager
                this.dataManager.addEntry(datacenter, entry);
            });
            
            // Show success message
            showSuccessMessage('Data saved successfully');
            
            // Clear the form
            e.target.reset();
            document.getElementById('data-rows').innerHTML = '';
            
        } catch (error) {
            console.error('Error submitting form:', error);
            showErrorMessage('Failed to save data: ' + error.message);
        }
    }
    
    addManualRow() {
        try {
            const tbody = document.getElementById('data-rows');
            const row = document.createElement('tr');
            
            // Generate a unique ID for the row
            const rowId = 'row-' + Date.now();
            row.id = rowId;
            
            // Create the row content
            row.innerHTML = `
                <td><input type="date" class="date-input" required></td>
                <td><input type="text" class="cabinet-input" placeholder="Cabinet/Rack"></td>
                <td><input type="text" class="circuit-input" placeholder="Circuit"></td>
                
                <!-- Primary Circuit -->
                <td><input type="number" step="0.01" class="kw-input power-input" data-type="kw" data-circuit="primary" placeholder="kW"></td>
                <td><input type="number" step="0.01" class="amps-input power-input" data-type="amps" data-circuit="primary" placeholder="A"></td>
                <td><input type="number" step="0.01" class="volts-input power-input" data-type="volts" data-circuit="primary" placeholder="V"></td>
                
                <!-- Redundant Circuit -->
                <td><input type="number" step="0.01" class="kw-input power-input" data-type="kw" data-circuit="redundant" placeholder="kW"></td>
                <td><input type="number" step="0.01" class="amps-input power-input" data-type="amps" data-circuit="redundant" placeholder="A"></td>
                <td><input type="number" step="0.01" class="volts-input power-input" data-type="volts" data-circuit="redundant" placeholder="V"></td>
                
                <!-- Usage Percentage -->
                <td class="usage-percent">0%</td>
                
                <!-- Notes -->
                <td><input type="text" class="notes-input" placeholder="Notes"></td>
                
                <!-- Actions -->
                <td>
                    <button type="button" class="delete-row-btn" data-row-id="${rowId}">Delete</button>
                </td>
            `;
            
            // Add the row to the table
            tbody.appendChild(row);
            
            // Setup delete button event listener
            const deleteBtn = row.querySelector('.delete-row-btn');
            deleteBtn.addEventListener('click', () => {
                row.remove();
            });
            
        } catch (error) {
            console.error('Error adding manual row:', error);
            showErrorMessage('Failed to add row: ' + error.message);
        }
    }
    
    generateRows() {
        try {
            const startMonth = document.getElementById('start-month').value;
            const numRowsSelect = document.getElementById('num-rows');
            const customNumRows = document.getElementById('custom-num-rows');
            
            if (!startMonth) {
                alert('Please select a starting month');
                return;
            }
            
            // Determine number of rows to generate
            let numRows;
            if (numRowsSelect.value === 'custom') {
                numRows = parseInt(customNumRows.value) || 1;
            } else {
                numRows = parseInt(numRowsSelect.value) || 1;
            }
            
            // Parse the start date
            const startDate = new Date(startMonth + '-01');
            
            // Clear existing rows
            document.getElementById('data-rows').innerHTML = '';
            
            // Generate rows
            for (let i = 0; i < numRows; i++) {
                // Clone the start date and add i months
                const date = new Date(startDate);
                date.setMonth(date.getMonth() + i);
                
                // Format the date as YYYY-MM-DD
                const formattedDate = date.toISOString().split('T')[0];
                
                // Add a row
                const tbody = document.getElementById('data-rows');
                const row = document.createElement('tr');
                
                // Generate a unique ID for the row
                const rowId = 'row-' + Date.now() + '-' + i;
                row.id = rowId;
                
                // Create the row content
                row.innerHTML = `
                    <td><input type="date" class="date-input" value="${formattedDate}" required></td>
                    <td><input type="text" class="cabinet-input" placeholder="Cabinet/Rack"></td>
                    <td><input type="text" class="circuit-input" placeholder="Circuit"></td>
                    
                    <!-- Primary Circuit -->
                    <td><input type="number" step="0.01" class="kw-input power-input" data-type="kw" data-circuit="primary" placeholder="kW"></td>
                    <td><input type="number" step="0.01" class="amps-input power-input" data-type="amps" data-circuit="primary" placeholder="A"></td>
                    <td><input type="number" step="0.01" class="volts-input power-input" data-type="volts" data-circuit="primary" placeholder="V"></td>
                    
                    <!-- Redundant Circuit -->
                    <td><input type="number" step="0.01" class="kw-input power-input" data-type="kw" data-circuit="redundant" placeholder="kW"></td>
                    <td><input type="number" step="0.01" class="amps-input power-input" data-type="amps" data-circuit="redundant" placeholder="A"></td>
                    <td><input type="number" step="0.01" class="volts-input power-input" data-type="volts" data-circuit="redundant" placeholder="V"></td>
                    
                    <!-- Usage Percentage -->
                    <td class="usage-percent">0%</td>
                    
                    <!-- Notes -->
                    <td><input type="text" class="notes-input" placeholder="Notes"></td>
                    
                    <!-- Actions -->
                    <td>
                        <button type="button" class="delete-row-btn" data-row-id="${rowId}">Delete</button>
                    </td>
                `;
                
                // Add the row to the table
                tbody.appendChild(row);
                
                // Setup delete button event listener
                const deleteBtn = row.querySelector('.delete-row-btn');
                deleteBtn.addEventListener('click', () => {
                    row.remove();
                });
            }
            
        } catch (error) {
            console.error('Error generating rows:', error);
            showErrorMessage('Failed to generate rows: ' + error.message);
        }
    }
    
    populateSelects() {
        try {
            // Populate datacenter select
            this.populateSelect('datacenter-select', this.dataManager.getDatacenterList());
            
            // Populate supplier select
            this.populateSelect('supplier-select', this.dataManager.getSupplierList());
            
            // Populate report datacenter selects
            this.populateSelect('report-datacenter', ['all', ...this.dataManager.getDatacenterList()]);
            this.populateSelect('yearly-report-datacenter', ['all', ...this.dataManager.getDatacenterList()]);
            
            // Populate report year select
            const reportYearSelect = document.getElementById('report-year');
            if (reportYearSelect) {
                const currentYear = new Date().getFullYear();
                reportYearSelect.innerHTML = '';
                
                for (let year = currentYear - 5; year <= currentYear; year++) {
                    const option = document.createElement('option');
                    option.value = year;
                    option.textContent = year;
                    if (year === currentYear) {
                        option.selected = true;
                    }
                    reportYearSelect.appendChild(option);
                }
            }
            
            // Populate export datacenter select
            this.populateSelect('export-datacenter', ['all', ...this.dataManager.getDatacenterList()]);
            
        } catch (error) {
            console.error('Error populating selects:', error);
            showErrorMessage('Failed to populate form fields: ' + error.message);
        }
    }
    
    populateSelect(id, items) {
        try {
            const select = document.getElementById(id);
            if (!select) return;
            
            // Save the current value
            const currentValue = select.value;
            
            // Clear existing options (except the first one which is usually a placeholder)
            const firstOption = select.options[0];
            select.innerHTML = '';
            if (firstOption) {
                select.appendChild(firstOption);
            }
            
            // Add new options
            items.forEach(item => {
                const option = document.createElement('option');
                option.value = item;
                option.textContent = item;
                select.appendChild(option);
            });
            
            // Restore the current value if it still exists
            if (currentValue && [...select.options].some(option => option.value === currentValue)) {
                select.value = currentValue;
            }
        } catch (error) {
            console.error(`Error populating select ${id}:`, error);
            throw error;
        }
    }
}