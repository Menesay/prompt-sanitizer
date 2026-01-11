import sausageImage from '../assets/sausage.png';

export default function ProfilePage({ user }) {
    // Determine user ID from email base64 encoding, or default if no user
    const userId = user?.email
        ? btoa(user.email)
        : 'Not Logged In';

    return (
        <div className="max-w-4xl mx-auto space-y-12">
            <h1 className="text-3xl font-bold text-center text-slate-100">user profile</h1>

            <div className="flex justify-center">
                <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-8 max-w-2xl w-full hover:border-blue-500/50 transition-all flex flex-col md:flex-row items-center gap-8">

                    {/* Profile Image */}
                    <div className="w-48 h-48 rounded-full bg-slate-700 flex-shrink-0 overflow-hidden border-4 border-slate-600">
                        <img
                            src={sausageImage}
                            alt="Profile"
                            className="w-full h-full object-cover"
                        />
                    </div>

                    {/* Account Details */}
                    <div className="flex-grow space-y-6 w-full text-center md:text-left">
                        <h2 className="text-2xl font-bold text-blue-400 border-b border-slate-700 pb-2">
                            Account Details
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-500 mb-1">
                                    Email
                                </label>
                                <div className="text-xl text-slate-200 break-all">
                                    {user?.email || 'N/A'}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-500 mb-1">
                                    User ID
                                </label>
                                <div className="text-lg text-slate-400 font-mono break-all bg-slate-900/50 p-2 rounded">
                                    {userId}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
