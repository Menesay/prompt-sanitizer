import { FaGithub } from 'react-icons/fa';
import kiwiImage from '../assets/kiwi.png';

export default function ContactPage() {
    return (
        <div className="max-w-4xl mx-auto space-y-12">
            <h1 className="text-3xl font-bold text-center text-slate-100">contact me</h1>

            <div className="flex justify-center">
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8 max-w-sm w-full text-center space-y-6 hover:border-cyan-500/50 transition-all">
                    {/* Avatar */}
                    <div className="w-32 h-32 mx-auto rounded-full bg-slate-700 flex items-center justify-center overflow-hidden">
                        <img
                            src={kiwiImage}
                            alt="Profile"
                            className="w-full h-full object-cover"
                        />
                    </div>

                    {/* Info */}
                    <div className="space-y-2">
                        <h2 className="text-2xl font-bold text-cyan-400">Menesay</h2>
                        <p className="text-slate-400 font-medium">Vayb Kodır</p>
                    </div>

                    {/* Links */}
                    <a
                        href="https://github.com/Menesay"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-all"
                    >
                        <FaGithub className="text-xl" />
                        <span>GitHub Profile</span>
                    </a>
                </div>
            </div>
        </div>
    );
}
