import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../lib/api';

export default function Login() {
    const [form, setForm] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const nav = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const res = await login(form);
            localStorage.setItem('token', res.data.token);
            nav('/spare-parts');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow w-full max-w-sm">
                <h2 className="text-2xl font-bold text-blue-700 mb-6 text-center">SIMS Login</h2>
                {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" required value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input type="password" required value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <button type="submit"
                    className="w-full bg-blue-700 text-white py-2 rounded-lg hover:bg-blue-800 transition font-medium">
                    Sign In
                </button>
            </form>
        </div>
    );
}