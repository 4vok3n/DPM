// Main application code
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

function showErrorMessage(message) {
    const errorContainer = document.getElementById('error-container');
    const errorMessage = document.getElementById('error-message');
    
    if (errorContainer && errorMessage) {
        errorMessage.textContent = message;
        errorContainer.style.display = 'block';
    } else {
        alert('Error: ' + message);
    }
}

class DatacenterPowerApp {
    constructor() {
        this.data = {};
        this.suppliers = new Set();
        this.datacenters = new Set();
        this.cabinets = new Set();
        this.circuits = new Set();
        this.relationshipMap = {};
    }

    init() {
        try {
            this.loadData();
            this.setupNavigation();
            this.setupFormHandlers();
            this.setupReportHandlers();
            this.setupExportImportHandlers();
            this.populateSelects();
            
            // Successfully initialized
            window.appInitialized = true;
        } catch (error) {
            console.error('Error in init:', error);
            showErrorMessage('Error initializing: ' + error.message);
            throw error; // Re-throw to allow the outer try-catch to handle it
        }
    }

    loadData() {
        try {
            // Load from localStorage
            const storedData = localStorage.getItem('datacenterPowerData');
            if (storedData) {
                this.data = JSON.parse(storedData);
                this.extractMetadata();
                console.log('Data loaded from localStorage');
            } else {
                console.log('No data found in localStorage');
            }
        } catch (error) {
            console.error('Error loading data:', error);
            // Initialize with empty data if load fails
            this.data = {};
        }
    }

    saveData() {
        try {
            localStorage.setItem('datacenterPowerData', JSON.stringify(this.data));
            console.log('Data saved to localStorage');
        } catch (error) {
            console.error('Error saving data:', error);
            showErrorMessage('Failed to save data: ' + error.message);
        }
    }

    extractMetadata() {
        try {
            // Extract all unique suppliers, datacenters, cabinets, circuits
            // and build relationship maps
            this.suppliers.clear();
            this.datacenters.clear();
            this.cabinets.clear();
            this.circuits.clear();
            this.relationshipMap = {};

            for (const datacenter in this.data) {
                if (Object.prototype.hasOwnProperty.call(this.data, datacenter)) {
                    this.datacenters.add(datacenter);
                    
                    if (Array.isArray(this.data[datacenter])) {
                        this.data[datacenter].forEach(entry => {
                            if (entry && entry.supplier) this.suppliers.add(entry.supplier);
                            if (entry && entry.cabinetRack) this.cabinets.add(entry.cabinetRack);
                            if (entry && entry.circuit) this.circuits.add(entry.circuit);
                            
                            // Build relationship map
                            if (entry && entry.supplier) {
                                if (!this.relationshipMap[entry.supplier]) {
                                    this.relationshipMap[entry.supplier] = { datacenters: new Set() };
                                }
                                this.relationshipMap[entry.supplier].datacenters.add(datacenter);
                            }
                            
                            if (!this.relationshipMap[datacenter]) {
                                this.relationshipMap[datacenter] = { cabinets: new Set() };
                            }
                            if (entry && entry.cabinetRack) {
                                this.relationshipMap[datacenter].cabinets.add(entry.cabinetRack);
                            }
                            
                            if (entry && entry.cabinetRack) {
                                const cabinetKey = `${datacenter}:${entry.cabinetRack}`;
                                if (!this.relationshipMap[cabinetKey]) {
                                    this.relationshipMap[cabinetKey] = { circuits: new Set() };
                                }
                                if (entry && entry.circuit) {
                                    this.relationshipMap[cabinetKey].circuits.add(entry.circuit);
                                }
                            }
                        });
                    }
                }
            }
            console.log('Metadata extracted successfully');
        } catch (error) {
            console.error('Error extracting metadata:', error);
            // Continue execution with empty metadata
            this.suppliers = new Set();
            this.datacenters = new Set();
            this.cabinets = new Set();
            this.circuits = new Set();
            this.relationshipMap = {};
        }
    }

    setupNavigation() {
        try {
            const navLinks = document.querySelectorAll('nav a');
            const views = document.querySelectorAll('.view');

            navLinks.forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    const viewId = link.getAttribute('data-view');
                    
                    // Update active link
                    navLinks.forEach(l => l.classList.remove('active'));
                    link.classList.add('active');
                    
                    // Show selected view, hide others
                    views.forEach(view => {
                        if (view.id === `${viewId}-view`) {
                            view.classList.add('active');
                        } else {
                            view.classList.remove('active');
                        }
                    });
                });
            });
            console.log('Navigation setup complete');
        } catch (error) {
            console.error('Error setting up navigation:', error);
            showErrorMessage('Error setting up navigation: ' + error.message);
        }
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
            
            if (supplier && this.relationshipMap[supplier] && this.relationshipMap[supplier].datacenters) {
                const datacenters = Array.from(this.relationshipMap[supplier].datacenters);
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
            
            if (!startMonthInput || !startMonthInput.value) {
                alert('Please select a starting month');
                return;
            }
            
            let numMonths = parseInt(numRowsSelect.value);
            if (numRowsSelect.value === 'custom') {
                numMonths = parseInt(customNumRows.value) || 1;
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
                
                for (let i = 0; i < numMonths; i++) {
                    const currentDate = new Date(startDate);
                    currentDate.setMonth(currentDate.getMonth() + i);
                    
                    const monthYear = `${currentDate.toLocaleString('default', { month: 'short' })}-${currentDate.getFullYear().toString().substr(2)}`;
                    
                    const row = this.createDataRow(monthYear);
                    dataRows.appendChild(row);
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
                this.cabinets.forEach(cabinet => {
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
                this.circuits.forEach(circuit => {
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
            
            // If this is a new datacenter, initialize its array
            if (!this.data[datacenter]) {
                this.data[datacenter] = [];
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
                    this.data[datacenter].push(entry);
                } catch (rowError) {
                    console.error('Error processing row:', rowError);
                    // Skip invalid rows
                }
            });
            
            // Save data to localStorage
            this.saveData();
            
            // Update metadata
            this.extractMetadata();
            
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
                
                this.suppliers.forEach(supplier => {
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
                
                this.datacenters.forEach(datacenter => {
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
                    
                    this.datacenters.forEach(datacenter => {
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
                
                for (const datacenter in this.data) {
                    if (Array.isArray(this.data[datacenter])) {
                        this.data[datacenter].forEach(entry => {
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

    setupReportHandlers() {
        try {
            const generateMonthlyBtn = document.getElementById('generate-monthly-report');
            if (generateMonthlyBtn) {
                generateMonthlyBtn.addEventListener('click', () => this.generateMonthlyReport());
            }
            
            const generateYearlyBtn = document.getElementById('generate-yearly-report');
            if (generateYearlyBtn) {
                generateYearlyBtn.addEventListener('click', () => this.generateYearlyReport());
            }
            console.log('Report handlers setup complete');
        } catch (error) {
            console.error('Error setting up report handlers:', error);
        }
    }

    generateMonthlyReport() {
        try {
            const datacenter = document.getElementById('report-datacenter').value;
            const yearMonth = document.getElementById('report-year-month').value;
            
            if (!yearMonth) {
                alert('Please select a month');
                return;
            }
            
            const selectedDate = new Date(yearMonth + '-01');
            const monthAbbr = selectedDate.toLocaleString('default', { month: 'short' });
            const yearShort = selectedDate.getFullYear().toString().substr(2);
            const searchDate = `${monthAbbr}-${yearShort}`;
            
            let reportData = [];
            
            // Filter data by datacenter and date
            if (datacenter === 'all') {
                for (const dc in this.data) {
                    if (Array.isArray(this.data[dc])) {
                        reportData = reportData.concat(
                            this.data[dc]
                                .filter(entry => entry && entry.date === searchDate)
                                .map(entry => ({ ...entry, datacenter: dc }))
                        );
                    }
                }
            } else {
                if (this.data[datacenter] && Array.isArray(this.data[datacenter])) {
                    reportData = this.data[datacenter]
                        .filter(entry => entry && entry.date === searchDate)
                        .map(entry => ({ ...entry, datacenter }));
                }
            }
            
            // If no data found
            if (reportData.length === 0) {
                alert('No data found for the selected month');
                return;
            }
            
            // Calculate kWh values (kW * 24 hours * days in month)
            const daysInMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0).getDate();
            
            reportData = reportData.map(entry => {
                const primaryKwh = entry.primaryKw * 24 * daysInMonth;
                const redundantKwh = entry.redundantKw * 24 * daysInMonth;
                const totalKwh = primaryKwh + redundantKwh;
                
                return {
                    ...entry,
                    primaryKwh: parseFloat(primaryKwh.toFixed(2)),
                    redundantKwh: parseFloat(redundantKwh.toFixed(2)),
                    totalKwh: parseFloat(totalKwh.toFixed(2))
                };
            });
            
            // Display data in table
            const tableBody = document.getElementById('monthly-data');
            if (tableBody) {
                tableBody.innerHTML = '';
                
                reportData.forEach(entry => {
                    const row = document.createElement('tr');
                    
                    row.innerHTML = `
                        <td>${entry.date}</td>
                        <td>${entry.datacenter}</td>
                        <td>${entry.supplier}</td>
                        <td>${entry.cabinetRack}</td>
                        <td>${entry.circuit}</td>
                        <td>${entry.totalKwh}</td>
                        <td>${entry.primaryKwh}</td>
                        <td>${entry.redundantKwh}</td>
                    `;
                    
                    tableBody.appendChild(row);
                });
            }
            
            // Calculate summary
            const totalKwh = reportData.reduce((sum, entry) => sum + entry.totalKwh, 0);
            const avgDailyKwh = totalKwh / daysInMonth;
            
            const summaryDiv = document.getElementById('monthly-summary');
            if (summaryDiv) {
                summaryDiv.innerHTML = `
                    <p><strong>Total Usage:</strong> ${totalKwh.toFixed(2)} kWh</p>
                    <p><strong>Average Daily Usage:</strong> ${avgDailyKwh.toFixed(2)} kWh</p>
                    <p><strong>Number of Circuits:</strong> ${reportData.length}</p>
                `;
            }
            
            // Instead of Chart.js chart, display simple text-based summary
            const chartContainer = document.querySelector('#monthly-view .chart-container');
            if (chartContainer) {
                chartContainer.innerHTML = '<div class="text-report"><h3>Monthly Power Usage Summary</h3>';
                
                // Group by datacenter
                const groupedData = {};
                reportData.forEach(entry => {
                    if (!groupedData[entry.datacenter]) {
                        groupedData[entry.datacenter] = {
                            totalKwh: 0,
                            primaryKwh: 0,
                            redundantKwh: 0
                        };
                    }
                    groupedData[entry.datacenter].totalKwh += entry.totalKwh;
                    groupedData[entry.datacenter].primaryKwh += entry.primaryKwh;
                    groupedData[entry.datacenter].redundantKwh += entry.redundantKwh;
                });
                
                // Create summary table
                let summaryTable = '<table class="summary-table">';
                summaryTable += '<tr><th>Datacenter</th><th>Total kWh</th><th>Primary kWh</th><th>Redundant kWh</th></tr>';
                
                for (const dc in groupedData) {
                    summaryTable += `<tr>
                        <td>${dc}</td>
                        <td>${groupedData[dc].totalKwh.toFixed(2)}</td>
                        <td>${groupedData[dc].primaryKwh.toFixed(2)}</td>
                        <td>${groupedData[dc].redundantKwh.toFixed(2)}</td>
                    </tr>`;
                }
                
                summaryTable += '</table>';
                chartContainer.innerHTML += summaryTable + '</div>';
            }
        } catch (error) {
            console.error('Error generating monthly report:', error);
            showErrorMessage('Error generating monthly report: ' + error.message);
        }
    }

    generateYearlyReport() {
        try {
            const datacenter = document.getElementById('yearly-report-datacenter').value;
            const year = document.getElementById('report-year').value;
            
            if (!year) {
                alert('Please select a year');
                return;
            }
            
            const yearShort = year.substr(2); // Convert "2024" to "24"
            
            let reportData = [];
            
            // Filter data by datacenter and year
            if (datacenter === 'all') {
                for (const dc in this.data) {
                    if (Array.isArray(this.data[dc])) {
                        reportData = reportData.concat(
                            this.data[dc]
                                .filter(entry => entry && entry.date && entry.date.endsWith(`-${yearShort}`))
                                .map(entry => ({ ...entry, datacenter: dc }))
                        );
                    }
                }
            } else {
                if (this.data[datacenter] && Array.isArray(this.data[datacenter])) {
                    reportData = this.data[datacenter]
                        .filter(entry => entry && entry.date && entry.date.endsWith(`-${yearShort}`))
                        .map(entry => ({ ...entry, datacenter }));
                }
            }
            
            // If no data found
            if (reportData.length === 0) {
                alert('No data found for the selected year');
                return;
            }
            
            // Group by month
            const monthlyData = {};
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            
            reportData.forEach(entry => {
                if (entry && entry.date) {
                    const dateParts = entry.date.split('-');
                    if (dateParts.length === 2) {
                        const month = dateParts[0]; // Extract "Jan" from "Jan-24"
                        
                        if (!monthlyData[month]) {
                            monthlyData[month] = {
                                datacenter: entry.datacenter,
                                primaryKw: 0,
                                redundantKw: 0,
                                count: 0
                            };
                        }
                        
                        monthlyData[month].primaryKw += entry.primaryKw;
                        monthlyData[month].redundantKw += entry.redundantKw;
                        monthlyData[month].count++;
                    }
                }
            });
            
            // Calculate average for each month
            const monthlyAverages = [];
            
            months.forEach(month => {
                if (monthlyData[month]) {
                    const data = monthlyData[month];
                    
                    // Calculate average kW
                    const avgPrimaryKw = data.primaryKw / data.count;
                    const avgRedundantKw = data.redundantKw / data.count;
                    
                    // Calculate kWh for the month (kW * 24 hours * days in month)
                    const monthIndex = months.indexOf(month);
                    const daysInMonth = new Date(parseInt(year), monthIndex + 1, 0).getDate();
                    
                    const primaryKwh = avgPrimaryKw * 24 * daysInMonth;
                    const redundantKwh = avgRedundantKw * 24 * daysInMonth;
                    const totalKwh = primaryKwh + redundantKwh;
                    const avgDailyKwh = totalKwh / daysInMonth;
                    
                    monthlyAverages.push({
                        month,
                        datacenter: data.datacenter,
                        primaryKwh: parseFloat(primaryKwh.toFixed(2)),
                        redundantKwh: parseFloat(redundantKwh.toFixed(2)),
                        totalKwh: parseFloat(totalKwh.toFixed(2)),
                        avgDailyKwh: parseFloat(avgDailyKwh.toFixed(2))
                    });
                }
            });
            
            // Sort by month
            monthlyAverages.sort((a, b) => months.indexOf(a.month) - months.indexOf(b.month));
            
            // Display data in table
            const tableBody = document.getElementById('yearly-data');
            if (tableBody) {
                tableBody.innerHTML = '';
                
                monthlyAverages.forEach(entry => {
                    const row = document.createElement('tr');
                    
                    row.innerHTML = `
                        <td>${entry.month} ${year}</td>
                        <td>${entry.datacenter}</td>
                        <td>${entry.totalKwh}</td>
                        <td>${entry.primaryKwh}</td>
                        <td>${entry.redundantKwh}</td>
                        <td>${entry.avgDailyKwh}</td>
                    `;
                    
                    tableBody.appendChild(row);
                });
            }
            
            // Calculate summary
            const totalPrimaryKwh = monthlyAverages.reduce((sum, entry) => sum + entry.primaryKwh, 0);
            const totalRedundantKwh = monthlyAverages.reduce((sum, entry) => sum + entry.redundantKwh, 0);
            const totalKwh = totalPrimaryKwh + totalRedundantKwh;
            const avgMonthlyKwh = totalKwh / monthlyAverages.length;
            const avgDailyKwh = totalKwh / (365 + (this.isLeapYear(parseInt(year)) ? 1 : 0));
            
            const summaryDiv = document.getElementById('yearly-summary');
            if (summaryDiv) {
                summaryDiv.innerHTML = `
                    <p><strong>Total Yearly Usage:</strong> ${totalKwh.toFixed(2)} kWh</p>
                    <p><strong>Average Monthly Usage:</strong> ${avgMonthlyKwh.toFixed(2)} kWh</p>
                    <p><strong>Average Daily Usage:</strong> ${avgDailyKwh.toFixed(2)} kWh</p>
                `;
            }
            
            // Instead of Chart.js chart, display simple text-based summary
            const chartContainer = document.querySelector('#yearly-view .chart-container');
            if (chartContainer) {
                chartContainer.innerHTML = '<div class="text-report"><h3>Monthly Breakdown</h3>';
                
                // Create monthly breakdown table
                let summaryTable = '<table class="summary-table">';
                summaryTable += '<tr><th>Month</th><th>Total kWh</th><th>Primary kWh</th><th>Redundant kWh</th><th>Daily Avg kWh</th></tr>';
                
                monthlyAverages.forEach(entry => {
                    summaryTable += `<tr>
                        <td>${entry.month}</td>
                        <td>${entry.totalKwh.toFixed(2)}</td>
                        <td>${entry.primaryKwh.toFixed(2)}</td>
                        <td>${entry.redundantKwh.toFixed(2)}</td>
                        <td>${entry.avgDailyKwh.toFixed(2)}</td>
                    </tr>`;
                });
                
                summaryTable += '</table>';
                chartContainer.innerHTML += summaryTable + '</div>';
            }
        } catch (error) {
            console.error('Error generating yearly report:', error);
            showErrorMessage('Error generating yearly report: ' + error.message);
        }
    }

    isLeapYear(year) {
        return ((year % 4 === 0) && (year % 100 !== 0)) || (year % 400 === 0);
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
            
            let dataToExport = {};
            
            if (datacenter === 'all') {
                dataToExport = this.data;
            } else {
                dataToExport[datacenter] = this.data[datacenter] || [];
            }
            
            if (format === 'json') {
                // Export as JSON
                const jsonStr = JSON.stringify(dataToExport, null, 2);
                this.downloadFile(jsonStr, 'datacenter_power_data.json', 'application/json');
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
                
                this.downloadFile(csv, 'datacenter_power_data.csv', 'text/csv');
            }
        } catch (error) {
            console.error('Error exporting data:', error);
            showErrorMessage('Error exporting data: ' + error.message);
        }
    }

    downloadFile(content, fileName, contentType) {
        try {
            const a = document.createElement('a');
            const file = new Blob([content], { type: contentType });
            
            a.href = URL.createObjectURL(file);
            a.download = fileName;
            a.click();
            
            URL.revokeObjectURL(a.href);
        } catch (error) {
            console.error('Error downloading file:', error);
            showErrorMessage('Error downloading file: ' + error.message);
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
                        for (const datacenter in importedData) {
                            if (!this.data[datacenter]) {
                                this.data[datacenter] = [];
                            }
                            
                            if (Array.isArray(importedData[datacenter])) {
                                this.data[datacenter] = this.data[datacenter].concat(importedData[datacenter]);
                            }
                        }
                        
                        // Save merged data
                        this.saveData();
                        
                        // Update metadata
                        this.extractMetadata();
                        
                        // Update selects
                        this.populateSelects();
                        
                        if (statusDiv) {
                            statusDiv.innerHTML = 'Data imported successfully!';
                            statusDiv.className = 'success-message';
                        } else {
                            alert('Data imported successfully!');
                        }
                    } else if (file.name.endsWith('.csv')) {
                        // Import CSV
                        const lines = e.target.result.split('\n');
                        
                        // Skip header
                        for (let i = 1; i < lines.length; i++) {
                            if (!lines[i].trim()) continue;
                            
                            // Parse CSV line
                            const values = this.parseCSVLine(lines[i]);
                            
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
                                const notes = values[9].replace(/^"|"$/g, ''); // Remove surrounding quotes
                                
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
                                if (!this.data[datacenter]) {
                                    this.data[datacenter] = [];
                                }
                                
                                this.data[datacenter].push(entry);
                            }
                        }
                        
                        // Save data
                        this.saveData();
                        
                        // Update metadata
                        this.extractMetadata();
                        
                        // Update selects
                        this.populateSelects();
                        
                        if (statusDiv) {
                            statusDiv.innerHTML = 'Data imported successfully!';
                            statusDiv.className = 'success-message';
                        } else {
                            alert('Data imported successfully!');
                        }
                    } else {
                        if (statusDiv) {
                            statusDiv.innerHTML = 'Unsupported file format. Please use .json or .csv files.';
                            statusDiv.className = 'error-message';
                        } else {
                            alert('Unsupported file format. Please use .json or .csv files.');
                        }
                    }
                } catch (error) {
                    console.error('Error processing file:', error);
                    if (statusDiv) {
                        statusDiv.innerHTML = `Error importing data: ${error.message}`;
                        statusDiv.className = 'error-message';
                    } else {
                        alert(`Error importing data: ${error.message}`);
                    }
                }
            };
            
            if (file.name.endsWith('.json') || file.name.endsWith('.csv')) {
                reader.readAsText(file);
            } else {
                if (statusDiv) {
                    statusDiv.innerHTML = 'Unsupported file format. Please use .json or .csv files.';
                    statusDiv.className = 'error-message';
                } else {
                    alert('Unsupported file format. Please use .json or .csv files.');
                }
            }
        } catch (error) {
            console.error('Error importing data:', error);
            showErrorMessage('Error importing data: ' + error.message);
        }
    }

    parseCSVLine(line) {
        try {
            const result = [];
            let current = '';
            let inQuotes = false;
            
            for (let i = 0; i < line.length; i++) {
                const char = line[i];
                
                if (char === '"') {
                    inQuotes = !inQuotes;
                } else if (char === ',' && !inQuotes) {
                    result.push(current);
                    current = '';
                } else {
                    current += char;
                }
            }
            
            result.push(current);
            return result;
        } catch (error) {
            console.error('Error parsing CSV line:', error);
            return [];
        }
    }
}