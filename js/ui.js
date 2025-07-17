// UI utilities and helper functions
export function showErrorMessage(message) {
    const errorContainer = document.getElementById('error-container');
    const errorMessage = document.getElementById('error-message');
    
    if (errorContainer && errorMessage) {
        errorMessage.textContent = message;
        errorContainer.style.display = 'block';
    } else {
        alert('Error: ' + message);
    }
}

export function hideErrorMessage() {
    const errorContainer = document.getElementById('error-container');
    if (errorContainer) {
        errorContainer.style.display = 'none';
    }
}

export function downloadFile(content, fileName, contentType) {
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

export function isLeapYear(year) {
    return ((year % 4 === 0) && (year % 100 !== 0)) || (year % 400 === 0);
}