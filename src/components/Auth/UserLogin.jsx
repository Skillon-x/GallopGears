import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LockClosedIcon, UserIcon } from '@heroicons/react/24/solid';

const UserLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const user = await login(email, password);
            if (user.role !== 'user') {
                setError('Invalid user account');
                return;
            }
            navigate('/');
        } catch (err) {
            setError(err.message || 'Failed to login');
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <div className="card max-w-md w-full mx-4">
                <div className="text-center mb-8">
                    <div className="bg-primary-100 w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center">
                        <UserIcon className="h-8 w-8 text-primary-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800">User Login</h2>
                    <p className="text-gray-600 mt-2">Welcome back to GallopMart</p>
                </div>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-gray-700 mb-2">Email</label>
                        <input
                            type="email"
                            className="input-field"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-gray-700 mb-2">Password</label>
                        <input
                            type="password"
                            className="input-field"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="btn-primary w-full flex items-center justify-center">
                        <LockClosedIcon className="h-5 w-5 mr-2" />
                        Login
                    </button>
                </form>
            </div>
        </div>
    );
};

export default UserLogin; 