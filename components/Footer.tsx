import React from 'react';
import ChatWidget from './ChatWidget';

interface FooterProps {
    onBack?: () => void;
    onContinue?: () => void;
    showContinue?: boolean;
    isContinueDisabled?: boolean;
    continueLabel?: string;
    className?: string;
}

export default function Footer({
    onBack,
    onContinue,
    showContinue = true,
    isContinueDisabled = false,
    continueLabel = 'Continue',
    className = '',
}: FooterProps) {
    return (
        <div
            className={`fixed bottom-0 left-0 right-0 h-[56px] bg-[#16a34a] flex items-center px-4 z-50 ${className}`}
        >
            {/* Back Button */}
            <div className="flex-1">
                {onBack && (
                    <button
                        onClick={onBack}
                        className="bg-white text-gray-800 px-4 md:px-6 py-1.5 rounded-md font-semibold text-sm shadow hover:bg-gray-100 flex items-center justify-center min-w-[40px]"
                    >
                        <span className="hidden min-[601px]:inline">Back</span>
                        <svg className="w-5 h-5 min-[601px]:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                )}
            </div>

            {/* Center Text */}
            <div className="flex-[2] text-center text-[8px] min-[601px]:text-[11px] text-white font-medium leading-tight px-2">
                ©Postframe - v4.9.92-SNAPSHOT &nbsp;&nbsp;
                <div className="inline md:block min-[601px]:inline">©2004–2025 Menard, Inc. All Rights Reserved.</div>
            </div>

            {/* Continue Button */}
            <div className="flex-1 flex justify-end">
                {showContinue && (
                    <button
                        onClick={onContinue}
                        disabled={isContinueDisabled}
                        className={`px-4 md:px-6 py-1.5 rounded-md font-semibold text-sm text-white shadow flex items-center justify-center min-w-[40px]
                            ${isContinueDisabled
                                ? 'bg-green-700 opacity-60 cursor-not-allowed'
                                : 'bg-[#4CAF50] hover:bg-[#43a047]'
                            }`}
                    >
                        <span className="hidden min-[601px]:inline">{continueLabel}</span>
                        <svg className="w-5 h-5 min-[601px]:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                )}
            </div>

            {/* Chat Widget */}
            <ChatWidget />
        </div>
    );
}
