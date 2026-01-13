'use client';

import Image from 'next/image';

interface LandingProps {
    onStartDesigning: () => void;
}

export default function Landing({ onStartDesigning }: LandingProps) {
    return (
        <div className="relative min-h-screen w-full overflow-x-hidden text-white flex flex-col">

            {/* BACKGROUND IMAGE */}
            <Image
                src="/assets/bg.jpg"
                alt="Post Frame"
                fill
                priority
                className="object-cover"
            />

            {/* OVERLAY (Responsive) */}
            <div className="absolute inset-0 bg-black/40 lg:hidden z-0" />
            <div className="responsive_overlay absolute inset-y-0 left-0 w-full lg:w-1/2 
                bg-gradient-to-r from-black/90 via-black/75 to-black/40 lg:to-black/30
                backdrop-blur-md lg:backdrop-blur-lg z-0" />

            {/* CONTENT */}
            <div className="relative z-10 flex-1 flex items-center">
                <div className="px-6 md:px-16 py-20 lg:py-0 w-full max-w-2xl">

                    <h1 className="text-3xl md:text-4xl lg:text-[42px] font-serif font-semibold leading-tight md:leading-none">
                        Design & Buy <span className="text-sm align-top">™</span>
                    </h1>

                    <h2 className="mt-2 text-sm md:text-[16px] tracking-[0.2em] md:tracking-[0.35em] uppercase opacity-80">
                        POST FRAME
                    </h2>

                    <div className="my-6 h-px w-full max-w-72 bg-white/40" />

                    <p className="text-sm md:text-[15px] font-semibold uppercase tracking-wide mb-8">
                        Easiest way to create your dream building
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-4 text-[14px] mb-10">
                        <Feature text="Heights Up To 20'" />
                        <Feature text="Widths Up To 70'" />
                        <Feature text="Clear Span Trusses" />
                        <Feature text="Steel Roofing And Siding" />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-5 mb-10">
                        <Button text="START DESIGNING" onClick={onStartDesigning} />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-x-4 gap-y-3 text-[14px] opacity-95">
                        <List text="Free Estimates" />
                        <List text="Customizable Design Features" />
                        <List text="3D Renderings" />
                        <List text="Save And Recall Designs" />
                        <List text="Chat With Experts" />
                        <List text="Email Your Design" />
                    </div>

                </div>
            </div>

            {/* FOOTER */}
            <div className="relative lg:absolute bottom-0 lg:bottom-4 w-full py-6 lg:py-0 text-center text-[10px] md:text-[11px] opacity-70 z-10 bg-black/40 lg:bg-transparent">
                <span className="bg-[#f05a28] px-1.5 py-0.5 font-bold italic rounded">
                    MENARDS®
                </span>{' '}
                ©2004–2024 Menard, Inc. All Rights Reserved.
            </div>
        </div>
    );
}

/* COMPONENTS */

function Feature({ text }: { text: string }) {
    return (
        <div className="flex items-center gap-3">
            <span className="text-[#0a8f3f] font-bold">✦</span>
            <span>{text}</span>
        </div>
    );
}

function Button({ text, onClick }: { text: string; onClick?: () => void }) {
    return (
        <button
            onClick={onClick}
            className="bg-[#0a8f3f] hover:bg-[#087a36] w-full sm:w-auto
      px-10 py-4 rounded-full text-[13px] font-bold uppercase transition-all hover:scale-105 active:scale-95 shadow-lg"
        >
            {text}
        </button>
    );
}

function List({ text }: { text: string }) {
    return (
        <div className="flex items-center gap-3">
            <span className="text-[#0a8f3f] text-xs">■</span>
            <span>{text}</span>
        </div>
    );
}
