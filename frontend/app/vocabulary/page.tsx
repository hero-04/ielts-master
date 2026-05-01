"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { BookOpen, Volume2, SearchX, Filter } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface VocabularyWord {
  id: number;
  word: string;
  definition: string;
  example_sentence?: string;
  topic?: string;
  difficulty?: string;
  audio_url?: string;
}

export default function VocabularyPage() {
  const [words, setWords] = useState<VocabularyWord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTopic, setActiveTopic] = useState("All");

  const topics = ["All", "Environment", "Technology", "Health", "Education", "Society", "Academic"];

  useEffect(() => {
    const fetchWords = async () => {
      try {
        setLoading(true);
        // If the backend supports ?topic= filter, we could pass it here.
        // For now, we fetch all (or paginated) and we can filter on frontend or pass params
        const params = activeTopic !== "All" ? { topic: activeTopic.toLowerCase() } : {};
        const res = await api.get("/vocabulary/words/", { params });
        const data = res.data.results || res.data;
        setWords(data);
      } catch (err: any) {
        console.error("Failed to fetch vocabulary words", err);
        setError("Could not load vocabulary list. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchWords();
  }, [activeTopic]);

  const playAudio = (url: string) => {
    if (url) {
      new Audio(url).play().catch(e => console.error("Error playing audio:", e));
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Vocabulary Builder</h2>
          <p className="text-gray-600 text-lg">Master essential IELTS vocabulary grouped by common topics.</p>
        </div>
      </div>

      {/* Topic Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-8 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-2 text-gray-500 mr-4">
          <Filter className="w-5 h-5" />
          <span className="font-medium">Topics:</span>
        </div>
        {topics.map((topic) => (
          <button
            key={topic}
            onClick={() => setActiveTopic(topic)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              activeTopic === topic 
                ? "bg-primary text-white shadow-sm" 
                : "bg-gray-50 text-gray-600 hover:bg-blue-50 hover:text-primary border border-gray-200"
            }`}
          >
            {topic}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-6 h-40 border border-gray-100 shadow-sm animate-pulse flex gap-4">
              <div className="w-16 h-16 bg-gray-200 rounded-xl shrink-0"></div>
              <div className="flex-1">
                <div className="w-1/3 h-6 bg-gray-200 rounded mb-3"></div>
                <div className="w-full h-4 bg-gray-200 rounded mb-2"></div>
                <div className="w-2/3 h-4 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-600 p-6 rounded-2xl flex flex-col items-center justify-center h-64 text-center">
          <p className="text-lg font-medium">{error}</p>
        </div>
      ) : words.length === 0 ? (
        <div className="bg-white border border-gray-100 shadow-sm rounded-2xl flex flex-col items-center justify-center p-12 text-center h-[50vh]">
          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-4">
            <SearchX className="w-10 h-10 text-primary" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No words found</h3>
          <p className="text-gray-500 max-w-sm">No vocabulary words were found for the topic "{activeTopic}". Please select a different topic.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {words.map((word) => (
            <div key={word.id} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between group">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-2xl font-bold text-gray-900 capitalize group-hover:text-primary transition-colors">
                    {word.word}
                  </h3>
                  {word.audio_url && (
                    <button 
                      onClick={() => playAudio(word.audio_url!)}
                      className="p-2 text-gray-400 hover:text-primary hover:bg-blue-50 rounded-lg transition-colors"
                      title="Listen to pronunciation"
                    >
                      <Volume2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
                <div className="mb-4">
                  <span className="inline-block px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded-md uppercase tracking-wider mb-2">
                    {word.topic || "General"}
                  </span>
                </div>
                <p className="text-gray-800 font-medium mb-3">
                  {word.definition}
                </p>
                {word.example_sentence && (
                  <p className="text-gray-500 italic text-sm border-l-2 border-primary pl-3 py-1">
                    "{word.example_sentence}"
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
