import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Message, Application } from '../types';
import * as geminiService from '../services/geminiService';

const SendIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 16 16">
        <path d="M15.854.146a.5.5 0 0 1 .11.54l-5.819 14.547a.75.75 0 0 1-1.329.124l-3.178-4.995L.643 7.184a.75.75 0 0 1 .124-1.33L15.314.037a.5.5 0 0 1 .54.11ZM6.636 10.07l2.761 4.338L14.13 2.576 6.636 10.07Zm6.787-8.201L1.591 6.602l4.339 2.76 7.494-7.493Z"/>
    </svg>
);

interface ChatBotProps {
    careerPreferences: string;
    resume: string;
    onAddNewApplication: (jobData: Omit<Application, 'id' | 'status' | 'fitAnalysis' | 'generatedContent'>) => void;
    applications: Application[];
}

type ChatMode = 'idle' | 'awaiting_jd';
type SaveState = 'idle' | 'saving' | 'saved' | 'error';

const ChatBot: React.FC<ChatBotProps> = ({ careerPreferences, resume, onAddNewApplication, applications }) => {
    const [messages, setMessages] = useState<Message[]>([
        { role: 'model', text: "Hello! I'm your Career Companion. Ask me to find job listings, get career advice, or analyze a job description against your saved resume." }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [chatMode, setChatMode] = useState<ChatMode>('idle');
    const [savingSources, setSavingSources] = useState<Record<string, SaveState>>({});
    const messagesEndRef = useRef<null | HTMLDivElement>(null);

    useEffect(() => {
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

    const handleSaveJob = async (source: { uri: string; title: string }) => {
        setSavingSources(prev => ({ ...prev, [source.uri]: 'saving' }));
        try {
            const details = await geminiService.extractJobDetails(source.uri);
            onAddNewApplication({
                ...details,
                logo: `https://picsum.photos/seed/${encodeURIComponent(details.company)}/100`,
            });
            setSavingSources(prev => ({ ...prev, [source.uri]: 'saved' }));
        } catch (error) {
            console.error(error);
            setSavingSources(prev => ({ ...prev, [source.uri]: 'error' }));
            // Optional: Show a toast or alert for the error
        }
    };

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;
        
        const messageText = input.trim();
        const userMessage: Message = { role: 'user', text: messageText };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        const urlRegex = new RegExp('^(https?|ftp)://[^\\s/$.?#].[^\\s]*$', 'i');

        if (urlRegex.test(messageText)) {
            try {
                const details = await geminiService.extractJobDetails(messageText);
                onAddNewApplication({
                    ...details,
                    logo: `https://picsum.photos/seed/${encodeURIComponent(details.company)}/100`,
                });
                const successMessage: Message = { role: 'model', text: `Great! I've added **${details.title}** at **${details.company}** to your Discovery Hub.` };
                setMessages(prev => [...prev, successMessage]);
            } catch (error) {
                const errorMessageText = (error as Error).message || "Sorry, I couldn't extract job details from that link. Please make sure it's a valid job posting.";
                const errorMessage: Message = { role: 'model', text: errorMessageText };
                setMessages(prev => [...prev, errorMessage]);
            } finally {
                setIsLoading(false);
            }
        } else {
            try {
                 if (chatMode === 'awaiting_jd') {
                    const jd = messageText;
                    setChatMode('idle');
                    const analysis = await geminiService.analyzeJobFit(jd, resume);
                    const analysisText = `Here is the analysis of the job description against your saved resume:\n\n**Fit Score:** ${analysis.fitScore}/100\n*${analysis.summary}*\n\n**Strengths:**\n- ${analysis.pros.join('\n- ')}\n\n**Potential Gaps:**\n- ${analysis.cons.join('\n- ')}`;
                    const botMessage: Message = { role: 'model', text: analysisText };
                    setMessages(prev => [...prev, botMessage]);
                } else if (/\banalyze\b/i.test(messageText)) {
                     setChatMode('awaiting_jd');
                     const botMessage: Message = { role: 'model', text: 'Of course. To analyze the job fit, please paste the full job description below.' };
                     setMessages(prev => [...prev, botMessage]);
                } else {
                    const { text: botResponseText, sources } = await geminiService.sendMessageToBot(messageText, careerPreferences);
                    const botMessage: Message = { role: 'model', text: botResponseText, sources };
                    setMessages(prev => [...prev, botMessage]);
                }
            } catch (error) {
                const message = (error as Error).message || 'Sorry, I ran into an error.';
                const errorMessage: Message = { role: 'model', text: message };
                setMessages(prev => [...prev, errorMessage]);
                setChatMode('idle'); // Reset mode on error
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="h-full w-full bg-gray-800 flex flex-col">
            {/* Header */}
            <div className="flex flex-col p-3 border-b border-gray-700 bg-gray-900/50 flex-shrink-0">
                <div className="flex items-center justify-between">
                    <h3 className="font-bold text-white">Career Companion</h3>
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
                    <div key={index} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                        <div className={`flex items-end gap-2 max-w-lg ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                            {msg.role === 'model' && <div className="w-6 h-6 bg-teal-500 rounded-full flex-shrink-0 self-start"></div>}
                            <div className={`px-3 py-2 rounded-xl ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-gray-700 text-gray-200 rounded-bl-none'}`}>
                                <p className="text-sm whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: msg.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>').replace(/-\s/g, '• ') }} />
                            </div>
                        </div>
                        {msg.sources && msg.sources.length > 0 && (
                            <div className="mt-2 pt-2 ml-8 border-t border-gray-700/50 space-y-2 w-full max-w-lg">
                                {msg.sources.map((source, i) => (
                                    <div key={i} className="bg-gray-700/50 p-2 rounded-md flex items-center justify-between gap-2">
                                        <a
                                            href={source.uri}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-xs text-blue-400 hover:underline truncate flex-grow"
                                            title={source.title}
                                        >
                                          <span className="font-semibold">[{i+1}]</span> {source.title}
                                        </a>
                                        <SaveJobButton 
                                            source={source} 
                                            onSave={handleSaveJob}
                                            applications={applications}
                                            saveState={savingSources[source.uri] || 'idle'}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
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
            <div className="p-3 border-t border-gray-700 flex items-center gap-2 flex-shrink-0">
                <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={chatMode === 'awaiting_jd' ? 'Paste job description here...' : 'Paste a job link or ask a question...'}
                    rows={1}
                    className="flex-grow bg-gray-700 text-gray-200 rounded-lg p-2 resize-none focus:ring-2 focus:ring-teal-500 focus:outline-none text-sm"
                    disabled={isLoading}
                />
                <button onClick={handleSend} disabled={isLoading || !input.trim()} className="bg-teal-600 hover:bg-teal-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white p-2 rounded-full transition-colors">
                    <SendIcon />
                </button>
            </div>
        </div>
    );
};

const SaveJobButton: React.FC<{
    source: { uri: string; title: string };
    onSave: (source: { uri: string; title: string }) => void;
    applications: Application[];
    saveState: SaveState;
}> = ({ source, onSave, applications, saveState }) => {
    const isAlreadySaved = useMemo(() =>
        applications.some(app => app.url === source.uri),
        [applications, source.uri]
    );

    const buttonContent: Record<SaveState | 'saved_already', { text: string; icon?: React.ReactNode; disabled: boolean }> = {
        'saved_already': { text: 'Saved', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>, disabled: true },
        'idle': { text: 'Save', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v12l-5-3-5 3V4z" /></svg>, disabled: false },
        'saving': { text: 'Saving', icon: <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></div>, disabled: true },
        'saved': { text: 'Saved', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>, disabled: true },
        'error': { text: 'Error', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>, disabled: false },
    };

    const state = isAlreadySaved ? 'saved_already' : saveState;
    const { text, icon, disabled } = buttonContent[state];

    const colorClasses = state === 'error'
        ? 'bg-red-600/50 text-red-200 hover:bg-red-500/50'
        : 'bg-teal-600/50 text-teal-200 hover:bg-teal-500/50';

    return (
        <button
            onClick={() => onSave(source)}
            disabled={disabled}
            className={`flex-shrink-0 text-xs font-semibold px-2 py-1 rounded-md flex items-center gap-1 transition-colors disabled:opacity-70 disabled:cursor-not-allowed ${colorClasses}`}
            title={state === 'error' ? 'Failed to save. Click to try again.' : text}
        >
            {icon}
            <span>{text}</span>
        </button>
    );
};

export default ChatBot;