"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

const examCategories = [
  {
    id: "upsc",
    name: "UPSC Civil Services",
    description: "Prepare for India's most prestigious civil services examination",
    icon: "🏛️",
    color: "bg-blue-500",
    examCount: 12
  },
  {
    id: "banking",
    name: "Banking Exams",
    description: "IBPS, SBI, RBI and other banking sector examinations",
    icon: "🏦",
    color: "bg-green-500",
    examCount: 8
  },
  {
    id: "engineering",
    name: "IIT JEE",
    description: "Joint Entrance Examination for IITs and NITs",
    icon: "⚗️",
    color: "bg-purple-500",
    examCount: 15
  },
  {
    id: "medical",
    name: "NEET",
    description: "National Eligibility cum Entrance Test for medical courses",
    icon: "🩺",
    color: "bg-red-500",
    examCount: 10
  },
  {
    id: "management",
    name: "CAT & MBA",
    description: "Common Admission Test and other management entrance exams",
    icon: "📊",
    color: "bg-orange-500",
    examCount: 6
  },
  {
    id: "defense",
    name: "Defense Exams",
    description: "NDA, CDS, AFCAT and other defense service examinations",
    icon: "🛡️",
    color: "bg-gray-500",
    examCount: 5
  }
];

export default function ExamsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading exams...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <Link href="/dashboard" className="flex items-center space-x-3">
                <Image
                  src="/YExam.png"
                  alt="YExam Logo"
                  width={40}
                  height={40}
                  className="rounded-lg"
                />
                <span className="text-2xl font-bold text-gray-900">YExam</span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">Welcome, {session.user?.name}</span>
              <Link 
                href="/api/auth/signout"
                className="text-gray-600 hover:text-gray-900"
              >
                Sign Out
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Available Exams</h1>
          <p className="text-gray-600">Choose an exam category to start practicing</p>
        </div>

        {/* Exam Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {examCategories.map((category) => (
            <Link
              key={category.id}
              href={`/exams/${category.id}`}
              className="group bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 p-6 border border-gray-200 hover:border-blue-300"
            >
              <div className="flex items-center space-x-4 mb-4">
                <div className={`w-12 h-12 ${category.color} rounded-lg flex items-center justify-center text-2xl`}>
                  {category.icon}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600">
                    {category.name}
                  </h3>
                  <p className="text-sm text-gray-500">{category.examCount} exams available</p>
                </div>
              </div>
              <p className="text-gray-600 text-sm">{category.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
