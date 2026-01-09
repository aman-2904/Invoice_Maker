import { useState } from 'react';
import { supabase } from '../supabase';
import { useNavigate } from 'react-router-dom';

function Login() {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const [isSignUp, setIsSignUp] = useState(false);

    const handleAuth = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (isSignUp) {
                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                });
                if (error) throw error;

                // If email confirmation is disabled, we get a session immediately
                if (data.session) {
                    alert('Account created successfully!');
                    navigate('/admin');
                } else {
                    alert('Check your email for the confirmation link!');
                }
            } else {
                const { data, error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
                navigate('/admin');
            }
        } catch (error) {
            console.error('Auth error:', error);
            alert(error.error_description || error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container">
            <h2>{isSignUp ? 'Create Admin Account' : 'Admin Login'}</h2>
            <form onSubmit={handleAuth} style={{ maxWidth: '400px', margin: '2rem auto' }}>
                <div style={{ marginBottom: '1rem' }}>
                    <label>Email:</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        style={{ width: '100%', padding: '0.5rem' }}
                    />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                    <label>Password:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={{ width: '100%', padding: '0.5rem' }}
                    />
                </div>
                <button type="submit" disabled={loading} style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem' }}>
                    {loading ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Login')}
                </button>

                <div style={{ textAlign: 'center' }}>
                    <button
                        type="button"
                        onClick={() => setIsSignUp(!isSignUp)}
                        style={{ background: 'none', border: 'none', color: '#007bff', cursor: 'pointer', textDecoration: 'underline' }}
                    >
                        {isSignUp ? 'Already have an account? Login' : 'Need an admin account? Sign Up'}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default Login;
