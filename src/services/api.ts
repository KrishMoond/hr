const API_BASE_URL = 'http://localhost:5000/api';

class ApiService {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('token');
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'API request failed');
      }

      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Auth methods
  async login(email: string, password: string) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    this.setToken(response.token);
    return response;
  }

  async register(userData: any) {
    const response = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    this.setToken(response.token);
    return response;
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  async getAllUsers() {
    return this.request('/auth/users');
  }

  // Message methods
  async getUsers() {
    return this.request('/messages/users');
  }

  async getConversations() {
    return this.request('/messages/conversations');
  }

  async getMessages(userId, page = 1) {
    return this.request(`/messages/${userId}?page=${page}`);
  }

  async sendMessage(receiver, content) {
    return this.request('/messages', {
      method: 'POST',
      body: JSON.stringify({ receiver, content }),
    });
  }

  async markMessageAsRead(messageId: string) {
    return this.request(`/messages/${messageId}/read`, {
      method: 'PUT',
    });
  }

  async markAllMessagesAsRead(userId: string) {
    return this.request(`/messages/mark-all/${userId}`, {
      method: 'PUT',
    });
  }

  logout() {
    this.token = null;
    localStorage.removeItem('token');
  }

  // Employee methods
  async getEmployees(params?: any) {
    const queryString = params ? `?${new URLSearchParams(params)}` : '';
    return this.request(`/employees${queryString}`);
  }

  async getEmployee(id: string) {
    return this.request(`/employees/${id}`);
  }

  async updateEmployee(id: string, data: any) {
    return this.request(`/employees/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteEmployee(id: string) {
    return this.request(`/employees/${id}`, {
      method: 'DELETE',
    });
  }

  async getEmployeeAnalytics() {
    return this.request('/employees/analytics/overview');
  }

  // Chat methods
  async getChats() {
    return this.request('/chat');
  }

  async createChat(data: any) {
    return this.request('/chat', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getChatMessages(chatId: string, page = 1) {
    return this.request(`/chat/${chatId}/messages?page=${page}`);
  }



  async markMessagesAsRead(chatId: string) {
    return this.request(`/chat/${chatId}/read`, {
      method: 'PUT',
    });
  }

  // Helpdesk methods
  async getTickets(params?: any) {
    const queryString = params ? `?${new URLSearchParams(params)}` : '';
    return this.request(`/helpdesk/tickets${queryString}`);
  }

  async createTicket(data: any) {
    return this.request('/helpdesk/tickets', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getTicket(id: string) {
    return this.request(`/helpdesk/tickets/${id}`);
  }

  async updateTicket(id: string, data: any) {
    return this.request(`/helpdesk/tickets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async addTicketComment(id: string, content: string) {
    return this.request(`/helpdesk/tickets/${id}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  }

  async getFAQ(params?: any) {
    const queryString = params ? `?${new URLSearchParams(params)}` : '';
    return this.request(`/helpdesk/faq${queryString}`);
  }

  // Wellness methods
  async getWellnessPrograms(params?: any) {
    const queryString = params ? `?${new URLSearchParams(params)}` : '';
    return this.request(`/wellness/programs${queryString}`);
  }

  async createWellnessProgram(data: any) {
    return this.request('/wellness/programs', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async joinWellnessProgram(id: string) {
    return this.request(`/wellness/programs/${id}/join`, {
      method: 'POST',
    });
  }

  async updateWellnessProgress(id: string, data: any) {
    return this.request(`/wellness/programs/${id}/progress`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getWellnessGoals() {
    return this.request('/wellness/goals');
  }

  async getWellnessAnalytics() {
    return this.request('/wellness/analytics');
  }

  // AI methods
  async getAIUpskilling() {
    return this.request('/ai/upskilling');
  }

  async getEarlyAlerts() {
    return this.request('/ai/alerts');
  }

  async chatWithChanakya(message: string, category: string) {
    return this.request('/ai/chanakya', {
      method: 'POST',
      body: JSON.stringify({ message, category }),
    });
  }

  async getPerformancePrediction(employeeId: string) {
    return this.request(`/ai/performance-prediction/${employeeId}`);
  }

  // Analytics methods
  async getDashboardAnalytics() {
    return this.request('/analytics/dashboard');
  }

  async getPerformanceAnalytics(period?: string) {
    const queryString = period ? `?period=${period}` : '';
    return this.request(`/analytics/performance${queryString}`);
  }

  async getWorkforceAnalytics() {
    return this.request('/analytics/workforce');
  }

  async getEngagementAnalytics() {
    return this.request('/analytics/engagement');
  }

  async getProductivityAnalytics() {
    return this.request('/analytics/productivity');
  }

  // Settings methods
  async getProfile() {
    return this.request('/settings/profile');
  }

  async updateProfile(data: any) {
    return this.request('/settings/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async updatePassword(data: any) {
    return this.request('/settings/password', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async updateNotificationSettings(data: any) {
    return this.request('/settings/notifications', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async updateAppearanceSettings(data: any) {
    return this.request('/settings/appearance', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getSystemSettings() {
    return this.request('/settings/system');
  }

  async updateSystemSettings(data: any) {
    return this.request('/settings/system', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Leave methods
  async getLeaves(params?: any) {
    const queryString = params ? `?${new URLSearchParams(params)}` : '';
    return this.request(`/leaves${queryString}`);
  }

  async applyLeave(data: any) {
    return this.request('/leaves', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateLeaveStatus(id: string, data: any) {
    return this.request(`/leaves/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getLeaveBalances() {
    return this.request('/leaves/balances');
  }

  // Complaint methods
  async getComplaints(params?: any) {
    const queryString = params ? `?${new URLSearchParams(params)}` : '';
    return this.request(`/complaints${queryString}`);
  }

  async fileComplaint(data: any) {
    return this.request('/complaints', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateComplaint(id: string, data: any) {
    return this.request(`/complaints/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Generic HTTP methods
  async get(endpoint: string, params?: any) {
    const queryString = params ? `?${new URLSearchParams(params)}` : '';
    return this.request(`${endpoint}${queryString}`);
  }

  async post(endpoint: string, data: any) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put(endpoint: string, data: any) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete(endpoint: string) {
    return this.request(endpoint, {
      method: 'DELETE',
    });
  }
}

export const apiService = new ApiService();
export default apiService;