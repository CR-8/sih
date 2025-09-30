'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import RecommendationCard from '@/components/ui/recommendation-card';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Palette, CheckCircle, Loader2 } from 'lucide-react';

interface DesignData {
  projectDescription: string;
  colorPreference: string;
  theme: string;
  mood: string;
  style: string;
  targetAudience: string;
}

interface Recommendation {
  id: string;
  name: string;
  colors: string[];
  fonts: {primary: string, secondary: string};
  description: string;
  tags: string[];
}

function Recommend() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [designData, setDesignData] = useState<DesignData | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [selectedRecommendation, setSelectedRecommendation] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Get design data from URL parameters
    const dataParam = searchParams.get('data');
    if (dataParam) {
      try {
        const data = JSON.parse(decodeURIComponent(dataParam)) as DesignData;
        setDesignData(data);
        generateRecommendations(data);
      } catch (error) {
        console.error('Error parsing design data:', error);
        setError('Failed to load design preferences');
        setIsLoading(false);
      }
    } else {
      setError('No design data found');
      setIsLoading(false);
    }
  }, [searchParams]);

  const generateRecommendations = async (data: DesignData) => {
    try {
      setIsLoading(true);
      
      // This would normally come from your Flask backend
      // For now, using fallback generation
      const mockRecommendations: Recommendation[] = [
        {
          id: 'rec-1',
          name: `${data.theme} Professional`,
          colors: getColorPalette(data.colorPreference, 0),
          fonts: { primary: 'Inter', secondary: 'Open Sans' },
          description: `Perfect for ${data.projectDescription.toLowerCase()} with ${data.mood.toLowerCase()} appeal`,
          tags: [data.theme.toLowerCase(), data.mood.toLowerCase(), 'professional']
        },
        {
          id: 'rec-2',
          name: `${data.mood} Modern`,
          colors: getColorPalette(data.colorPreference, 1),
          fonts: { primary: 'Poppins', secondary: 'Roboto' },
          description: `Modern design approach for ${data.targetAudience.toLowerCase()}`,
          tags: [data.style.toLowerCase(), 'modern', 'clean']
        },
        {
          id: 'rec-3',
          name: `Creative ${data.style}`,
          colors: getColorPalette(data.colorPreference, 2),
          fonts: { primary: 'Montserrat', secondary: 'Source Sans Pro' },
          description: `Creative interpretation of ${data.style.toLowerCase()} design`,
          tags: ['creative', data.style.toLowerCase(), 'unique']
        },
        {
          id: 'rec-4',
          name: `${data.theme} Elite`,
          colors: getColorPalette(data.colorPreference, 3),
          fonts: { primary: 'Playfair Display', secondary: 'Inter' },
          description: `Premium ${data.theme.toLowerCase()} design for sophisticated audiences`,
          tags: ['premium', data.theme.toLowerCase(), 'elegant']
        },
        {
          id: 'rec-5',
          name: `Bold ${data.mood}`,
          colors: getColorPalette(data.colorPreference, 4),
          fonts: { primary: 'Oswald', secondary: 'Lato' },
          description: `Bold take on ${data.mood.toLowerCase()} design principles`,
          tags: ['bold', data.mood.toLowerCase(), 'impactful']
        }
      ];

      // Simulate AI processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setRecommendations(mockRecommendations);
    } catch (error) {
      console.error('Error generating recommendations:', error);
      setError('Failed to generate recommendations');
    } finally {
      setIsLoading(false);
    }
  };

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
      ]
    };

    const colorSet = palettes[preference] || palettes['Blue (Professional & Trust)'];
    return colorSet[index % colorSet.length];
  };

  const handleSelectRecommendation = (recommendationId: string) => {
    setSelectedRecommendation(recommendationId);
  };

  const handleProceedToComponents = () => {
    if (selectedRecommendation && designData) {
      const selectedRec = recommendations.find(r => r.id === selectedRecommendation);
      if (selectedRec) {
        // Pass both design data and selected recommendation to component designer
        const combinedData = {
          designData,
          selectedRecommendation: selectedRec
        };
        const dataParam = encodeURIComponent(JSON.stringify(combinedData));
        router.push(`/component-designer?data=${dataParam}`);
      }
    }
  };

  if (isLoading) {
    return (
      <div className='flex items-center justify-center bg-neutral-900 min-h-screen'>
        <Card className="w-96 bg-neutral-800 border-neutral-700">
          <CardContent className="p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Generating Recommendations</h3>
            <p className="text-neutral-400">Our AI is creating personalized design options for you...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex items-center justify-center bg-neutral-900 min-h-screen'>
        <Card className="w-96 bg-neutral-800 border-red-500/50">
          <CardContent className="p-8 text-center">
            <div className="text-red-500 mb-4 text-4xl">⚠️</div>
            <h3 className="text-lg font-semibold text-white mb-2">Error</h3>
            <p className="text-neutral-400 mb-4">{error}</p>
            <Button onClick={() => router.push('/chat')} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Chat
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-neutral-900 p-4'>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <Button 
              variant="ghost" 
              onClick={() => router.push('/chat')}
              className="text-neutral-400 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Chat
            </Button>
            
            <div className="flex items-center gap-2 text-neutral-400">
              <Palette className="h-5 w-5" />
              <span className="text-sm">AI Generated Recommendations</span>
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-white mb-2">Choose Your Design Style</h1>
          <p className="text-neutral-400">
            Based on your preferences, we've generated {recommendations.length} personalized design recommendations
          </p>
          
          {designData && (
            <div className="mt-4 p-4 bg-neutral-800 rounded-lg border border-neutral-700">
              <h3 className="text-sm font-medium text-neutral-300 mb-2">Your Project Requirements:</h3>
              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full">
                  {designData.projectDescription}
                </span>
                <span className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full">
                  {designData.colorPreference.split(' ')[0]}
                </span>
                <span className="px-2 py-1 bg-green-500/20 text-green-300 text-xs rounded-full">
                  {designData.theme}
                </span>
                <span className="px-2 py-1 bg-orange-500/20 text-orange-300 text-xs rounded-full">
                  {designData.mood}
                </span>
                <span className="px-2 py-1 bg-red-500/20 text-red-300 text-xs rounded-full">
                  {designData.style}
                </span>
                <span className="px-2 py-1 bg-yellow-500/20 text-yellow-300 text-xs rounded-full">
                  {designData.targetAudience}
                </span>
              </div>
            </div>
          )}
        </motion.div>

        {/* Recommendations Grid */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8"
        >
          {recommendations.map((rec, index) => (
            <motion.div
              key={rec.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative cursor-pointer transform transition-all duration-200 hover:scale-105 ${
                selectedRecommendation === rec.id 
                  ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-neutral-900' 
                  : ''
              }`}
              onClick={() => handleSelectRecommendation(rec.id)}
            >
              <RecommendationCard
                colors={rec.colors}
                headingText={rec.name}
                contentText={rec.description}
                fontFamily={rec.fonts.primary}
              />
              
              {selectedRecommendation === rec.id && (
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-2 right-2 bg-blue-500 rounded-full p-1"
                >
                  <CheckCircle className="h-4 w-4 text-white" />
                </motion.div>
              )}
              
              <div className="mt-2 text-center">
                <p className="text-sm font-medium text-white">{rec.name}</p>
                <div className="flex flex-wrap justify-center gap-1 mt-1">
                  {rec.tags.slice(0, 3).map((tag, i) => (
                    <span key={i} className="text-xs px-2 py-0.5 bg-neutral-700 text-neutral-300 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Action Button */}
        {selectedRecommendation && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <Button 
              onClick={handleProceedToComponents}
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
            >
              Continue with Selected Design
              <CheckCircle className="h-5 w-5 ml-2" />
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default Recommend;