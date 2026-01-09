import { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { Link, useNavigate } from 'react-router-dom';

function Admin() {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchInvoices();
    }, []);

    const fetchInvoices = async () => {
        try {
            const { data, error } = await supabase
                .from('invoices')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setInvoices(data);
        } catch (error) {
            alert('Error fetching invoices: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/login');
    };

    if (loading) return <div className="container">Loading...</div>;

    return (
        <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1>Admin Dashboard</h1>
                <div>
                    <Link to="/" className="btn-primary" style={{ marginRight: '1rem', textDecoration: 'none' }}>New Invoice</Link>
                    <button onClick={handleLogout} className="btn-secondary">Logout</button>
                </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f5f5f5', textAlign: 'left' }}>
                            <th style={{ padding: '1rem', borderBottom: '1px solid #ddd' }}>Date</th>
                            <th style={{ padding: '1rem', borderBottom: '1px solid #ddd' }}>Invoice #</th>
                            <th style={{ padding: '1rem', borderBottom: '1px solid #ddd' }}>Buyer</th>
                            <th style={{ padding: '1rem', borderBottom: '1px solid #ddd' }}>Amount</th>
                            <th style={{ padding: '1rem', borderBottom: '1px solid #ddd' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {invoices.length === 0 ? (
                            <tr>
                                <td colSpan="5" style={{ padding: '1rem', textAlign: 'center' }}>No invoices found</td>
                            </tr>
                        ) : (
                            invoices.map((invoice) => (
                                <tr key={invoice.id} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '1rem' }}>{invoice.invoice_date}</td>
                                    <td style={{ padding: '1rem' }}>{invoice.invoice_number}</td>
                                    <td style={{ padding: '1rem' }}>{invoice.buyer_name}</td>
                                    <td style={{ padding: '1rem' }}>₹{invoice.total_amount}</td>
                                    <td style={{ padding: '1rem' }}>
                                        <Link
                                            to={`/edit/${invoice.id}`}
                                            style={{
                                                marginRight: '1rem',
                                                color: '#1976d2',
                                                textDecoration: 'none',
                                                fontWeight: 'bold'
                                            }}
                                        >
                                            Edit
                                        </Link>
                                        {/* Add download logic if needed later, for now Edit page has download */}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default Admin;
