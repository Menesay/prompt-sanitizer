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
        <nav className="bg-black/60 backdrop-blur-sm border-b border-slate-800 sticky top-0 z-50">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    {/* Left: User Email or Person Icon */}
                    <div className="flex items-center gap-2 text-slate-300">
                        {user ? (
                            <button
                                onClick={() => onTabChange('profile')}
                                className="flex items-center gap-2 hover:text-blue-400 transition-colors"
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
                            className={`flex items-center gap-2 text-sm transition-all ${activeTab === 'sanitizer'
                                ? 'text-blue-400 font-medium'
                                : 'text-slate-400 hover:text-slate-200'
                                }`}
                        >
                            <img src="https://raw.githubusercontent.com/Menesay/prompt-sanitizer/refs/heads/main/src/assets/prompt-sanitize-logo-whitebg.png" alt="Logo" className="w-5 h-5 rounded-sm" />
                            prompt sanitizer
                        </button>
                        <button
                            onClick={() => onTabChange('history')}
                            className={`text-sm transition-all ${activeTab === 'history'
                                ? 'text-blue-400 font-medium'
                                : 'text-slate-400 hover:text-slate-200'
                                }`}
                        >
                            history
                        </button>
                        <button
                            onClick={() => onTabChange('feedback')}
                            className={`text-sm transition-all ${activeTab === 'feedback'
                                ? 'text-blue-400 font-medium'
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
                                className="flex items-center gap-2 px-4 py-2 bg-black/60 backdrop-blur-sm border border-blue-500/30 hover:border-blue-500/60 text-white text-sm font-semibold rounded-lg transition-all shadow-lg shadow-blue-500/10"
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
