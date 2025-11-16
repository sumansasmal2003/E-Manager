// src/pages/AiChatPage.jsx
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Send, User, Loader2, Edit, Check, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosConfig';
import ReactMarkdown from 'react-markdown';

// Simple Message Component
const ChatMessage = ({ message, isLatest, onEdit, isEditing, onSaveEdit, onCancelEdit, canEdit }) => {
  const { role, content, id } = message;
  const isUser = role === 'user';
  const { user } = useAuth();
  const [editedContent, setEditedContent] = useState(content);

  const handleSave = () => {
    if (editedContent.trim() && editedContent !== content) {
      onSaveEdit(id, editedContent);
    } else {
      onCancelEdit();
    }
  };

  const handleCancel = () => {
    setEditedContent(content);
    onCancelEdit();
  };

  useEffect(() => {
    if (isEditing) {
      setEditedContent(content);
    }
  }, [isEditing, content]);

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-6`}>
      <div className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'} max-w-2xl w-full`}>
        {/* Simple Avatar */}
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
          isUser ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600'
        }`}>
          {isUser ? (
            <span className="text-xs font-medium">{user?.username?.charAt(0).toUpperCase() || 'U'}</span>
          ) : (
            <Brain size={16} />
          )}
        </div>

        {/* Message Content */}
        <div className="flex-1 min-w-0">
          {isUser && canEdit && !isEditing && (
            <button
              className="mb-1 text-gray-400 hover:text-gray-600 transition-colors text-xs flex items-center gap-1"
              onClick={() => onEdit(id)}
            >
              <Edit size={12} />
              Edit
            </button>
          )}

          <div className={`rounded-lg ${
            isEditing ? 'ring-1 ring-blue-500' : ''
          }`}>
            {isEditing ? (
              <div>
                <textarea
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-lg p-3 focus:outline-none focus:border-blue-500 resize-none text-sm"
                  rows={3}
                  autoFocus
                />
                <div className="flex justify-end gap-2 mt-2">
                  <button
                    onClick={handleCancel}
                    className="px-3 py-1 text-gray-600 hover:text-gray-800 text-sm flex items-center gap-1"
                  >
                    <X size={14} />
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={!editedContent.trim()}
                    className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 disabled:opacity-50 flex items-center gap-1"
                  >
                    <Check size={14} />
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <div className={`px-4 py-3 rounded-lg ${
                isUser ? 'bg-gray-800 text-white' : 'bg-gray-50 text-gray-800'
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
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Chat Page
const AiChatPage = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'ai',
      content: "Hello! I'm your E-Manager assistant. I have access to all your teams, tasks, and notes. How can I help you today?",
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [nextId, setNextId] = useState(2);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  // Find the last user message
  const getLastUserMessage = () => {
    const userMessages = messages.filter(msg => msg.role === 'user');
    return userMessages[userMessages.length - 1];
  };

  const lastUserMessage = getLastUserMessage();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = {
      id: nextId,
      role: 'user',
      content: input
    };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);
    setError(null);
    setNextId(nextId + 1);

    try {
      const history = newMessages
        .filter(msg => msg.id !== userMessage.id)
        .map(msg => ({ role: msg.role, content: msg.content }));

      const res = await api.post('/chat/ask', {
        history: history,
        question: input,
      });

      const aiMessage = {
        id: nextId + 1,
        role: 'ai',
        content: res.data.response
      };
      setMessages([...newMessages, aiMessage]);
      setNextId(nextId + 2);
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Sorry, I encountered an error. Please try again.';
      setError(errorMsg);
      const errorMessage = {
        id: nextId + 1,
        role: 'ai',
        content: errorMsg
      };
      setMessages([...newMessages, errorMessage]);
      setNextId(nextId + 1);
    }
    setIsLoading(false);
  };

  const handleEditMessage = (messageId) => {
    setEditingMessageId(messageId);
  };

  const handleSaveEdit = async (messageId, newContent) => {
    setMessages(messages.map(msg =>
      msg.id === messageId ? { ...msg, content: newContent } : msg
    ));
    setEditingMessageId(null);

    const editedIndex = messages.findIndex(msg => msg.id === messageId);
    const updatedMessages = messages.slice(0, editedIndex + 1);

    const editedMessage = messages.find(msg => msg.id === messageId);
    if (editedMessage.role === 'user') {
      setIsLoading(true);

      try {
        const history = updatedMessages
          .slice(0, -1)
          .map(msg => ({ role: msg.role, content: msg.content }));

        const res = await api.post('/chat/ask', {
          history: history,
          question: newContent,
        });

        const aiMessage = {
          id: nextId,
          role: 'ai',
          content: res.data.response
        };
        setMessages([...updatedMessages, aiMessage]);
        setNextId(nextId + 1);
      } catch (err) {
        const errorMsg = err.response?.data?.message || 'Sorry, I encountered an error. Please try again.';
        setError(errorMsg);
        const errorMessage = {
          id: nextId,
          role: 'ai',
          content: errorMsg
        };
        setMessages([...updatedMessages, errorMessage]);
        setNextId(nextId + 1);
      }
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingMessageId(null);
  };

  return (
    <div className="flex flex-col h-full bg-white" style={{ minHeight: 'calc(100vh - 200px)' }}>
      {/* Simple Header */}
      <div className="border-b border-gray-200 bg-white py-6 px-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center">
            <Brain className="text-white" size={20} />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">AI Assistant</h1>
            <p className="text-gray-600 text-sm">Ask me anything about your account</p>
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div className="flex-1 flex flex-col">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-8 py-6">
          <div className="max-w-4xl mx-auto">
            {messages.map((msg, index) => (
              <ChatMessage
                key={msg.id}
                message={msg}
                isLatest={index === messages.length - 1}
                onEdit={handleEditMessage}
                isEditing={editingMessageId === msg.id}
                onSaveEdit={handleSaveEdit}
                onCancelEdit={handleCancelEdit}
                canEdit={lastUserMessage && msg.id === lastUserMessage.id}
              />
            ))}

            {isLoading && (
              <div className="flex justify-start mb-6">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Brain size={16} className="text-gray-600" />
                  </div>
                  <div className="px-4 py-3 bg-gray-50 rounded-lg flex items-center gap-2">
                    <Loader2 size={16} className="animate-spin text-gray-500" />
                    <span className="text-sm text-gray-600">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 bg-white p-6">
          <div className="max-w-4xl mx-auto">
            {editingMessageId && (
              <div className="mb-3 px-4 py-2 bg-blue-50 text-blue-700 text-sm rounded-lg text-center">
                Editing your last message - conversation will continue from this point
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  editingMessageId
                    ? "Finish editing to send new messages..."
                    : "Ask about your tasks, teams, or notes..."
                }
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
                disabled={isLoading || editingMessageId}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim() || editingMessageId}
                className="px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Sending
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    Send
                  </>
                )}
              </button>
            </form>

            {error && (
              <div className="mt-3 px-4 py-2 bg-red-50 text-red-700 text-sm rounded-lg text-center">
                {error}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AiChatPage;
