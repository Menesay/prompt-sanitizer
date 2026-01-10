import { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { FaTimes } from 'react-icons/fa';

export default function AuthModal({ onClose, onSuccess }) {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const validateEmail = (email) => {
        // Check if email ends with @corp.com
        return email.toLowerCase().endsWith('@corp.com');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validate email domain
        if (!validateEmail(email)) {
            setError('Only @corp.com email addresses are allowed');
            return;
        }

        setLoading(true);

        try {
            if (isLogin) {
                await signInWithEmailAndPassword(auth, email, password);
            } else {
                await createUserWithEmailAndPassword(auth, email, password);
            }
            onSuccess();
        } catch (error) {
            console.error('Auth error:', error);

            // Friendly error messages
            let errorMessage = 'Authentication failed. Please try again.';

            if (error.code === 'auth/email-already-in-use') {
                errorMessage = 'Email already in use. Try logging in instead.';
            } else if (error.code === 'auth/user-not-found') {
                errorMessage = 'No account found with this email. Please register.';
            } else if (error.code === 'auth/wrong-password') {
                errorMessage = 'Incorrect password. Please try again.';
            } else if (error.code === 'auth/weak-password') {
                errorMessage = 'Password should be at least 6 characters.';
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = 'Invalid email format.';
            }

            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-md">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-slate-700">
                        <h2 className="text-2xl font-bold text-cyan-400">
                            {isLogin ? 'Login' : 'Register'}
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-slate-400 hover:text-slate-200 transition-colors"
                        >
                            <FaTimes size={20} />
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Email (@corp.com only)
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                                placeholder="user@corp.com"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Password
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        {error && (
                            <div className="p-3 bg-red-900/30 border border-red-700 rounded-lg text-red-400 text-sm">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-cyan-600 hover:bg-cyan-700 disabled:bg-cyan-800 text-white font-medium rounded-lg transition-all"
                        >
                            {loading ? 'Please wait...' : isLogin ? 'Login' : 'Register'}
                        </button>

                        <div className="text-center">
                            <button
                                type="button"
                                onClick={() => {
                                    setIsLogin(!isLogin);
                                    setError('');
                                }}
                                className="text-cyan-400 hover:text-cyan-300 text-sm transition-colors"
                            >
                                {isLogin ? "Don't have an account? Register" : 'Already have an account? Login'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}
