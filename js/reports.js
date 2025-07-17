// Report generation (monthly/yearly)
import { showErrorMessage, isLeapYear } from './ui.js';

export class ReportsManager {
    constructor(dataManager) {
        this.dataManager = dataManager;
    }

    init() {
        this.setupReportHandlers();
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
            const allData = this.dataManager.getAllData();
            
            // Filter data by datacenter and date
            if (datacenter === 'all') {
                for (const dc in allData) {
                    if (Array.isArray(allData[dc])) {
                        reportData = reportData.concat(
                            allData[dc]
                                .filter(entry => entry && entry.date === searchDate)
                                .map(entry => ({ ...entry, datacenter: dc }))
                        );
                    }
                }
            } else {
                if (allData[datacenter] && Array.isArray(allData[datacenter])) {
                    reportData = allData[datacenter]
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
            const allData = this.dataManager.getAllData();
            
            // Filter data by datacenter and year
            if (datacenter === 'all') {
                for (const dc in allData) {
                    if (Array.isArray(allData[dc])) {
                        reportData = reportData.concat(
                            allData[dc]
                                .filter(entry => entry && entry.date && entry.date.endsWith(`-${yearShort}`))
                                .map(entry => ({ ...entry, datacenter: dc }))
                        );
                    }
                }
            } else {
                if (allData[datacenter] && Array.isArray(allData[datacenter])) {
                    reportData = allData[datacenter]
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
            const avgDailyKwh = totalKwh / (365 + (isLeapYear(parseInt(year)) ? 1 : 0));
            
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
}