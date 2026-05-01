"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Clock, ArrowLeft, ArrowRight, Settings, HelpCircle, CheckSquare } from "lucide-react";
import Link from "next/link";

// Mock Data for a full test (1 passage)
const MOCK_PASSAGE = {
  title: "The Development of the London Underground",
  content: `In the first half of the 1800s, London's population grew at an astonishing rate, and the central area became increasingly congested. In addition, the expansion of the overground railway network resulted in more and more passengers arriving in the capital. However, in 1846, a Royal Commission decided that the railways should not be allowed to enter the City, the capital's historic and business centre. The result was that the overground railway stations formed a ring around the City.

The area within consisted of poorly built, overcrowded slums and the streets were full of horse-drawn traffic. Crossing the City became a nightmare. It could take an hour and a half to travel 8 km by horse-drawn carriage or bus. Numerous schemes were proposed to resolve these problems, but few succeeded.

Amongst the most vocal advocates for a solution was Charles Pearson, who worked as a solicitor for the City of London. He saw both social and economic advantages in building an underground railway that would link the overground railway stations together and clear London slums at the same time. His idea was to relocate the poor workers who lived in the inner-city slums to newly constructed suburbs, and to provide cheap rail travel for them to get to work. Pearson's ideas gained support amongst some businessmen and in 1851 he submitted a plan to Parliament. It was rejected, but coincided with a proposal from another group for an underground connecting line, which Parliament passed.

The two groups merged and established the Metropolitan Railway Company in August 1854. The company's plan was to construct an underground railway line from the Great Western Railway's (GWR) station at Paddington to the edge of the City at Farringdon Street - a distance of almost 5 km. The organisation had difficulty in raising the funding for such a radical and expensive scheme, not least because of the critical articles printed by the press.`,
};

const MOCK_QUESTIONS = [
  { id: 1, type: "multiple_choice", text: "What was the main reason for the congestion in central London in the 1800s?", options: ["Population growth", "Too many railways", "Poorly built slums", "Lack of funding"] },
  { id: 2, type: "true_false_not_given", text: "Charles Pearson was the first person to suggest an underground railway.", options: ["True", "False", "Not Given"] },
  { id: 3, type: "short_answer", text: "In what year did the Metropolitan Railway Company form?" }
];

export default function ReadingTestPage() {
  const router = useRouter();
  const params = useParams();
  
  const [timeLeft, setTimeLeft] = useState(60 * 60); // 60 minutes
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [activePassage, setActivePassage] = useState(1);
  const [fontSize, setFontSize] = useState("text-base");

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleAnswerChange = (qId: number, val: string) => {
    setAnswers({ ...answers, [qId]: val });
  };

  const handleSubmit = () => {
    if (confirm("Are you sure you want to submit your test?")) {
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      {/* Top Header - CD IELTS Style */}
      <header className="bg-[#1a3a5f] text-white flex items-center justify-between px-6 py-3 shrink-0 shadow-md z-10">
        <div className="flex items-center gap-4">
          <div className="font-bold text-xl tracking-wide">IELTS</div>
          <div className="h-6 w-[1px] bg-white/30"></div>
          <div className="text-sm">Reading</div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className={`flex items-center gap-2 font-mono text-xl font-bold bg-black/20 px-4 py-1.5 rounded ${timeLeft < 300 ? 'text-red-400 animate-pulse' : 'text-white'}`}>
            <Clock className="w-5 h-5" />
            {formatTime(timeLeft)}
          </div>
          <div className="flex items-center gap-4 text-sm">
            <button 
              className="flex items-center gap-1 hover:text-blue-200 transition-colors"
              onClick={() => setFontSize(prev => prev === "text-base" ? "text-lg" : prev === "text-lg" ? "text-xl" : "text-base")}
            >
              <Settings className="w-4 h-4" /> Text Size
            </button>
            <button className="flex items-center gap-1 hover:text-blue-200 transition-colors">
              <HelpCircle className="w-4 h-4" /> Help
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Split View */}
      <main className="flex-1 flex overflow-hidden bg-[#f0f2f5]">
        {/* Left Panel: Passage */}
        <div className="flex-1 flex flex-col border-r border-gray-300 bg-white m-2 rounded-xl shadow-sm overflow-hidden">
          <div className="bg-gray-100 px-6 py-3 border-b border-gray-200 shrink-0 flex justify-between items-center">
            <h2 className="font-bold text-gray-800">Passage {activePassage}</h2>
          </div>
          <div className={`p-8 overflow-y-auto ${fontSize} leading-relaxed text-gray-800 text-justify font-serif`}>
            <h1 className="text-2xl font-bold text-center mb-8">{MOCK_PASSAGE.title}</h1>
            {MOCK_PASSAGE.content.split('\n\n').map((paragraph, i) => (
              <p key={i} className="mb-6 indent-8">{paragraph}</p>
            ))}
          </div>
        </div>

        {/* Right Panel: Questions */}
        <div className="flex-1 flex flex-col bg-white m-2 rounded-xl shadow-sm overflow-hidden ml-0">
          <div className="bg-gray-100 px-6 py-3 border-b border-gray-200 shrink-0">
            <h2 className="font-bold text-gray-800">Questions {activePassage === 1 ? '1-3' : activePassage === 2 ? '14-26' : '27-40'}</h2>
          </div>
          <div className="p-8 overflow-y-auto text-base text-gray-800 space-y-10">
            {MOCK_QUESTIONS.map((q) => (
              <div key={q.id} className="p-4 bg-blue-50/30 rounded-xl border border-blue-100">
                <p className="font-medium mb-4 flex gap-3">
                  <span className="w-7 h-7 bg-primary text-white rounded-full flex items-center justify-center shrink-0 text-sm">{q.id}</span>
                  <span className="pt-0.5">{q.text}</span>
                </p>
                
                <div className="pl-10">
                  {q.type === "multiple_choice" || q.type === "true_false_not_given" ? (
                    <div className="space-y-3">
                      {q.options?.map((opt, i) => (
                        <label key={i} className="flex items-center gap-3 cursor-pointer p-2 hover:bg-white rounded border border-transparent hover:border-gray-200 transition-colors">
                          <input 
                            type="radio" 
                            name={`q-${q.id}`} 
                            value={opt}
                            checked={answers[q.id] === opt}
                            onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                            className="w-4 h-4 text-primary focus:ring-primary border-gray-300"
                          />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <input 
                      type="text" 
                      value={answers[q.id] || ""}
                      onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                      className="w-full max-w-sm px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                      placeholder="Type your answer..."
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Bottom Navigation */}
      <footer className="bg-white border-t border-gray-300 p-4 shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center gap-1">
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded font-medium transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex">
              {[1, 2, 3].map((num) => (
                <button 
                  key={num}
                  onClick={() => setActivePassage(num)}
                  className={`w-10 h-10 border ${activePassage === num ? 'bg-primary border-primary text-white' : 'bg-white border-gray-300 hover:bg-gray-50 text-gray-700'} font-medium transition-colors`}
                >
                  {num}
                </button>
              ))}
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded font-medium transition-colors">
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
          
          {/* Question Palette */}
          <div className="hidden lg:flex flex-wrap gap-1 max-w-2xl justify-center">
            {Array.from({length: 40}).map((_, i) => (
              <div 
                key={i} 
                className={`w-6 h-6 text-xs flex items-center justify-center border cursor-pointer hover:bg-gray-50 ${
                  i < 3 && answers[i+1] ? 'bg-blue-100 border-primary text-primary font-bold' : 'bg-white border-gray-300 text-gray-500'
                } ${i === 0 ? 'ring-2 ring-primary ring-offset-1' : ''}`}
              >
                {i + 1}
              </div>
            ))}
          </div>

          <button 
            onClick={handleSubmit}
            className="flex items-center gap-2 px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-bold transition-colors shadow-sm"
          >
            <CheckSquare className="w-5 h-5" /> Submit
          </button>
        </div>
      </footer>
    </div>
  );
}
