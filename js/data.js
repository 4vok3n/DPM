// Data management and localStorage operations
import { showErrorMessage } from './ui.js';

export class DataManager {
    constructor() {
        this.data = {};
        this.suppliers = new Set();
        this.datacenters = new Set();
        this.cabinets = new Set();
        this.circuits = new Set();
        this.relationshipMap = {};
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

    addEntry(datacenter, entry) {
        try {
            if (!this.data[datacenter]) {
                this.data[datacenter] = [];
            }
            this.data[datacenter].push(entry);
            this.saveData();
            this.extractMetadata();
        } catch (error) {
            console.error('Error adding entry:', error);
            showErrorMessage('Error adding entry: ' + error.message);
        }
    }

    getDataForDatacenter(datacenter) {
        return this.data[datacenter] || [];
    }

    getAllData() {
        return this.data;
    }

    getSuppliers() {
        return Array.from(this.suppliers);
    }

    getDatacenters() {
        return Array.from(this.datacenters);
    }

    getCabinets() {
        return Array.from(this.cabinets);
    }

    getCircuits() {
        return Array.from(this.circuits);
    }

    getRelationshipMap() {
        return this.relationshipMap;
    }
}