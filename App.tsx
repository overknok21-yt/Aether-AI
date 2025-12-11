import React, { useState, useRef, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Login from './components/Login';
import ToolsPanel from './components/ToolsPanel';
import { 
  Send, 
  Paperclip, 
  Loader2, 
  AlertCircle
} from 'lucide-react';
import { 
  Message, 
  NavSection, 
  AppMode, 
  User, 
  ImageGenConfig
} from './types';
import * as Gemini from './services/geminiService';

const INITIAL_USER: User = {
  name: "Demo User",
  email: "user@example.com",
  avatar: "https://picsum.photos/200"
};

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  
  // App State
  const [currentMode, setCurrentMode] = useState<AppMode>('flash');
  const [activeSection, setActiveSection] = useState<NavSection>('chat');
  
  // Chat State
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // File Upload State
  const [attachedImage, setAttachedImage] = useState<{data: string, mimeType: string} | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Config State
  const [imageConfig, setImageConfig] = useState<ImageGenConfig>({
    size: '1K',
    aspectRatio: '1:1'
  });
  
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleLogin = () => {
    // Simulating OAuth flow
    setTimeout(() => {
      setUser(INITIAL_USER);
      setIsAuthenticated(true);
      setMessages([{
        id: 'welcome',
        role: 'system',
        text: 'Welcome to Aether. How can I help you today?',
        timestamp: Date.now()
      }]);
    }, 800);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
    setMessages([]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        // Remove data URL prefix for API
        const base64Data = base64String.split(',')[1];
        setAttachedImage({
          data: base64Data,
          mimeType: file.type
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const clearAttachment = () => {
    setAttachedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if ((!input.trim() && !attachedImage) || isLoading) return;

    const userMsgId = Date.now().toString();
    const newUserMsg: Message = {
      id: userMsgId,
      role: 'user',
      text: input,
      timestamp: Date.now(),
      attachments: attachedImage ? [{
        type: 'image',
        mimeType: attachedImage.mimeType,
        data: attachedImage.data,
        url: `data:${attachedImage.mimeType};base64,${attachedImage.data}`
      }] : undefined
    };

    setMessages(prev => [...prev, newUserMsg]);
    setInput('');
    setIsLoading(true);
    setError(null);
    
    // Capture state for async call
    const prompt = input;
    const imgData = attachedImage;
    clearAttachment();

    try {
      let responseContent = "";
      let responseAttachments = undefined;

      if (activeSection === 'imagine') {
        // Image Generation
        const imageUrl = await Gemini.generateImage(prompt, currentMode, imageConfig, imgData ? {data: imgData.data, mimeType: imgData.mimeType} : undefined);
        responseContent = `Here is your generated image based on: "${prompt}"`;
        responseAttachments = [{
          type: 'image' as const,
          mimeType: 'image/png',
          data: '', // Not storing full base64 in history to save mem, relying on URL for display
          url: imageUrl
        }];
      } else {
        // Chat & Analysis
        const historyForApi = messages.filter(m => m.role !== 'system').map(m => ({
            role: m.role,
            parts: [{ text: m.text }] // Simplified history, actual app might need to store images in history
        }));
        
        responseContent = await Gemini.generateChatResponse(
          historyForApi, 
          prompt, 
          currentMode,
          imgData ? { inlineData: { data: imgData.data, mimeType: imgData.mimeType } } : undefined
        );
      }

      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'model',
        text: responseContent,
        timestamp: Date.now(),
        attachments: responseAttachments
      }]);

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong.");
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'system',
        text: `Error: ${err.message || "An unexpected error occurred."}`,
        timestamp: Date.now()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated || !user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-100">
      <Sidebar 
        activeSection={activeSection}
        onNavigate={setActiveSection}
        currentMode={currentMode}
        onToggleMode={() => setCurrentMode(prev => prev === 'flash' ? 'detail' : 'flash')}
        user={user}
        onLogout={handleLogout}
      />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Header Area (Empty for now, or breadcrumbs) */}
        
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6" ref={scrollRef}>
          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-4 max-w-4xl mx-auto ${msg.role === 'user' ? 'justify-end' : ''}`}>
              {msg.role !== 'user' && (
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 
                  ${msg.role === 'system' ? 'bg-red-500/20 text-red-400' : 'bg-gradient-to-br from-indigo-500 to-purple-600'}`}>
                  {msg.role === 'system' ? <AlertCircle size={16}/> : <span className="text-xs font-bold">AI</span>}
                </div>
              )}
              
              <div className={`space-y-2 max-w-[80%] ${msg.role === 'user' ? 'items-end flex flex-col' : ''}`}>
                {msg.attachments?.map((att, idx) => (
                  <div key={idx} className="rounded-lg overflow-hidden border border-zinc-800 shadow-lg bg-black">
                     {att.type === 'image' && (
                       <img src={att.url} alt="Generated or uploaded" className="max-w-full max-h-96 object-contain" />
                     )}
                     {att.type === 'video' && (
                       <video src={att.url} controls className="max-w-full max-h-96" />
                     )}
                  </div>
                ))}
                
                {msg.text && (
                  <div className={`p-4 rounded-2xl ${
                    msg.role === 'user' 
                      ? 'bg-zinc-800 text-white rounded-br-none' 
                      : msg.role === 'system' 
                        ? 'bg-red-900/10 border border-red-900/30 text-red-200' 
                        : 'bg-zinc-900 border border-zinc-800 rounded-bl-none'
                  }`}>
                    <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
             <div className="flex gap-4 max-w-4xl mx-auto">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0 animate-pulse">
                  <span className="text-xs font-bold">AI</span>
                </div>
                <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl rounded-bl-none flex items-center gap-3">
                  <Loader2 className="w-4 h-4 animate-spin text-zinc-400" />
                  <span className="text-sm text-zinc-400">
                    {currentMode === 'detail' ? 'Thinking deeply...' : 'Processing...'}
                  </span>
                </div>
             </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 bg-zinc-950 border-t border-zinc-800">
          <div className="max-w-4xl mx-auto space-y-4">
             {attachedImage && (
                <div className="flex items-center gap-3 p-2 bg-zinc-900 rounded-lg w-fit border border-zinc-800">
                  <div className="w-10 h-10 rounded overflow-hidden">
                    <img src={`data:${attachedImage.mimeType};base64,${attachedImage.data}`} className="w-full h-full object-cover" />
                  </div>
                  <span className="text-xs text-zinc-400">Image attached</span>
                  <button onClick={clearAttachment} className="ml-2 text-zinc-500 hover:text-red-400">×</button>
                </div>
             )}

            <form onSubmit={handleSubmit} className="relative">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  activeSection === 'imagine' ? "Describe the image you want to create..." : 
                  "Ask anything or upload an image to analyze..."
                }
                className="w-full bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-xl pl-4 pr-32 py-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all shadow-xl"
                disabled={isLoading}
              />
              
              <div className="absolute right-2 top-2 bottom-2 flex items-center gap-1">
                <button 
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition-colors"
                  disabled={isLoading}
                  title="Upload image"
                >
                  <Paperclip className="w-5 h-5" />
                </button>
                <button 
                  type="submit"
                  disabled={!input.trim() && !attachedImage || isLoading}
                  className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </form>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*"
              onChange={handleFileSelect}
            />
             <p className="text-xs text-center text-zinc-600">
              Aether may produce inaccurate info.
            </p>
          </div>
        </div>
      </div>

      <ToolsPanel 
        mode={currentMode} 
        section={activeSection === 'chat' ? 'imagine' : activeSection as any}
        imageConfig={imageConfig}
        setImageConfig={setImageConfig}
      />
      {/* Hide ToolsPanel when in chat mode */}
      <style>{`
        ${activeSection === 'chat' ? '.hidden-lg-block { display: none !important; }' : ''}
      `}</style>
    </div>
  );
};

export default App;