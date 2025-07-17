// Manages UI interactions, form handling, and display updates
import { showErrorMessage } from './utils.js';

export class UIController {
    constructor(dataManager) {
        this.dataManager = dataManager;
    }
    
    setupNavigation() {
        try {
            const navLinks = document.querySelectorAll('.nav-link');
            const contentSections = document.querySelectorAll('.content-section');
            
            navLinks.forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    
                    // Hide all content sections
                    contentSections.forEach(section => {
                        section.style.display = 'none';
                    });
                    
                    // Show the selected section
                    const targetId = link.getAttribute('data-target');
                    const targetSection = document.getElementById(targetId);
                    if (targetSection) {
                        targetSection.style.display = 'block';
                    }
                    
                    // Update active link
                    navLinks.forEach(navLink => {
                        navLink.classList.remove('active');
                    });
                    link.classList.add('active');
                });
            });
            
            // Activate the first tab by default
            if (navLinks.length > 0) {
                navLinks[0].click();
            }
        } catch (error) {
            console.error('Error setting up navigation:', error);
            showErrorMessage('Failed to set up navigation: ' + error.message);
        }
    }
    
    setupFormHandlers() {
        try {
            const addEntryForm = document.getElementById('add-entry-form');
            if (addEntryForm) {
                addEntryForm.addEventListener('submit', this.handleFormSubmit.bind(this));
            }
            
            // Setup other form-related event listeners
        } catch (error) {
            console.error('Error setting up form handlers:', error);
            showErrorMessage('Failed to set up form handlers: ' + error.message);
        }
    }
    
    handleFormSubmit(e) {
        e.preventDefault();
        
        try {
            const formData = new FormData(e.target);
            const datacenter = formData.get('datacenter');
            
            // Create entry object from form data
            const entry = {
                supplier: formData.get('supplier'),
                cabinetRack: formData.get('cabinet'),
                circuit: formData.get('circuit'),
                powerCapacity: parseFloat(formData.get('power-capacity')),
                powerUsage: parseFloat(formData.get('power-usage')),
                date: formData.get('date')
            };
            
            // Add entry to data manager
            this.dataManager.addEntry(datacenter, entry);
            
            // Clear form
            e.target.reset();
            
            // Show success message
            alert('Entry added successfully');
            
        } catch (error) {
            console.error('Error submitting form:', error);
            showErrorMessage('Failed to add entry: ' + error.message);
        }
    }
    
    populateSelects() {
        try {
            // Populate datacenter select
            this.populateSelect('datacenter-select', this.dataManager.getDatacenterList());
            
            // Populate supplier select
            this.populateSelect('supplier-select', this.dataManager.getSupplierList());
            
            // Populate cabinet select
            this.populateSelect('cabinet-select', this.dataManager.getCabinetList());
            
            // Populate circuit select
            this.populateSelect('circuit-select', this.dataManager.getCircuitList());
        } catch (error) {
            console.error('Error populating selects:', error);
            showErrorMessage('Failed to populate form fields: ' + error.message);
        }
    }
    
    populateSelect(selectId, options) {
        const select = document.getElementById(selectId);
        if (!select) return;
        
        // Clear existing options
        select.innerHTML = '';
        
        // Add empty option
        const emptyOption = document.createElement('option');
        emptyOption.value = '';
        emptyOption.textContent = '-- Select --';
        select.appendChild(emptyOption);
        
        // Add options from list
        options.forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option;
            optionElement.textContent = option;
            select.appendChild(optionElement);
        });
    }
}