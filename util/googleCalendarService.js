const { google } = require("googleapis");
const TokenRefreshService = require("./tokenRefreshService");

class GoogleCalendarService {
  constructor(userId) { // Change to accept userId instead of accessToken
    this.userId = userId;
  }
  
  async initializeCalendar() {
    try {
      const accessToken = await TokenRefreshService.getValidAccessToken(this.userId);
      
      const oauth2Client = new google.auth.OAuth2();
      oauth2Client.setCredentials({
        access_token: accessToken,
      });
      
      this.calendar = google.calendar({
        version: "v3",
        auth: oauth2Client,
      });
    } catch (error) {
      console.error('Failed to initialize calendar:', error);
      throw new Error('Calendar authentication failed');
    } 
  }

  async createEvent(appointment, user) {
    await this.initializeCalendar();
    try {
      // Format the date properly
      const appointmentDate = new Date(appointment.date);
      const dateString = appointmentDate.toISOString().split("T")[0]; // Get YYYY-MM-DD format

      const event = {
        summary: `Appointment with ${appointment.doctor.name}`,
        description: appointment.note || "Medical appointment",
        start: {
          dateTime: new Date(
            `${dateString}T${appointment.slotStart}:00`
          ).toISOString(),
          timeZone: "UTC",
        },
        end: {
          dateTime: new Date(
            `${dateString}T${appointment.slotEnd}:00`
          ).toISOString(),
          timeZone: "UTC",
        },
        attendees: [
          { email: appointment.patient.email },
          { email: appointment.doctor.email },
        ],
        reminders: {
          useDefault: false,
          overrides: [
            { method: "email", minutes: 24 * 60 }, // 1 day before
            { method: "popup", minutes: 30 }, // 30 minutes before
          ],
        },
      };

      const response = await this.calendar.events.insert({
        calendarId: "primary",
        resource: event,
        sendUpdates: "all", // Send email notifications to attendees
      });

      return response.data;
    } catch (error) {
      console.error("Google Calendar API Error:", error);
      throw new Error("Failed to create calendar event");
    }
  }

  async updateEvent(eventId, appointment) {
    await this.initializeCalendar();
    try {
      // Format the date properly
      const appointmentDate = new Date(appointment.date);
      const dateString = appointmentDate.toISOString().split("T")[0]; // Get YYYY-MM-DD format

      const event = {
        summary: `Appointment with ${appointment.doctor.name}`,
        description: appointment.note || "Medical appointment",
        start: {
          dateTime: new Date(
            `${dateString}T${appointment.slotStart}:00`
          ).toISOString(),
          timeZone: "UTC",
        },
        end: {
          dateTime: new Date(
            `${dateString}T${appointment.slotEnd}:00`
          ).toISOString(),
          timeZone: "UTC",
        },
        attendees: [
          { email: appointment.patient.email },
          { email: appointment.doctor.email },
        ],
      };

      const response = await this.calendar.events.update({
        calendarId: "primary",
        eventId: eventId,
        resource: event,
        sendUpdates: "all",
      });

      return response.data;
    } catch (error) {
      console.error("Google Calendar API Error:", error);
      throw new Error("Failed to update calendar event");
    }
  }

  async deleteEvent(eventId) {
    await this.initializeCalendar();
    try {
      await this.calendar.events.delete({
        calendarId: "primary",
        eventId: eventId,
        sendUpdates: "all",
      });
    } catch (error) {
      console.error("Google Calendar API Error:", error);
      throw new Error("Failed to delete calendar event");
    }
  }
}

module.exports = GoogleCalendarService;
