'use client';

import React, { useState, useRef, useEffect } from 'react';

type ChatState = 'CLOSED' | 'WELCOME' | 'FORM' | 'CHAT';

export default function ChatWidget() {
    const [state, setState] = useState<ChatState>('CLOSED');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [messages, setMessages] = useState<{ text: string; sender: 'user' | 'agent' }[]>([
        { text: 'Hello! How can we help you today?', sender: 'agent' }
    ]);
    const [inputText, setInputText] = useState('');
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputText.trim()) return;
        setMessages([...messages, { text: inputText, sender: 'user' }]);
        setInputText('');
        // Simulate agent response
        setTimeout(() => {
            setMessages(prev => [...prev, { text: 'Thanks for your message! A specialist will get back to you shortly.', sender: 'agent' }]);
        }, 1000);
    };

    if (state === 'CLOSED') {
        return (
            <button
                onClick={() => setState('WELCOME')}
                className="fixed bottom-20 right-4 w-12 h-12 bg-brown-600 rounded-full flex items-center justify-center shadow-lg hover:scale-105 hover:bg-brown-700 transition-all z-[60]"
            >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
            </button>
        );
    }

    return (
        <div className="fixed bottom-20 right-4 w-[320px] max-h-[500px] h-[70vh] bg-cream-100 rounded-2xl shadow-2xl flex flex-col overflow-hidden z-[60] border border-cream-300 animate-in slide-in-from-bottom-4 duration-300">
            {/* Header */}
            <div className="bg-brown-600 p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {state !== 'WELCOME' && (
                        <button onClick={() => setState(state === 'FORM' ? 'WELCOME' : 'FORM')} className="hover:bg-white/10 p-1 rounded">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                        </button>
                    )}
                    <div className="flex flex-col">
                        <span className="font-bold text-white text-base">Live Chat</span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => setState('CLOSED')} className="hover:bg-white/10 p-1 rounded">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 bg-cream-100">
                {state === 'WELCOME' && (
                    <div className="flex flex-col h-full animate-in fade-in duration-500">
                        <h1 className="text-xl font-extrabold text-brown-900 leading-tight mb-3">
                            Welcome!<br />Text us
                        </h1>

                        <div className="bg-cream-200 p-4 rounded-2xl shadow-sm border border-cream-300 flex flex-col items-center gap-3 text-center mt-auto mb-6">
                            <div className="w-10 h-10 bg-brown-100 rounded-full flex items-center justify-center">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6B5344" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                            </div>
                            <p className="text-brown-500 text-xs">
                                We're away at the moment. Leave a message, and we'll reply by email.
                            </p>
                            <button
                                onClick={() => setState('FORM')}
                                className="w-full bg-brown-600 text-white py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-brown-700 transition-colors shadow-md active:scale-95 text-sm"
                            >
                                Let's chat <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                            </button>
                        </div>

                        {/* Bottom Nav Simulation */}
                        <div className="flex justify-around items-center border-t border-cream-300 pt-3 -mx-4 px-4 bg-cream-200 mt-auto">
                            <div className="flex flex-col items-center gap-1 text-brown-600">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"></path></svg>
                                <span className="text-[10px] font-bold">Home</span>
                            </div>
                            <div className="flex flex-col items-center gap-1 text-brown-400">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                                <span className="text-[10px]">Chat</span>
                            </div>
                        </div>
                    </div>
                )}

                {state === 'FORM' && (
                    <div className="flex flex-col h-full animate-in fade-in duration-500">
                        <div className="bg-cream-200 p-3 rounded-xl shadow-sm border border-cream-300 flex items-center gap-3 mb-4">
                            <div className="w-7 h-7 bg-brown-100 rounded-full flex items-center justify-center">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6B5344" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                            </div>
                            <p className="text-brown-500 text-[12px] leading-tight">
                                We're away at the moment. Leave a message, and we'll reply by email.
                            </p>
                        </div>

                        <div className="flex flex-col gap-3 text-xs text-brown-700 font-medium">
                            <p className="mb-2">Welcome to our LiveChat! Please fill in the form below before starting the chat.</p>
                            <div className="space-y-4">
                                <div className="flex flex-col gap-1">
                                    <label>Name: <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="border border-cream-300 rounded-lg p-2.5 w-full focus:outline-none focus:ring-2 focus:ring-brown-500/20 font-normal text-sm"
                                        placeholder="Your name"
                                    />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label>E-mail: <span className="text-red-500">*</span></label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="border border-cream-300 rounded-lg p-2.5 w-full focus:outline-none focus:ring-2 focus:ring-brown-500/20 font-normal text-sm"
                                        placeholder="your@email.com"
                                    />
                                </div>
                            </div>
                            <button
                                disabled={!name || !email}
                                onClick={() => setState('CHAT')}
                                className="mt-4 w-full bg-brown-600 text-white py-2.5 rounded-xl font-bold hover:bg-brown-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md text-sm"
                            >
                                Start the chat
                            </button>
                        </div>
                    </div>
                )}

                {state === 'CHAT' && (
                    <div className="flex flex-col h-full animate-in fade-in duration-500 relative">
                        <div className="text-center text-[10px] text-brown-400 my-4 uppercase tracking-widest font-bold">Yesterday</div>

                        <div className="flex flex-col gap-4 mb-20">
                            {messages.map((msg, i) => (
                                <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[80%] p-2.5 rounded-2xl text-xs ${msg.sender === 'user'
                                        ? 'bg-brown-600 text-white rounded-tr-none'
                                        : 'bg-white text-brown-800 border border-cream-200 rounded-tl-none shadow-sm'
                                        }`}>
                                        {msg.text}
                                    </div>
                                </div>
                            ))}
                            <div ref={chatEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="absolute bottom-0 left-0 right-0 bg-white p-3 border-t border-cream-200 flex items-center gap-2">
                            <button className="text-brown-400 hover:text-brown-500 p-1">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                            </button>
                            <form onSubmit={handleSendMessage} className="flex-1 flex items-center gap-2 bg-cream-200 rounded-full px-3 py-1.5">
                                <input
                                    type="text"
                                    placeholder="Write a message..."
                                    className="flex-1 bg-transparent border-none outline-none text-xs text-brown-800"
                                    value={inputText}
                                    onChange={(e) => setInputText(e.target.value)}
                                />
                                <button type="submit" className="text-brown-400 hover:text-brown-600">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
