import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { supabase } from '@/lib/supabase';
import { Mail, Eye, CheckCircle, Clock, Trash2, Reply, Phone, MapPin, X, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  created_at: string;
  status: 'new' | 'read' | 'responded';
  responded_at?: string;
  notes?: string;
}

const ContactMessages = () => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'new' | 'read' | 'responded'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  // Load messages
  const loadMessages = async (isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);
    
    try {
      let query = supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false });

      // Apply status filter
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      
      setMessages(data || []);
      setLastRefresh(new Date());
    } catch (err: any) {
      console.error('Failed to load messages:', err);
      setError('Failed to load messages. Please try again.');
    } finally {
      if (isRefresh) {
        setIsRefreshing(false);
      } else {
        setIsLoading(false);
      }
    }
  };

  const handleRefresh = async () => {
    await loadMessages(true);
  };

  useEffect(() => {
    loadMessages();
  }, [statusFilter]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      loadMessages(true);
    }, 30000);

    return () => clearInterval(interval);
  }, [statusFilter]);

  // Filter messages by search term
  const filteredMessages = messages.filter(message =>
    message.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    message.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    message.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Mark message as read
  const markAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('contact_messages')
        .update({ status: 'read' })
        .eq('id', id);

      if (error) throw error;

      setMessages(prev => prev.map(msg => 
        msg.id === id ? { ...msg, status: 'read' as const } : msg
      ));
    } catch (err: any) {
      console.error('Failed to mark message as read:', err);
    }
  };

  // Mark message as responded
  const markAsResponded = async (id: string) => {
    try {
      const { error } = await supabase
        .from('contact_messages')
        .update({ 
          status: 'responded',
          responded_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      setMessages(prev => prev.map(msg => 
        msg.id === id ? { 
          ...msg, 
          status: 'responded' as const,
          responded_at: new Date().toISOString()
        } : msg
      ));
    } catch (err: any) {
      console.error('Failed to mark message as responded:', err);
    }
  };

  // Delete message
  const deleteMessage = async (id: string) => {
    if (!confirm('Are you sure you want to delete this message? This action cannot be undone.')) {
      return;
    }

    try {
      console.log('Attempting to delete message with ID:', id);
      
      const { data, error } = await supabase
        .from('contact_messages')
        .delete()
        .eq('id', id)
        .select();

      if (error) {
        console.error('Delete error:', error);
        console.error('Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        throw error;
      }

      console.log('Delete successful, removed rows:', data);
      setMessages(prev => prev.filter(msg => msg.id !== id));
    } catch (err: any) {
      console.error('Failed to delete message:', err);
      alert(`Failed to delete message: ${err.message}`);
    }
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          <Clock className="w-3 h-3 mr-1" />
          New
        </span>;
      case 'read':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <Eye className="w-3 h-3 mr-1" />
          Read
        </span>;
      case 'responded':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle className="w-3 h-3 mr-1" />
          Responded
        </span>;
      default:
        return null;
    }
  };

  // Get message count by status
  const getMessageCount = (status: string) => {
    return messages.filter(msg => msg.status === status).length;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Contact Messages</h1>
            <p className="mt-2 text-white/70">Manage and respond to contact form submissions</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="backdrop-blur-sm px-4 py-2 rounded-lg text-sm flex items-center space-x-2 bg-white/10 border border-white/20 text-white/80 hover:bg-white/15 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            <div className="flex space-x-2">
              <span className="text-sm text-white/70">New: {getMessageCount('new')}</span>
              <span className="text-sm text-white/70">Read: {getMessageCount('read')}</span>
              <span className="text-sm text-white/70">Responded: {getMessageCount('responded')}</span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search messages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#4f7df9]/50"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#4f7df9]/50"
          >
            <option value="all">All Messages</option>
            <option value="new">New</option>
            <option value="read">Read</option>
            <option value="responded">Responded</option>
          </select>
        </div>

        {/* Messages List */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg shadow border border-white/20 p-6">
          <div className="mb-4 text-xs text-white/50 text-center">
            Last updated: {format(lastRefresh, 'HH:mm:ss')} | Auto-refresh every 30 seconds
          </div>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#4f7df9]"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 p-4 rounded-xl text-red-600">
              {error}
            </div>
          ) : filteredMessages.length === 0 ? (
            <div className="text-center py-12 text-white/70">
              <Mail className="mx-auto h-12 w-12 text-white/50 mb-3" />
              <p>No messages found.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredMessages.map(message => (
                <div 
                  key={message.id} 
                  className={`bg-white/5 rounded-lg p-4 border transition-all cursor-pointer hover:bg-white/10 ${
                    selectedMessage?.id === message.id ? 'border-[#4f7df9] bg-white/15' : 'border-white/10'
                  }`}
                  onClick={() => {
                    setSelectedMessage(message);
                    if (message.status === 'new') {
                      markAsRead(message.id);
                    }
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-white">{message.name}</h3>
                        {getStatusBadge(message.status)}
                      </div>
                      <p className="text-sm text-white/80 mb-1">{message.email}</p>
                      <p className="text-sm font-medium text-white mb-2">{message.subject}</p>
                      <p className="text-sm text-white/70 line-clamp-2">{message.message}</p>
                      <p className="text-xs text-white/50 mt-2">
                        {format(new Date(message.created_at), 'dd/MM/yyyy HH:mm')}
                      </p>
                    </div>
                    
                    <div className="flex space-x-2 ml-4">
                      {message.status === 'new' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead(message.id);
                          }}
                          className="p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                          title="Mark as read"
                        >
                          <Eye size={16} />
                        </button>
                      )}
                      {message.status !== 'responded' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsResponded(message.id);
                          }}
                          className="p-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                          title="Mark as responded"
                        >
                          <Reply size={16} />
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteMessage(message.id);
                        }}
                        className="p-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                        title="Delete message"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Message Detail Modal */}
        {selectedMessage && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[999999]" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[70vh] overflow-y-auto shadow-2xl mx-auto" style={{ margin: 'auto' }}>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">Message Details</h2>
                  <button
                    onClick={() => setSelectedMessage(null)}
                    className="text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
                    <p className="text-gray-900">{selectedMessage.name}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <p className="text-gray-900">{selectedMessage.email}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                    <p className="text-gray-900">{selectedMessage.subject}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                    <p className="text-gray-900 whitespace-pre-wrap">{selectedMessage.message}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Received</label>
                    <p className="text-gray-900">
                      {format(new Date(selectedMessage.created_at), 'dd/MM/yyyy HH:mm')}
                    </p>
                  </div>
                  
                  {selectedMessage.responded_at && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Responded</label>
                      <p className="text-gray-900">
                        {format(new Date(selectedMessage.responded_at), 'dd/MM/yyyy HH:mm')}
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => setSelectedMessage(null)}
                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                  >
                    Close
                  </button>
                  {selectedMessage.status !== 'responded' && (
                    <button
                      onClick={() => {
                        markAsResponded(selectedMessage.id);
                        setSelectedMessage(null);
                      }}
                      className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                    >
                      Mark as Responded
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default ContactMessages; 