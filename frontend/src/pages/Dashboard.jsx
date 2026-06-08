import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';

const Dashboard = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const userRole = localStorage.getItem('userRole') || 'user';
  const userName = localStorage.getItem('userName') || 'User';
  const isAdmin = userRole === 'admin';

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Technical Support');
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const response = await API.get('/tickets');
      setTickets(response.data.data);
    } catch (err) {
      if (err.response?.status === 401) handleLogout();
      setError('Could not retrieve tickets from server.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await API.post('/tickets', { title, description, category });
      setTitle('');
      setDescription('');
      setCategory('Technical Support');
      fetchTickets();
    } catch (err) {
      setError('Failed to create ticket');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (ticketId, newStatus) => {
    try {
      await API.put(`/tickets/${ticketId}`, { status: newStatus });
      fetchTickets();
    } catch (err) {
      setError('Failed to update ticket status.');
    }
  };

  const handleDeleteTicket = async (ticketId) => {
    if (!window.confirm('Are you sure you want to remove this ticket?')) return;
    try {
      await API.delete(`/tickets/${ticketId}`);
      fetchTickets();
    } catch (err) {
      setError('Failed to execute soft-delete.');
    }
  };

  const handleLogout = () => {
    localStorage.clear(); 
    navigate('/login');
    window.location.reload();
  };

  const getStatusClass = (status) => {
    if (status === 'Open') return 'badge open';
    if (status === 'In Progress') return 'badge in-progress';
    return 'badge resolved';
  };

  const metrics = {
    total: tickets.length,
    open: tickets.filter(t => t.status === 'Open').length,
    progress: tickets.filter(t => t.status === 'In Progress').length,
  };

  return (
    <div>
      <div className="header-flex">
        <div>
          <h2 style={{ margin: 0 }}> Support Portal</h2>
          <p style={{ color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
            Welcome back, <strong>{userName}</strong> ({userRole.toUpperCase()})
          </p>
        </div>
        <button className="btn btn-danger" onClick={handleLogout}>Logout</button>
      </div>

      {error && <div style={{ color: 'red', marginBottom: '1rem', fontWeight: '500' }}> {error}</div>}

      <div className="dashboard-grid">
        <div className="card" style={{ position: 'sticky', top: '2rem' }}>
          {isAdmin ? (
            <div>
              <h3 style={{ marginTop: 0 }}>System Performance</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                  <span>Global Workload:</span>
                  <strong>{metrics.total} Cases</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                  <span>Unassigned / Open:</span>
                  <span style={{ color: '#1e40af', fontWeight: 'bold' }}>{metrics.open} Open</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Under Active Review:</span>
                  <span style={{ color: '#854d0e', fontWeight: 'bold' }}>{metrics.progress} Active</span>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <h3 style={{ marginTop: 0 }}>Submit an Issue</h3>
              <form onSubmit={handleCreateTicket}>
                <div className="input-group">
                  <label>Issue Title</label>
                  <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
                </div>
                
                <div className="input-group">
                  <label>Category</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)}>
                    <option value="Bug Report">Bug Report</option>
                    <option value="Feature Request">Feature Request</option>
                    <option value="Billing">Billing</option>
                    <option value="Technical Support">Technical Support</option>
                  </select>
                </div>

                <div className="input-group">
                  <label>Description</label>
                  <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows="4" required />
                </div>

                <button type="submit" className="btn" disabled={submitting}>
                  {submitting ? 'Submitting...' : 'Create Ticket'}
                </button>
              </form>
            </div>
          )}
        </div>

        <div className="card">
          <h3 style={{ marginTop: 0 }}>{isAdmin ? 'Global Operations Feed' : 'My Active Tickets'}</h3>
          {loading ? (
            <p>Loading server data...</p>
          ) : tickets.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>Queue clear. No cases found.</p>
          ) : (
            <div>
              {tickets.map((ticket) => (
                <div key={ticket._id} className="ticket-item">
                  <div className="header-flex" style={{ marginBottom: '0.5rem' }}>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '1.1rem' }}>{ticket.title}</h4>
                      {isAdmin && ticket.createdBy && (
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          Opened by: {ticket.createdBy.name} ({ticket.createdBy.email})
                        </span>
                      )}
                    </div>
                    <span className={getStatusClass(ticket.status)}>{ticket.status}</span>
                  </div>
                  
                  <p style={{ margin: '0 0 1rem 0', color: 'var(--text-muted)', lineHeight: '1.5', fontSize: '0.95rem' }}>
                    {ticket.description}
                  </p>
                  
                  <div className="header-flex" style={{ marginBottom: 0, alignItems: 'center' }}>
                    <span className="badge badge-category">{ticket.category}</span>
                    
                    {isAdmin ? (
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <select 
                          value={ticket.status} 
                          onChange={(e) => handleStatusChange(ticket._id, e.target.value)}
                          style={{ padding: '0.4rem', fontSize: '0.85rem', width: 'auto' }}
                        >
                          <option value="Open">Open</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Resolved">Resolved</option>
                        </select>
                        <button 
                          onClick={() => handleDeleteTicket(ticket._id)}
                          className="btn btn-danger"
                          style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', borderRadius: '6px' }}
                        >
                          Delete
                        </button>
                      </div>
                    ) : (
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        {new Date(ticket.createdAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;