'use client';

import { useState } from 'react';
import { BuildingDesign } from '@/types/building';
import Footer from './Footer';

interface ClientInfoProps {
    design: BuildingDesign;
    onSubmit: (data: Partial<BuildingDesign>) => void;
    onNext: () => void;
    onBack?: () => void;
}

export default function ClientInfo({
    design,
    onSubmit,
    onNext,
    onBack,
}: ClientInfoProps) {
    const [formData, setFormData] = useState({
        clientName: design.clientName || '',
        clientEmail: (design as any).clientEmail || '',
        clientPhone: (design as any).clientPhone || '',
        clientAddress: design.clientAddress || '',
        buildingZipCode: design.buildingZipCode || '',
    });

    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const validateField = (name: string, value: string) => {
        let error = '';
        switch (name) {
            case 'clientName':
                if (!value.trim()) error = 'Name is required';
                break;
            case 'clientEmail': {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!value.trim()) error = 'Email is required';
                else if (!emailRegex.test(value)) error = 'Invalid email format';
                break;
            }
            case 'clientPhone': {
                const phoneDigits = value.replace(/\D/g, '');
                if (!value.trim()) error = 'Phone is required';
                else if (phoneDigits.length < 10) error = 'Phone number must be at least 10 digits';
                break;
            }
            case 'buildingZipCode':
                if (!value.trim()) error = 'Zip code is required';
                else if (!/^\d{5}$/.test(value)) error = 'Zip code must be 5 digits';
                break;
            case 'clientAddress':
                if (!value.trim()) error = 'Address is required';
                else if (value.trim().length < 5) error = 'Please enter a full address';
                break;
        }
        return error;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const error = validateField(name, value);
        setErrors(prev => ({ ...prev, [name]: error }));
    };

    const isFormValid =
        formData.clientName.trim() !== '' &&
        formData.clientEmail.trim() !== '' &&
        formData.clientPhone.trim() !== '' &&
        formData.clientAddress.trim() !== '' &&
        formData.buildingZipCode.trim() !== '' &&
        Object.values(errors).every(err => !err);

    const handleContinue = () => {
        // Final validation check
        const newErrors: { [key: string]: string } = {};
        Object.keys(formData).forEach(key => {
            const error = validateField(key, (formData as any)[key]);
            if (error) newErrors[key] = error;
        });

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        onSubmit(formData);
        onNext();
    };

    return (
        <div className="bg-cream-200 min-h-[calc(100vh-150px)] flex flex-col pb-20">
            <div className="w-full px-4 md:px-10 max-w-4xl mx-auto py-8">
                {/* <h1 className="text-2xl md:text-3xl font-bold text-brown-900 mb-6 text-center">
                    Client Information
                </h1> */}

                <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg border border-cream-300">
                    <p className="text-brown-700 mb-8 text-center text-sm md:text-base">
                        Please provide your contact information and the location where you plan to build.
                    </p>

                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-brown-900">
                                    Full Name *
                                </label>
                                <input
                                    type="text"
                                    name="clientName"
                                    value={formData.clientName}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    required
                                    placeholder="e.g. John Doe"
                                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brown-500 focus:border-transparent transition-all ${errors.clientName ? 'border-red-500' : 'border-cream-300'
                                        }`}
                                />
                                {errors.clientName && <p className="text-red-500 text-xs mt-1">{errors.clientName}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-brown-900">
                                    Email Address *
                                </label>
                                <input
                                    type="email"
                                    name="clientEmail"
                                    value={formData.clientEmail}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    required
                                    placeholder="e.g. john@example.com"
                                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brown-500 focus:border-transparent transition-all ${errors.clientEmail ? 'border-red-500' : 'border-cream-300'
                                        }`}
                                />
                                {errors.clientEmail && <p className="text-red-500 text-xs mt-1">{errors.clientEmail}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-brown-900">
                                    Phone Number *
                                </label>
                                <input
                                    type="tel"
                                    name="clientPhone"
                                    value={formData.clientPhone}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    required
                                    placeholder="e.g. (555) 000-0000"
                                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brown-500 focus:border-transparent transition-all ${errors.clientPhone ? 'border-red-500' : 'border-cream-300'
                                        }`}
                                />
                                {errors.clientPhone && <p className="text-red-500 text-xs mt-1">{errors.clientPhone}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-brown-900">
                                    Building Zip Code *
                                </label>
                                <input
                                    type="text"
                                    name="buildingZipCode"
                                    value={formData.buildingZipCode}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    required
                                    maxLength={5}
                                    placeholder="e.g. 12345"
                                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brown-500 focus:border-transparent transition-all ${errors.buildingZipCode ? 'border-red-500' : 'border-cream-300'
                                        }`}
                                />
                                {errors.buildingZipCode && <p className="text-red-500 text-xs mt-1">{errors.buildingZipCode}</p>}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-brown-900">
                                Building Site Address *
                            </label>
                            <input
                                type="text"
                                name="clientAddress"
                                value={formData.clientAddress}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                required
                                placeholder="e.g. 123 Construction Rd, City, State"
                                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brown-500 focus:border-transparent transition-all ${errors.clientAddress ? 'border-red-500' : 'border-cream-300'
                                    }`}
                            />
                            {errors.clientAddress && <p className="text-red-500 text-xs mt-1">{errors.clientAddress}</p>}
                        </div>
                    </div>
                </div>
            </div>

            <Footer
                onBack={onBack}
                onContinue={handleContinue}
                showContinue={true}
                isContinueDisabled={!isFormValid}
                continueLabel="Continue to Design"
            />
        </div>
    );
}
