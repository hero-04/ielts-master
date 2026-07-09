"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { Headphones } from "lucide-react";

export default function ListeningListPage() {
  return (
    <DashboardLayout>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Listening Practice Tests</h2>
        <p className="text-gray-600 text-lg">Choose a test to begin your IELTS listening practice.</p>
      </div>

      <div className="bg-white border border-gray-100 shadow-sm rounded-2xl flex flex-col items-center justify-center p-16 text-center">
        <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mb-4">
          <Headphones className="w-8 h-8 text-purple-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">No tests available yet</h3>
        <p className="text-gray-500 max-w-sm">Coming soon — check back later for new IELTS listening practice tests.</p>
      </div>
    </DashboardLayout>
  );
}
