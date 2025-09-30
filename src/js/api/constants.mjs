// Use Postman, or JavaScript to get your API key
// In Workflow we will learn how to secure this information
export const API_KEY = '13470c70-58c8-42c1-af16-acb89d71b750';

// Base URL for the API
export const API_BASE = 'https://v2.api.noroff.dev';

// Authentication Endpoints
export const API_AUTH = `${API_BASE}/auth`;
export const API_AUTH_LOGIN = `${API_AUTH}/login`;
export const API_AUTH_REGISTER = `${API_AUTH}/register`;

// Auction House Endpoints
export const API_AUCTION = `${API_BASE}/auction`;
export const API_AUCTION_LISTINGS = `${API_AUCTION}/listings`;
export const API_AUCTION_PROFILES = `${API_AUCTION}/profiles`;
