// API and data fetching functionality
import { config } from './config.js';

export async function fetchPowerData() {
  try {
    const response = await fetch(config.apiEndpoint + '/power');
    return await response.json();
  } catch (error) {
    console.error('Error fetching power data:', error);
    throw error;
  }
}

export async function fetchTemperatureData() {
  // Similar implementation
}