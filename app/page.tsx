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
    'Building Size',
    'Building Info',
    'Accessories',
    'Leans & Openings',
    'Summary',
    'Delivery'
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

                <main className={`flex-1 overflow-auto relative ${currentStep === 0 ? 'pb-0' : 'pb-24'}`}>
                    {currentStep === 0 && (
                        <div className="w-full">
                            <StoreSelect
                                buildingZipCode={design.buildingZipCode}
                                selectedStore={design.selectedStore}
                                onZipCodeChange={handleZipCodeChange}
                                onStoreSelect={handleStoreSelect}
                                onBack={handleBack}
                            />
                        </div>
                    )}

                    {currentStep === 1 && (
                        <BuildingSize
                            zipCode={design.buildingZipCode || ''}
                            onNext={handleNext}
                            onBack={handleBack}
                            design={design}
                            onSubmit={updateDesign}
                        />
                    )}

                    {currentStep === 2 && (
                        <BuildingInfo
                            design={design}
                            onSubmit={updateDesign}
                            onNext={handleNext}
                            onBack={handleBack}
                        />
                    )}

                    {currentStep === 3 && (
                        <BuildingAccessories
                            design={design}
                            onSubmit={updateDesign}
                            onNext={handleNext}
                            onBack={handleBack}
                        />
                    )}

                    {currentStep === 4 && (
                        <LeansAndOpenings
                            design={design}
                            onSubmit={updateDesign}
                            onNext={handleNext}
                            onBack={handleBack}
                        />
                    )}

                    {currentStep === 5 && (
                        <BuildingSummary
                            design={design}
                            onBack={handleBack}
                        />
                    )}
                </main>
            </div>
        );
    };

    return renderCurrentStep();
}
