import { FaCheck } from 'react-icons/fa';

export default function PricingPage() {
    const pricingTiers = [
        {
            name: 'Free',
            description: 'Perfect for getting started. Completely open source.',
            price: '$0',
            features: ['Open Source']
        },
        {
            name: 'Pro',
            description: 'For power users. Completely open source.',
            price: '$0',
            features: ['Open Source']
        },
        {
            name: 'Ultimate',
            description: 'For professional teams. Completely open source.',
            price: '$0',
            features: ['Open Source']
        },
        {
            name: 'Hollygate',
            description: 'The hollygate plan for enterprises. Completely open source.',
            price: '$0',
            features: ['Open Source']
        }
    ];

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div className="text-center space-y-2">
                <h1 className="text-4xl font-bold text-slate-100">pricing</h1>
                <p className="text-slate-400 text-lg">All plans are free and open source.</p>
            </div>

            {/* Pricing Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {pricingTiers.map((tier, index) => (
                    <div
                        key={index}
                        className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 space-y-4 hover:border-blue-500/50 transition-all"
                    >
                        {/* Tier Name */}
                        <h3 className="text-2xl font-bold text-blue-400">{tier.name}</h3>

                        {/* Description */}
                        <p className="text-slate-400 text-sm min-h-[3rem]">{tier.description}</p>

                        {/* Price */}
                        <div className="text-4xl font-bold text-slate-100 py-4">
                            {tier.price}
                        </div>

                        {/* Features */}
                        <div className="space-y-2 pt-4 border-t border-slate-700">
                            {tier.features.map((feature, idx) => (
                                <div key={idx} className="flex items-center gap-2 text-blue-400">
                                    <FaCheck className="flex-shrink-0" />
                                    <span className="text-sm">{feature}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
