import { useState, useEffect } from 'react';
import { collection, addDoc, query, orderBy, getDocs, doc, updateDoc, arrayUnion, arrayRemove, deleteDoc, where, getCountFromServer } from 'firebase/firestore';
import { db } from '../firebase';
import { FaTimes, FaThumbsUp, FaThumbsDown, FaTrash, FaComments } from 'react-icons/fa';

export default function FeedbackPage({ user }) {
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showSubmitModal, setShowSubmitModal] = useState(false);
    const [newFeedback, setNewFeedback] = useState('');
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [userFeedbackCount, setUserFeedbackCount] = useState(0);

    useEffect(() => {
        fetchFeedbacks();
        if (user) {
            fetchUserFeedbackCount();
        }
    }, [user]);

    const fetchFeedbacks = async () => {
        try {
            const feedbacksQuery = query(
                collection(db, 'feedbacks'),
                orderBy('timestamp', 'desc')
            );

            const snapshot = await getDocs(feedbacksQuery);
            let feedbacksData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Sort by interaction score (likes - dislikes)
            feedbacksData.sort((a, b) => {
                const scoreA = (a.likes || 0) - (a.dislikes || 0);
                const scoreB = (b.likes || 0) - (b.dislikes || 0);
                return scoreB - scoreA;
            });

            setFeedbacks(feedbacksData);
        } catch (error) {
            console.error('Error fetching feedbacks:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchUserFeedbackCount = async () => {
        try {
            const userFeedbackQuery = query(
                collection(db, 'feedbacks'),
                where('userId', '==', user.uid)
            );
            const snapshot = await getCountFromServer(userFeedbackQuery);
            setUserFeedbackCount(snapshot.data().count);
        } catch (error) {
            console.error('Error fetching user feedback count:', error);
        }
    };

    const handleSubmitFeedback = async () => {
        if (!user) {
            alert('Please login to submit feedback');
            return;
        }

        if (userFeedbackCount >= 5) {
            alert('You have reached the maximum of 5 feedbacks');
            return;
        }

        if (!newFeedback.trim()) {
            return;
        }

        setSubmitting(true);

        try {
            await addDoc(collection(db, 'feedbacks'), {
                userId: user.uid,
                email: isAnonymous ? 'anonymous' : user.email,
                text: newFeedback,
                likes: 0,
                dislikes: 0,
                likedBy: [],
                dislikedBy: [],
                isAnonymous: isAnonymous,
                timestamp: new Date()
            });

            setNewFeedback('');
            setIsAnonymous(false);
            setShowSubmitModal(false);
            setUserFeedbackCount(userFeedbackCount + 1);
            fetchFeedbacks();
        } catch (error) {
            console.error('Error submitting feedback:', error);
            alert('Error submitting feedback');
        } finally {
            setSubmitting(false);
        }
    };

    const handleReaction = async (feedbackId, type, feedback) => {
        if (!user) {
            alert('Please login to react to feedbacks');
            return;
        }

        const likedBy = feedback.likedBy || [];
        const dislikedBy = feedback.dislikedBy || [];
        const hasLiked = likedBy.includes(user.uid);
        const hasDisliked = dislikedBy.includes(user.uid);

        try {
            const feedbackRef = doc(db, 'feedbacks', feedbackId);

            if (type === 'likes') {
                if (hasLiked) {
                    // Remove like
                    await updateDoc(feedbackRef, {
                        likes: Math.max(0, (feedback.likes || 0) - 1),
                        likedBy: arrayRemove(user.uid)
                    });
                } else {
                    // Add like and remove dislike if exists
                    const updates = {
                        likes: (feedback.likes || 0) + 1,
                        likedBy: arrayUnion(user.uid)
                    };
                    if (hasDisliked) {
                        updates.dislikes = Math.max(0, (feedback.dislikes || 0) - 1);
                        updates.dislikedBy = arrayRemove(user.uid);
                    }
                    await updateDoc(feedbackRef, updates);
                }
            } else if (type === 'dislikes') {
                if (hasDisliked) {
                    // Remove dislike
                    await updateDoc(feedbackRef, {
                        dislikes: Math.max(0, (feedback.dislikes || 0) - 1),
                        dislikedBy: arrayRemove(user.uid)
                    });
                } else {
                    // Add dislike and remove like if exists
                    const updates = {
                        dislikes: (feedback.dislikes || 0) + 1,
                        dislikedBy: arrayUnion(user.uid)
                    };
                    if (hasLiked) {
                        updates.likes = Math.max(0, (feedback.likes || 0) - 1);
                        updates.likedBy = arrayRemove(user.uid);
                    }
                    await updateDoc(feedbackRef, updates);
                }
            }

            fetchFeedbacks();
        } catch (error) {
            console.error('Error updating reaction:', error);
        }
    };

    const handleDeleteFeedback = async (feedbackId) => {
        if (!user) {
            alert('Please login to delete feedback');
            return;
        }

        if (!confirm('Are you sure you want to delete this feedback?')) {
            return;
        }

        try {
            await deleteDoc(doc(db, 'feedbacks', feedbackId));
            setUserFeedbackCount(Math.max(0, userFeedbackCount - 1));
            fetchFeedbacks();
        } catch (error) {
            console.error('Error deleting feedback:', error);
            alert('Error deleting feedback');
        }
    };

    const formatDate = (timestamp) => {
        if (!timestamp) return 'N/A';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleString();
    };

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-slate-100">feedback board</h1>
                <button
                    onClick={() => setShowSubmitModal(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-black/60 backdrop-blur-sm border border-blue-500/30 hover:border-blue-500/60 text-white font-semibold rounded-lg transition-all shadow-lg shadow-blue-500/10"
                >
                    <FaComments className="text-lg" />
                    Submit New Feedback
                </button>
            </div>

            {/* Feedbacks List */}
            <div className="space-y-4">
                {loading ? (
                    <div className="text-center py-12 text-slate-400">Loading feedbacks...</div>
                ) : feedbacks.length === 0 ? (
                    <div className="text-center py-12 text-slate-500">No feedbacks yet. Be the first!</div>
                ) : (
                    feedbacks.map((feedback) => {
                        const likedBy = feedback.likedBy || [];
                        const dislikedBy = feedback.dislikedBy || [];
                        const hasLiked = user && likedBy.includes(user.uid);
                        const hasDisliked = user && dislikedBy.includes(user.uid);
                        const isOwner = user && feedback.userId === user.uid;

                        return (
                            <div
                                key={feedback.id}
                                className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 space-y-4"
                            >
                                {/* Header */}
                                <div className="flex items-center justify-between">
                                    <span className="text-blue-400 font-medium">{feedback.email}</span>
                                    <span className="text-slate-500 text-sm">{formatDate(feedback.timestamp)}</span>
                                </div>

                                {/* Feedback Text */}
                                <p className="text-slate-300">{feedback.text}</p>

                                {/* Footer with reactions */}
                                <div className="flex items-center justify-between pt-2">
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => handleReaction(feedback.id, 'likes', feedback)}
                                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${hasLiked
                                                ? 'bg-blue-900/50 border border-blue-500 text-blue-400'
                                                : 'bg-slate-900 border border-slate-700 text-slate-400 hover:border-blue-500'
                                                }`}
                                        >
                                            <FaThumbsUp />
                                            <span>{feedback.likes || 0}</span>
                                        </button>
                                        <button
                                            onClick={() => handleReaction(feedback.id, 'dislikes', feedback)}
                                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${hasDisliked
                                                ? 'bg-red-900/50 border border-red-500 text-red-400'
                                                : 'bg-slate-900 border border-slate-700 text-slate-400 hover:border-red-500'
                                                }`}
                                        >
                                            <FaThumbsDown />
                                            <span>{feedback.dislikes || 0}</span>
                                        </button>
                                    </div>

                                    {/* Delete button for owner */}
                                    {isOwner && (
                                        <button
                                            onClick={() => handleDeleteFeedback(feedback.id)}
                                            className="text-slate-500 hover:text-red-400 transition-all"
                                        >
                                            <FaTrash />
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Submit Feedback Modal */}
            {showSubmitModal && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                        onClick={() => setShowSubmitModal(false)}
                    />

                    {/* Modal */}
                    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                        <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-2xl">
                            {/* Header */}
                            <div className="flex items-center justify-between p-6 border-b border-slate-700">
                                <h2 className="text-2xl font-bold text-blue-400">Submit Feedback</h2>
                                <button
                                    onClick={() => setShowSubmitModal(false)}
                                    className="text-slate-400 hover:text-slate-200 transition-colors"
                                >
                                    <FaTimes size={24} />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="p-6 space-y-4">
                                {user ? (
                                    <>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-slate-400">
                                                {userFeedbackCount}/5 submitted
                                            </span>
                                        </div>
                                        <textarea
                                            value={newFeedback}
                                            onChange={(e) => setNewFeedback(e.target.value)}
                                            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-blue-500 resize-none"
                                            rows="5"
                                            placeholder="Share your thoughts..."
                                            disabled={userFeedbackCount >= 5}
                                        />

                                        {/* Anonymous checkbox */}
                                        <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={isAnonymous}
                                                onChange={(e) => setIsAnonymous(e.target.checked)}
                                                className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-blue-600 focus:ring-blue-500"
                                            />
                                            <span>Submit anonymously</span>
                                        </label>

                                        <button
                                            onClick={handleSubmitFeedback}
                                            disabled={!newFeedback.trim() || submitting || userFeedbackCount >= 5}
                                            className="w-full px-4 py-3 bg-black/60 backdrop-blur-sm border border-blue-500/30 hover:border-blue-500/60 disabled:bg-slate-900/50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all shadow-lg shadow-blue-500/10"
                                        >
                                            {submitting ? 'Submitting...' : 'Submit Feedback'}
                                        </button>
                                    </>
                                ) : (
                                    <div className="text-center py-8 text-slate-400">
                                        Please login to submit feedback
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
