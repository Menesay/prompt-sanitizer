import { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { FaExclamationTriangle, FaCheckCircle, FaCog } from 'react-icons/fa';
import { HiLightningBolt } from 'react-icons/hi';

export default function SanitizerWorkspace({ user }) {
    const [unsafeText, setUnsafeText] = useState('');
    const [sanitizedText, setSanitizedText] = useState('');
    const [detectedEntities, setDetectedEntities] = useState([]);
    const [showToast, setShowToast] = useState(false);
    const [processing, setProcessing] = useState(false);

    // Sanitization Settings State
    const [settings, setSettings] = useState({
        privateKeys: true,
        slackTokens: true,
        stripeKeys: true,
        googleKeys: true,
        awsKeys: true,
        emails: true,
        iban: true,
        ips: true,
        creditCards: true
    });

    const toggleSetting = (key) => {
        setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const luhnCheck = (str) => {
        const sanitized = str.replace(/[\s-]/g, '');
        if (!/^\d+$/.test(sanitized)) return false;

        let sum = 0;
        let shouldDouble = false;

        for (let i = sanitized.length - 1; i >= 0; i--) {
            let digit = parseInt(sanitized.charAt(i));

            if (shouldDouble) {
                if ((digit *= 2) > 9) digit -= 9;
            }

            sum += digit;
            shouldDouble = !shouldDouble;
        }
        return (sum % 10) === 0;
    };

    const sanitizeText = async () => {
        if (!unsafeText.trim()) {
            return;
        }

        setProcessing(true);
        let sanitized = unsafeText;
        const entities = [];

        // PII Detection Patterns
        const patterns = [
            {
                key: 'emails',
                regex: /[\w.-]+@[\w.-]+\.\w+/g,
                replacement: '[EMAIL_REDACTED]',
                type: 'Email'
            },
            {
                key: 'creditCards',
                regex: /\b(?:\d{16}|\d{4}-\d{4}-\d{4}-\d{4}|\d{4}\s\d{4}\s\d{4}\s\d{4})\b/g,
                replacement: '[CARD_REDACTED]',
                type: 'Credit Card',
                validate: luhnCheck
            },
            {
                key: 'awsKeys',
                regex: /(AKIA|ASIA)[A-Z0-9]{16}/g,
                replacement: '[AWS_KEY_REDACTED]',
                type: 'AWS API Key'
            },
            {
                key: 'privateKeys',
                regex: /-{5}BEGIN PRIVATE KEY-{5}[\s\S]*?-{5}END PRIVATE KEY-{5}/g,
                replacement: '[PRIVATE_KEY_REDACTED]',
                type: 'Private Key'
            },
            {
                key: 'slackTokens',
                regex: /xox[baprs]-[a-zA-Z0-9-]{10,}/g,
                replacement: '[SLACK_TOKEN_REDACTED]',
                type: 'Slack Token'
            },
            {
                key: 'stripeKeys',
                regex: /(sk|pk|rk)_(test|live)_[a-zA-Z0-9]{24,}/g,
                replacement: '[STRIPE_KEY_REDACTED]',
                type: 'Stripe API Key'
            },
            {
                key: 'googleKeys',
                regex: /AIza[0-9A-Za-z-_]{35}/g,
                replacement: '[GOOGLE_KEY_REDACTED]',
                type: 'Google Cloud API Key'
            },
            {
                key: 'ips',
                regex: /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g,
                replacement: '[IP_REDACTED]',
                type: 'IPv4 Address'
            },
            {
                key: 'iban',
                regex: /[A-Z]{2}\d{2}[A-Z0-9]{11,30}/g,
                replacement: '[IBAN_REDACTED]',
                type: 'IBAN'
            }
        ];

        // Apply enabled patterns and track detected entities
        patterns.forEach(({ key, regex, replacement, type, validate }) => {
            if (settings[key]) {
                let count = 0;
                sanitized = sanitized.replace(regex, (match) => {
                    if (validate && !validate(match)) {
                        return match;
                    }
                    count++;
                    return replacement;
                });

                if (count > 0) {
                    entities.push({ type, count });
                }
            }
        });

        setSanitizedText(sanitized);
        setDetectedEntities(entities);

        // Save to Firestore if user is authenticated
        if (user) {
            try {
                await addDoc(collection(db, 'logs'), {
                    userId: user.uid,
                    email: user.email,
                    original: unsafeText,
                    sanitized: sanitized,
                    entities: entities,
                    timestamp: serverTimestamp()
                });
            } catch (error) {
                console.error('Error saving to Firestore:', error);
            }
        } else {
            // Show toast for guest users
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
        }

        setProcessing(false);
    };

    const handlePaste = async () => {
        try {
            const text = await navigator.clipboard.readText();
            setUnsafeText(text);
        } catch (error) {
            console.error('Failed to read clipboard:', error);
        }
    };

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(sanitizedText);
            // Optional: Show a brief success indicator
        } catch (error) {
            console.error('Failed to copy to clipboard:', error);
        }
    };

    return (
        <div className="space-y-6">
            {/* Centered Title */}
            <div className="text-center">
                <h1 className="text-4xl font-bold text-slate-100 mb-8">prompt sanitizer</h1>
            </div>

            {/* Disclaimer Banner */}
            <div className="bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded-lg">
                <div className="flex items-start gap-3">
                    <FaExclamationTriangle className="text-yellow-500 text-xl mt-1 flex-shrink-0" />
                    <div>
                        <h3 className="font-bold text-yellow-400 mb-1">Demonstration Environment</h3>
                        <p className="text-yellow-200/90 text-sm">
                            This is a demo application. For your security, please DO NOT enter real, sensitive, or production data. In a real-world scenario, this tool should be deployed on a secure, internal network.
                        </p>
                    </div>
                </div>
            </div>

            {/* Action Buttons Row */}
            <div className="flex justify-center gap-4">
                <button
                    onClick={handlePaste}
                    className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-all"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    PASTE
                </button>
                <button
                    onClick={sanitizeText}
                    disabled={!unsafeText.trim() || processing}
                    className="flex items-center gap-3 px-8 py-3 bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-semibold rounded-lg shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all"
                >
                    <HiLightningBolt className="text-xl" />
                    {processing ? 'SANITIZING...' : 'SANITIZE'}
                </button>
                <button
                    onClick={handleCopy}
                    disabled={!sanitizedText}
                    className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    COPY
                </button>
            </div>

            {/* Main Workspace */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                {/* Left: Unsafe Input */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2 text-red-400">
                        <FaExclamationTriangle />
                        <h3 className="font-semibold">Unsafe Input</h3>
                    </div>
                    <textarea
                        value={unsafeText}
                        onChange={(e) => setUnsafeText(e.target.value)}
                        className="w-full h-96 px-4 py-3 bg-slate-900 border-2 border-red-500/50 rounded-lg text-slate-200 focus:outline-none focus:border-red-500 resize-none"
                        placeholder="Paste sensitive prompt here..."
                    />
                </div>

                {/* Right: Sanitized Output */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2 text-emerald-400">
                        <FaCheckCircle />
                        <h3 className="font-semibold">Sanitized Output</h3>
                    </div>
                    <textarea
                        value={sanitizedText}
                        readOnly
                        className="w-full h-96 px-4 py-3 bg-slate-900 border-2 border-emerald-500/50 rounded-lg text-slate-200 resize-none"
                        placeholder="Sanitized output will appear here..."
                    />
                </div>
            </div>

            {/* Sanitization Settings */}
            <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-2">
                    <FaCog className="text-slate-400" />
                    <h3 className="text-lg font-semibold text-slate-200">Sanitization Settings</h3>
                </div>
                <p className="text-slate-500 text-sm mb-6">
                    Choose which types of sensitive information to detect and redact.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <label className="flex items-center gap-3 cursor-pointer group">
                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${settings.privateKeys ? 'bg-cyan-600 border-cyan-600' : 'border-slate-600 bg-slate-800'}`}>
                            {settings.privateKeys && <FaCheckCircle className="text-white text-xs" />}
                        </div>
                        <input type="checkbox" className="hidden" checked={settings.privateKeys} onChange={() => toggleSetting('privateKeys')} />
                        <span className="text-slate-300 group-hover:text-cyan-400 transition-colors">Private Keys</span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer group">
                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${settings.slackTokens ? 'bg-cyan-600 border-cyan-600' : 'border-slate-600 bg-slate-800'}`}>
                            {settings.slackTokens && <FaCheckCircle className="text-white text-xs" />}
                        </div>
                        <input type="checkbox" className="hidden" checked={settings.slackTokens} onChange={() => toggleSetting('slackTokens')} />
                        <span className="text-slate-300 group-hover:text-cyan-400 transition-colors">Slack Tokens</span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer group">
                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${settings.stripeKeys ? 'bg-cyan-600 border-cyan-600' : 'border-slate-600 bg-slate-800'}`}>
                            {settings.stripeKeys && <FaCheckCircle className="text-white text-xs" />}
                        </div>
                        <input type="checkbox" className="hidden" checked={settings.stripeKeys} onChange={() => toggleSetting('stripeKeys')} />
                        <span className="text-slate-300 group-hover:text-cyan-400 transition-colors">Stripe API Keys</span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer group">
                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${settings.googleKeys ? 'bg-cyan-600 border-cyan-600' : 'border-slate-600 bg-slate-800'}`}>
                            {settings.googleKeys && <FaCheckCircle className="text-white text-xs" />}
                        </div>
                        <input type="checkbox" className="hidden" checked={settings.googleKeys} onChange={() => toggleSetting('googleKeys')} />
                        <span className="text-slate-300 group-hover:text-cyan-400 transition-colors">Google Cloud API Keys</span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer group">
                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${settings.awsKeys ? 'bg-cyan-600 border-cyan-600' : 'border-slate-600 bg-slate-800'}`}>
                            {settings.awsKeys && <FaCheckCircle className="text-white text-xs" />}
                        </div>
                        <input type="checkbox" className="hidden" checked={settings.awsKeys} onChange={() => toggleSetting('awsKeys')} />
                        <span className="text-slate-300 group-hover:text-cyan-400 transition-colors">AWS API Keys</span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer group">
                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${settings.emails ? 'bg-cyan-600 border-cyan-600' : 'border-slate-600 bg-slate-800'}`}>
                            {settings.emails && <FaCheckCircle className="text-white text-xs" />}
                        </div>
                        <input type="checkbox" className="hidden" checked={settings.emails} onChange={() => toggleSetting('emails')} />
                        <span className="text-slate-300 group-hover:text-cyan-400 transition-colors">Email Addresses</span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer group">
                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${settings.iban ? 'bg-cyan-600 border-cyan-600' : 'border-slate-600 bg-slate-800'}`}>
                            {settings.iban && <FaCheckCircle className="text-white text-xs" />}
                        </div>
                        <input type="checkbox" className="hidden" checked={settings.iban} onChange={() => toggleSetting('iban')} />
                        <span className="text-slate-300 group-hover:text-cyan-400 transition-colors">IBAN</span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer group">
                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${settings.ips ? 'bg-cyan-600 border-cyan-600' : 'border-slate-600 bg-slate-800'}`}>
                            {settings.ips && <FaCheckCircle className="text-white text-xs" />}
                        </div>
                        <input type="checkbox" className="hidden" checked={settings.ips} onChange={() => toggleSetting('ips')} />
                        <span className="text-slate-300 group-hover:text-cyan-400 transition-colors">IPv4 Addresses</span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer group">
                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${settings.creditCards ? 'bg-cyan-600 border-cyan-600' : 'border-slate-600 bg-slate-800'}`}>
                            {settings.creditCards && <FaCheckCircle className="text-white text-xs" />}
                        </div>
                        <input type="checkbox" className="hidden" checked={settings.creditCards} onChange={() => toggleSetting('creditCards')} />
                        <span className="text-slate-300 group-hover:text-cyan-400 transition-colors">Credit Card Numbers</span>
                    </label>
                </div>
            </div>

            {/* Detection Summary */}
            {detectedEntities.length > 0 && (
                <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
                    <h4 className="font-semibold text-cyan-400 mb-3">Detected Entities:</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {detectedEntities.map((entity, idx) => (
                            <div key={idx} className="bg-slate-800 rounded-lg p-3 text-center">
                                <div className="text-2xl font-bold text-cyan-400">{entity.count}</div>
                                <div className="text-sm text-slate-400">{entity.type}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Guest Toast */}
            {showToast && (
                <div className="fixed bottom-8 right-8 bg-slate-800 border border-cyan-500 rounded-lg p-4 shadow-xl animate-bounce">
                    <p className="text-cyan-400 font-medium">Login to save history</p>
                </div>
            )}
        </div>
    );
}
