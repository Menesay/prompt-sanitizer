import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import Navbar from './components/Navbar';
import AuthModal from './components/AuthModal';
import SanitizerWorkspace from './components/SanitizerWorkspace';
import HistoryList from './components/HistoryList';
import FeedbackPage from './components/FeedbackPage';
import PricingPage from './components/PricingPage';
import FAQPage from './components/FAQPage';
import ContactPage from './components/ContactPage';
import ProfilePage from './components/ProfilePage';
import AboutPage from './components/AboutPage';

function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('sanitizer'); // 'sanitizer' or 'history'
    const [showAuthModal, setShowAuthModal] = useState(false);

    // Listen for auth state changes
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleTabChange = (tab) => {
        // If user tries to access History tab without being logged in, show login modal
        if (tab === 'history' && !user) {
            setShowAuthModal(true);
            return;
        }
        setActiveTab(tab);
    };

    const handleAuthSuccess = () => {
        setShowAuthModal(false);
        // If they were trying to access history, switch to it now
        if (activeTab === 'history') {
            setActiveTab('history');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-2xl text-blue-500">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            <Navbar
                user={user}
                activeTab={activeTab}
                onTabChange={handleTabChange}
                onShowAuth={() => setShowAuthModal(true)}
            />

            <main className="container mx-auto px-4 py-8">
                {activeTab === 'sanitizer' && <SanitizerWorkspace user={user} />}
                {activeTab === 'history' && user && <HistoryList user={user} />}
                {activeTab === 'feedback' && <FeedbackPage user={user} />}
                {activeTab === 'pricing' && <PricingPage />}
                {activeTab === 'faq' && <FAQPage />}
                {activeTab === 'contact' && <ContactPage />}
                {activeTab === 'profile' && <ProfilePage user={user} />}
                {activeTab === 'about' && <AboutPage />}
            </main>

            {/* Auth Modal */}
            {showAuthModal && (
                <AuthModal
                    onClose={() => setShowAuthModal(false)}
                    onSuccess={handleAuthSuccess}
                    isLogin={true}
                />
            )}
        </div>
    );
}

export default App;
