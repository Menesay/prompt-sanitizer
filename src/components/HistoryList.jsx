import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { FaHistory, FaTimes, FaEye, FaRegCopy, FaTrash } from 'react-icons/fa';

export default function HistoryList({ user }) {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedLog, setSelectedLog] = useState(null);
    const [logToDelete, setLogToDelete] = useState(null);

    useEffect(() => {
        fetchLogs();
    }, [user]);

    const fetchLogs = async () => {
        try {
            const logsQuery = query(
                collection(db, 'logs'),
                where('userId', '==', user.uid)
            );

            const snapshot = await getDocs(logsQuery);
            const logsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Sort client-side to avoid missing index issues
            logsData.sort((a, b) => b.timestamp?.seconds - a.timestamp?.seconds);

            setLogs(logsData);
        } catch (error) {
            console.error('Error fetching logs:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (e, logId) => {
        e.stopPropagation();
        setLogToDelete(logId);
    };

    const confirmDelete = async () => {
        if (!logToDelete) return;
        try {
            await deleteDoc(doc(db, 'logs', logToDelete));
            setLogs(prev => prev.filter(log => log.id !== logToDelete));
            setLogToDelete(null);
        } catch (error) {
            console.error('Error deleting log:', error);
        }
    };

    const handleCopy = async (e, text) => {
        e.stopPropagation();
        try {
            await navigator.clipboard.writeText(text);
        } catch (error) {
            console.error('Failed to copy:', error);
        }
    };

    const timeAgo = (timestamp) => {
        if (!timestamp) return 'Just now';

        const seconds = Math.floor((new Date() - timestamp.toDate()) / 1000);

        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + " years ago";

        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + " months ago";

        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + " days ago";

        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + " hours ago";

        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + " minutes ago";

        return Math.floor(seconds) + " seconds ago";
    };

    const formatDate = (timestamp) => {
        if (!timestamp) return 'N/A';
        return timestamp.toDate().toLocaleString();
    };

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <div className="text-blue-500 text-xl">Loading history...</div>
            </div>
        );
    }

    if (logs.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <FaHistory className="text-6xl text-slate-700 mb-4" />
                <h3 className="text-2xl font-semibold text-slate-400 mb-2">No History Yet</h3>
                <p className="text-slate-500">Sanitize some prompts to see them here!</p>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <h2 className="text-2xl font-bold text-slate-100 mb-6">sanitization history</h2>

            <div className="space-y-3">
                {logs.map((log) => (
                    <div
                        key={log.id}
                        className="bg-black/40 backdrop-blur-sm border border-slate-700/50 hover:border-blue-500/30 rounded-lg p-4 transition-all group"
                    >
                        <div className="flex justify-between items-start gap-4">
                            {/* Text Preview */}
                            <div className="flex-grow min-w-0">
                                <p className="text-slate-300 text-sm truncate mb-1">
                                    {log.sanitized || log.original}
                                </p>
                                <p className="text-slate-500 text-xs">
                                    {timeAgo(log.timestamp)}
                                </p>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-3 flex-shrink-0">
                                <button
                                    onClick={() => setSelectedLog(log)}
                                    className="text-slate-500 hover:text-blue-400 transition-colors p-1"
                                    title="View Details"
                                >
                                    <FaEye />
                                </button>
                                <button
                                    onClick={(e) => handleCopy(e, log.sanitized)}
                                    className="text-slate-500 hover:text-emerald-400 transition-colors p-1"
                                    title="Copy Sanitized Text"
                                >
                                    <FaRegCopy />
                                </button>
                                <button
                                    onClick={(e) => handleDelete(e, log.id)}
                                    className="text-slate-500 hover:text-red-400 transition-colors p-1"
                                    title="Delete Log"
                                >
                                    <FaTrash />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Detail Modal */}
            {selectedLog && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                        onClick={() => setSelectedLog(null)}
                    />

                    {/* Modal */}
                    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                        <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                            {/* Header */}
                            <div className="flex items-center justify-between p-6 border-b border-slate-700 bg-slate-900">
                                <h3 className="text-xl font-bold text-blue-400">
                                    {formatDate(selectedLog.timestamp)}
                                </h3>
                                <button
                                    onClick={() => setSelectedLog(null)}
                                    className="text-slate-400 hover:text-slate-200 transition-colors"
                                >
                                    <FaTimes size={24} />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="p-6 overflow-y-auto space-y-6 bg-slate-950/50">
                                {/* Original */}
                                <div>
                                    <h4 className="font-semibold text-red-400 mb-2 flex items-center gap-2">
                                        Original (Unsafe)
                                    </h4>
                                    <div className="bg-slate-900 border border-red-500/30 rounded-lg p-4 text-slate-300 whitespace-pre-wrap break-words font-mono text-sm">
                                        {selectedLog.original}
                                    </div>
                                </div>

                                {/* Sanitized */}
                                <div>
                                    <h4 className="font-semibold text-emerald-400 mb-2 flex items-center gap-2">
                                        Sanitized (Safe)
                                    </h4>
                                    <div className="bg-slate-900 border border-emerald-500/30 rounded-lg p-4 text-slate-300 whitespace-pre-wrap break-words font-mono text-sm">
                                        {selectedLog.sanitized}
                                    </div>
                                </div>

                                {/* Entities */}
                                {selectedLog.entities && selectedLog.entities.length > 0 && (
                                    <div>
                                        <h4 className="font-semibold text-blue-400 mb-2">Detected Entities</h4>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                            {selectedLog.entities.map((entity, idx) => (
                                                <div key={idx} className="bg-slate-900 rounded-lg p-3 text-center border border-slate-800">
                                                    <div className="text-2xl font-bold text-blue-400">{entity.count}</div>
                                                    <div className="text-sm text-slate-400">{entity.type}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Delete Confirmation Modal */}
            {logToDelete && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                        onClick={() => setLogToDelete(null)}
                    />

                    {/* Modal */}
                    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                        <div className="bg-slate-900 border border-slate-700 rounded-lg shadow-2xl w-full max-w-sm overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
                            <div className="p-6 text-center">
                                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-500/10 mb-4">
                                    <FaTrash className="h-6 w-6 text-red-500" />
                                </div>
                                <h3 className="text-lg font-medium text-slate-100 mb-2">Delete Log?</h3>
                                <p className="text-sm text-slate-400 mb-6">
                                    Are you sure you want to delete this log? This action cannot be undone.
                                </p>
                                <div className="flex gap-3 justify-center">
                                    <button
                                        onClick={() => setLogToDelete(null)}
                                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md transition-colors text-sm font-medium"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={confirmDelete}
                                        className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/50 rounded-md transition-colors text-sm font-medium"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
