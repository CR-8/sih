"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { PromptInputBox } from "@/components/ui/ai-prompt-box";
import { motion, AnimatePresence } from 'framer-motion';
import { formatConversationMessage } from '@/lib/markdown-sanitizer';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  source?: 'local_ai_model' | 'gemini' | 'gemini_fallback';
  isQuestion?: boolean;
  options?: string[];
}

interface DesignData {
  project_type?: string;
  audience?: string;
  color_pref?: string;
  layout_pref?: string;
  award_winner?: string;
  description?: string;
}

interface QuestionAnswer {
  question: string;
  answer: string;
}

interface QuestionAnswer {
  question: string;
  answer: string;
}

interface ChatProps {
  initialMessage?: string;
  onBack?: () => void;
}

type ChatMode = 'chat' | 'ui_generation';

function Chat({ initialMessage, onBack }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [designData, setDesignData] = useState<DesignData>({});
  const [currentQuestion, setCurrentQuestion] = useState<number>(0);
  const [isCollectingData, setIsCollectingData] = useState(false);
  const [recommendation, setRecommendation] = useState<string>('');
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [otherInput, setOtherInput] = useState<string>('');
  const [questionnaireSelections, setQuestionnaireSelections] = useState<Record<string, string[]>>({});
  const [questionnaireOtherInputs, setQuestionnaireOtherInputs] = useState<Record<string, string>>({});
  const [questionAnswers, setQuestionAnswers] = useState<QuestionAnswer[]>([]);
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [showAnalyzingAnimation, setShowAnalyzingAnimation] = useState(false);
  const [chatMode, setChatMode] = useState<ChatMode>('chat');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Helper functions to generate design recommendations
  const generateColorPalette = (colorPref: string) => {
    const palettes: Record<string, { colors: string[], name: string }> = {
      'Blue': {
        colors: ['#1E40AF', '#3B82F6', '#60A5FA', '#93C5FD', '#DBEAFE', '#F8FAFC'],
        name: 'Professional Blue'
      },
      'Purple': {
        colors: ['#7C3AED', '#8B5CF6', '#A78BFA', '#C4B5FD', '#DDD6FE', '#F3F4F6'],
        name: 'Creative Purple'
      },
      'Green': {
        colors: ['#059669', '#10B981', '#34D399', '#6EE7B7', '#A7F3D0', '#ECFDF5'],
        name: 'Natural Green'
      },
      'Orange': {
        colors: ['#EA580C', '#F97316', '#FB923C', '#FDBA74', '#FED7AA', '#FFFBEB'],
        name: 'Energetic Orange'
      },
      'Red': {
        colors: ['#DC2626', '#EF4444', '#F87171', '#FCA5A5', '#FECACA', '#FEF2F2'],
        name: 'Bold Red'
      },
      'Neutral': {
        colors: ['#374151', '#6B7280', '#9CA3AF', '#D1D5DB', '#F3F4F6', '#FFFFFF'],
        name: 'Timeless Neutral'
      }
    };
    return palettes[colorPref] || palettes['Neutral'];
  };

  const generateFonts = (mood: string, style: string) => {
    const fontSuggestions: Record<string, string[]> = {
      'Minimalist': ['Inter', 'Roboto', 'Open Sans'],
      'Playful': ['Poppins', 'Nunito', 'Fredoka One'],
      'Bold': ['Montserrat', 'Oswald', 'Bebas Neue'],
      'Elegant': ['Playfair Display', 'Crimson Text', 'Lora'],
      'Modern': ['Inter', 'Poppins', 'Work Sans'],
      'Clean': ['Inter', 'Roboto', 'Lato'],
      'Grid-based': ['Inter', 'Roboto', 'Source Sans Pro'],
      'Traditional': ['Times New Roman', 'Georgia', 'Garamond'],
      'Contemporary': ['Poppins', 'Inter', 'Futura'],
      'Card-based': ['Inter', 'Roboto', 'Open Sans']
    };
    const moodFonts = fontSuggestions[mood] || [];
    const styleFonts = fontSuggestions[style] || [];
    return [...new Set([...moodFonts, ...styleFonts])].slice(0, 3);
  };

  const generateThemes = (mood: string) => {
    const themes: Record<string, string[]> = {
      'Minimalist': ['Light Mode', 'Dark Mode'],
      'Playful': ['Light Mode', 'Colorful Theme'],
      'Bold': ['Dark Mode', 'High Contrast'],
      'Elegant': ['Light Mode', 'Soft Theme'],
      'Modern': ['Light Mode', 'Dark Mode', 'System Theme']
    };
    return themes[mood] || ['Light Mode', 'Dark Mode'];
  };

  const hasProcessedInitialMessage = useRef(false);

  // Reset state when component mounts
  useEffect(() => {
    setCurrentQuestion(0);
    setIsCollectingData(false);
    setDesignData({});
    setRecommendation('');
    setQuestionAnswers([]);
  }, []);

  // Define the questions to ask
  const questions = [
    {
      key: 'mood',
      question: 'What mood should your design evoke?',
      options: ['Playful', 'Minimalist', 'Bold', 'Elegant', 'Modern', 'other']
    },
    {
      key: 'color_pref',
      question: 'Which colors do you prefer?',
      options: ['Blue', 'Purple', 'Green', 'Orange', 'Red', 'Neutral', 'other']
    },
    {
      key: 'style',
      question: 'What style appeals to you?',
      options: ['Clean', 'Grid-based', 'Traditional', 'Contemporary', 'Card-based', 'other']
    },
    {
      key: 'audience',
      question: 'Who is your target audience?',
      options: ['Tech professionals', 'Creative/artists', 'Business', 'General public', 'Young adults', 'other']
    },
    {
      key: 'premium',
      question: 'Are you looking for premium quality?',
      options: ['Yes', 'No']
    }
  ];

  // Function to get recommendation from AI model
  const getRecommendation = useCallback(async () => {

    // Add analyzing message
    const analyzingMessage: Message = {
      id: `analyzing-${Date.now()}`,
      content: 'Analyzing your responses...',
      role: 'assistant',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, analyzingMessage]);

    setIsLoading(true);
    try {
      // Make direct request to localhost:5000/recommend
      const selections = questionAnswers.reduce((acc, qa) => {
        acc[qa.question] = qa.answer;
        return acc;
      }, {} as Record<string, string>);
      const response = await fetch('http://localhost:5000/recommend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...selections,
          description: designData.description
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get recommendation');
      }

      const data = await response.json();
      setRecommendation(data.recommendation || data.reply || 'Based on your selections, I recommend a modern, clean design approach that balances functionality with aesthetic appeal.');

      const successMessage: Message = {
        id: `recommendation-ready-${Date.now()}`,
        content: 'Perfect! I\'ve analyzed your requirements and generated a design recommendation. Check the results panel on the right!',
        role: 'assistant',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, successMessage]);
    } catch (error) {
      console.error('Error getting recommendation:', error);
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        content: 'Sorry, I encountered an error getting your recommendation. Please make sure the AI model server is running on localhost:5000.',
        role: 'assistant',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [questionAnswers]);

  // Function to ask the next question
  const askNextQuestion = useCallback(() => {
    if (currentQuestion < questions.length) {
      const question = questions[currentQuestion];
      const questionMessage: Message = {
        id: `question-${Date.now()}-${currentQuestion}`, // Unique ID with timestamp
        content: question.question,
        role: 'assistant',
        timestamp: new Date(),
        isQuestion: true,
        options: question.options
      };
      setMessages(prev => [...prev, questionMessage]);
      // Reset selections for new question
      setSelectedOptions([]);
      setOtherInput('');
    } else {
      // All questions answered, get recommendation
      getRecommendation();
    }
  }, [currentQuestion, questions, getRecommendation]);

  // Function to handle done button click
  const handleDoneClick = useCallback(() => {
    if (selectedOptions.length === 0 || currentQuestion >= questions.length) return;

    // Don't add user selection as a message - hide selections as requested

    // Process the selected options
    const question = questions[currentQuestion];
    if (!question) return; // Safety check
    let mappedAnswer = selectedOptions[0]; // Default to first selection

    // Handle "other" input if provided
    if (selectedOptions.includes('other') && otherInput.trim()) {
      mappedAnswer = otherInput.trim();
    } else if (selectedOptions.length > 1) {
      // For multiple selections, combine them
      mappedAnswer = selectedOptions.join(', ');
    }

    // Map to expected format
    if (question.key === 'project_type') {
      if (mappedAnswer.includes('portfolio')) mappedAnswer = 'portfolio';
      else if (mappedAnswer.includes('blog')) mappedAnswer = 'blog';
      else if (mappedAnswer.includes('ecommerce')) mappedAnswer = 'ecommerce';
      else if (mappedAnswer.includes('landing')) mappedAnswer = 'landing';
      else mappedAnswer = mappedAnswer; // Keep custom input for other
    } else if (question.key === 'audience') {
      if (mappedAnswer.includes('tech')) mappedAnswer = 'tech';
      else if (mappedAnswer.includes('creative')) mappedAnswer = 'creative';
      else if (mappedAnswer.includes('business')) mappedAnswer = 'enterprise';
      else if (mappedAnswer.includes('young')) mappedAnswer = 'young';
      else mappedAnswer = mappedAnswer; // Keep custom input for other
    } else if (question.key === 'color_pref') {
      if (mappedAnswer.includes('blue')) mappedAnswer = 'blue';
      else if (mappedAnswer.includes('purple')) mappedAnswer = 'purple';
      else if (mappedAnswer.includes('green')) mappedAnswer = 'green';
      else if (mappedAnswer.includes('orange')) mappedAnswer = 'orange';
      else if (mappedAnswer.includes('red')) mappedAnswer = 'red';
      else if (mappedAnswer.includes('neutral')) mappedAnswer = 'neutral';
      else mappedAnswer = mappedAnswer; // Keep custom input for other
    } else if (question.key === 'layout_pref') {
      if (mappedAnswer.includes('minimal')) mappedAnswer = 'minimal';
      else if (mappedAnswer.includes('grid')) mappedAnswer = 'grid';
      else if (mappedAnswer.includes('classic')) mappedAnswer = 'classic';
      else if (mappedAnswer.includes('modern')) mappedAnswer = 'modern';
      else if (mappedAnswer.includes('card')) mappedAnswer = 'card-based';
      else mappedAnswer = mappedAnswer; // Keep custom input for other
    } else if (question.key === 'award_winner') {
      mappedAnswer = mappedAnswer.includes('yes') ? 'yes' : 'no';
    }

    // Add to questionAnswers array with question marker
    const questionAnswer: QuestionAnswer = {
      question: question.key,
      answer: mappedAnswer
    };
    setQuestionAnswers(prev => [...prev, questionAnswer]);

    // Update design data (for backward compatibility)
    setDesignData(prev => ({ ...prev, [question.key]: mappedAnswer }));

    // Reset selections and other input for next question
    setSelectedOptions([]);
    setOtherInput('');

    // Move to next question
    setCurrentQuestion(prev => prev + 1);

    // Ask next question after a short delay
    setTimeout(() => {
      askNextQuestion();
    }, 500);
  }, [selectedOptions, currentQuestion, questions, askNextQuestion, otherInput]);

  const handleChatMode = useCallback(async (message: string) => {
    try {
      setIsLoading(true);

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'gemini',
          prompt: message,
          conversationHistory: messages.slice(-10), // Send last 10 messages for context
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get chat response');
      }

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response,
        role: 'assistant',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat mode error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Sorry, I\'m having trouble connecting right now. Please try again later.',
        role: 'assistant',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [messages]);

  const handleSendMessage = useCallback(async (message: string, files?: File[]) => {
    if (!message.trim()) return;

    // Check for mode switching commands
    const lowerMessage = message.toLowerCase();
    if (lowerMessage.includes('start') && lowerMessage.includes('theme') && lowerMessage.includes('generation')) {
      // Switch to UI generation mode
      setChatMode('ui_generation');
      const modeSwitchMessage: Message = {
        id: Date.now().toString(),
        content: 'Switched to UI Generation Mode! 🎨 Describe your project idea and I\'ll help you create a beautiful design.',
        role: 'assistant',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, modeSwitchMessage]);
      return;
    }

    if (lowerMessage.includes('switch to chat') || lowerMessage.includes('normal chat') || lowerMessage.includes('learning mode')) {
      // Switch back to chat mode
      setChatMode('chat');
      const modeSwitchMessage: Message = {
        id: Date.now().toString(),
        content: 'Switched to Chat Mode! 💬 I\'m here to help you learn about design and development. What would you like to know?',
        role: 'assistant',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, modeSwitchMessage]);
      return;
    }

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: message,
      role: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);

    // Handle based on current mode
    if (chatMode === 'ui_generation') {
      // UI Generation Mode - trigger questionnaire
      if (messages.length === 0) {
        setDesignData(prev => ({ ...prev, description: message }));
        setShowQuestionnaire(true);
        return;
      }
    } else {
      // Chat Mode - send to Gemini for general conversation
      await handleChatMode(message);
    }

    // Handle existing UI generation flow if in that mode
    if (chatMode === 'ui_generation' && isCollectingData && currentQuestion < questions.length) {
      // Process the answer to the current question
      const question = questions[currentQuestion];
      const answer = message.trim().toLowerCase();

      // Map user answer to the expected format
      let mappedAnswer = answer;
      if (question.key === 'project_type') {
        if (answer.includes('portfolio')) mappedAnswer = 'portfolio';
        else if (answer.includes('blog')) mappedAnswer = 'blog';
        else if (answer.includes('ecommerce') || answer.includes('shop') || answer.includes('store')) mappedAnswer = 'ecommerce';
        else if (answer.includes('landing')) mappedAnswer = 'landing';
        else mappedAnswer = 'other';
      } else if (question.key === 'audience') {
        if (answer.includes('tech')) mappedAnswer = 'tech';
        else if (answer.includes('creative') || answer.includes('artist')) mappedAnswer = 'creative';
        else if (answer.includes('business') || answer.includes('enterprise')) mappedAnswer = 'enterprise';
        else if (answer.includes('young')) mappedAnswer = 'young';
        else mappedAnswer = 'general';
      } else if (question.key === 'color_pref') {
        if (answer.includes('blue')) mappedAnswer = 'blue';
        else if (answer.includes('purple')) mappedAnswer = 'purple';
        else if (answer.includes('green')) mappedAnswer = 'green';
        else if (answer.includes('orange')) mappedAnswer = 'orange';
        else if (answer.includes('red')) mappedAnswer = 'red';
        else if (answer.includes('neutral') || answer.includes('gray')) mappedAnswer = 'neutral';
        else mappedAnswer = 'neutral';
      } else if (question.key === 'layout_pref') {
        if (answer.includes('minimal') || answer.includes('clean')) mappedAnswer = 'minimal';
        else if (answer.includes('grid')) mappedAnswer = 'grid';
        else if (answer.includes('classic') || answer.includes('traditional')) mappedAnswer = 'classic';
        else if (answer.includes('modern') || answer.includes('contemporary')) mappedAnswer = 'modern';
        else if (answer.includes('card')) mappedAnswer = 'card-based';
        else mappedAnswer = 'modern';
      } else if (question.key === 'award_winner') {
        mappedAnswer = answer.includes('yes') || answer.includes('premium') || answer.includes('award') ? 'yes' : 'no';
      }

      // Update design data
      setDesignData(prev => ({ ...prev, [question.key]: mappedAnswer }));

      // Move to next question
      setCurrentQuestion(prev => prev + 1);

      // Ask next question after a short delay
      setTimeout(() => {
        askNextQuestion();
      }, 500);
    }
  }, [messages.length, chatMode, isCollectingData, currentQuestion, questions, askNextQuestion]);

  // Handle initial message and start question flow
  useEffect(() => {
    if (initialMessage && !hasProcessedInitialMessage.current && messages.length === 0) {
      hasProcessedInitialMessage.current = true;

      // Store the initial description
      setDesignData(prev => ({ ...prev, description: initialMessage }));

      // Add user message first
      const userMessage: Message = {
        id: 'initial-message',
        content: initialMessage,
        role: 'user',
        timestamp: new Date(),
      };

      // Add welcome message from AI
      const welcomeMessage: Message = {
        id: 'welcome',
        content: 'Hello! I\'m Ada, your design assistant. Describe your project idea, and I\'ll help bring it to life.',
        role: 'assistant',
        timestamp: new Date(),
      };

      setMessages([userMessage, welcomeMessage]);

      // Show questionnaire popup
      setTimeout(() => {
        setShowQuestionnaire(true);
      }, 1500);
    }
  }, [initialMessage, messages.length]);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex w-full h-screen p-4 justify-evenly items-center bg-[radial-gradient(125%_125%_at_50%_101%,rgba(245,87,2,1)_10.5%,rgba(245,120,2,1)_16%,rgba(245,140,2,1)_17.5%,rgba(245,170,100,1)_25%,rgba(238,174,202,1)_40%,rgba(202,179,214,1)_65%,rgba(148,201,233,1)_100%)]">
      <div className="w-screen h-[96vh] rounded-3xl p-6 flex items-center justify-center gap-4 m-2 bg-black">
        <div className="w-2/3 flex flex-col h-[90vh] bg-neutral-800 rounded-4xl">
          {/* Messages Area */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex-1 backdrop-blur-md rounded-lg p-6 m-4 overflow-hidden flex flex-col"
          >
            <div className="flex-1 overflow-y-auto space-y-4 hide-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              <style jsx>{`
                .hide-scrollbar::-webkit-scrollbar {
                  display: none;
                }
                .hide-scrollbar {
                  -ms-overflow-style: none;
                  scrollbar-width: none;
                }
              `}</style>
              {/* Back button */}
              <div className="flex items-center justify-between mb-4">
                <button onClick={onBack} className="text-white/70 hover:text-white flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  <span>Back</span>
                </button>
                <div className="text-white font-semibold flex items-center space-x-2">
                  <span>Chat with Ada</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    chatMode === 'chat' 
                      ? 'bg-blue-500/20 text-blue-300' 
                      : 'bg-orange-500/20 text-orange-300'
                  }`}>
                    {chatMode === 'chat' ? '💬 Chat Mode' : '🎨 UI Generation Mode'}
                  </span>
                </div>
              </div>
              {messages.length === 0 && !initialMessage ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center text-white/60">
                    <div className="text-6xl mb-4">�</div>
                    <p className="text-lg mb-2">Hello! I&apos;m Ada, your design assistant.</p>
                    <p className="text-sm">Describe your project idea, and I&apos;ll help bring it to life.</p>
                  </div>
                </div>
              ) : (
                <AnimatePresence>
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] p-4 rounded-lg ${
                          message.role === 'user'
                            ? 'bg-white/20 text-white'
                            : 'bg-white/10 text-white/90'
                        }`}
                      >
                        <p className="whitespace-pre-line mb-2 leading-relaxed">{formatConversationMessage(message.content)}</p>
                        
                        <div className={`text-xs mt-2 flex items-center justify-between ${
                          message.role === 'user' ? 'text-white/70' : 'text-white/60'
                        }`}>
                          <span>{message.timestamp.toLocaleTimeString()}</span>
                          {message.source && message.role === 'assistant' && (
                            <span className="text-xs opacity-60">
                              {message.source === 'local_ai_model' ? '🤖 AI Model' : 
                               message.source === 'gemini_fallback' ? '🌐 Gemini' : '💬 Ada'}
                            </span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}

              {/* Loading indicator */}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="bg-white/10 text-white/90 p-4 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                      <span className="text-sm text-white/70">AI is thinking...</span>
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </motion.div>

          {/* Input Area */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="backdrop-blur-md rounded-lg p-4"
          >
            <PromptInputBox
              onSend={handleSendMessage}
              isLoading={isLoading}
              placeholder={
                chatMode === 'chat' 
                  ? "Ask me about design and development..." 
                  : "Describe your project idea or say 'switch to chat' to change modes..."
              }
              className="w-full"
              mode={chatMode}
              onModeChange={(newMode) => {
                if (newMode !== chatMode) {
                  setChatMode(newMode);
                  const modeSwitchMessage: Message = {
                    id: Date.now().toString(),
                    content: newMode === 'chat' 
                      ? 'Switched to Chat Mode! 💬 I\'m here to help you learn about design and development. What would you like to know?' 
                      : 'Switched to UI Generation Mode! 🎨 Describe your project idea and I\'ll help you create a beautiful design.',
                    role: 'assistant',
                    timestamp: new Date(),
                  };
                  setMessages(prev => [...prev, modeSwitchMessage]);
                }
              }}
            />
          </motion.div>
        </div>
        <div className="w-1/3 flex flex-col h-[90vh] bg-neutral-800 rounded-4xl">
          {/* Results Area */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex-1 backdrop-blur-md rounded-lg p-6 m-4 overflow-hidden flex flex-col"
          >
            <div className="text-white mb-4">
              <h3 className="text-lg font-bold text-center">Design Results</h3>
            </div>
            <div className="flex-1 overflow-y-auto hide-scrollbar">
              {recommendation ? (
                <div className="space-y-6">
                  {/* Design Recommendation */}
                  <div className="bg-white/10 rounded-lg p-4">
                    <h4 className="text-white font-semibold mb-2 flex items-center">
                      <span className="text-xl mr-2">🎨</span>
                      Design Recommendation
                    </h4>
                    <p className="text-white/90 text-sm leading-relaxed">{recommendation}</p>
                  </div>

                  {/* Color Palette Suggestions */}
                  <div className="bg-white/10 rounded-lg p-4">
                    <h4 className="text-white font-semibold mb-3 flex items-center">
                      <span className="text-xl mr-2">🎨</span>
                      Suggested Color Palette
                    </h4>
                    {(() => {
                      const colorPref = questionAnswers.find(qa => qa.question === 'color_pref')?.answer || 'Neutral';
                      const palette = generateColorPalette(colorPref.split(',')[0].trim());
                      return (
                        <div className="space-y-2">
                          <div className="flex space-x-1">
                            {palette.colors.map((color, idx) => (
                              <div key={idx} className="w-8 h-8 rounded cursor-pointer hover:scale-110 transition-transform" style={{ backgroundColor: color }} />
                            ))}
                          </div>
                          <p className="text-white/70 text-xs">{palette.name}</p>
                          <div className="text-xs text-white/60 mt-2">
                            {palette.colors.map((color, idx) => (
                              <span key={idx} className="mr-2">{color}</span>
                            ))}
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Typography Suggestions */}
                  <div className="bg-white/10 rounded-lg p-4">
                    <h4 className="text-white font-semibold mb-3 flex items-center">
                      <span className="text-xl mr-2">📝</span>
                      Typography Recommendations
                    </h4>
                    {(() => {
                      const mood = questionAnswers.find(qa => qa.question === 'mood')?.answer || 'Modern';
                      const style = questionAnswers.find(qa => qa.question === 'style')?.answer || 'Clean';
                      const fonts = generateFonts(mood.split(',')[0].trim(), style.split(',')[0].trim());
                      return (
                        <div className="space-y-3">
                          {fonts.map((font, idx) => (
                            <div key={idx} className="border border-white/20 rounded p-3">
                              <p className="text-white font-bold text-lg" style={{ fontFamily: `${font}, sans-serif` }}>{font}</p>
                              <p className="text-white/70 text-sm">Perfect for {mood.toLowerCase()} designs</p>
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </div>

                  {/* Theme Options */}
                  <div className="bg-white/10 rounded-lg p-4">
                    <h4 className="text-white font-semibold mb-3 flex items-center">
                      <span className="text-xl mr-2">🎭</span>
                      Theme Options
                    </h4>
                    {(() => {
                      const mood = questionAnswers.find(qa => qa.question === 'mood')?.answer || 'Modern';
                      const themes = generateThemes(mood.split(',')[0].trim());
                      return (
                        <div className="grid grid-cols-1 gap-2">
                          {themes.map((theme, idx) => (
                            <div key={idx} className="border border-white/20 rounded p-3 cursor-pointer hover:bg-white/5 transition-colors">
                              <p className="text-white font-medium">{theme}</p>
                              <p className="text-white/70 text-sm">Ideal for {mood.toLowerCase()} aesthetics</p>
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </div>

                  {/* Your Design Summary */}
                  <div className="bg-white/10 rounded-lg p-4">
                    <h4 className="text-white font-semibold mb-2 flex items-center">
                      <span className="text-xl mr-2">📋</span>
                      Your Design Summary
                    </h4>
                    <div className="space-y-2 text-sm">
                      {questionAnswers.map((qa, index) => (
                        <p key={index} className="text-white/80">
                          <span className="font-medium capitalize">{qa.question.replace('_', ' ')}:</span> {qa.answer}
                        </p>
                      ))}
                    </div>
                  </div>

                  {/* Next Steps */}
                  <div className="bg-white/10 rounded-lg p-4">
                    <h4 className="text-white font-semibold mb-2 flex items-center">
                      <span className="text-xl mr-2">🚀</span>
                      Next Steps
                    </h4>
                    <ul className="text-white/80 text-sm space-y-1">
                      <li>• Click a color to customize further</li>
                      <li>• Download your design assets</li>
                      <li>• Explore similar design inspirations</li>
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {/* Typography Section */}
                  <div className="bg-white/10 rounded-lg p-4">
                    <h4 className="text-white font-semibold mb-2">Typography</h4>
                    <p className="text-white/70 text-sm">Font recommendations will appear here after you complete the questionnaire.</p>
                  </div>
                  {/* Colors Section */}
                  <div className="bg-white/10 rounded-lg p-4">
                    <h4 className="text-white font-semibold mb-2">Colors</h4>
                    <p className="text-white/70 text-sm">Color palette suggestions will appear here after you complete the questionnaire.</p>
                  </div>
                  {/* Layout Section */}
                  <div className="bg-white/10 rounded-lg p-4">
                    <h4 className="text-white font-semibold mb-2">Layout</h4>
                    <p className="text-white/70 text-sm">Layout recommendations will appear here after you complete the questionnaire.</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Questionnaire Popup */}
      <AnimatePresence>
        {showQuestionnaire && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-neutral-800 rounded-3xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto hide-scrollbar"
            >
              <div className="text-white mb-6">
                <h2 className="text-2xl font-bold text-center mb-2">Let&apos;s Customize Your Design</h2>
                <p className="text-white/70 text-center">Answer these questions to help me create the perfect design for you.</p>
              </div>

              <div className="space-y-6">
                {questions.map((question, qIndex) => {
                  const isLastQuestion = qIndex === questions.length - 1;
                  return (
                    <div key={question.key} className="bg-white/5 rounded-lg p-4">
                      <h3 className="text-white font-semibold mb-3">{question.question}</h3>
                      <div className="space-y-2">
                        {question.options.map((option, index) => {
                          const isSelected = isLastQuestion 
                            ? questionnaireSelections[question.key]?.[0] === option
                            : questionnaireSelections[question.key]?.includes(option) || false;
                          const isOther = option === 'other';
                          const showOtherInput = isOther && questionnaireSelections[question.key]?.includes('other');

                          return (
                            <div key={index}>
                              <label className={`flex items-center space-x-2 cursor-pointer p-2 rounded-lg transition-colors ${
                                isSelected ? 'bg-orange-500/20 border border-orange-500/50' : 'hover:bg-white/5'
                              }`}>
                                <input
                                  type={isLastQuestion ? "radio" : "checkbox"}
                                  name={isLastQuestion ? `question-${question.key}` : undefined}
                                  checked={isSelected}
                                  onChange={(e) => {
                                    if (isLastQuestion) {
                                      // Radio button behavior
                                      setQuestionnaireSelections(prev => ({
                                        ...prev,
                                        [question.key]: [option]
                                      }));
                                    } else {
                                      // Checkbox behavior
                                      const checked = e.target.checked;
                                      setQuestionnaireSelections(prev => {
                                        const current = prev[question.key] || [];
                                        if (checked) {
                                          return { ...prev, [question.key]: [...current, option] };
                                        } else {
                                          return { ...prev, [question.key]: current.filter(opt => opt !== option) };
                                        }
                                      });
                                    }
                                  }}
                                  className="w-4 h-4 text-orange-500 bg-gray-100 border-gray-300 rounded focus:ring-orange-500 focus:ring-2"
                                />
                                <span className="text-white/90">{option}</span>
                              </label>

                              {showOtherInput && (
                                <div className="ml-6 mt-2">
                                  <input
                                    type="text"
                                    value={questionnaireOtherInputs[question.key] || ''}
                                    onChange={(e) => setQuestionnaireOtherInputs(prev => ({ ...prev, [question.key]: e.target.value }))}
                                    placeholder="Please specify..."
                                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-500"
                                  />
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-center mt-6">
                {questions.every(q => questionnaireSelections[q.key] && questionnaireSelections[q.key].length > 0) && (
                  <button
                    onClick={() => {
                      // Process all selections
                      const answers: QuestionAnswer[] = [];
                      questions.forEach(question => {
                        const selections = questionnaireSelections[question.key] || [];
                        let answer = selections.join(', ');
                        if (selections.includes('other') && questionnaireOtherInputs[question.key]) {
                          answer = questionnaireOtherInputs[question.key];
                        }
                        if (answer) {
                          answers.push({ question: question.key, answer });
                        }
                      });
                      setQuestionAnswers(answers);

                      // Update design data
                      answers.forEach(({ question, answer }) => {
                        setDesignData(prev => ({ ...prev, [question]: answer }));
                      });

                      setShowQuestionnaire(false);
                      setShowAnalyzingAnimation(true);

                      // Simulate loading
                      setTimeout(() => {
                        setShowAnalyzingAnimation(false);
                        getRecommendation();
                      }, 3000);
                    }}
                    className="px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors"
                  >
                    Finalized
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Analyzing Animation */}
      <AnimatePresence>
        {showAnalyzingAnimation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="text-center"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"
              />
              <h2 className="text-2xl font-bold text-white mb-2">Analyzing your input...</h2>
              <p className="text-white/70">Generating your personalized design recommendations</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Chat;