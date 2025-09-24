"use client";

import { useState } from "react";
import { useRouter } from 'next/navigation';
import    { PromptInputBox } from "@/components/ui/ai-prompt-box";
import { motion } from 'framer-motion';

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSendMessage = async (message: string) => {
    if (!message.trim()) return;

    setIsLoading(true);
    
    // Navigate to chat page with the message
    router.push(`/chat?initialMessage=${encodeURIComponent(message)}`);
  };

  return (
    <div className="h-screen overflow-hidden flex justify-center items-center bg-[radial-gradient(125%_125%_at_50%_101%,rgba(245,87,2,1)_10.5%,rgba(245,120,2,1)_16%,rgba(245,140,2,1)_17.5%,rgba(245,170,100,1)_25%,rgba(238,174,202,1)_40%,rgba(202,179,214,1)_65%,rgba(148,201,233,1)_100%)]">
      <div className="w-full max-w-4xl h-screen flex flex-col justify-center items-center p-6">
        {/* Input Area */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="w-full max-w-2xl text-[1rem]"
        >
          <div className="backdrop-blur-md rounded-lg p-6">
            <div className="text-[1.8vw] font-bold text-white mb-4 text-center">
              Ready to start designing with Ada
            </div>
            <div className="text-white/80 text-center mb-6">
              Describe your project idea and let our AI assistant help you bring it to life.
            </div>
            <PromptInputBox
              onSend={handleSendMessage}
              isLoading={isLoading}
              placeholder="Tell me about your design project..."
              className="w-full"
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}