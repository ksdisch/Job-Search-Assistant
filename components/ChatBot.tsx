
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Message } from '../types';
import * as geminiService from '../services/geminiService';

const ChatIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
);

const CloseIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const SendIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 16 16">
        <path d="M15.854.146a.5.5 0 0 1 .11.54l-5.819 14.547a.75.75 0 0 1-1.329.124l-3.178-4.995L.643 7.184a.75.75 0 0 1 .124-1.33L15.314.037a.5.5 0 0 1 .54.11ZM6.636 10.07l2.761 4.338L14.13 2.576 6.636 10.07Zm6.787-8.201L1.591 6.602l4.339 2.76 7.494-7.493Z"/>
    </svg>
);


const ChatBot: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { role: 'model', text: 'Hello! I\'m your Career Companion. How can I help you with your job search today?' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const messagesEndRef = useRef<null | HTMLDivElement>(null);

    useEffect(() => {
        // Only scroll to bottom if not searching
        if (!searchQuery) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isLoading, searchQuery]);
    
    const filteredMessages = useMemo(() => {
        if (!searchQuery.trim()) {
            return messages;
        }
        return messages.filter(msg => 
            msg.text.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [messages, searchQuery]);


    const handleSend = async () => {
        if (!input.trim() || isLoading) return;
        
        const userMessage: Message = { role: 'user', text: input.trim() };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const botResponseText = await geminiService.sendMessageToBot(userMessage.text);
            const botMessage: Message = { role: 'model', text: botResponseText };
            setMessages(prev => [...prev, botMessage]);
        } catch (error) {
            const message = (error as Error).message || 'Sorry, I ran into an error.';
            const errorMessage: Message = { role: 'model', text: message };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <>
            <div className={`fixed bottom-24 right-5 z-40 w-[90vw] max-w-md h-[65vh] max-h-[600px] bg-gray-800 rounded-lg shadow-2xl border border-gray-700 flex flex-col transition-all duration-300 ease-in-out transform ${isOpen ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'}`}>
                {/* Header */}
                <div className="flex flex-col p-3 border-b border-gray-700 bg-gray-900/50 rounded-t-lg">
                    <div className="flex items-center justify-between">
                        <h3 className="font-bold text-white">Career Companion</h3>
                        <button onClick={() => setIsOpen(false)} className="p-1 text-gray-400 hover:text-white"><CloseIcon /></button>
                    </div>
                    <div className="relative mt-2">
                        <input
                            type="search"
                            placeholder="Search conversation..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-gray-700 text-gray-200 rounded-lg pl-8 pr-3 py-1.5 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none placeholder-gray-400"
                        />
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-grow p-4 overflow-y-auto space-y-4">
                    {filteredMessages.map((msg, index) => (
                        <div key={index} className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {msg.role === 'model' && <div className="w-6 h-6 bg-teal-500 rounded-full flex-shrink-0"></div>}
                            <div className={`max-w-xs md:max-w-sm px-3 py-2 rounded-xl ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-gray-700 text-gray-200 rounded-bl-none'}`}>
                                <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                            </div>
                        </div>
                    ))}
                    {isLoading && !searchQuery && (
                        <div className="flex items-end gap-2 justify-start">
                             <div className="w-6 h-6 bg-teal-500 rounded-full flex-shrink-0"></div>
                             <div className="px-3 py-2 rounded-xl bg-gray-700 text-gray-200 rounded-bl-none">
                                <div className="flex items-center space-x-1">
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                </div>
                             </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-3 border-t border-gray-700 flex items-center gap-2">
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Ask me anything..."
                        rows={1}
                        className="flex-grow bg-gray-700 text-gray-200 rounded-lg p-2 resize-none focus:ring-2 focus:ring-teal-500 focus:outline-none text-sm"
                        disabled={isLoading}
                    />
                    <button onClick={handleSend} disabled={isLoading || !input.trim()} className="bg-teal-600 hover:bg-teal-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white p-2 rounded-full transition-colors">
                        <SendIcon />
                    </button>
                </div>
            </div>

            <button onClick={() => setIsOpen(!isOpen)} title="Open Chat" aria-label="Open Chat" className="fixed bottom-5 right-5 z-50 w-14 h-14 bg-teal-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-teal-500 transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-teal-500">
                <div className={`transition-transform duration-300 ease-in-out ${isOpen ? 'rotate-180 scale-0' : 'rotate-0 scale-100'}`}><ChatIcon /></div>
                <div className={`absolute transition-transform duration-300 ease-in-out ${isOpen ? 'rotate-0 scale-100' : '-rotate-180 scale-0'}`}><CloseIcon /></div>
            </button>
        </>
    );
};

export default ChatBot;
