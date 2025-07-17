// Handles data operations, storage, and metadata extraction
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
            }
        } catch (error) {
            console.error('Error extracting metadata:', error);
            showErrorMessage('Failed to process data: ' + error.message);
        }
    }
    
    // Add methods for data manipulation
    addEntry(datacenter, entry) {
        if (!this.data[datacenter]) {
            this.data[datacenter] = [];
        }
        
        this.data[datacenter].push(entry);
        this.extractMetadata(); // Re-extract metadata after adding
        this.saveData();
    }
    
    getDatacenterList() {
        return Array.from(this.datacenters).sort();
    }
    
    getSupplierList() {
        return Array.from(this.suppliers).sort();
    }
    
    getCabinetList() {
        return Array.from(this.cabinets).sort();
    }
    
    getCircuitList() {
        return Array.from(this.circuits).sort();
    }
    
    getDatacenterData(datacenter) {
        return this.data[datacenter] || [];
    }
}