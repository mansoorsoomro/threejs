'use client';

import React, { useState } from 'react';
import Landing from '@/components/Landing';
import StoreSelect from '@/components/StoreSelect';
import BuildingSize from '@/components/BuildingSize';
import BuildingInfo from '@/components/BuildingInfo';
import BuildingAccessories from '@/components/BuildingAccessories';
import LeansAndOpenings from '@/components/LeansAndOpenings';
import BuildingSummary from '@/components/BuildingSummary';
import StepNavigation from '@/components/StepNavigation';
import { BuildingDesign, Store } from '@/types/building';

type Step = 'landing' | 0 | 1 | 2 | 3 | 4 | 5;

const STEPS = [
    'Store Selection',
    'Size',
    'Information',
    'Accessories',
    'Openings',
    'Summary'
];

export default function Home() {
    const [currentStep, setCurrentStep] = useState<Step>('landing');
    const [design, setDesign] = useState<BuildingDesign>({
        clientName: '',
        clientAddress: '',
        buildingUse: 'storage',
        width: 24,
        length: 30,
        trussSpacing: '6',
        framingType: 'post-frame-construction',
        roofPitch: '4/12',
        floorFinish: 'dirt-gravel',
        thickenedEdgeSlab: false,
        postConstructionSlab: false,
        sitePreparation: false,
        sidewallPosts: '4x6',
        clearHeight: '12',
        gradeBoard: '2x6',
        girtType: 'flat',
        girtSize: '2x4',
        wallColor: 'white',
        trimColor: 'white',
        roofColor: 'charcoal',
        endWallOverhang: '0',
        sidewallOverhang: '0',
        openings: [],
        buildingZipCode: '',
    });

    const handleNext = () => {
        if (currentStep === 'landing') {
            setCurrentStep(0);
        } else if (typeof currentStep === 'number' && currentStep < STEPS.length - 1) {
            setCurrentStep((currentStep + 1) as Step);
        }
    };

    const handleBack = () => {
        if (typeof currentStep === 'number') {
            if (currentStep === 0) {
                setCurrentStep('landing');
            } else {
                setCurrentStep((currentStep - 1) as Step);
            }
        }
    };

    const updateDesign = (updates: Partial<BuildingDesign>) => {
        setDesign((prev) => ({ ...prev, ...updates }));
    };

    const handleStoreSelect = (store: Store) => {
        updateDesign({
            selectedStore: store,
            buildingZipCode: store.zipCode
        });
        handleNext();
    };

    const handleZipCodeChange = (zipCode: string) => {
        updateDesign({ buildingZipCode: zipCode });
    };

    const renderCurrentStep = () => {
        if (currentStep === 'landing') {
            return <Landing onStartDesigning={handleNext} />;
        }

        return (
            <div className="flex flex-col min-h-screen bg-gray-50">
                <StepNavigation currentStep={currentStep + 1} steps={STEPS} />

                <main className="flex-1 overflow-auto relative">
                    {currentStep === 0 && (
                        <div className="max-w-4xl mx-auto py-8 px-4">
                            <StoreSelect
                                buildingZipCode={design.buildingZipCode}
                                selectedStore={design.selectedStore}
                                onZipCodeChange={handleZipCodeChange}
                                onStoreSelect={handleStoreSelect}
                            />
                        </div>
                    )}

                    {currentStep === 1 && (
                        <BuildingSize
                            zipCode={design.buildingZipCode || ''}
                            onNext={handleNext}
                            design={design}
                            onSubmit={updateDesign}
                        />
                    )}

                    {currentStep === 2 && (
                        <BuildingInfo
                            design={design}
                            onSubmit={updateDesign}
                            onNext={handleNext}
                        />
                    )}

                    {currentStep === 3 && (
                        <BuildingAccessories
                            design={design}
                            onSubmit={updateDesign}
                            onNext={handleNext}
                        />
                    )}

                    {currentStep === 4 && (
                        <LeansAndOpenings
                            design={design}
                            onSubmit={updateDesign}
                            onNext={handleNext}
                        />
                    )}

                    {currentStep === 5 && (
                        <BuildingSummary
                            design={design}
                        />
                    )}

                    {/* Global Back button for steps >= 0 */}
                    <div className="fixed bottom-6 left-6 z-50">
                        <button
                            onClick={handleBack}
                            className="bg-gray-800 hover:bg-black text-white px-8 py-2.5 rounded-full shadow-2xl font-bold transition-all transform hover:scale-105 flex items-center gap-2"
                        >
                            <span className="text-xl">←</span> Back
                        </button>
                    </div>
                </main>
            </div>
        );
    };

    return renderCurrentStep();
}
