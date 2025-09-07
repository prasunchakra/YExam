"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, use } from "react";
import Link from "next/link";
import Image from "next/image";
import { Clock, BookOpen, Play, Users } from "lucide-react";

interface TestPaper {
  id: string;
  title: string;
  description: string;
  duration: number;
  totalMarks: number;
  subject: {
    name: string;
  };
}

export default function ExamCategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [testPapers, setTestPapers] = useState<TestPaper[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Unwrap the params Promise using React.use()
  const { category } = use(params);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    } else if (status === "authenticated") {
      fetchTestPapers();
    }
  }, [status, router, category]);

  const fetchTestPapers = async () => {
    try {
      const response = await fetch(`/api/exams/category/${category}`);
      if (response.ok) {
        const data = await response.json();
        setTestPapers(data);
      }
    } catch (error) {
      console.error("Error fetching test papers:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading test papers...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const categoryNames: Record<string, string> = {
    upsc: "UPSC Civil Services",
    banking: "Banking Exams",
    engineering: "IIT JEE",
    medical: "NEET",
    management: "CAT & MBA",
    defense: "Defense Exams"
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <Link href="/exams" className="flex items-center space-x-3">
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
          <Link 
            href="/exams" 
            className="text-blue-600 hover:text-blue-700 mb-4 inline-block"
          >
            ← Back to Exams
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">
            {categoryNames[category] || category}
          </h1>
          <p className="text-gray-600">Choose a test paper to start practicing</p>
        </div>

        {/* Test Papers */}
        {testPapers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testPapers.map((testPaper) => (
              <div key={testPaper.id} className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{testPaper.title}</h3>
                    <p className="text-gray-600 text-sm mb-4">{testPaper.description}</p>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>{testPaper.duration} minutes</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <BookOpen className="w-4 h-4" />
                    <span>{testPaper.subject.name}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Users className="w-4 h-4" />
                    <span>{testPaper.totalMarks} marks</span>
                  </div>
                </div>

                <Link
                  href={`/exam/${testPaper.id}`}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center space-x-2"
                >
                  <Play className="w-4 h-4" />
                  <span>Start Test</span>
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No test papers available</h3>
            <p className="text-gray-600">Test papers for this category are coming soon.</p>
          </div>
        )}
      </div>
    </div>
  );
}
