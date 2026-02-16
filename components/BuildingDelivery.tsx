'use client';

import { useState } from 'react';
import { BuildingDesign } from '@/types/building';
import { calculatePrice } from '@/lib/pricing';
import { useAppSelector } from '@/lib/store/hooks';
import Footer from './Footer';

interface BuildingDeliveryProps {
    design: BuildingDesign;
    onBack: () => void;
    onRestart: () => void;
}

export default function BuildingDelivery({ design, onBack, onRestart }: BuildingDeliveryProps) {
    const pricingConfig = useAppSelector((state) => state.pricing.config);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

    const totalPrice = calculatePrice({
        width: design.width,
        length: design.length,
        trussSpacing: design.trussSpacing,
        floorFinish: design.floorFinish,
        thickenedEdgeSlab: design.thickenedEdgeSlab,
        postConstructionSlab: design.postConstructionSlab,
        sidewallPosts: design.sidewallPosts,
        clearHeight: design.clearHeight,
        girtType: design.girtType,
        gradeBoard: design.gradeBoard,
        endWallOverhang: design.endWallOverhang,
        sidewallOverhang: design.sidewallOverhang,
        sitePreparation: design.sitePreparation,
        openings: (design.openings || []).map(o => ({
            id: o.id,
            x: o.x,
            y: o.y,
            width: o.width,
            height: o.height,
            price: o.price,
        })),
    }, pricingConfig);

    const handleSubmitQuote = async () => {
        setIsSubmitting(true);
        setSubmitStatus('idle');
        try {
            // In static mode, we use mailto to send the quote details
            const subject = encodeURIComponent(`Building Quote Request - ${design.clientName}`);

            const bodyLines = [
                `Name: ${design.clientName}`,
                `Email: ${design.clientEmail}`,
                `Phone: ${design.clientPhone}`,
                `Address: ${design.clientAddress}, ${design.buildingZipCode}`,
                `Building Specs: ${design.width}x${design.length}x${design.clearHeight}`,
                `Estimated Price: $${totalPrice.toLocaleString()}`,
                `Use the online designer to view this Design ID: ${design.width}-${design.length}`
            ];

            const body = encodeURIComponent(bodyLines.join('\n'));

            // Open user's email client
            window.location.href = `mailto:sales@coupebuildingco.com?subject=${subject}&body=${body}`;

            setSubmitStatus('success');
        } catch (error) {
            console.error('Error submitting quote:', error);
            setSubmitStatus('error');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (submitStatus === 'success') {
        return (
            <div className="min-h-[60vh] flex items-center justify-center px-4">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center border-t-8 border-brown-500">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Quote Requested!</h2>
                    <p className="text-gray-600 mb-8 text-lg">
                        Thank you, <strong>{design.clientName}</strong>. Your design and official quote request have been sent to our sales team. We'll be in touch shortly!
                    </p>
                    <button
                        onClick={onRestart}
                        className="w-full py-4 bg-brown-600 text-white rounded-xl font-bold text-lg hover:bg-brown-700 transition-colors shadow-lg"
                    >
                        Design New Building
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-cream-200 py-12 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-brown-100 mb-8">
                    <div className="bg-brown-600 py-6 px-8 text-white">
                        <h1 className="text-3xl font-bold">Official Quote Request</h1>
                        <p className="text-brown-100 mt-1 opacity-90">Review final details and submit your project to Coupe Building Co.</p>
                    </div>

                    <div className="p-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 pb-8 border-b border-gray-100">
                            <div>
                                <h3 className="text-sm font-bold text-brown-500 uppercase tracking-wider mb-4">Client Details</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between border-b border-dashed border-gray-100 pb-2">
                                        <span className="text-gray-500">Name:</span>
                                        <span className="font-semibold text-gray-900">{design.clientName}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-dashed border-gray-100 pb-2">
                                        <span className="text-gray-500">Email:</span>
                                        <span className="font-semibold text-gray-900">{design.clientEmail}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-dashed border-gray-100 pb-2">
                                        <span className="text-gray-500">Phone:</span>
                                        <span className="font-semibold text-gray-900">{design.clientPhone}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Site Address:</span>
                                        <span className="font-semibold text-gray-900 text-right max-w-[200px]">{design.clientAddress}, {design.buildingZipCode}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-cream-50 rounded-xl p-6 border border-brown-50">
                                <h3 className="text-sm font-bold text-brown-500 uppercase tracking-wider mb-4">Pricing Summary</h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-baseline">
                                        <span className="text-gray-600">Estimated Building Total:</span>
                                        <span className="text-3xl font-bold text-brown-900">${totalPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                    </div>
                                    <p className="text-xs text-brown-400 italic">
                                        *Total includes materials based on current internal pricing. Labor, tax, and delivery will be added to your official quote by our team.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col items-center py-4">
                            <button
                                onClick={handleSubmitQuote}
                                disabled={isSubmitting}
                                className={`w-full max-w-lg py-5 rounded-full font-bold text-2xl text-white shadow-2xl transition-all transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-4
                  ${isSubmitting ? 'bg-brown-400 cursor-not-allowed' : 'bg-brown-400 hover:bg-brown-400 ring-4 ring-brown-100'}
                `}
                            >
                                {isSubmitting ? (
                                    <>
                                        <svg className="animate-spin h-7 w-7 text-white" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Processing Quote...
                                    </>
                                ) : (
                                    <>Send Design for Official Quote</>
                                )}
                            </button>

                            {submitStatus === 'error' && (
                                <div className="mt-4 bg-red-50 text-red-700 px-6 py-3 rounded-xl border border-red-200 font-bold flex items-center gap-2">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Submission Failed. Please check your connection and try again.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <Footer
                    onBack={onBack}
                    onContinue={() => { }}
                    showContinue={false}
                />
            </div>
        </div>
    );
}
