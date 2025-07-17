// Data management functionality
import { config } from './config.js';
import { showErrorMessage } from './utils.js';

export class DataManager {
    constructor() {
        this.data = {};
        this.suppliers = new Set();
        this.datacenters = new Set();
        this.cabinets = new Set();
        this.circuits = new Set();
        this.relationshipMap = {};
        this.lastGeneratedDate = null;
    }
    
    loadData() {
        try {
            // Load from localStorage
            const storedData = localStorage.getItem(config.storageKey);
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
            localStorage.setItem(config.storageKey, JSON.stringify(this.data));
            console.log('Data saved to localStorage');
        } catch (error) {
            console.error('Error saving data:', error);
            showErrorMessage('Failed to save data: ' + error.message);
            throw error;
        }
    }

    extractMetadata() {
        try {
            // Clear existing metadata
            this.suppliers.clear();
            this.datacenters.clear();
            this.cabinets.clear();
            this.circuits.clear();
            this.relationshipMap = {};
            
            // Extract metadata from data
            for (const datacenter in this.data) {
                if (Object.hasOwnProperty.call(this.data, datacenter)) {
                    this.datacenters.add(datacenter);
                    
                    const entries = this.data[datacenter];
                    entries.forEach(entry => {
                        if (entry.supplier) {
                            this.suppliers.add(entry.supplier);
                            
                            if (!this.relationshipMap[entry.supplier]) {
                                this.relationshipMap[entry.supplier] = {
                                    datacenters: new Set(),
                                    cabinets: new Set(),
                                    circuits: new Set()
                                };
                            }
                            
                            this.relationshipMap[entry.supplier].datacenters.add(datacenter);
                            if (entry.cabinetRack) {
                                this.relationshipMap[entry.supplier].cabinets.add(entry.cabinetRack);
                            }
                            if (entry.circuit) {
                                this.relationshipMap[entry.supplier].circuits.add(entry.circuit);
                            }
                        }
                    });
                }
            }
        } catch (error) {
            console.error('Error extracting metadata:', error);
            showErrorMessage('Failed to process data: ' + error.message);
        }
    }
    
    // Add methods for data manipulation
    addEntry(datacenter, entry) {
        try {
            if (!datacenter) {
                throw new Error('Datacenter is required');
            }
            
            // Initialize datacenter array if it doesn't exist
            if (!this.data[datacenter]) {
                this.data[datacenter] = [];
            }
            
            // Add the entry to the datacenter
            this.data[datacenter].push(entry);
            
            // Update metadata
            this.datacenters.add(datacenter);
            if (entry.supplier) {
                this.suppliers.add(entry.supplier);
            }
            if (entry.cabinetRack) {
                this.cabinets.add(entry.cabinetRack);
            }
            if (entry.circuit) {
                this.circuits.add(entry.circuit);
            }
            
            // Update relationship map
            if (entry.supplier) {
                if (!this.relationshipMap[entry.supplier]) {
                    this.relationshipMap[entry.supplier] = {
                        datacenters: new Set(),
                        cabinets: new Set(),
                        circuits: new Set()
                    };
                }
                
                this.relationshipMap[entry.supplier].datacenters.add(datacenter);
                if (entry.cabinetRack) {
                    this.relationshipMap[entry.supplier].cabinets.add(entry.cabinetRack);
                }
                if (entry.circuit) {
                    this.relationshipMap[entry.supplier].circuits.add(entry.circuit);
                }
            }
            
            // Save the data
            this.saveData();
            
        } catch (error) {
            console.error('Error adding entry:', error);
            showErrorMessage('Failed to add entry: ' + error.message);
            throw error;
        }
    }
    
    // Power conversion utility methods
    calculateKWFromAmpsVolts(amps, volts) {
        if (!amps || !volts) return null;
        // P(kW) = I(A) × V(V) / 1000
        return (amps * volts) / 1000;
    }
    
    calculateAmpsFromKWVolts(kw, volts) {
        if (!kw || !volts) return null;
        // I(A) = P(kW) × 1000 / V(V)
        return (kw * 1000) / volts;
    }
    
    calculateVoltsFromKWAmps(kw, amps) {
        if (!kw || !amps) return null;
        // V(V) = P(kW) × 1000 / I(A)
        return (kw * 1000) / amps;
    }
    
    getDatacenterList() {
        return Array.from(this.datacenters);
    }
    
    getSupplierList() {
        return Array.from(this.suppliers);
    }
    
    getCabinetList() {
        return Array.from(this.cabinets);
    }
    
    getCircuitList() {
        return Array.from(this.circuits);
    }
    
    getDatacenterData(datacenter) {
        if (datacenter === 'all') {
            // Return all data flattened
            return Object.values(this.data).flat();
        }
        
        return this.data[datacenter] || [];
    }
}