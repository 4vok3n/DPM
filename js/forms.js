// Form handling and validation
import { showErrorMessage } from './ui.js';

export class FormManager {
    constructor(dataManager) {
        this.dataManager = dataManager;
        this.lastGeneratedDate = null;
    }

    init() {
        this.setupFormHandlers();
        this.populateSelects();
    }

    setupFormHandlers() {
        try {
            // Setup dropdown linking
            const supplierSelect = document.getElementById('supplier-select');
            const datacenterSelect = document.getElementById('datacenter-select');
            
            if (supplierSelect) {
                supplierSelect.addEventListener('change', () => {
                    const supplier = supplierSelect.value;
                    this.updateDatacenterOptions(supplier);
                });
            }
            
            if (datacenterSelect) {
                datacenterSelect.addEventListener('change', () => {
                    const datacenter = datacenterSelect.value;
                    this.populateCabinetOptions(datacenter);
                });
            }
            
            // Setup row generation
            const numRowsSelect = document.getElementById('num-rows');
            const customNumRows = document.getElementById('custom-num-rows');
            
            if (numRowsSelect && customNumRows) {
                numRowsSelect.addEventListener('change', () => {
                    if (numRowsSelect.value === 'custom') {
                        customNumRows.classList.remove('hidden');
                    } else {
                        customNumRows.classList.add('hidden');
                    }
                });
            }
            
            const generateRowsBtn = document.getElementById('generate-rows');
            if (generateRowsBtn) {
                generateRowsBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.generateInputRows();
                });
            }
            
            // Setup form submission
            const powerDataForm = document.getElementById('power-data-form');
            if (powerDataForm) {
                powerDataForm.addEventListener('submit', (e) => {
                    e.preventDefault();
                    this.saveFormData();
                });
            }
            
            // Clear form button
            const clearFormBtn = document.getElementById('clear-form');
            if (clearFormBtn) {
                clearFormBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.clearForm();
                });
            }

            // Setup manual add row button
            const addManualRowBtn = document.getElementById('add-manual-row');
            if (addManualRowBtn) {
                addManualRowBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.addManualRow();
                });
            }
            
            console.log('Form handlers setup complete');
        } catch (error) {
            console.error('Error setting up form handlers:', error);
            showErrorMessage('Error setting up form: ' + error.message);
        }
    }

    updateDatacenterOptions(supplier) {
        try {
            const datacenterSelect = document.getElementById('datacenter-select');
            if (!datacenterSelect) return;
            
            datacenterSelect.innerHTML = '<option value="">-- Select Existing or Add New --</option>';
            
            const relationshipMap = this.dataManager.getRelationshipMap();
            if (supplier && relationshipMap[supplier] && relationshipMap[supplier].datacenters) {
                const datacenters = Array.from(relationshipMap[supplier].datacenters);
                datacenters.forEach(datacenter => {
                    const option = document.createElement('option');
                    option.value = datacenter;
                    option.textContent = datacenter;
                    datacenterSelect.appendChild(option);
                });
            }
        } catch (error) {
            console.error('Error updating datacenter options:', error);
        }
    }

    populateCabinetOptions(datacenter) {
        // This will be used in the row generation
        this.selectedDatacenter = datacenter;
    }

    generateInputRows() {
        try {
            const startMonthInput = document.getElementById('start-month');
            const numRowsSelect = document.getElementById('num-rows');
            const customNumRows = document.getElementById('custom-num-rows');
            const dataRows = document.getElementById('data-rows');
            const rackCountInput = document.getElementById('rack-count');
            
            if (!startMonthInput || !startMonthInput.value) {
                alert('Please select a starting month');
                return;
            }
            
            let numMonths = parseInt(numRowsSelect.value);
            if (numRowsSelect.value === 'custom') {
                numMonths = parseInt(customNumRows.value) || 1;
            }
            
            // Get rack count for new datacenters
            let rackCount = 1;
            if (rackCountInput) {
                rackCount = parseInt(rackCountInput.value) || 1;
                if (rackCount < 1) rackCount = 1;
            }
            
            // Clear existing rows
            if (dataRows) {
                dataRows.innerHTML = '';
            } else {
                console.error('data-rows element not found');
                return;
            }
            
            // Generate rows
            try {
                const startDate = new Date(startMonthInput.value + '-01');
                this.lastGeneratedDate = startMonthInput.value;
                
                for (let i = 0; i < numMonths; i++) {
                    const currentDate = new Date(startDate);
                    currentDate.setMonth(currentDate.getMonth() + i);
                    
                    const monthYear = `${currentDate.toLocaleString('default', { month: 'short' })}-${currentDate.getFullYear().toString().substr(2)}`;
                    
                    // Generate multiple rows for each month based on rack count
                    for (let j = 0; j < rackCount; j++) {
                        const row = this.createDataRow(monthYear);
                        dataRows.appendChild(row);
                    }
                }
            } catch (dateError) {
                console.error('Error processing date:', dateError);
                alert('Error processing date. Please check the format.');
            }
        } catch (error) {
            console.error('Error generating input rows:', error);
            showErrorMessage('Error generating rows: ' + error.message);
        }
    }

    addManualRow() {
        try {
            const dataRows = document.getElementById('data-rows');
            if (!dataRows) {
                console.error('data-rows element not found');
                return;
            }
            
            // If we have a last generated date, use it, otherwise use the current month/year
            let dateValue = '';
            if (this.lastGeneratedDate) {
                const date = new Date(this.lastGeneratedDate + '-01');
                dateValue = `${date.toLocaleString('default', { month: 'short' })}-${date.getFullYear().toString().substr(2)}`;
            } else {
                const now = new Date();
                dateValue = `${now.toLocaleString('default', { month: 'short' })}-${now.getFullYear().toString().substr(2)}`;
            }
            
            const row = this.createDataRow(dateValue);
            dataRows.appendChild(row);
            
            // Scroll to the new row
            row.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } catch (error) {
            console.error('Error adding manual row:', error);
            showErrorMessage('Error adding row: ' + error.message);
        }
    }

    createDataRow(dateValue) {
        try {
            const row = document.createElement('tr');
            
            // Date cell (read-only)
            const dateCell = document.createElement('td');
            dateCell.textContent = dateValue;
            row.appendChild(dateCell);
            
            // Cabinet/Rack cell
            const cabinetCell = document.createElement('td');
            const cabinetInput = document.createElement('input');
            cabinetInput.setAttribute('list', 'cabinet-options');
            cabinetInput.className = 'cabinet-input';
            cabinetInput.required = true;
            cabinetCell.appendChild(cabinetInput);
            row.appendChild(cabinetCell);
            
            // Create datalist for cabinets if it doesn't exist
            let cabinetDatalist = document.getElementById('cabinet-options');
            if (!cabinetDatalist) {
                cabinetDatalist = document.createElement('datalist');
                cabinetDatalist.id = 'cabinet-options';
                document.body.appendChild(cabinetDatalist);
                
                // Populate with existing cabinets
                this.dataManager.getCabinets().forEach(cabinet => {
                    const option = document.createElement('option');
                    option.value = cabinet;
                    cabinetDatalist.appendChild(option);
                });
            }
            
            // Circuit cell
            const circuitCell = document.createElement('td');
            const circuitInput = document.createElement('input');
            circuitInput.setAttribute('list', 'circuit-options');
            circuitInput.className = 'circuit-input';
            circuitInput.required = true;
            circuitCell.appendChild(circuitInput);
            row.appendChild(circuitCell);
            
            // Create datalist for circuits if it doesn't exist
            let circuitDatalist = document.getElementById('circuit-options');
            if (!circuitDatalist) {
                circuitDatalist = document.createElement('datalist');
                circuitDatalist.id = 'circuit-options';
                document.body.appendChild(circuitDatalist);
                
                // Populate with existing circuits
                this.dataManager.getCircuits().forEach(circuit => {
                    const option = document.createElement('option');
                    option.value = circuit;
                    circuitDatalist.appendChild(option);
                });
            }
            
            // Primary Circuit - Usage (kW)
            const primaryKwCell = document.createElement('td');
            const primaryKwInput = document.createElement('input');
            primaryKwInput.type = 'number';
            primaryKwInput.step = '0.01';
            primaryKwInput.min = '0';
            primaryKwInput.className = 'primary-kw';
            primaryKwInput.required = true;
            primaryKwCell.appendChild(primaryKwInput);
            row.appendChild(primaryKwCell);
            
            // Primary Circuit - Usage (A Avg)
            const primaryACell = document.createElement('td');
            const primaryAInput = document.createElement('input');
            primaryAInput.type = 'number';
            primaryAInput.step = '0.01';
            primaryAInput.min = '0';
            primaryAInput.className = 'primary-a';
            primaryAInput.required = true;
            primaryACell.appendChild(primaryAInput);
            row.appendChild(primaryACell);
            
            // Redundant Circuit - Usage (kW)
            const redundantKwCell = document.createElement('td');
            const redundantKwInput = document.createElement('input');
            redundantKwInput.type = 'number';
            redundantKwInput.step = '0.01';
            redundantKwInput.min = '0';
            redundantKwInput.className = 'redundant-kw';
            redundantKwInput.required = true;
            redundantKwCell.appendChild(redundantKwInput);
            row.appendChild(redundantKwCell);
            
            // Redundant Circuit - Usage (A Avg)
            const redundantACell = document.createElement('td');
            const redundantAInput = document.createElement('input');
            redundantAInput.type = 'number';
            redundantAInput.step = '0.01';
            redundantAInput.min = '0';
            redundantAInput.className = 'redundant-a';
            redundantAInput.required = true;
            redundantACell.appendChild(redundantAInput);
            row.appendChild(redundantACell);
            
            // Total Usage (%)
            const totalUsageCell = document.createElement('td');
            const totalUsageInput = document.createElement('input');
            totalUsageInput.value = 'N/A';
            totalUsageInput.readOnly = true;
            totalUsageInput.className = 'total-usage';
            totalUsageCell.appendChild(totalUsageInput);
            row.appendChild(totalUsageCell);
            
            // Notes
            const notesCell = document.createElement('td');
            const notesInput = document.createElement('input');
            notesInput.value = 'Reading Taken on Average of Month';
            notesInput.className = 'notes';
            notesCell.appendChild(notesInput);
            row.appendChild(notesCell);
            
            // Actions
            const actionsCell = document.createElement('td');
            const removeButton = document.createElement('button');
            removeButton.type = 'button';
            removeButton.textContent = 'Remove';
            removeButton.className = 'remove-row';
            removeButton.addEventListener('click', () => row.remove());
            actionsCell.appendChild(removeButton);
            row.appendChild(actionsCell);
            
            return row;
        } catch (error) {
            console.error('Error creating data row:', error);
            const errorRow = document.createElement('tr');
            errorRow.innerHTML = '<td colspan="10">Error creating row: ' + error.message + '</td>';
            return errorRow;
        }
    }

    saveFormData() {
        try {
            const datacenter = document.getElementById('datacenter-select').value || 
                               document.getElementById('new-datacenter').value;
                               
            const supplier = document.getElementById('supplier-select').value || 
                             document.getElementById('new-supplier').value;
            
            if (!datacenter || !supplier) {
                alert('Please select or enter a datacenter and supplier');
                return;
            }
            
            // Process each row
            const rows = document.querySelectorAll('#data-rows tr');
            
            if (rows.length === 0) {
                alert('Please generate at least one data row');
                return;
            }
            
            rows.forEach(row => {
                try {
                    const date = row.querySelector('td:first-child').textContent;
                    const cabinetRack = row.querySelector('.cabinet-input').value;
                    const circuit = row.querySelector('.circuit-input').value;
                    const primaryKw = parseFloat(row.querySelector('.primary-kw').value);
                    const primaryA = parseFloat(row.querySelector('.primary-a').value);
                    const redundantKw = parseFloat(row.querySelector('.redundant-kw').value);
                    const redundantA = parseFloat(row.querySelector('.redundant-a').value);
                    const notes = row.querySelector('.notes').value;
                    
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
                    
                    // Add entry to data
                    this.dataManager.addEntry(datacenter, entry);
                } catch (rowError) {
                    console.error('Error processing row:', rowError);
                    // Skip invalid rows
                }
            });
            
            // Update selects
            this.populateSelects();
            
            // Show success message
            alert('Data saved successfully!');
            
            // Clear form
            this.clearForm();
        } catch (error) {
            console.error('Error saving form data:', error);
            showErrorMessage('Error saving data: ' + error.message);
        }
    }

    clearForm() {
        try {
            const dataRows = document.getElementById('data-rows');
            if (dataRows) {
                dataRows.innerHTML = '';
            }
            
            const startMonth = document.getElementById('start-month');
            if (startMonth) {
                startMonth.value = '';
            }
            
            const numRows = document.getElementById('num-rows');
            if (numRows) {
                numRows.value = '1';
            }
            
            const customNumRows = document.getElementById('custom-num-rows');
            if (customNumRows) {
                customNumRows.value = '1';
                customNumRows.classList.add('hidden');
            }
            
            const rackCount = document.getElementById('rack-count');
            if (rackCount) {
                rackCount.value = '1';
            }
            
            // Reset last generated date
            this.lastGeneratedDate = null;
        } catch (error) {
            console.error('Error clearing form:', error);
        }
    }

    populateSelects() {
        try {
            // Populate supplier select
            const supplierSelect = document.getElementById('supplier-select');
            if (supplierSelect) {
                supplierSelect.innerHTML = '<option value="">-- Select Existing or Add New --</option>';
                
                this.dataManager.getSuppliers().forEach(supplier => {
                    if (supplier) {
                        const option = document.createElement('option');
                        option.value = supplier;
                        option.textContent = supplier;
                        supplierSelect.appendChild(option);
                    }
                });
            }
            
            // Populate datacenter select
            const datacenterSelect = document.getElementById('datacenter-select');
            if (datacenterSelect) {
                datacenterSelect.innerHTML = '<option value="">-- Select Existing or Add New --</option>';
                
                this.dataManager.getDatacenters().forEach(datacenter => {
                    if (datacenter) {
                        const option = document.createElement('option');
                        option.value = datacenter;
                        option.textContent = datacenter;
                        datacenterSelect.appendChild(option);
                    }
                });
            }
            
            // Populate report datacenter selects
            const reportDatacenterSelects = [
                document.getElementById('report-datacenter'), 
                document.getElementById('yearly-report-datacenter'), 
                document.getElementById('export-datacenter')
            ];
            
            reportDatacenterSelects.forEach(select => {
                if (select) {
                    select.innerHTML = '<option value="all">All Datacenters</option>';
                    
                    this.dataManager.getDatacenters().forEach(datacenter => {
                        if (datacenter) {
                            const option = document.createElement('option');
                            option.value = datacenter;
                            option.textContent = datacenter;
                            select.appendChild(option);
                        }
                    });
                }
            });
            
            // Populate years for yearly report
            const reportYearSelect = document.getElementById('report-year');
            if (reportYearSelect) {
                reportYearSelect.innerHTML = '';
                
                const years = new Set();
                const allData = this.dataManager.getAllData();
                
                for (const datacenter in allData) {
                    if (Array.isArray(allData[datacenter])) {
                        allData[datacenter].forEach(entry => {
                            if (entry && entry.date) {
                                const dateParts = entry.date.split('-');
                                if (dateParts.length === 2) {
                                    const year = '20' + dateParts[1]; // Convert "Jan-24" to "2024"
                                    years.add(year);
                                }
                            }
                        });
                    }
                }
                
                Array.from(years).sort().forEach(year => {
                    const option = document.createElement('option');
                    option.value = year;
                    option.textContent = year;
                    reportYearSelect.appendChild(option);
                });
            }
            console.log('Selects populated successfully');
        } catch (error) {
            console.error('Error populating selects:', error);
        }
    }
}