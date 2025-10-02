"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PromptInputBox } from "@/components/ui/ai-prompt-box";
import { motion, AnimatePresence } from 'framer-motion';
import { formatConversationMessage } from '@/lib/markdown-sanitizer';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ComponentTray } from '@/components/component-tray/ComponentTray';
import { ComponentInfo } from '@/components/component-tray/component-registry';
import RecommendationCard from '@/components/ui/recommendation-card';
import { Palette, Eye } from 'lucide-react';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  source?: 'local_ai_model' | 'gemini' | 'gemini_fallback';
  isQuestion?: boolean;
  options?: string[];
  isRecommendationSet?: boolean;
  recommendations?: Recommendation[];
  isComponentSet?: boolean;
  selectedRecommendation?: string;
  selectedComponent?: ComponentInfo;
}

interface Recommendation {
  id: string;
  name: string;
  colors: string[];
  fonts: {primary: string, secondary: string};
  description: string;
  tags: string[];
}

interface DesignData {
  projectDescription: string;
  colorPreference: string;
  theme: string;
  mood: string;
  style: string;
  targetAudience: string;
}

interface ChatProps {
  initialMessage?: string;
}

type ChatMode = 'chat' | 'ui_generation' | 'questionnaire';

function Chat({ initialMessage }: ChatProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [chatMode, setChatMode] = useState<ChatMode>('chat');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedRecommendationId, setSelectedRecommendationId] = useState<string | null>(null);
  const [designData, setDesignData] = useState<DesignData>({
    projectDescription: '',
    colorPreference: '',
    theme: '',
    mood: '',
    style: '',
    targetAudience: ''
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Get message from URL parameters
  const urlMessage = searchParams.get('message');
  const effectiveInitialMessage = initialMessage || (urlMessage ? decodeURIComponent(urlMessage) : undefined);
  const hasProcessedInitialMessage = useRef(false);

  // Design questionnaire
  const questionnaire = [
    {
      question: "What type of project are you working on? (e.g., company website, portfolio, e-commerce site)",
      key: 'projectDescription' as keyof DesignData,
      options: ['Company Website', 'Portfolio', 'E-commerce Site', 'Landing Page', 'Blog', 'Other']
    },
    {
      question: "What color preferences do you have in mind?",
      key: 'colorPreference' as keyof DesignData,
      options: ['Blue (Professional & Trust)', 'Purple (Creative & Luxury)', 'Green (Natural & Growth)', 'Orange (Energetic & Warm)', 'Red (Bold & Urgent)', 'Neutral (Timeless & Elegant)']
    },
    {
      question: "What theme are you thinking of?",
      key: 'theme' as keyof DesignData,
      options: ['Modern', 'Classic', 'Minimalist', 'Bold', 'Elegant', 'Playful']
    },
    {
      question: "What mood should your design convey?",
      key: 'mood' as keyof DesignData,
      options: ['Professional', 'Creative', 'Friendly', 'Trustworthy', 'Innovative', 'Sophisticated']
    },
    {
      question: "What style approach do you prefer?",
      key: 'style' as keyof DesignData,
      options: ['Clean & Simple', 'Rich & Detailed', 'Grid-based', 'Card-based', 'One-page', 'Multi-section']
    },
    {
      question: "Who is your target audience?",
      key: 'targetAudience' as keyof DesignData,
      options: ['Tech Professionals', 'Creative/Artists', 'Business Executives', 'General Public', 'Young Adults', 'Enterprises']
    }
  ];

  const getColorPalette = (preference: string, index: number): string[] => {
    const palettes: Record<string, string[][]> = {
      'Blue (Professional & Trust)': [
        ['#1E40AF', '#3B82F6', '#60A5FA', '#93C5FD', '#DBEAFE'],
        ['#1E3A8A', '#1D4ED8', '#2563EB', '#3B82F6', '#60A5FA'],
        ['#0C2B5F', '#1E40AF', '#2563EB', '#3B82F6', '#93C5FD'],
        ['#0F172A', '#1E293B', '#334155', '#64748B', '#94A3B8'],
        ['#0EA5E9', '#0284C7', '#0369A1', '#075985', '#0C4A6E']
      ],
      'Purple (Creative & Luxury)': [
        ['#7C3AED', '#8B5CF6', '#A78BFA', '#C4B5FD', '#E9D5FF'],
        ['#6B21A8', '#7C2D92', '#8B5CF6', '#A78BFA', '#C4B5FD'],
        ['#581C87', '#6B21A8', '#7C2D92', '#8B5CF6', '#A78BFA'],
        ['#4C1D95', '#5B21B6', '#6D28D9', '#7C3AED', '#8B5CF6'],
        ['#9333EA', '#A855F7', '#B565A7', '#C084FC', '#D8B4FE']
      ],
      'Green (Natural & Growth)': [
        ['#059669', '#10B981', '#34D399', '#6EE7B7', '#A7F3D0'],
        ['#047857', '#059669', '#10B981', '#34D399', '#6EE7B7'],
        ['#064E3B', '#047857', '#059669', '#10B981', '#34D399'],
        ['#14532D', '#166534', '#15803D', '#16A34A', '#22C55E'],
        ['#365314', '#3F6212', '#4D7C0F', '#65A30D', '#84CC16']
      ],
      'Orange (Energetic & Warm)': [
        ['#EA580C', '#F97316', '#FB923C', '#FDBA74', '#FED7AA'],
        ['#C2410C', '#EA580C', '#F97316', '#FB923C', '#FDBA74'],
        ['#9A3412', '#C2410C', '#EA580C', '#F97316', '#FB923C'],
        ['#DC2626', '#EF4444', '#F87171', '#FCA5A5', '#FECACA'],
        ['#7C2D12', '#92400E', '#B45309', '#D97706', '#F59E0B']
      ],
      'Red (Bold & Urgent)': [
        ['#DC2626', '#EF4444', '#F87171', '#FCA5A5', '#FECACA'],
        ['#B91C1C', '#DC2626', '#EF4444', '#F87171', '#FCA5A5'],
        ['#991B1B', '#B91C1C', '#DC2626', '#EF4444', '#F87171'],
        ['#7F1D1D', '#991B1B', '#B91C1C', '#DC2626', '#EF4444'],
        ['#BE185D', '#DB2777', '#EC4899', '#F472B6', '#F9A8D4']
      ],
      'Neutral (Timeless & Elegant)': [
        ['#1F2937', '#374151', '#4B5563', '#6B7280', '#9CA3AF'],
        ['#111827', '#1F2937', '#374151', '#4B5563', '#6B7280'],
        ['#0F172A', '#1E293B', '#334155', '#475569', '#64748B'],
        ['#18181B', '#27272A', '#3F3F46', '#52525B', '#71717A'],
        ['#171717', '#262626', '#404040', '#525252', '#737373']
      ]
    };

    const colorSet = palettes[preference] || palettes['Blue (Professional & Trust)'];
    return colorSet[index % colorSet.length];
  };

  const generateInlineRecommendations = useCallback((designData: DesignData): Recommendation[] => {
    return [
      {
        id: 'rec-1',
        name: `${designData.theme} Professional`,
        colors: getColorPalette(designData.colorPreference, 0),
        fonts: { primary: 'Inter', secondary: 'Open Sans' },
        description: `Perfect for ${designData.projectDescription.toLowerCase()} with ${designData.mood.toLowerCase()} appeal`,
        tags: [designData.theme.toLowerCase(), designData.mood.toLowerCase(), 'professional']
      },
      {
        id: 'rec-2',
        name: `${designData.mood} Modern`,
        colors: getColorPalette(designData.colorPreference, 1),
        fonts: { primary: 'Poppins', secondary: 'Roboto' },
        description: `Modern design approach for ${designData.targetAudience.toLowerCase()}`,
        tags: [designData.style.toLowerCase(), 'modern', 'clean']
      },
      {
        id: 'rec-3',
        name: `Creative ${designData.style}`,
        colors: getColorPalette(designData.colorPreference, 2),
        fonts: { primary: 'Montserrat', secondary: 'Source Sans Pro' },
        description: `Creative interpretation of ${designData.style.toLowerCase()} design`,
        tags: ['creative', designData.style.toLowerCase(), 'unique']
      },
      {
        id: 'rec-4',
        name: `${designData.theme} Elite`,
        colors: getColorPalette(designData.colorPreference, 3),
        fonts: { primary: 'Playfair Display', secondary: 'Inter' },
        description: `Premium ${designData.theme.toLowerCase()} design for sophisticated audiences`,
        tags: ['premium', designData.theme.toLowerCase(), 'elegant']
      },
      {
        id: 'rec-5',
        name: `Bold ${designData.mood}`,
        colors: getColorPalette(designData.colorPreference, 4),
        fonts: { primary: 'Oswald', secondary: 'Lato' },
        description: `Bold take on ${designData.mood.toLowerCase()} design principles`,
        tags: ['bold', designData.mood.toLowerCase(), 'impactful']
      }
    ];
  }, []);

  const handleRecommendationSelect = useCallback((recommendation: Recommendation) => {
    setSelectedRecommendationId(recommendation.id);
    
    const confirmationMessage: Message = {
      id: Date.now().toString(),
      content: `Great choice! You've selected "${recommendation.name}". Now you can preview components with your selected color palette and fonts.`,
      role: 'assistant',
      timestamp: new Date(),
      isComponentSet: true,
      selectedRecommendation: recommendation.id
    };
    setMessages(prev => [...prev, confirmationMessage]);
  }, []);

  const handleComponentPreview = useCallback((componentId: string) => {
    // Find the selected recommendation
    const selectedRec = messages
      .filter(msg => msg.recommendations)
      .flatMap(msg => msg.recommendations!)
      .find(rec => rec.id === selectedRecommendationId);
    
    if (selectedRec) {
      const previewData = {
        componentId,
        recommendation: selectedRec
      };
      const dataParam = encodeURIComponent(JSON.stringify(previewData));
      window.open(`/component-preview/${componentId}?data=${dataParam}`, '_blank');
    }
  }, [messages, selectedRecommendationId]);

  // Function to start questionnaire
  const startQuestionnaire = useCallback(() => {
    setChatMode('questionnaire');
    setCurrentQuestionIndex(0);
    
    const questionnaireStartMessage: Message = {
      id: 'questionnaire-start',
      content: "Great! I'll help you create the perfect design. Let me ask you a few questions to understand your needs better.",
      role: 'assistant',
      timestamp: new Date(),
    };
    
    setTimeout(() => {
      const firstQuestion: Message = {
        id: 'question-0',
        content: questionnaire[0].question,
        role: 'assistant',
        timestamp: new Date(),
        isQuestion: true,
        options: questionnaire[0].options
      };
      setMessages(prev => [...prev, questionnaireStartMessage, firstQuestion]);
    }, 500);
  }, []);

  // Function to handle questionnaire answers
  const handleQuestionnaireAnswer = useCallback(async (answer: string) => {
    const currentQuestion = questionnaire[currentQuestionIndex];
    
    // Update design data
    const newDesignData = {
      ...designData,
      [currentQuestion.key]: answer
    };
    setDesignData(newDesignData);

    // Add user's answer to messages
    const userAnswer: Message = {
      id: `answer-${currentQuestionIndex}`,
      content: answer,
      role: 'user',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userAnswer]);

    // Check if there are more questions
    if (currentQuestionIndex < questionnaire.length - 1) {
      // Ask next question
      setTimeout(() => {
        const nextQuestionIndex = currentQuestionIndex + 1;
        setCurrentQuestionIndex(nextQuestionIndex);
        
        const nextQuestion: Message = {
          id: `question-${nextQuestionIndex}`,
          content: questionnaire[nextQuestionIndex].question,
          role: 'assistant',
          timestamp: new Date(),
          isQuestion: true,
          options: questionnaire[nextQuestionIndex].options
        };
        setMessages(prev => [...prev, nextQuestion]);
      }, 1000);
    } else {
      // All questions answered, generate recommendations inline
      setIsLoading(true);
      
      setTimeout(async () => {
        try {
          const recommendations = generateInlineRecommendations(newDesignData);

          const completionMessage: Message = {
            id: 'questionnaire-complete',
            content: "Perfect! I've analyzed your preferences and generated personalized design recommendations for you. Please select a color palette and font combination that resonates with your vision:",
            role: 'assistant',
            timestamp: new Date(),
            isRecommendationSet: true,
            recommendations: recommendations
          };
          setMessages(prev => [...prev, completionMessage]);
        } catch (error) {
          console.error('Error generating recommendations:', error);
        } finally {
          setIsLoading(false);
        }
      }, 1500);
    }
  }, [currentQuestionIndex, designData, generateInlineRecommendations]);

  // Function to restart the chat
  const restartChat = useCallback(() => {
    setMessages([]);
    setChatMode('chat');
    setCurrentQuestionIndex(0);
    setSelectedRecommendationId(null);
    setDesignData({
      projectDescription: '',
      colorPreference: '',
      theme: '',
      mood: '',
      style: '',
      targetAudience: ''
    });
    hasProcessedInitialMessage.current = false;
  }, []);

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
          conversationHistory: messages.slice(-10),
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

    // Check if we're in questionnaire mode and this is an option selection
    if (chatMode === 'questionnaire') {
      await handleQuestionnaireAnswer(message);
      return;
    }

    // Check for design project detection
    const lowerMessage = message.toLowerCase();
    const designKeywords = ['design', 'website', 'web', 'ui', 'ux', 'create', 'build', 'help me make'];
    const isDesignRequest = designKeywords.some(keyword => lowerMessage.includes(keyword));
    
    if (isDesignRequest) {
      const userMessage: Message = {
        id: Date.now().toString(),
        content: message,
        role: 'user',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, userMessage]);
      
      startQuestionnaire();
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
    await handleChatMode(message);
  }, [handleChatMode, chatMode, handleQuestionnaireAnswer, startQuestionnaire]);

  // Handle initial message
  useEffect(() => {
    if (effectiveInitialMessage && !hasProcessedInitialMessage.current && messages.length === 0) {
      hasProcessedInitialMessage.current = true;

      const userMessage: Message = {
        id: 'initial-message',
        content: effectiveInitialMessage,
        role: 'user',
        timestamp: new Date(),
      };

      const welcomeMessage: Message = {
        id: 'welcome',
        content: 'Hello! I\'m Ada, your design assistant. I can help you create beautiful designs. What would you like to work on today?',
        role: 'assistant',
        timestamp: new Date(),
      };

      setMessages([userMessage, welcomeMessage]);
    }
  }, [effectiveInitialMessage, messages.length]);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex w-full min-h-screen sm:p-4 justify-center items-center bg-[radial-gradient(125%_125%_at_50%_101%,rgba(245,87,2,1)_10.5%,rgba(245,120,2,1)_16%,rgba(245,140,2,1)_17.5%,rgba(245,170,100,1)_25%,rgba(238,174,202,1)_40%,rgba(202,179,214,1)_65%,rgba(148,201,233,1)_100%)]">
      <div className="w-full h-[98vh] sm:h-[96vh] rounded-2xl sm:rounded-3xl p-3 sm:p-6 flex items-center justify-center gap-2 sm:gap-4 m-1 sm:m-2 bg-black">
        <div className="w-full flex flex-col h-full bg-neutral-800 rounded-2xl sm:rounded-4xl">
          {/* Messages Area */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex-1 backdrop-blur-md rounded-lg p-3 sm:p-6 m-2 sm:m-4 overflow-hidden flex flex-col"
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
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2 sm:gap-0">
                <div className="flex items-center space-x-4">
                  <button 
                    onClick={() => router.push('/')} 
                    className="text-white/70 hover:text-white flex items-center space-x-2 text-sm sm:text-base"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    <span>Back</span>
                  </button>
                  <button 
                    onClick={restartChat} 
                    className="text-white/70 hover:text-white flex items-center space-x-2 text-sm sm:text-base"
                    title="Restart Analysis"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>Restart</span>
                  </button>
                </div>
              </div>

              {messages.length === 0 && !initialMessage ? (
                <div className="flex items-center justify-center h-full px-4">
                  <div className="text-center text-white/60 max-w-md">
                    <p className="text-base sm:text-lg mb-2">Hello! I&apos;m Ada, your design assistant.</p>
                    <p className="text-xs sm:text-sm">Describe your project idea, and I&apos;ll help bring it to life.</p>
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
                        className={`max-w-[90%] p-4 rounded-lg ${
                          message.role === 'user'
                            ? 'bg-white/20 text-white'
                            : 'bg-white/10 text-white/90'
                        }`}
                      >
                        <p className="whitespace-pre-line mb-2 leading-relaxed">{formatConversationMessage(message.content)}</p>
                        
                        {/* Show option buttons for questions */}
                        {message.isQuestion && message.options && (
                          <div className="mt-3 space-y-2">
                            {message.options.map((option, index) => (
                              <button
                                key={index}
                                onClick={() => handleQuestionnaireAnswer(option)}
                                className="block w-full text-left p-2 text-sm bg-white/10 hover:bg-white/20 rounded-md transition-colors duration-200 border border-white/20 hover:border-white/40"
                              >
                                {option}
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Show recommendation cards in carousel */}
                        {message.isRecommendationSet && message.recommendations && (
                          <div className="mt-4">
                            <div className="flex items-center gap-2 mb-3">
                              <Palette className="h-4 w-4 text-blue-400" />
                              <span className="text-sm text-white/80">Select your preferred design palette:</span>
                            </div>
                            
                            <Carousel className="w-full">
                              <CarouselContent className="-ml-2 md:-ml-4">
                                {message.recommendations.map((rec) => (
                                  <CarouselItem key={rec.id} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
                                    <div
                                      onClick={() => handleRecommendationSelect(rec)}
                                      className={`relative cursor-pointer transform transition-all duration-200 hover:scale-105 ${
                                        selectedRecommendationId === rec.id 
                                          ? 'ring-2 ring-blue-400 ring-offset-2 ring-offset-neutral-800' 
                                          : ''
                                      }`}
                                    >
                                      <RecommendationCard
                                        colors={rec.colors}
                                        headingText={rec.name}
                                        contentText={rec.description}
                                        fontFamily={rec.fonts.primary}
                                        className="w-full"
                                      />
                                      
                                      {/* Selection indicator */}
                                      {selectedRecommendationId === rec.id && (
                                        <div className="absolute top-2 right-2 bg-blue-500 rounded-full p-1">
                                          <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                          </svg>
                                        </div>
                                      )}
                                    </div>
                                  </CarouselItem>
                                ))}
                              </CarouselContent>
                              <CarouselPrevious className="text-white border-white/20 hover:bg-white/10" />
                              <CarouselNext className="text-white border-white/20 hover:bg-white/10" />
                            </Carousel>
                          </div>
                        )}

                        {/* Show component tray after recommendation selection */}
                        {message.isComponentSet && (
                          <div className="mt-4">
                            <div className="flex items-center gap-2 mb-3">
                              <Eye className="h-4 w-4 text-green-400" />
                              <span className="text-sm text-white/80">Choose components to preview with your selected palette:</span>
                            </div>
                            
                            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4">
                              <ComponentTray
                                selectedComponentId={message.selectedComponent?.id || null}
                                onComponentSelect={(component: ComponentInfo) => {
                                  setMessages(prev => prev.map(msg => 
                                    msg.id === message.id 
                                      ? {...msg, selectedComponent: component}
                                      : msg
                                  ));
                                }}
                              />
                              
                              {message.selectedComponent && (
                                <div className="mt-4 text-center">
                                  <Button
                                    onClick={() => handleComponentPreview(message.selectedComponent!.id)}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
                                  >
                                    <Eye className="h-4 w-4 mr-2" />
                                    Preview {message.selectedComponent.name}
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                        
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
                      <span className="text-sm text-white/70">ADA is thinking...</span>
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
                  ? "Describe your design project or ask me about design..." 
                  : "Choose from the options above or describe your project..."
              }
              className="w-full"
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function ChatPage() {
  return <Chat />;
}

export default ChatPage;