'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

interface RecommendationCardProps {
    colors?: string[];
    headingText?: string;
    contentText?: string;
    fontFamily?: string;
    className?: string;
}

// Utility function to convert hex to HSL
function hexToHsl(hex: string): string {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;
    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
}

export default function RecommendationCard({
    colors = ['#1E40AF', '#8B5CF6', '#059669', '#F97316', '#EF4444'],
    headingText = 'Modern Design',
    contentText = 'Clean & Professional',
    fontFamily = 'Inter',
    className = ''
}: RecommendationCardProps) {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast("Copied", {
            description: "Code copied to clipboard",
        });
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`flex flex-col w-[280px] h-[320px] bg-neutral-800/80 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden shadow-2xl ${className}`}
        >
            {/* Color Palette Section */}
            <div className='relative h-48 w-full bg-gradient-to-br from-neutral-700'>
                <div className='absolute inset-0 backdrop-blur-sm' />
                <div className='relative z-10 h-full w-full flex'>
                    {colors.map((color, index) => (
                        <motion.div 
                            key={index}
                            initial={{ flexGrow: 1 }}
                            animate={{ flexGrow: hoveredIndex === index ? 5 : 0.5 }}
                            transition={{ duration: 0.3 }}
                            className='h-full shadow-lg border border-white/20 relative cursor-pointer'
                            style={{ backgroundColor: color }}
                            onMouseEnter={() => setHoveredIndex(index)}
                            onMouseLeave={() => setHoveredIndex(null)}
                        >
                            {hoveredIndex === index && (
                                <motion.div 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className='absolute inset-0 flex flex-col justify-center items-center text-white font-mono'
                                >
                                    <div 
                                        className='cursor-pointer hover:underline mb-1 text-sm'
                                        onClick={() => copyToClipboard(color)}
                                    >
                                        {color}
                                    </div>
                                    <div 
                                        className='cursor-pointer hover:underline text-sm'
                                        onClick={() => copyToClipboard(hexToHsl(color))}
                                    >
                                        {hexToHsl(color)}
                                    </div>
                                </motion.div>
                            )}
                        </motion.div>
                    ))}
                </div>
            </div>
            
            {/* Font Preview Section */}
            <div className='flex-1 px-4 pt-4 bg-neutral-800/60 backdrop-blur-md'>
                <h3 className='text-white/90 text-sm font-medium mb-3'>Typography</h3>
                <div className='space-y-2'>
                    <div 
                        className='text-lg font-semibold text-white/90'
                        style={{ fontFamily }}
                    >
                        {headingText}
                    </div>
                    <div 
                        className='text-sm text-white/70'
                        style={{ fontFamily }}
                    >
                        {contentText}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
