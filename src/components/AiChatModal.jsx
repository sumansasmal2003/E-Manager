// src/components/AiChatModal.jsx
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Send, User, Loader2, Zap, Mic } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosConfig';
import ReactMarkdown from 'react-markdown';
import Modal from './Modal';
import { useModal } from '../context/ModalContext';

// Helper for random "typing" delay
const randomSleep = (min = 30, max = 110) => {
  const duration = Math.floor(Math.random() * (max - min + 1)) + min;
  return new Promise(resolve => setTimeout(resolve, duration));
};
const initialSleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// --- 1. NEW: DEFINE THE RICH WELCOME MESSAGE ---
const initialAiMessage = {
  role: 'ai',
  content: `
Hello! I am your E-Manager assistant. I have full access to your account data and can help you read, create, update, and delete information.

Here are a few examples of what you can ask me to do:

**Find Information (Read-Only):**
* "How many tasks are pending for the 'Fixspire' team?"
* "Show me all of Suman's tasks."
* "What's on my schedule for next Friday?"

**Create New Items:**
* "Create a task for 'Develop Homepage', assign it to 'John' on the 'Frontend' team, and make it due tomorrow."
* "Schedule a 'Team Sync' for Wednesday at 10 AM for the 'Backend' team."
* "Add a new personal note titled 'My Q4 Goals'."

**Update Existing Items:**
* "Change the status of the 'Design Homepage' task to 'Completed'."
* "Reschedule the 'Team Sync' meeting to 3 PM."
* "Update my 'Q4 Goals' note with the content 'Focus on user growth'."

**Delete Items:**
* "Delete the task 'Old Reports'."
* "Cancel the 'Team Sync' meeting."

How can I help you today?
  `
};

// --- (ChatMessage component is unchanged) ---
const ChatMessage = ({ message, isTyping }) => {
  const { role, content } = message;
  const isUser = role === 'user';
  const isAi = role ==='ai';
  const { user } = useAuth();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
    >
      <div className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isUser ? 'bg-gray-900 text-white' : 'bg-gray-100'}`}>
          {isUser ? <span className="font-bold">{user?.username?.charAt(0).toUpperCase() || 'U'}</span> : <Brain size={20} className="text-gray-900" />}
        </div>
        <div className={`p-4 rounded-xl max-w-lg ${isUser ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200'}`}>
          <div className="prose prose-sm text-inherit">
            <ReactMarkdown>{content}</ReactMarkdown>
            {isAi && isTyping && <span className="typing-cursor" />}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Main Chat Modal Component
const AiChatModal = () => {
  const { modalState, closeModal } = useModal();
  const isOpen = modalState.aiChat;

  // --- 2. UPDATE: Use the new initial message ---
  const [messages, setMessages] = useState([initialAiMessage]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  const [isListening, setIsListening] = useState(false);
  const [isSpeechSupported, setIsSpeechSupported] = useState(false);
  const recognitionRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages, isLoading, isTyping]);

  useEffect(() => {
    // Check for browser support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setIsSpeechSupported(true);
      const recognition = new SpeechRecognition();

      // --- THIS IS THE ONLY CHANGE ---
      recognition.continuous = true; // Was false
      // --- END OF CHANGE ---

      recognition.interimResults = true; // Show results as user speaks
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        // This logic correctly handles continuous mode
        setInput(finalTranscript + interimTranscript);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setError(`Speech error: ${event.error}`);
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } else {
      console.warn("Speech recognition not supported by this browser.");
      setIsSpeechSupported(false);
    }
  }, []);

  const handleClose = () => {
    closeModal('aiChat');
    // --- 3. UPDATE: Reset to the initial message on close ---
    setTimeout(() => {
      setMessages([initialAiMessage]);
      setInput('');
      setError(null);
    }, 300); // Delay to allow animation
  };

  // --- (handleSubmit function is unchanged) ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading || isTyping) return;

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

        // --- THIS IS THE FIX ---
        // We now use the 100% immutable (and correct) way to update.
        setMessages(prev => {
          // 1. Create a copy of the messages array
          const newMessages = [...prev];

          // 2. Get the index of the last message
          const lastMessageIndex = newMessages.length - 1;

          // 3. Create a *new* object for the last message
          const updatedLastMessage = {
            ...newMessages[lastMessageIndex], // Copy old properties
            // Append the new word to its content
            content: newMessages[lastMessageIndex].content + word + ' ',
          };

          // 4. Replace the old message with the new one
          newMessages[lastMessageIndex] = updatedLastMessage;

          // 5. Return the new, immutable array
          return newMessages;
        });
        // --- END OF FIX ---

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
      setInput(''); // Clear input before starting
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Get Your Ans">
      <div className="flex flex-col h-[70vh]">
        {/* CSS for animations (unchanged) */}
        <style>
          {`
            .typing-cursor {
              display: inline-block;
              width: 8px;
              height: 1em;
              background-color: currentColor;
              margin-left: 4px;
              animation: blink 1s infinite;
            }
            @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }

            .gemini-loader {
              display: flex; align-items: center; justify-content: center;
              height: 20px; width: 50px;
            }
            .gemini-loader div {
              width: 8px; height: 100%; margin: 0 2px;
              background-color: #9ca3af; border-radius: 4px;
              animation: gemini-pulse 1.2s infinite;
            }
            .gemini-loader div:nth-child(1) { animation-delay: 0s; }
            .gemini-loader div:nth-child(2) { animation-delay: 0.2s; }
            .gemini-loader div:nth-child(3) { animation-delay: 0.4s; }
            @keyframes gemini-pulse {
              0%, 100% { transform: scaleY(0.5); opacity: 0.5; }
              50% { transform: scaleY(1); opacity: 1; }
            }
          `}
        </style>

        {/* Chat Messages (unchanged) */}
        <div className="flex-1 overflow-y-auto pr-2 space-y-4 pb-4">
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
              className="flex justify-start mb-4"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Brain size={20} className="text-gray-900" />
                </div>
                <div className="p-4 rounded-xl bg-white border border-gray-200 flex items-center space-x-2">
                  <div className="gemini-loader" />
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Form (unchanged) */}
        <div className="pt-4 border-t border-gray-200">
          <form onSubmit={handleSubmit} className="flex items-center space-x-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isListening ? "Listening..." : "Ask about your tasks, members..."}
              className="flex-1 w-full pl-4 pr-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900"
              disabled={isLoading || isTyping || isListening}
            />

            {/* NEW: MIC BUTTON */}
            {isSpeechSupported && (
              <button
                type="button"
                onClick={handleToggleListen}
                disabled={isLoading || isTyping}
                className={`p-3 rounded-lg transition-all duration-200 shadow-lg ${
                  isListening
                    ? 'mic-listening-button' // Red pulsing button
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
                } disabled:opacity-50`}
              >
                <Mic size={20} />
              </button>
            )}

            {/* SEND BUTTON */}
            <button
              type="submit"
              disabled={isLoading || isTyping || !input.trim()}
              className="bg-gray-900 text-white p-3 rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-all duration-200 shadow-lg"
            >
              {(isLoading || isTyping) ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
            </button>
          </form>
        </div>
      </div>
    </Modal>
  );
};

export default AiChatModal;
