// src/components/AiChatModal.jsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain, Send, User, Loader2, Zap, Mic,
  ClipboardList, Calendar, FileText, MessageSquare,
  PlusCircle, Edit, Trash2, ArrowLeft,CheckSquare
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosConfig';
import ReactMarkdown from 'react-markdown';
import Modal from './Modal';
import { useModal } from '../context/ModalContext';

// Helper functions
const randomSleep = (min = 30, max = 110) => {
  const duration = Math.floor(Math.random() * (max - min + 1)) + min;
  return new Promise(resolve => setTimeout(resolve, duration));
};

const initialSleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const initialAiMessage = {
  role: 'ai',
  content: "Hello! I am your E-Manager assistant. I have access to all your teams, tasks, and notes. Ask me anything about your account!",
};

// ChatMessage Component
const ChatMessage = ({ message, isTyping }) => {
  const { role, content } = message;
  const isUser = role === 'user';
  const isAi = role === 'ai';
  const { user } = useAuth();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
    >
      <div className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
          isUser ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700'
        }`}>
          {isUser ? (
            <span className="text-sm font-medium">{user?.username?.charAt(0).toUpperCase() || 'U'}</span>
          ) : (
            <Brain size={16} />
          )}
        </div>
        <div className={`px-4 py-3 rounded-lg max-w-lg ${
          isUser ? 'bg-primary text-white' : 'bg-gray-50 text-gray-800'
        }`}>
          <div className="text-sm leading-relaxed">
            <ReactMarkdown
              components={{
                p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                ul: ({ children }) => <ul className="mb-2 list-disc list-inside space-y-1">{children}</ul>,
                ol: ({ children }) => <ol className="mb-2 list-decimal list-inside space-y-1">{children}</ol>,
                strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                code: ({ children }) => <code className="px-1 bg-gray-200 text-gray-800 rounded text-xs">{children}</code>,
              }}
            >
              {content}
            </ReactMarkdown>
            {isAi && isTyping && <span className="typing-cursor" />}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Categories Data with Professional Colors
const categories = {
  tasks: {
    name: 'Tasks',
    icon: ClipboardList,
    actions: [
      { name: 'Create Task', icon: PlusCircle, template: "Create a task for [MEMBER NAME] titled '[TASK TITLE]' due on [DATE]." },
      { name: 'Update Task', icon: Edit, template: "Update the task '[TASK TITLE]' and set its status to [Completed/In Progress/Pending]." },
      { name: 'Delete Task', icon: Trash2, template: "Delete the task named '[TASK TITLE]'." },
    ]
  },
  meetings: {
    name: 'Meetings',
    icon: Calendar,
    actions: [
      { name: 'Schedule Meeting', icon: PlusCircle, template: "Schedule a meeting for the [TEAM NAME] team titled '[MEETING TITLE]' on [DATE] at [TIME]." },
      { name: 'Update Meeting', icon: Edit, template: "Reschedule the '[MEETING TITLE]' meeting to [NEW DATE] at [NEW TIME]." },
      { name: 'Cancel Meeting', icon: Trash2, template: "Cancel the meeting named '[MEETING TITLE]'." },
    ]
  },
  attendance: {
    name: 'Attendance',
    icon: CheckSquare,
    color: 'text-indigo-600 bg-indigo-50',
    actions: [
      { name: 'Set Today\'s Attendance', icon: PlusCircle, template: "Mark [MEMBER NAME / TEAM NAME] as [Present/Absent/Leave/Holiday] for today." },
      { name: 'Find Attendance', icon: MessageSquare, template: "Show me all dates [MEMBER NAME] was [STATUS]." },
    ]
  },
  notes: {
    name: 'Notes',
    icon: FileText,
    actions: [
      { name: 'Create Note', icon: PlusCircle, template: "Create a new personal note titled '[NOTE TITLE]' with the content '[CONTENT]'." },
      { name: 'Update Note', icon: Edit, template: "Update my note '[NOTE TITLE]' and set the content to '[NEW CONTENT]'." },
      { name: 'Delete Note', icon: Trash2, template: "Delete my personal note titled '[NOTE TITLE]'." },
    ]
  },
};

// Main Chat Modal Component
const AiChatModal = () => {
  const { modalState, closeModal } = useModal();
  const isOpen = modalState.aiChat;

  const [messages, setMessages] = useState([initialAiMessage]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // State for UI mode
  const [chatMode, setChatMode] = useState('selection');
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Speech recognition
  const [isListening, setIsListening] = useState(false);
  const [isSpeechSupported, setIsSpeechSupported] = useState(false);
  const recognitionRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages, isLoading, isTyping]);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setIsSpeechSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join('');
        setInput(transcript);
      };

      recognition.onend = () => setIsListening(false);
      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } else {
      setIsSpeechSupported(false);
    }
  }, []);

  const handleClose = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
    closeModal('aiChat');
    setTimeout(() => {
      setMessages([initialAiMessage]);
      setInput('');
      setError(null);
      setIsListening(false);
      setChatMode('selection');
      setSelectedCategory(null);
    }, 300);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading || isTyping) return;

    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    setChatMode('chat');
    setSelectedCategory(null);

    const userMessage = { role: 'user', content: input };
    const history = messages.map(msg => ({ role: msg.role, content: msg.content }));
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const res = await api.post('/chat/ask', {
        history: history,
        question: input,
        timezone: timezone,
      });

      const fullAiResponse = res.data.response;

      setIsLoading(false);
      setIsTyping(true);

      setMessages(prev => [...prev, { role: 'ai', content: '' }]);
      await initialSleep(50);

      const words = fullAiResponse.split(' ');
      for (const word of words) {
        setMessages(prev => {
          const newMessages = [...prev];
          const lastMessageIndex = newMessages.length - 1;
          const updatedLastMessage = {
            ...newMessages[lastMessageIndex],
            content: newMessages[lastMessageIndex].content + word + ' ',
          };
          newMessages[lastMessageIndex] = updatedLastMessage;
          return newMessages;
        });
        await randomSleep();
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Sorry, I encountered an error. Please try again.';
      setError(errorMsg);
      setMessages(prev => [...prev, { role: 'ai', content: errorMsg }]);
    }
    setIsLoading(false);
    setIsTyping(false);
  };

  const handleToggleListen = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      setInput('');
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  const handleActionClick = (template) => {
    setChatMode('chat');
    setInput(template);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  };

  const handleSimpleChatClick = () => {
    setChatMode('chat');
    setInput('');
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="AI Assistant">
      <div className="flex flex-col h-[70vh]">
        <style>{`
          .typing-cursor::after {
            content: '|';
            animation: blink 1s infinite;
          }
          @keyframes blink {
            0%, 50% { opacity: 1; }
            51%, 100% { opacity: 0; }
          }
          .mic-listening-button {
            background-color: #dc2626;
            color: white;
            animation: pulse 2s infinite;
          }
          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
          }
        `}</style>

        <AnimatePresence mode="wait">
          {chatMode === 'selection' ? (
            // SELECTION VIEW
            <motion.div
              key="selection"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 overflow-y-auto"
            >
              <AnimatePresence mode="wait">
                {selectedCategory ? (
                  // Sub-Action View
                  <motion.div
                    key="sub-actions"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <button
                      onClick={() => setSelectedCategory(null)}
                      className="flex items-center space-x-2 text-sm text-gray-600 hover:text-primary font-medium mb-4"
                    >
                      <ArrowLeft size={16} />
                      <span>Back to categories</span>
                    </button>
                    <h3 className="text-lg font-semibold text-primary mb-4">
                      {categories[selectedCategory].name} Actions
                    </h3>
                    <div className="space-y-2">
                      {categories[selectedCategory].actions.map((action) => {
                        const Icon = action.icon;
                        return (
                          <button
                            key={action.name}
                            onClick={() => handleActionClick(action.template)}
                            className="w-full text-left flex items-center space-x-3 p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            <Icon size={18} className="text-gray-700" />
                            <span className="font-medium text-gray-800">{action.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                ) : (
                  // Main Category View
                  <motion.div
                    key="main-categories"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <h3 className="text-lg font-semibold text-primary mb-4">What would you like to do?</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {Object.keys(categories).map(key => {
                        const category = categories[key];
                        const Icon = category.icon;
                        return (
                          <button
                            key={category.name}
                            onClick={() => setSelectedCategory(key)}
                            className="flex items-center space-x-3 p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                          >
                            <Icon size={20} className="text-gray-700" />
                            <span className="font-medium text-gray-800">{category.name}</span>
                          </button>
                        );
                      })}
                      <button
                        onClick={handleSimpleChatClick}
                        className="flex items-center space-x-3 p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        <MessageSquare size={20} className="text-gray-700" />
                        <span className="font-medium text-gray-800">Just Chat</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ) : (
            // CHAT VIEW
            <motion.div
              key="chat"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex-1 overflow-y-auto flex flex-col"
            >
              {/* Chat Messages */}
              <div className="flex-1 space-y-4 pb-4">
                <AnimatePresence>
                  {messages.map((msg, index) => (
                    <ChatMessage
                      key={index}
                      message={msg}
                      isTyping={isTyping && index === messages.length - 1 && msg.role === 'ai'}
                    />
                  ))}
                </AnimatePresence>
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-start"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Brain size={16} className="text-gray-700" />
                      </div>
                      <div className="px-4 py-3 bg-gray-50 rounded-lg flex items-center space-x-2">
                        <Loader2 size={16} className="animate-spin text-gray-500" />
                        <span className="text-sm text-gray-600">Thinking...</span>
                      </div>
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Form */}
              <div className="pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setChatMode('selection');
                    setSelectedCategory(null);
                  }}
                  className="flex items-center space-x-2 text-sm text-gray-600 hover:text-primary font-medium mb-3"
                >
                  <ArrowLeft size={16} />
                  <span>Back to actions</span>
                </button>
                <form onSubmit={handleSubmit} className="flex items-center space-x-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={isListening ? "Listening..." : "Ask about your tasks, teams, or notes..."}
                    className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg text-primary focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm"
                    disabled={isLoading || isTyping || isListening}
                  />
                  {isSpeechSupported && (
                    <button
                      type="button"
                      onClick={handleToggleListen}
                      disabled={isLoading || isTyping}
                      className={`p-2 rounded-lg transition-colors ${
                        isListening
                          ? 'mic-listening-button'
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
                      } disabled:opacity-50`}
                    >
                      <Mic size={18} />
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={isLoading || isTyping || !input.trim()}
                    className="bg-primary text-white p-2 rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors"
                  >
                    {(isLoading || isTyping) ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <Send size={18} />
                    )}
                  </button>
                </form>
                {error && (
                  <div className="mt-2 px-3 py-2 bg-red-50 text-red-700 text-sm rounded-lg text-center">
                    {error}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Modal>
  );
};

export default AiChatModal;
