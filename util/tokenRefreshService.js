// backend/util/tokenRefreshService.js
const { google } = require('googleapis');
const User = require('../models/userModel');

class TokenRefreshService {
  static async refreshUserTokens(userId) {
    try {
      const user = await User.findById(userId);
      
      if (!user.googleCalendarTokens?.refreshToken) {
        throw new Error('No refresh token available');
      }
      
      // Create OAuth2 client
      const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        `${process.env.BACKEND_URL}/api/v1/auth/google-calendar-callback`
      );
      
      // Set refresh token
      oauth2Client.setCredentials({
        refresh_token: user.googleCalendarTokens.refreshToken,
      });
      
      // Get new access token
      const { credentials } = await oauth2Client.refreshAccessToken();
      
      // Update user tokens
      user.googleCalendarTokens.accessToken = credentials.access_token;
      user.googleCalendarTokens.expiresAt = new Date(Date.now() + 60 * 60 * 1000);
      
      await user.save({ validateBeforeSave: false });
      
      return credentials.access_token;
    } catch (error) {
      console.error('Token refresh failed:', error);
      throw error;
    }
  }
  
  static async getValidAccessToken(userId) {
    const user = await User.findById(userId);
    
    if (!user.googleCalendarTokens?.accessToken) {
      throw new Error('No access token available');
    }
    
    // Check if token is expired (with 5 minute buffer)
    const isExpired = user.googleCalendarTokens.expiresAt < new Date(Date.now() + 5 * 60 * 1000);
    
    if (isExpired) {
      return await this.refreshUserTokens(userId);
    }
    
    return user.googleCalendarTokens.accessToken;
  }
}

module.exports = TokenRefreshService;