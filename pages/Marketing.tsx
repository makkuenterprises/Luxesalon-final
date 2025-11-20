
import React, { useState } from 'react';
import { Sparkles, Send, Copy, Check, MessageSquare, Smartphone } from 'lucide-react';
import { CampaignSegment } from '../types';
import { generateMarketingContent } from '../services/geminiService';

const Marketing = () => {
  const [segment, setSegment] = useState<CampaignSegment>(CampaignSegment.ALL);
  const [goal, setGoal] = useState('');
  const [tone, setTone] = useState('Professional & Inviting');
  const [generatedContent, setGeneratedContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!goal) return;
    setLoading(true);
    setGeneratedContent('');
    
    const content = await generateMarketingContent(segment, goal, tone);
    
    setGeneratedContent(content);
    setLoading(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col space-y-2">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Sparkles className="text-primary" /> AI Campaign Assistant
        </h2>
        <p className="text-slate-500">Generate high-converting SMS and WhatsApp messages for your salon customers using Google Gemini.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Configuration Panel */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-6 order-2 lg:order-1">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Target Audience</label>
            <select 
              className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary/20 outline-none"
              value={segment}
              onChange={(e) => setSegment(e.target.value as CampaignSegment)}
            >
              {Object.values(CampaignSegment).map(seg => (
                <option key={seg} value={seg}>{seg}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Campaign Goal</label>
            <input 
              type="text" 
              placeholder="e.g., Announce Diwali Offer 20% off"
              className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 outline-none"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Tone of Voice</label>
            <div className="grid grid-cols-3 gap-3">
              {['Professional', 'Exciting', 'Urgent'].map(t => (
                <button
                  key={t}
                  onClick={() => setTone(t)}
                  className={`py-2 px-2 sm:px-4 rounded-lg text-xs sm:text-sm border transition-all ${
                    tone === t 
                      ? 'bg-primary/10 border-primary text-primary font-semibold' 
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <button 
            onClick={handleGenerate}
            disabled={loading || !goal}
            className="w-full bg-gradient-to-r from-primary to-violet-600 text-white py-3 rounded-xl font-bold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="animate-pulse">Generating Magic...</span>
            ) : (
              <>
                <Sparkles size={18} /> Generate Content
              </>
            )}
          </button>
        </div>

        {/* Preview Panel */}
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 flex flex-col h-full order-1 lg:order-2">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Live Preview</h3>
          
          <div className="flex-1 bg-white border border-slate-200 rounded-xl p-4 relative shadow-sm min-h-[200px]">
            <div className="absolute -top-3 left-4 bg-green-100 text-green-700 px-2 py-0.5 rounded-md text-xs font-bold flex items-center gap-1">
               <MessageSquare size={12} /> WhatsApp
            </div>
            
            {generatedContent ? (
              <div className="prose prose-sm text-slate-800 mt-2 whitespace-pre-wrap">
                {generatedContent}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 text-sm">
                <Smartphone size={48} className="mb-3 opacity-50" />
                <p>Your generated message will appear here.</p>
              </div>
            )}
          </div>

          <div className="mt-6 flex flex-col sm:flex-row gap-4">
            <button 
               onClick={copyToClipboard}
               disabled={!generatedContent}
               className="flex-1 flex items-center justify-center gap-2 bg-white border border-slate-200 py-3 rounded-xl font-semibold text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
               {copied ? <Check size={18} className="text-green-500"/> : <Copy size={18} />}
               {copied ? 'Copied!' : 'Copy Text'}
            </button>
             <button 
               disabled={!generatedContent}
               className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 shadow-lg shadow-green-600/20"
            >
               <Send size={18} /> Send Campaign
            </button>
          </div>
        </div>
      </div>
      
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3 items-start">
        <div className="bg-blue-100 p-2 rounded-full text-blue-600 flex-shrink-0">
          <Smartphone size={20} />
        </div>
        <div>
          <h4 className="font-bold text-blue-800">Backend Integration Note</h4>
          <p className="text-sm text-blue-700 mt-1">In the full Laravel version, clicking "Send Campaign" would queue jobs via the Laravel Queue system and dispatch messages using the WhatsApp Cloud API or Twilio/MSG91 based on the customer segments stored in MySQL.</p>
        </div>
      </div>
    </div>
  );
};

export default Marketing;
