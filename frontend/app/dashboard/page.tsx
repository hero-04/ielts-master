"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { Book, Headphones, PenTool, Mic, ArrowRight, BarChart2 } from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";

export default function DashboardPage() {
  const { user } = useAuthStore();

  const stats = [
    { name: "Reading Tests Completed", value: "12", icon: Book, color: "text-blue-500", bg: "bg-blue-50" },
    { name: "Average Reading Score", value: "7.5", icon: BarChart2, color: "text-green-500", bg: "bg-green-50" },
    { name: "Listening Tests Completed", value: "8", icon: Headphones, color: "text-purple-500", bg: "bg-purple-50" },
    { name: "Average Listening Score", value: "8.0", icon: BarChart2, color: "text-amber-500", bg: "bg-amber-50" },
  ];

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Welcome back, {user?.full_name?.split(" ")[0] || "Student"}!</h2>
        <p className="text-gray-600 mt-2 text-lg">Ready to continue your IELTS preparation journey?</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg} ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">{stat.name}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <h3 className="text-xl font-bold text-gray-900 mb-6">Quick Start</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {/* Practice Cards */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
          <div className="relative z-10">
            <div className="w-14 h-14 bg-primary text-white rounded-xl flex items-center justify-center mb-6 shadow-md">
              <Book className="w-7 h-7" />
            </div>
            <h4 className="text-2xl font-bold text-gray-900 mb-2">Reading Practice</h4>
            <p className="text-gray-600 mb-6">Full 60-minute CD IELTS simulation with all 3 passages and 40 questions.</p>
            <Link href="/reading" className="inline-flex items-center gap-2 text-primary font-semibold hover:text-primary-dark transition-colors">
              Start new test <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50 rounded-bl-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
          <div className="relative z-10">
            <div className="w-14 h-14 bg-purple-600 text-white rounded-xl flex items-center justify-center mb-6 shadow-md">
              <Headphones className="w-7 h-7" />
            </div>
            <h4 className="text-2xl font-bold text-gray-900 mb-2">Listening Practice</h4>
            <p className="text-gray-600 mb-6">Adjustable audio, real exam interface, and instant band score calculation.</p>
            <Link href="/listening" className="inline-flex items-center gap-2 text-purple-600 font-semibold hover:text-purple-800 transition-colors">
              Start new test <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-bl-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
          <div className="relative z-10">
            <div className="w-14 h-14 bg-amber-500 text-white rounded-xl flex items-center justify-center mb-6 shadow-md">
              <PenTool className="w-7 h-7" />
            </div>
            <h4 className="text-2xl font-bold text-gray-900 mb-2">Writing with AI</h4>
            <p className="text-gray-600 mb-6">Get instant feedback on TR, CC, LR, and GRA with our advanced AI grading.</p>
            <Link href="/writing" className="inline-flex items-center gap-2 text-amber-600 font-semibold hover:text-amber-800 transition-colors">
              Write an essay <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 rounded-bl-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
          <div className="relative z-10">
            <div className="w-14 h-14 bg-green-500 text-white rounded-xl flex items-center justify-center mb-6 shadow-md">
              <Mic className="w-7 h-7" />
            </div>
            <h4 className="text-2xl font-bold text-gray-900 mb-2">Speaking Simulation</h4>
            <p className="text-gray-600 mb-6">Practice all 3 parts of the speaking test with immediate pronunciation feedback.</p>
            <Link href="/speaking" className="inline-flex items-center gap-2 text-green-600 font-semibold hover:text-green-800 transition-colors">
              Start speaking <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
