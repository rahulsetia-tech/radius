import { useState, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { API_BASE_URL } from "@/config";
import LandingNav from "@/components/LandingNav";
import HeroSection from "@/components/HeroSection";
import LLMStatementSection from "@/components/LLMStatementSection";
import VideoSection from "@/components/VideoSection";
import WhatIsGEOSection from "@/components/WhatIsGEOSection";
import { FeaturesSection } from "@/components/FeaturesSection";
import Footer from "@/components/Footer";
import type { AnalysisResult } from "@/types/schema";

/**
 * Landing Page (/)
 * 
 * ARCHITECTURAL RULES:
 * - ONLY accepts website URL input
 * - On submit: Generate analysisId → Redirect to /analysis/:analysisId
 * - NO analysis UI here
 * - NO caching of previous results
 */
export default function Home() {
  const [, navigate] = useLocation();
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeMutation = useMutation({
    mutationFn: async (url: string) => {
      // Add cache-busting headers to ensure fresh analysis
      const response = await fetch(`${API_BASE_URL}/api/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store, no-cache, must-revalidate",
          "Pragma": "no-cache",
          "X-Request-Nonce": `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        },
        body: JSON.stringify({ url }),
      });
      
      if (!response.ok) {
        throw new Error(`Analysis failed: ${response.status}`);
      }
      
      return await response.json() as AnalysisResult;
    },
    onSuccess: (data) => {
      // REDIRECT to analysis page with analysisId
      // NO analysis UI on landing page
      if (data.analysisId) {
        console.log(`✅ Analysis complete - redirecting to /analysis/${data.analysisId}`);
        navigate(`/analysis/${data.analysisId}`);
      } else {
        console.error("❌ No analysisId returned from API");
        setIsAnalyzing(false);
      }
    },
    onError: (error: Error) => {
      console.error('❌ Analysis failed:', error.message);
      setIsAnalyzing(false);
    },
  });

  const handleAnalyze = (url: string) => {
    setIsAnalyzing(true);
    analyzeMutation.mutate(url);
  };

  const handleTimelineComplete = useCallback(() => {
    // Timeline animation complete - analysis should redirect
  }, []);

  // Landing page ONLY - no analysis results rendered here
  return (
    <>
      <LandingNav />
      <HeroSection 
        onAnalyze={handleAnalyze} 
        isLoading={analyzeMutation.isPending || isAnalyzing}
        onTimelineComplete={handleTimelineComplete}
      />
      {/* Error display for failed analysis */}
      {analyzeMutation.error && !isAnalyzing && (
        <div className="max-w-2xl mx-auto mt-4 px-6">
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-center">
            <p className="text-red-600 font-medium">Analysis failed</p>
            <p className="text-red-500 text-sm mt-1">
              {analyzeMutation.error instanceof Error
                ? analyzeMutation.error.message
                : "Unknown error. Please try again."}
            </p>
            <p className="text-gray-500 text-xs mt-2">
              This usually means the AI service is temporarily unavailable. Try again in a moment.
            </p>
          </div>
        </div>
      )}
      <LLMStatementSection />
      <VideoSection />
      <WhatIsGEOSection />
      <FeaturesSection />
      <Footer />
    </>
  );
}
