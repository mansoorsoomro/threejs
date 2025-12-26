'use client';

import Image from 'next/image';

interface LandingProps {
    onStartDesigning: () => void;
}

export default function Landing({ onStartDesigning }: LandingProps) {
    return (
        <div className="relative h-screen w-full overflow-hidden text-white">

            {/* BACKGROUND IMAGE */}
            <Image
                src="/assets/bg.jpg"
                alt="Post Frame"
                fill
                priority
                className="object-cover"
            />

            {/* LEFT OVERLAY (BLUR + GRADIENT) */}
            <div className="absolute inset-y-0 left-0 w-1/2 
        bg-gradient-to-r from-black/80 via-black/65 to-black/30
        backdrop-blur-lg z-0" />

            {/* RIGHT SIDE (NO OVERLAY – CLEAR IMAGE) */}
            <div className="absolute inset-y-0 right-0 w-1/2 z-0" />

            {/* CONTENT */}
            <div className="absolute inset-y-0 left-0 w-1/2 z-10 flex items-center">
                <div className="px-16 max-w-xl">

                    <h1 className="text-[42px] font-serif font-semibold leading-none">
                        Design & Buy <span className="text-sm align-top">™</span>
                    </h1>

                    <h2 className="mt-2 text-[16px] tracking-[0.35em] uppercase opacity-80">
                        POST FRAME
                    </h2>

                    <div className="my-6 h-px w-72 bg-white/40" />

                    <p className="text-[15px] font-semibold uppercase tracking-wide mb-8">
                        Easiest way to create your dream building
                    </p>

                    <div className="grid grid-cols-2 gap-x-10 gap-y-4 text-[14px] mb-10">
                        <Feature text="Heights Up To 20'" />
                        <Feature text="Widths Up To 70'" />
                        <Feature text="Clear Span Trusses" />
                        <Feature text="Steel Roofing And Siding" />
                    </div>

                    <div className="flex gap-5 mb-10">
                        <Button text="START DESIGNING" onClick={onStartDesigning} />
                        {/* <Button text="SEARCH SAVED DESIGNS" /> */}
                    </div>

                    <div className="space-y-3 text-[14px] opacity-95">
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
            <div className="absolute bottom-4 w-full text-center text-[11px] opacity-70 z-10">
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
            <span className="text-sm">✦</span>
            <span>{text}</span>
        </div>
    );
}

function Button({ text, onClick }: { text: string; onClick?: () => void }) {
    return (
        <button
            onClick={onClick}
            className="bg-[#0a8f3f] hover:bg-[#087a36] 
      px-8 py-3 rounded-full text-[13px] font-semibold uppercase transition"
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
