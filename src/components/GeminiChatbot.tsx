
import React, { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Globe, AlertCircle, RefreshCw } from "lucide-react";
import { ChatMessage } from "../types";

export default function GeminiChatbot() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome_msg",
      text: "Mbote / Bonjour! I am your PropSpace AI Agent. I can help you find listings in Douala or Yaoundé, calculate mortgage terms, or search the web for Cameroonian real estate regulations (like Land Titles / Titre Foncier). Ask me anything!",
      sender: "agent",
      timestamp: new Date().toISOString()
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: "msg_" + Math.random().toString(36).substring(7),
      text: textToSend,
      sender: "user",
      timestamp: new Date().toISOString()
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          history: messages.slice(-10) // Send up to last 10 messages for context
        })
      });

      const data = await response.json();
      if (response.ok) {
        const agentMsg: ChatMessage = {
          id: "msg_" + Math.random().toString(36).substring(7),
          text: data.text,
          sender: "agent",
          timestamp: new Date().toISOString(),
          isGroundingUsed: data.isGroundingUsed,
          groundingSources: data.sources
        };
        setMessages((prev) => [...prev, agentMsg]);
      } else {
        throw new Error(data.error || "Failed to talk to Gemini AI");
      }
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: "error_" + Math.random().toString(36).substring(7),
        text: "Pardon! I couldn't reach the backend. If you are running locally, make sure your server is online and you've provided the GEMINI_API_KEY in Settings Secrets.",
        sender: "agent",
        timestamp: new Date().toISOString()
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = [
    "What is MINDCAF & Land Certificate (Titre Foncier) in Cameroon?",
    "Show average rental prices in bastos, yaoundé",
    "What are Cameroon property transaction tax rates?",
    "Tell me about Kribi real estate investment potential"
  ];

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl flex flex-col h-[600px] text-slate-100 shadow-xl shadow-slate-950/20" id="gemini-chatbot-container">
      {/* Chat Header */}
      <div className="p-5 bg-indigo-600 rounded-t-2xl flex items-center justify-between text-white shadow-lg shadow-indigo-600/10">
        <div className="flex items-center gap-3">
          <div className="bg-white/10 p-2 rounded-xl backdrop-blur-md">
            <Bot className="h-5 w-5 text-indigo-200 animate-pulse" />
          </div>
          <div>
            <h3 className="font-bold text-sm leading-none font-sans">PropSpace AI Concierge</h3>
            <span className="text-xs text-indigo-100 mt-1.5 flex items-center gap-1.5 font-medium">
              <Globe className="h-3 w-3" />
              Google Search Grounding Enabled
            </span>
          </div>
        </div>
        <span className="text-xs bg-indigo-700/50 px-2.5 py-1 rounded-md font-mono text-indigo-200 border border-indigo-500/20">gemini-3.5-flash</span>
      </div>

      {/* Message Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-950/20">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 max-w-[85%] ${
              msg.sender === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
            }`}
          >
            {/* Avatar */}
            <div className={`p-2 h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 border ${
              msg.sender === "user" ? "bg-indigo-600/20 text-indigo-400 border-indigo-500/30" : "bg-slate-900 text-indigo-400 border-slate-700"
            }`}>
              {msg.sender === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
            </div>

            {/* Message Bubble */}
            <div className="space-y-1.5">
              <div className={`p-3.5 rounded-2xl text-sm leading-relaxed ${
                msg.sender === "user"
                  ? "bg-indigo-600 text-white rounded-tr-none shadow-md"
                  : "bg-slate-900 text-slate-200 border border-slate-800 rounded-tl-none whitespace-pre-wrap shadow-md"
              }`}>
                {msg.text}
              </div>

              {/* Grounding Sources Panel */}
              {msg.isGroundingUsed && msg.groundingSources && msg.groundingSources.length > 0 && (
                <div className="bg-indigo-950/40 border border-indigo-900/40 p-3.5 rounded-xl space-y-2 max-w-full">
                  <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-1">
                    <Globe className="h-3 w-3" />
                    Web Verified Sources:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {msg.groundingSources.map((source, index) => (
                      <a
                        key={index}
                        href={source.uri}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-indigo-300 hover:text-white bg-slate-900 border border-indigo-950/60 px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-md truncate max-w-[240px]"
                      >
                        <Globe className="h-3 w-3 text-indigo-400 flex-shrink-0" />
                        <span className="truncate">{source.title || "Search Result"}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-3 max-w-[80%] mr-auto">
            <div className="p-2 h-8 w-8 rounded-full bg-slate-900 text-indigo-400 border border-slate-700 flex items-center justify-center">
              <Bot className="h-4 w-4 animate-spin" />
            </div>
            <div className="bg-slate-900 text-slate-400 border border-slate-800 shadow-md p-3.5 rounded-2xl rounded-tl-none text-sm flex items-center gap-2">
              <Globe className="h-3.5 w-3.5 animate-spin text-indigo-400" />
              <span>PropSpace Agent is searching Google & analyzing listings...</span>
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Suggested Quick Prompts */}
      {messages.length === 1 && (
        <div className="p-3.5 bg-slate-950/40 border-t border-slate-800">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Try asking:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {quickPrompts.map((p, idx) => (
              <button
                key={idx}
                id={`quick-prompt-${idx}`}
                onClick={() => handleSend(p)}
                className="text-left text-xs bg-slate-900 hover:bg-indigo-950/40 hover:border-indigo-500/30 border border-slate-800 p-3 rounded-xl text-slate-400 hover:text-indigo-400 shadow-md transition-all truncate cursor-pointer"
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend(input);
        }}
        className="p-3.5 border-t border-slate-800 bg-slate-900/20 flex gap-2"
      >
        <input
          id="chat-input-text"
          type="text"
          placeholder="Ask about properties, rental deposits, tax laws..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
          className="flex-1 bg-slate-950 border border-slate-800 text-slate-100 placeholder:text-slate-700 rounded-xl px-4 py-3 text-sm focus:outline-hidden focus:border-indigo-500 transition-all disabled:bg-slate-900 disabled:text-slate-500"
        />
        <button
          id="chat-btn-submit"
          type="submit"
          disabled={!input.trim() || loading}
          className="bg-indigo-600 hover:bg-indigo-500 text-white p-3 rounded-xl disabled:bg-slate-800 disabled:text-slate-600 transition-all cursor-pointer"
        >
          <Send className="h-4.5 w-4.5" />
        </button>
      </form>
    </div>
  );
}
