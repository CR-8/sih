/**
 * Google Gemini Conversation Engine
 * Handles design requirement gathering through intelligent conversations
 */

export interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    questionType?: string;
    extractedInfo?: Record<string, string | string[] | object>;
    attachments?: string[];
  };
}

export interface QuestionFlowItem {
  id: string;
  prompt: string;
  extractField: string;
  followUp: string;
}

export interface DesignRequirements {
  projectType?: string;
  targetAudience?: string;
  industry?: string;
  brandPersonality?: string[];
  preferredColors?: string[];
  colorMood?: string;
  typography?: {
    style?: string;
    mood?: string;
    readability?: string;
  };
  layoutPreferences?: {
    style?: string;
    complexity?: string;
    spacing?: string;
  };
  functionalRequirements?: string[];
  accessibility?: boolean;
  deviceTargets?: string[];
  completionLevel?: number; // 0-100
}

export interface ConversationState {
  phase: 'initial' | 'gathering' | 'clarifying' | 'summarizing' | 'completed';
  currentQuestionIndex: number;
  requirements: DesignRequirements;
  messages: ConversationMessage[];
  awaitingResponse: boolean;
}

export class ConversationEngine {
  constructor() {
    // No need to store API key since we use API route
  }

  /**
   * Design gathering question prompts
   */
  private readonly questionFlow: QuestionFlowItem[] = [
    {
      id: 'project-type',
      prompt: "I'm excited to help you create an amazing design! Let's start with the basics - what type of project are you working on? (e.g., website, mobile app, dashboard, landing page, e-commerce)",
      extractField: 'projectType',
      followUp: "Could you tell me more about what this project will be used for?"
    },
    {
      id: 'target-audience',
      prompt: "Great! Now, who is your target audience? Who will be using or viewing this design? (e.g., young professionals, seniors, tech-savvy users, general public)",
      extractField: 'targetAudience',
      followUp: "What age group or demographic should I keep in mind?"
    },
    {
      id: 'industry-context',
      prompt: "Perfect! What industry or field is this project for? (e.g., healthcare, finance, education, entertainment, e-commerce, tech startup)",
      extractField: 'industry',
      followUp: "This helps me understand the appropriate tone and style."
    },
    {
      id: 'brand-personality',
      prompt: "Let's talk about personality! How would you describe the feeling or vibe you want your design to convey? (e.g., professional, friendly, modern, playful, trustworthy, innovative)",
      extractField: 'brandPersonality',
      followUp: "You can mention multiple characteristics - what emotions should users feel?"
    },
    {
      id: 'color-preferences',
      prompt: "Now for colors! Do you have any color preferences or colors you definitely want to avoid? (e.g., blue and white, warm colors, no bright reds, corporate blues)",
      extractField: 'preferredColors',
      followUp: "What mood should the colors create - energetic, calming, professional, or creative?"
    },
    {
      id: 'typography-style',
      prompt: "Let's discuss typography! What style of text appeals to you? (e.g., clean and modern, classic and elegant, bold and impactful, friendly and approachable)",
      extractField: 'typography',
      followUp: "Should the text be highly readable for long content or more decorative for headers?"
    },
    {
      id: 'layout-complexity',
      prompt: "How complex should the layout be? (e.g., clean and minimal, rich with content, somewhere in between)",
      extractField: 'layoutPreferences',
      followUp: "Do you prefer lots of white space or more content-dense designs?"
    },
    {
      id: 'device-targets',
      prompt: "What devices will this design be viewed on primarily? (e.g., desktop, mobile, tablet, all devices equally)",
      extractField: 'deviceTargets',
      followUp: "Should I prioritize any specific device experience?"
    }
  ];

  /**
   * Initialize a new conversation
   */
  async startConversation(): Promise<ConversationState> {
    const initialMessage: ConversationMessage = {
      id: `msg-${Date.now()}`,
      role: 'assistant',
      content: `Hello! I'm your AI design assistant, and I'm here to help you create something amazing! 🎨

I'll ask you a few questions to understand your vision, and then I'll create a personalized design roadmap with color palettes, typography recommendations, and a step-by-step plan tailored just for you.

${this.questionFlow[0].prompt}`,
      timestamp: new Date(),
      metadata: {
        questionType: this.questionFlow[0].id
      }
    };

    return {
      phase: 'gathering',
      currentQuestionIndex: 0,
      requirements: { completionLevel: 0 },
      messages: [initialMessage],
      awaitingResponse: true
    };
  }

  /**
   * Process user response and continue conversation
   */
  async processUserResponse(
    userMessage: string, 
    conversationState: ConversationState
  ): Promise<ConversationState> {
    // Add user message to conversation
    const userMsg: ConversationMessage = {
      id: `msg-${Date.now()}-user`,
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    };

    const updatedMessages = [...conversationState.messages, userMsg];

    // Extract information from user response
    const currentQuestion = this.questionFlow[conversationState.currentQuestionIndex];
    const extractedInfo = await this.extractInformation(userMessage, currentQuestion);
    
    // Update requirements
    const updatedRequirements = this.updateRequirements(
      conversationState.requirements, 
      currentQuestion.extractField, 
      extractedInfo
    );

    // Calculate completion level
    updatedRequirements.completionLevel = this.calculateCompletionLevel(updatedRequirements);

    // Determine next step
    const nextQuestionIndex = conversationState.currentQuestionIndex + 1;
    let assistantResponse: ConversationMessage;
    let newPhase = conversationState.phase;

    if (nextQuestionIndex >= this.questionFlow.length) {
      // All questions completed
      assistantResponse = await this.generateSummary(updatedRequirements);
      newPhase = 'completed';
    } else {
      // Ask next question
      assistantResponse = await this.generateNextQuestion(
        nextQuestionIndex, 
        updatedRequirements,
        extractedInfo
      );
    }

    return {
      phase: newPhase,
      currentQuestionIndex: nextQuestionIndex,
      requirements: updatedRequirements,
      messages: [...updatedMessages, assistantResponse],
      awaitingResponse: newPhase !== 'completed'
    };
  }

  /**
   * Extract information from user response using Gemini
   */
  private async extractInformation(
    userMessage: string, 
    question: QuestionFlowItem
  ): Promise<string | string[] | object> {
    try {
      const extractionPrompt = `
You are analyzing a user's response to extract specific design requirements.

Question context: ${question.prompt}
User response: "${userMessage}"
Field to extract: ${question.extractField}

Please extract relevant information and return it as a structured response. 
If extracting colors, return an array of color names or hex codes.
If extracting personality traits, return an array of adjectives.
If extracting a single value, return a string.
Be concise and focus on the key information.

Return only the extracted value(s), no explanation.`;

      const response = await this.callGeminiAPI(extractionPrompt);
      return this.parseExtractedInfo(response, question.extractField);
    } catch (error) {
      console.error('Error extracting information:', error);
      return userMessage; // Fallback to raw user message
    }
  }

  /**
   * Generate next question with personalized context
   */
  private async generateNextQuestion(
    questionIndex: number, 
    requirements: DesignRequirements,
    previousResponse: string | string[] | object
  ): Promise<ConversationMessage> {
    const question = this.questionFlow[questionIndex];
    
    try {
      const contextPrompt = `
You are a friendly AI design assistant. Generate a personalized follow-up question.

Previous context: ${JSON.stringify(requirements)}
Previous response: ${previousResponse}
Next question template: ${question.prompt}

Make the question feel natural and conversational, referencing their previous answers when relevant.
Keep it concise but engaging. Add encouraging phrases.
`;

      const personalizedQuestion = await this.callGeminiAPI(contextPrompt);
      
      return {
        id: `msg-${Date.now()}-assistant`,
        role: 'assistant',
        content: personalizedQuestion,
        timestamp: new Date(),
        metadata: {
          questionType: question.id
        }
      };
    } catch {
      // Fallback to template question
      return {
        id: `msg-${Date.now()}-assistant`,
        role: 'assistant',
        content: question.prompt,
        timestamp: new Date(),
        metadata: {
          questionType: question.id
        }
      };
    }
  }

  /**
   * Generate conversation summary and next steps
   */
  private async generateSummary(requirements: DesignRequirements): Promise<ConversationMessage> {
    try {
      const summaryPrompt = `
You are a design assistant summarizing the requirements gathering.

Requirements collected: ${JSON.stringify(requirements, null, 2)}

Create an encouraging summary that:
1. Thanks the user for their detailed input
2. Briefly summarizes their key requirements
3. Mentions what you'll create next (roadmap, color palette, typography)
4. Creates excitement for the next phase

Keep it concise but enthusiastic. Use markdown formatting for better readability.
`;

      const summary = await this.callGeminiAPI(summaryPrompt);
      
      return {
        id: `msg-${Date.now()}-summary`,
        role: 'assistant',
        content: summary,
        timestamp: new Date(),
        metadata: {
          questionType: 'summary'
        }
      };
    } catch {
      return {
        id: `msg-${Date.now()}-summary`,
        role: 'assistant',
        content: `Perfect! I have all the information I need to create your design system. 

**Here's what we've gathered:**
- Project: ${requirements.projectType || 'Custom project'}
- Audience: ${requirements.targetAudience || 'Specified users'}
- Style: ${requirements.brandPersonality?.join(', ') || 'Custom style'}

Now I'll generate your personalized design roadmap, color palette, and typography recommendations! 🎨✨`,
        timestamp: new Date(),
        metadata: {
          questionType: 'summary'
        }
      };
    }
  }

  /**
   * Call Google Gemini API via our API route
   */
  private async callGeminiAPI(prompt: string): Promise<string> {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'gemini',
          prompt: prompt
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      return data.response || '';
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      throw error;
    }
  }

  /**
   * Call design recommendation API (Python ML model)
   */
  private async callDesignRecommendationAPI(requirements: DesignRequirements): Promise<string> {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'design_recommendation',
          project_type: requirements.projectType || '',
          audience: requirements.targetAudience || '',
          color_pref: requirements.preferredColors?.join(', ') || '',
          layout_pref: requirements.layoutPreferences?.style || '',
          award_winner: 'false' // Default to false, could be determined from requirements
        })
      });

      if (!response.ok) {
        throw new Error(`Design recommendation API error: ${response.status}`);
      }

      const data = await response.json();
      return data.reply || '';
    } catch (error) {
      console.error('Error calling design recommendation API:', error);
      throw error;
    }
  }

  /**
   * Parse extracted information based on field type
   */
  private parseExtractedInfo(response: string, fieldType: string): string | string[] | object {
    try {
      // Clean up the response
      const cleaned = response.trim().replace(/^[`"'\[\]{}]+|[`"'\[\]{}]+$/g, '');
      
      switch (fieldType) {
        case 'brandPersonality':
        case 'preferredColors':
        case 'deviceTargets':
        case 'functionalRequirements':
          // Try to parse as array or split by common delimiters
          if (cleaned.includes(',')) {
            return cleaned.split(',').map(item => item.trim());
          }
          return [cleaned];
        
        case 'typography':
        case 'layoutPreferences':
          // Return as object with style property
          return { style: cleaned };
        
        default:
          return cleaned;
      }
    } catch {
      return response; // Return original if parsing fails
    }
  }

  /**
   * Update requirements object with new information
   */
  private updateRequirements(
    requirements: DesignRequirements, 
    field: string, 
    value: string | string[] | object
  ): DesignRequirements {
    const updated = { ...requirements };
    
    switch (field) {
      case 'projectType':
        updated.projectType = typeof value === 'string' ? value : String(value);
        break;
      case 'targetAudience':
        updated.targetAudience = typeof value === 'string' ? value : String(value);
        break;
      case 'industry':
        updated.industry = typeof value === 'string' ? value : String(value);
        break;
      case 'brandPersonality':
        updated.brandPersonality = Array.isArray(value) ? value : [String(value)];
        break;
      case 'preferredColors':
        updated.preferredColors = Array.isArray(value) ? value : [String(value)];
        break;
      case 'typography':
        updated.typography = { ...updated.typography, ...(value as object) };
        break;
      case 'layoutPreferences':
        updated.layoutPreferences = { ...updated.layoutPreferences, ...(value as object) };
        break;
      case 'deviceTargets':
        updated.deviceTargets = Array.isArray(value) ? value : [String(value)];
        break;
      default:
        (updated as Record<string, unknown>)[field] = value;
    }
    
    return updated;
  }

  /**
   * Calculate completion percentage
   */
  private calculateCompletionLevel(requirements: DesignRequirements): number {
    const fields = [
      'projectType', 'targetAudience', 'industry', 'brandPersonality',
      'preferredColors', 'typography', 'layoutPreferences', 'deviceTargets'
    ];
    
    const completedFields = fields.filter(field => {
      const value = (requirements as Record<string, unknown>)[field];
      return value && (Array.isArray(value) ? value.length > 0 : true);
    });
    
    return Math.round((completedFields.length / fields.length) * 100);
  }

  /**
   * Generate design specifications from requirements
   */
  async generateDesignSpecs(requirements: DesignRequirements): Promise<Record<string, unknown>> {
    // First, get AI-powered recommendation from the ML model
    let aiRecommendation = '';
    try {
      aiRecommendation = await this.callDesignRecommendationAPI(requirements);
    } catch (error) {
      console.error('Error getting AI recommendation:', error);
    }

    const prompt = `
Based on these design requirements, generate comprehensive design specifications:

${JSON.stringify(requirements, null, 2)}

${aiRecommendation ? `AI Design Recommendation: ${aiRecommendation}` : ''}

Generate:
1. Color palette (5-7 colors with hex codes and usage descriptions)
2. Typography system (font recommendations for headers, body, UI)
3. Spacing and layout guidelines
4. Component style recommendations
5. Accessibility considerations

Format as structured JSON with clear categories and explanations.
`;

    try {
      const specs = await this.callGeminiAPI(prompt);
      return JSON.parse(specs);
    } catch {
      return this.generateFallbackSpecs();
    }
  }

  /**
   * Fallback design specifications
   */
  private generateFallbackSpecs(): Record<string, unknown> {
    return {
      colorPalette: {
        primary: "#2563eb",
        secondary: "#7c3aed",
        accent: "#f59e0b",
        neutral: "#6b7280",
        background: "#ffffff",
        text: "#1f2937"
      },
      typography: {
        heading: "Inter, system-ui, sans-serif",
        body: "Inter, system-ui, sans-serif",
        mono: "JetBrains Mono, monospace"
      },
      spacing: {
        unit: "0.25rem",
        scale: [0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64]
      },
      recommendations: [
        "Use consistent spacing throughout the design",
        "Maintain proper color contrast for accessibility",
        "Keep typography hierarchy clear and consistent"
      ]
    };
  }
}

/**
 * Utility function to get Gemini API key from environment
 */
export function getGeminiApiKey(): string {
  if (typeof window !== 'undefined') {
    // Client-side - should be passed from server or stored securely
    return process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
  }
  // Server-side
  return process.env.GEMINI_API_KEY || '';
}

/**
 * Create a new conversation engine instance
 */
export function createConversationEngine(): ConversationEngine {
  return new ConversationEngine();
}
