"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { Mic, Sparkles, Clock, AudioWaveform } from "lucide-react";

export default function SpeakingPage() {
  return (
    <DashboardLayout>
      <div className="flex flex-col items-center justify-center h-[70vh] text-center max-w-2xl mx-auto px-4">
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-green-200 rounded-full blur-xl opacity-50 animate-pulse"></div>
          <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-600 text-white rounded-2xl flex items-center justify-center relative z-10 shadow-xl shadow-green-500/20 transform rotate-6">
            <Mic className="w-12 h-12" />
          </div>
          <div className="absolute -bottom-4 -left-4 bg-white p-2 rounded-full shadow-lg z-20 text-emerald-500 animate-bounce" style={{ animationDelay: '200ms' }}>
            <AudioWaveform className="w-6 h-6" />
          </div>
          <div className="absolute -top-4 -right-4 bg-white p-2 rounded-full shadow-lg z-20 text-green-500 animate-bounce">
            <Sparkles className="w-6 h-6" />
          </div>
        </div>

        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 tracking-tight">
          AI Speaking Examiner
        </h1>
        
        <p className="text-xl text-gray-600 mb-10 leading-relaxed">
          Get ready to practice with our lifelike AI examiner. You'll be able to record your voice for all 3 parts of the speaking test and receive instant pronunciation and fluency feedback.
        </p>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 w-full max-w-md">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center justify-center gap-2">
            <Clock className="w-5 h-5 text-green-500" />
            Coming Very Soon
          </h3>
          <ul className="text-left text-sm text-gray-600 space-y-3">
            <li className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-green-400"></div>
              Real-time speech-to-text transcription
            </li>
            <li className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-green-400"></div>
              Fluency & Coherence grading
            </li>
            <li className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-green-400"></div>
              Lexical Resource evaluation
            </li>
            <li className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-green-400"></div>
              Pronunciation & Grammatical accuracy
            </li>
          </ul>
        </div>
      </div>
    </DashboardLayout>
  );
}
