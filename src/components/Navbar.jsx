import { useState } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { FaShieldAlt, FaChevronDown, FaUser, FaSignOutAlt } from 'react-icons/fa';

export default function Navbar({ user, activeTab, onTabChange, onShowAuth }) {
    const [showResourcesDropdown, setShowResourcesDropdown] = useState(false);

    const handleLogout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    return (
        <nav className="bg-slate-900/80 backdrop-blur border-b border-slate-800 sticky top-0 z-50">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    {/* Left: User Email or Person Icon */}
                    <div className="flex items-center gap-2 text-slate-300">
                        {user ? (
                            <button
                                onClick={() => onTabChange('profile')}
                                className="flex items-center gap-2 hover:text-cyan-400 transition-colors"
                            >
                                <FaUser className="text-slate-400" />
                                <span className="text-sm">{user.email}</span>
                            </button>
                        ) : (
                            <div className="flex items-center gap-2 text-slate-500">
                                <FaUser />
                            </div>
                        )}
                    </div>

                    {/* Center: Navigation Links */}
                    <div className="flex gap-6">
                        <button
                            onClick={() => onTabChange('sanitizer')}
                            className={`text-sm transition-all ${activeTab === 'sanitizer'
                                ? 'text-cyan-400 font-medium'
                                : 'text-slate-400 hover:text-slate-200'
                                }`}
                        >
                            prompt sanitizer
                        </button>
                        <button
                            onClick={() => onTabChange('history')}
                            className={`text-sm transition-all ${activeTab === 'history'
                                ? 'text-cyan-400 font-medium'
                                : 'text-slate-400 hover:text-slate-200'
                                }`}
                        >
                            history
                        </button>
                        <button
                            onClick={() => onTabChange('feedback')}
                            className={`text-sm transition-all ${activeTab === 'feedback'
                                ? 'text-cyan-400 font-medium'
                                : 'text-slate-400 hover:text-slate-200'
                                }`}
                        >
                            feedback
                        </button>
                    </div>

                    {/* Right: Hamburger Menu + Logout */}
                    <div className="flex items-center gap-4">
                        {/* Resources Dropdown (Hamburger Menu) */}
                        <div className="relative">
                            <button
                                onClick={() => setShowResourcesDropdown(!showResourcesDropdown)}
                                className="text-slate-400 hover:text-slate-200 transition-all p-2"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>

                            {showResourcesDropdown && (
                                <>
                                    {/* Backdrop */}
                                    <div
                                        className="fixed inset-0 z-10"
                                        onClick={() => setShowResourcesDropdown(false)}
                                    />
                                    {/* Dropdown Menu */}
                                    <div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-20">
                                        <button
                                            onClick={() => {
                                                onTabChange('pricing'); // Use onTabChange instead of onShowInfoModal
                                                setShowResourcesDropdown(false);
                                            }}
                                            className="w-full px-4 py-2 text-left text-slate-200 hover:bg-slate-700 rounded-t-lg transition-all"
                                        >
                                            Pricing
                                        </button>
                                        <button
                                            onClick={() => {
                                                onTabChange('about');
                                                setShowResourcesDropdown(false);
                                            }}
                                            className="w-full px-4 py-2 text-left text-slate-200 hover:bg-slate-700 transition-all"
                                        >
                                            About
                                        </button>
                                        <button
                                            onClick={() => {
                                                onTabChange('faq');
                                                setShowResourcesDropdown(false);
                                            }}
                                            className="w-full px-4 py-2 text-left text-slate-200 hover:bg-slate-700 transition-all"
                                        >
                                            FAQ
                                        </button>
                                        <button
                                            onClick={() => {
                                                onTabChange('contact');
                                                setShowResourcesDropdown(false);
                                            }}
                                            className="w-full px-4 py-2 text-left text-slate-200 hover:bg-slate-700 rounded-b-lg transition-all"
                                        >
                                            Contact
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Login/Logout Buttons */}
                        {user ? (
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 text-slate-400 hover:text-slate-200 transition-all text-sm"
                            >
                                <FaSignOutAlt />
                                Logout
                            </button>
                        ) : (
                            <button
                                onClick={onShowAuth}
                                className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-semibold rounded-lg transition-all"
                            >
                                <FaUser />
                                Login
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
