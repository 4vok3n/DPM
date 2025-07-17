# DPM - Datacenter Power Readings Manager

A web application for managing datacenter power consumption data with modular JavaScript architecture.

## Features

- **Data Input**: Enter power readings for datacenters with dynamic row generation
- **Reporting**: Generate monthly and yearly power usage reports
- **Export/Import**: CSV and JSON data export/import functionality
- **Navigation**: Multi-view interface with smooth transitions
- **Data Persistence**: localStorage-based data storage

## Architecture

The application has been refactored into a modular ES6 structure for better maintainability:

### Module Structure

```
js/
├── main.js           # Application entry point and initialization
├── data.js           # Data management and localStorage operations
├── navigation.js     # Navigation handling between views
├── forms.js          # Form handling and validation
├── reports.js        # Report generation (monthly/yearly)
├── exportImport.js   # Export/import functionality
└── ui.js             # UI utilities and helper functions
```

### Key Benefits

- **Modular Design**: Each module has a single responsibility
- **ES6 Modules**: Modern JavaScript import/export syntax
- **Better Organization**: Code is logically separated by functionality
- **Maintainability**: Easier to understand, test, and modify
- **Reusability**: Functions can be imported where needed

## Usage

1. Open `Index.html` in a modern web browser
2. Navigate between views using the top navigation
3. Enter power readings in the Input Data section
4. Generate reports in the Monthly/Yearly Report sections
5. Export/import data in the Export/Import section

## Technical Details

- **Frontend**: HTML5, CSS3, ES6 Modules
- **Storage**: localStorage for data persistence
- **Compatibility**: Modern browsers with ES6 module support
- **No Dependencies**: Pure JavaScript implementation

## Development

The application uses ES6 modules and requires a modern browser or local server for development due to CORS restrictions with file:// protocol.

For local development:
```bash
python3 -m http.server 8080
```

Then visit `http://localhost:8080`