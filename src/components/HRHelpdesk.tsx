import { useState, useEffect } from 'react';
import { HelpCircle, Search, MessageSquare, FileText, DollarSign, Calendar, Send, CheckCircle } from 'lucide-react';
import apiService from '../services/api';

interface FAQ {
  id: number;
  question: string;
  answer: string;
  category: 'policy' | 'leave' | 'salary' | 'benefits' | 'general';
  views: number;
}

interface Ticket {
  id: number;
  subject: string;
  category: string;
  status: 'open' | 'in-progress' | 'resolved';
  priority: 'low' | 'medium' | 'high';
  created: string;
}

export default function HRHelpdesk() {
  const [activeTab, setActiveTab] = useState<'faq' | 'chat' | 'tickets'>('faq');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [newTicket, setNewTicket] = useState({ subject: '', category: 'general', description: '' });

  const faqs: FAQ[] = [
    {
      id: 1,
      question: 'How do I apply for annual leave?',
      answer: 'You can apply for annual leave through the HR portal. Go to Leave Management > Apply Leave, select the dates, and submit for approval.',
      category: 'leave',
      views: 245
    },
    {
      id: 2,
      question: 'What is the company policy on remote work?',
      answer: 'Our remote work policy allows up to 3 days per week of remote work with manager approval. Full details are available in the Employee Handbook.',
      category: 'policy',
      views: 189
    },
    {
      id: 3,
      question: 'How can I view my salary slip?',
      answer: 'Salary slips are available in the HR portal under Payroll > Salary Slips. You can download PDFs for the last 12 months.',
      category: 'salary',
      views: 156
    },
    {
      id: 4,
      question: 'What health benefits are available?',
      answer: 'We offer comprehensive health insurance including medical, dental, and vision coverage. Details are in your benefits package document.',
      category: 'benefits',
      views: 134
    }
  ];

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [ticketsLoading, setTicketsLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    // load tickets when tickets tab active
    if (activeTab === 'tickets') {
      loadTickets();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const loadTickets = async () => {
    try {
      setTicketsLoading(true);
      const res = await apiService.getTickets().catch(() => null);
      // API might return { tickets: [...] } or an array
      const arr = Array.isArray(res) ? res : (res && Array.isArray(res.tickets) ? res.tickets : []);
      setTickets(arr as Ticket[]);
    } catch (err) {
      console.error('Error loading tickets', err);
    } finally {
      setTicketsLoading(false);
    }
  };

  const categories = [
    { id: 'all', label: 'All Categories', icon: HelpCircle },
    { id: 'policy', label: 'Policies', icon: FileText },
    { id: 'leave', label: 'Leave Management', icon: Calendar },
    { id: 'salary', label: 'Salary & Payroll', icon: DollarSign },
    { id: 'benefits', label: 'Benefits', icon: CheckCircle },
    { id: 'general', label: 'General', icon: MessageSquare }
  ];

  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const submitTicket = async () => {
    setSubmitError(null);
    if (!newTicket.subject || !newTicket.description) {
      setSubmitError('Please provide subject and description');
      return;
    }

    try {
      setSubmitLoading(true);
      const payload = {
        subject: newTicket.subject,
        category: newTicket.category,
        description: newTicket.description
      };

      const res = await apiService.createTicket(payload);
      // backend may return the created ticket directly or under `ticket`
      const created = res?.ticket ?? res;
      if (created) {
        setTickets((prev) => [created as Ticket, ...prev]);
      }

      setNewTicket({ subject: '', category: 'general', description: '' });
    } catch (err: any) {
      console.error('Submit ticket error', err);
      setSubmitError(err?.message || 'Could not submit ticket');
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">HR Helpdesk</h2>
        <p className="text-gray-600">Get quick answers to HR questions and submit support requests</p>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-2xl p-1 shadow-sm">
        <div className="flex gap-1">
          {[
            { id: 'faq', label: 'FAQs', icon: HelpCircle },
            { id: 'chat', label: 'Live Chat', icon: MessageSquare },
            { id: 'tickets', label: 'My Tickets', icon: FileText }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  activeTab === tab.id
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* FAQ Section */}
      {activeTab === 'faq' && (
        <div className="space-y-6">
          {/* Search and Filter */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search FAQs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Categories Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.slice(1).map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    selectedCategory === category.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Icon size={24} className="mx-auto mb-2 text-gray-600" />
                  <div className="text-sm font-medium text-gray-900">{category.label}</div>
                </button>
              );
            })}
          </div>

          {/* FAQ List */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Frequently Asked Questions ({filteredFAQs.length})
              </h3>
            </div>
            <div className="divide-y divide-gray-200">
              {filteredFAQs.map((faq) => (
                <div key={faq.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="font-medium text-gray-900 flex-1">{faq.question}</h4>
                    <div className="flex items-center gap-2 ml-4">
                      <span className="text-xs text-gray-500">{faq.views} views</span>
                      <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full capitalize">
                        {faq.category}
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Live Chat Section */}
      {activeTab === 'chat' && (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Live Chat Support</h3>
            <p className="text-sm text-gray-600">Chat with HR representatives (Available 9 AM - 6 PM)</p>
          </div>
          
          <div className="h-96 p-6 bg-gray-50">
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <MessageSquare size={48} className="text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">Start a Conversation</h4>
                <p className="text-gray-600 mb-4">Our HR team is ready to help you with any questions</p>
                <button className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all">
                  Start Chat
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tickets Section */}
      {activeTab === 'tickets' && (
        <div className="space-y-6">
          {/* Create New Ticket */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Submit New Ticket</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Subject"
                  value={newTicket.subject}
                  onChange={(e) => setNewTicket(prev => ({ ...prev, subject: e.target.value }))}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <select
                  value={newTicket.category}
                  onChange={(e) => setNewTicket(prev => ({ ...prev, category: e.target.value }))}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="general">General</option>
                  <option value="policy">Policy</option>
                  <option value="leave">Leave</option>
                  <option value="salary">Salary</option>
                  <option value="benefits">Benefits</option>
                </select>
              </div>
              <textarea
                placeholder="Describe your issue in detail..."
                value={newTicket.description}
                onChange={(e) => setNewTicket(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {submitError && (
                <div className="text-sm text-red-600">{submitError}</div>
              )}
              <button
                onClick={submitTicket}
                disabled={submitLoading}
                className={`flex items-center gap-2 px-6 py-2 rounded-lg transition-all ${submitLoading ? 'bg-blue-300 text-white opacity-80 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
              >
                <Send size={16} />
                {submitLoading ? 'Submitting...' : 'Submit Ticket'}
              </button>
            </div>
          </div>

          {/* Existing Tickets */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">My Tickets</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {ticketsLoading ? (
                <div className="p-6 text-center text-gray-500">Loading tickets...</div>
              ) : tickets.length === 0 ? (
                <div className="p-6 text-center text-gray-500">No tickets found.</div>
              ) : (
                tickets.map((ticket) => (
                  <div key={ticket.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 mb-1">{ticket.subject}</h4>
                        <p className="text-sm text-gray-600">Category: {ticket.category}</p>
                        <p className="text-xs text-gray-500 mt-1">Created: {ticket.created}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(ticket.status)}`}>
                          {ticket.status}
                        </span>
                        <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(ticket.priority)}`}>
                          {ticket.priority}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}