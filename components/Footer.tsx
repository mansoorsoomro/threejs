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
                        className="bg-white text-gray-800 px-6 py-1.5 rounded-md font-semibold text-sm shadow hover:bg-gray-100"
                    >
                        Back
                    </button>
                )}
            </div>

            {/* Center Text */}
            <div className="flex-1 text-center text-[11px] text-white font-medium">
                ©Postframe - v4.9.92-SNAPSHOT &nbsp;&nbsp;
                ©2004–2025 Menard, Inc. All Rights Reserved.
            </div>

            {/* Continue Button */}
            <div className="flex-1 flex justify-end">
                {showContinue && (
                    <button
                        onClick={onContinue}
                        disabled={isContinueDisabled}
                        className={`px-6 py-1.5 rounded-md font-semibold text-sm text-white shadow
                            ${isContinueDisabled
                                ? 'bg-green-700 opacity-60 cursor-not-allowed'
                                : 'bg-[#4CAF50] hover:bg-[#43a047]'
                            }`}
                    >
                        {continueLabel}
                    </button>
                )}
            </div>

            {/* Chat Widget */}
            <ChatWidget />
        </div>
    );
}
