"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { Clock, BarChart, PlayCircle, SearchX, Headphones } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface ListeningTest {
  id: number;
  title: string;
  difficulty: string;
  duration?: number;
  questions?: number;
}

export default function ListeningListPage() {
  const [tests, setTests] = useState<ListeningTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTests = async () => {
      try {
        const res = await api.get("/listening/tests/");
        const data = res.data.results || res.data;
        setTests(data);
      } catch (err: any) {
        console.error("Failed to fetch listening tests", err);
        setError("Could not load listening tests. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchTests();
  }, []);

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Listening Practice Tests</h2>
          <p className="text-gray-600 text-lg">Listen to audio recordings and answer questions in real-time.</p>
        </div>
        
        <div className="flex gap-2">
          <select className="bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-lg outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 disabled:opacity-50" disabled={loading}>
            <option>All Difficulties</option>
            <option>Easy</option>
            <option>Medium</option>
            <option>Hard</option>
          </select>
          <select className="bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-lg outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 disabled:opacity-50" disabled={loading}>
            <option>Latest</option>
            <option>Oldest</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-6 h-48 border border-gray-100 shadow-sm animate-pulse">
              <div className="flex justify-between mb-4">
                <div className="w-20 h-6 bg-gray-200 rounded-full"></div>
                <div className="w-16 h-6 bg-gray-200 rounded-full"></div>
              </div>
              <div className="w-3/4 h-6 bg-gray-200 rounded mb-6"></div>
              <div className="flex gap-4">
                <div className="w-20 h-4 bg-gray-200 rounded"></div>
                <div className="w-24 h-4 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-600 p-6 rounded-2xl flex flex-col items-center justify-center h-64 text-center">
          <p className="text-lg font-medium">{error}</p>
        </div>
      ) : tests.length === 0 ? (
        <div className="bg-white border border-gray-100 shadow-sm rounded-2xl flex flex-col items-center justify-center p-12 text-center h-[50vh]">
          <div className="w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center mb-4">
            <SearchX className="w-10 h-10 text-purple-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No tests available</h3>
          <p className="text-gray-500 max-w-sm">We couldn't find any listening practice tests at the moment. Please check back later.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tests.map((test) => (
            <div key={test.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group flex flex-col">
              <div className="p-6 flex-1">
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-purple-50 text-purple-600 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide flex items-center gap-1">
                    <Headphones className="w-3 h-3" /> Audio
                  </div>
                  <div className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide ${
                    test.difficulty?.toLowerCase() === 'hard' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
                  }`}>
                    {test.difficulty || "Medium"}
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-purple-600 transition-colors line-clamp-2">
                  {test.title}
                </h3>
                
                <div className="flex items-center gap-6 text-sm text-gray-500 mb-6">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span>{test.duration || 40} mins</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BarChart className="w-4 h-4 text-gray-400" />
                    <span>{test.questions || 40} Questions</span>
                  </div>
                </div>
              </div>
              
              <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 rounded-b-2xl">
                <Link 
                  href={`/listening/${test.id}`} 
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-white border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-purple-600 hover:text-white hover:border-purple-600 transition-colors"
                >
                  <PlayCircle className="w-5 h-5" />
                  Start Audio Test
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
