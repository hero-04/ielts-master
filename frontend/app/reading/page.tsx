"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { Clock, BarChart, ArrowRight, PlayCircle } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

// Mock data to use until backend is ready
const MOCK_TESTS = [
  { id: 1, title: "Cambridge IELTS 18 - Test 1", difficulty: "Medium", duration: 60, questions: 40 },
  { id: 2, title: "Cambridge IELTS 18 - Test 2", difficulty: "Hard", duration: 60, questions: 40 },
  { id: 3, title: "Cambridge IELTS 18 - Test 3", difficulty: "Medium", duration: 60, questions: 40 },
  { id: 4, title: "Cambridge IELTS 18 - Test 4", difficulty: "Hard", duration: 60, questions: 40 },
  { id: 5, title: "Actual Test 2024 - Vol 1", difficulty: "Medium", duration: 60, questions: 40 },
  { id: 6, title: "Actual Test 2024 - Vol 2", difficulty: "Hard", duration: 60, questions: 40 },
];

export default function ReadingListPage() {
  const [tests, setTests] = useState(MOCK_TESTS);
  const [loading, setLoading] = useState(false); // Set to true when backend is ready

  useEffect(() => {
    // Fetch tests from API when backend is ready
    /*
    const fetchTests = async () => {
      try {
        const res = await api.get("/reading/tests/");
        setTests(res.data);
      } catch (err) {
        console.error("Failed to fetch reading tests", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTests();
    */
  }, []);

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Reading Practice Tests</h2>
          <p className="text-gray-600 text-lg">Select a test to begin your CD IELTS simulation.</p>
        </div>
        
        <div className="flex gap-2">
          <select className="bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-lg outline-none focus:ring-2 focus:ring-primary focus:border-primary">
            <option>All Difficulties</option>
            <option>Easy</option>
            <option>Medium</option>
            <option>Hard</option>
          </select>
          <select className="bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-lg outline-none focus:ring-2 focus:ring-primary focus:border-primary">
            <option>Latest</option>
            <option>Oldest</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-6 h-48 border border-gray-100 shadow-sm animate-pulse">
              <div className="w-3/4 h-6 bg-gray-200 rounded mb-4"></div>
              <div className="w-1/2 h-4 bg-gray-200 rounded mb-8"></div>
              <div className="flex justify-between">
                <div className="w-1/4 h-4 bg-gray-200 rounded"></div>
                <div className="w-1/4 h-4 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tests.map((test) => (
            <div key={test.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group flex flex-col">
              <div className="p-6 flex-1">
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-blue-50 text-primary text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                    Academic
                  </div>
                  <div className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide ${
                    test.difficulty === 'Hard' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
                  }`}>
                    {test.difficulty}
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-primary transition-colors line-clamp-2">
                  {test.title}
                </h3>
                
                <div className="flex items-center gap-6 text-sm text-gray-500 mb-6">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span>{test.duration} mins</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BarChart className="w-4 h-4 text-gray-400" />
                    <span>{test.questions} Questions</span>
                  </div>
                </div>
              </div>
              
              <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 rounded-b-2xl">
                <Link 
                  href={`/reading/${test.id}`} 
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-white border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-primary hover:text-white hover:border-primary transition-colors"
                >
                  <PlayCircle className="w-5 h-5" />
                  Start Test
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
