// Use Postman, or JavaScript to get your API key
// In Workflow we will learn how to secure this information
export const API_KEY = ''; // Replace with your API key

// Base URL for the Auction House API
export const API_BASE = 'https://api.noroff.dev/api/v2';

// Authentication Endpoints
export const API_AUTH = `${API_BASE}/auction/auth`;
export const API_AUTH_LOGIN = `${API_AUTH}/login`;
export const API_AUTH_REGISTER = `${API_AUTH}/register`;

// Auction House Endpoints
export const API_AUCTION = `${API_BASE}/auction`;
export const API_AUCTION_LISTINGS = `${API_AUCTION}/listings`;
export const API_AUCTION_PROFILES = `${API_AUCTION}/profiles`;
