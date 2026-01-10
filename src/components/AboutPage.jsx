import { FaShieldAlt } from 'react-icons/fa';

export default function AboutPage() {
    return (
        <div className="max-w-4xl mx-auto space-y-12">
            <h1 className="text-3xl font-bold text-center text-slate-100">about prompt sanitizer</h1>

            <div className="flex justify-center">
                <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-8 max-w-2xl w-full hover:border-cyan-500/50 transition-all">

                    <div className="flex justify-center mb-6">
                        <div className="p-4 bg-cyan-900/20 rounded-full border border-cyan-500/30">
                            <FaShieldAlt className="text-4xl text-cyan-400" />
                        </div>
                    </div>

                    <div className="space-y-6 text-slate-300 leading-relaxed text-center">
                        <p>
                            <span className="font-semibold text-cyan-400">Prompt Sanitizer</span> is a secure demonstration tool designed to prevent data leaks by scrubbing sensitive information from your text.
                        </p>
                        <p>
                            It automatically detects and redacts high-risk data—including API keys (AWS, Google, Stripe), private tokens, and PII (like emails and credit card numbers)—allowing you to sanitize prompts safely before processing them.
                        </p>
                    </div>

                </div>
            </div>
        </div>
    );
}
