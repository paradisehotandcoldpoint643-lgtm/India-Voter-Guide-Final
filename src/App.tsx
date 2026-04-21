/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckCircle2, 
  MapPin, 
  Calendar, 
  Info, 
  MessageSquare, 
  ArrowRight, 
  ChevronRight,
  Vote,
  FileText,
  UserCheck,
  Send,
  Loader2,
  Sparkles,
  RefreshCcw,
  School,
  ExternalLink
} from 'lucide-react';
import { getElectionGuidance } from './services/geminiService';

type RegistrationStatus = 'registered' | 'not_registered' | 'unsure';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", 
  "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", 
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", 
  "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands", "Chandigarh", 
  "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
];

const OnboardingStep1 = ({ onStart }: any) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    className="max-w-2xl mx-auto text-center space-y-8"
  >
    <div className="space-y-4">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-100 text-orange-600 mb-4 animate-pulse">
        <Vote size={32} />
      </div>
      <h1 className="heading-display text-5xl lg:text-6xl text-slate-900">
        Largest democracy in the <span className="text-orange-600">world.</span>
      </h1>
      <p className="text-xl text-slate-600 max-w-lg mx-auto">
        Navigate the Indian election process with ease. Get tailored guidance for your State or UT.
      </p>
    </div>
    <button 
      onClick={onStart}
      className="btn-primary bg-orange-600 hover:bg-orange-700 flex items-center gap-2 mx-auto"
    >
      Get Started <ArrowRight size={20} />
    </button>
  </motion.div>
);

const OnboardingStep2 = ({ location, setLocation, registrationStatus, setRegistrationStatus, onFinish }: any) => (
  <motion.div 
    initial={{ opacity: 0, x: 50 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -50 }}
    className="max-w-xl mx-auto space-y-8"
  >
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-semibold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2">
          <MapPin size={16} /> Where do you reside?
        </label>
        <select 
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="w-full p-4 bg-white border border-slate-200 rounded-xl shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all outline-none"
        >
          <option value="">Select your State/UT</option>
          {INDIAN_STATES.map(state => (
            <option key={state} value={state}>{state}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2">
          <UserCheck size={16} /> Have you registered for your Voter ID (EPIC)?
        </label>
        <div className="grid grid-cols-1 gap-3">
          {[
            { id: 'registered', label: 'I have my Voter ID (EPIC)', icon: CheckCircle2 },
            { id: 'not_registered', label: 'I am not registered yet', icon: School },
            { id: 'unsure', label: 'I am not sure of my status', icon: Info },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setRegistrationStatus(item.id as RegistrationStatus)}
              className={`flex items-center gap-4 p-4 rounded-xl border transition-all text-left ${
                registrationStatus === item.id 
                  ? 'border-orange-500 bg-orange-50 text-orange-700 ring-1 ring-orange-500' 
                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
              }`}
            >
              <item.icon size={20} className={registrationStatus === item.id ? 'text-orange-600' : 'text-slate-400'} />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>

    <button 
      disabled={!location}
      onClick={onFinish}
      className="w-full btn-primary bg-orange-600 hover:bg-orange-700 flex items-center justify-center gap-2 mt-8"
    >
      Generate My Guide <Sparkles size={20} />
    </button>
  </motion.div>
);

const Dashboard = ({ location, registrationStatus, guidance, isLoading, messages, setStep, setOnboardingStep, handleSendMessage, inputValue, setInputValue, chatEndRef }: any) => (
  <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
    {/* Sidebar: Status & Quick Info */}
    <div className="lg:col-span-4 space-y-6">
      <div className="card-glass space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="heading-display text-xl">Voter Profile</h2>
          <button 
            onClick={() => { setStep('onboarding'); setOnboardingStep(2); }}
            className="text-slate-400 hover:text-orange-600 transition-colors"
          >
            <RefreshCcw size={18} />
          </button>
        </div>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
            <MapPin size={18} className="text-orange-500" />
            <div>
              <p className="text-xs text-slate-500 uppercase font-bold tracking-tight">Location</p>
              <p className="font-semibold">{location}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
            <UserCheck size={18} className="text-orange-500" />
            <div>
              <p className="text-xs text-slate-500 uppercase font-bold tracking-tight">Voter Status</p>
              <p className="font-semibold capitalize">{registrationStatus.replace('_', ' ')}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card-glass bg-orange-600 text-white border-none space-y-4 shadow-orange-200">
        <div className="inline-flex p-2 bg-white/20 rounded-lg">
          <Info size={20} />
        </div>
        <h3 className="font-display font-bold text-lg">ECI Guidelines</h3>
        <p className="text-orange-100 text-sm leading-relaxed">
          Verify your name in the Voter List directly on the ECI portal to ensure your voting rights.
        </p>
        <a 
          href={`https://voters.eci.gov.in/`} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-sm font-semibold hover:underline"
        >
          ECI Official Portal <ExternalLink size={14} />
        </a>
      </div>
    </div>

    {/* Main Content: Guidance & Chat */}
    <div className="lg:col-span-8 space-y-8">
      <div className="card-glass min-h-[400px]">
        <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
          <h2 className="heading-display text-2xl flex items-center gap-2">
            <FileText className="text-orange-600" size={24} /> Election Guide for India
          </h2>
          {isLoading && !guidance && (
            <div className="flex items-center gap-2 text-orange-600 text-sm font-medium">
              <Loader2 className="animate-spin" size={16} /> Fetching ECI data...
            </div>
          )}
        </div>
        
        <div className="prose prose-slate max-w-none">
          {isLoading && !guidance ? (
            <div className="space-y-4 animate-pulse">
              <div className="h-4 bg-slate-200 rounded w-3/4"></div>
              <div className="h-4 bg-slate-200 rounded w-full"></div>
              <div className="h-4 bg-slate-200 rounded w-5/6"></div>
              <div className="h-4 bg-slate-200 rounded w-1/2 mt-8"></div>
              <div className="h-4 bg-slate-200 rounded w-full"></div>
            </div>
          ) : (
            <div className="whitespace-pre-wrap text-slate-700 leading-relaxed text-lg">
              {guidance}
            </div>
          )}
        </div>
      </div>

      {/* Chat Assistant */}
      <div className="card-glass flex flex-col h-[600px]">
        <div className="flex items-center gap-3 mb-4 border-b border-slate-100 pb-4">
          <div className="w-10 h-10 rounded-full bg-orange-600 flex items-center justify-center text-white">
            <MessageSquare size={20} />
          </div>
          <div>
            <h3 className="font-display font-bold">ECI Assistant</h3>
            <p className="text-xs text-green-500 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> Online & Searching
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-6 mb-4 px-2 custom-scrollbar">
          {messages.map((m: any, i: number) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] p-4 rounded-2xl ${
                m.role === 'user' 
                  ? 'bg-orange-600 text-white rounded-tr-none' 
                  : 'bg-slate-100 text-slate-800 rounded-tl-none'
              }`}>
                <p className="whitespace-pre-wrap text-sm md:text-base">{m.content}</p>
              </div>
            </div>
          ))}
          {isLoading && messages.length > 0 && messages[messages.length-1].role === 'user' && (
            <div className="flex justify-start">
              <div className="bg-slate-100 p-4 rounded-2xl rounded-tl-none flex gap-1">
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <form onSubmit={handleSendMessage} className="relative">
          <input 
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask about EPIC card, polling booths, or deadlines..."
            className="w-full p-4 pr-16 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
          />
          <button 
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className="absolute right-2 top-2 p-2 bg-orange-600 text-white rounded-lg disabled:opacity-50 hover:bg-orange-700 transition-all"
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  </div>
);

export default function App() {
  const [step, setStep] = useState<'onboarding' | 'dashboard'>('onboarding');
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [location, setLocation] = useState('');
  const [registrationStatus, setRegistrationStatus] = useState<RegistrationStatus>('unsure');
  const [guidance, setGuidance] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleStartOnboarding = () => setOnboardingStep(2);

  const handleFinishOnboarding = async () => {
    setIsLoading(true);
    setStep('dashboard');
    try {
      const result = await getElectionGuidance({ location, registrationStatus });
      setGuidance(result || "Could not retrieve guidance at this time.");
      setMessages([{ role: 'assistant', content: "Hello! I've analyzed the election process for your location. How else can I help you today?" }]);
    } catch (error) {
      console.error(error);
      setGuidance("Error loading personalized guidance. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage = inputValue;
    setInputValue('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const result = await getElectionGuidance({ 
        location, 
        registrationStatus, 
        specificQuestion: userMessage 
      });
      setMessages(prev => [...prev, { role: 'assistant', content: result || "I'm sorry, I couldn't process that request." }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: "I encountered an error while searching for information. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen border-t-8 border-orange-600 flex flex-col font-sans">
      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between bg-white/50 backdrop-blur-sm sticky top-0 z-50 border-b border-white/20">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-orange-600 flex items-center justify-center rounded-lg shadow-lg shadow-orange-200">
            <Vote className="text-white" size={20} />
          </div>
          <span className="font-display font-bold text-xl md:text-2xl tracking-tighter text-slate-900">IndiaVoterGuide AI</span>
        </div>
        <nav className="hidden md:flex items-center gap-6">
          <a href="#" className="text-sm font-semibold text-slate-600 hover:text-orange-600 transition-colors">Resources</a>
          <a href="#" className="text-sm font-semibold text-slate-600 hover:text-orange-600 transition-colors">Contact</a>
          <button className="btn-primary bg-orange-600 hover:bg-orange-700 text-sm py-2 px-4">Register Now</button>
        </nav>
      </header>

      <main className="flex-1 flex items-center justify-center p-6 relative">
        {/* Background Accents */}
        <div className="absolute inset-0 overflow-hidden -z-10 pointer-events-none">
          <div className="absolute top-1/4 -left-20 w-80 h-80 bg-orange-200 rounded-full blur-[120px] opacity-20"></div>
          <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-blue-200 rounded-full blur-[120px] opacity-20"></div>
        </div>

        <div className="w-full max-w-7xl transition-all">
          <AnimatePresence mode="wait">
            {step === 'onboarding' ? (
              onboardingStep === 1 ? (
                <OnboardingStep1 key="s1" onStart={handleStartOnboarding} />
              ) : (
                <OnboardingStep2 
                  key="s2" 
                  location={location} 
                  setLocation={setLocation} 
                  registrationStatus={registrationStatus} 
                  setRegistrationStatus={setRegistrationStatus}
                  onFinish={handleFinishOnboarding}
                />
              )
            ) : (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full"
              >
                <Dashboard 
                  location={location}
                  registrationStatus={registrationStatus}
                  guidance={guidance}
                  isLoading={isLoading}
                  messages={messages}
                  setStep={setStep}
                  setOnboardingStep={setOnboardingStep}
                  handleSendMessage={handleSendMessage}
                  inputValue={inputValue}
                  setInputValue={setInputValue}
                  chatEndRef={chatEndRef}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <footer className="p-6 text-center text-slate-400 text-sm border-t border-slate-100">
        <p>© 2026 IndiaVoterGuide AI. Information sourced from ECI guidelines. Always verify with official sources.</p>
      </footer>
    </div>
  );
}


