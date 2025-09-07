"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Plus, Edit, Trash2, Eye, Search, Filter, BookOpen, Clock, Users, Star } from "lucide-react";

interface TestPaper {
  id: string;
  title: string;
  description: string;
  exam: {
    id: string;
    name: string;
    category: string;
  };
  subject: {
    id: string;
    name: string;
  };
  duration: number;
  totalMarks: number;
  totalQuestions: number;
  difficulty: 'easy' | 'medium' | 'hard';
  isActive: boolean;
  createdAt: string;
  attempts: number;
  averageScore: number;
  questions: Array<{
    id: string;
    question: string;
    type: string;
    points: number;
  }>;
}

export default function AdminTestPapersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [testPapers, setTestPapers] = useState<TestPaper[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterExam, setFilterExam] = useState("all");
  const [filterSubject, setFilterSubject] = useState("all");
  const [filterDifficulty, setFilterDifficulty] = useState("all");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    } else if (status === "authenticated") {
      if (session.user?.role !== "ADMIN") {
        router.push("/dashboard");
      } else {
        fetchTestPapers();
      }
    }
  }, [status, router, session]);

  const fetchTestPapers = async () => {
    try {
      const response = await fetch("/api/admin/test-papers");
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

  const filteredTestPapers = testPapers.filter(testPaper => {
    const matchesSearch = testPaper.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         testPaper.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         testPaper.exam.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesExam = filterExam === "all" || testPaper.exam.id === filterExam;
    const matchesSubject = filterSubject === "all" || testPaper.subject.id === filterSubject;
    const matchesDifficulty = filterDifficulty === "all" || testPaper.difficulty === filterDifficulty;
    return matchesSearch && matchesExam && matchesSubject && matchesDifficulty;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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

  if (!session || session.user?.role !== "ADMIN") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <Link href="/admin" className="flex items-center space-x-3">
                <Image
                  src="/YExam.png"
                  alt="YExam Logo"
                  width={40}
                  height={40}
                  className="rounded-lg"
                />
                <span className="text-2xl font-bold text-gray-900">YExam Admin</span>
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
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link 
              href="/admin" 
              className="text-blue-600 hover:text-blue-700 mb-4 inline-block"
            >
              ← Back to Admin Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Test Papers Management</h1>
            <p className="text-gray-600">Manage test papers and their questions</p>
          </div>
          <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
            <Plus className="w-5 h-5" />
            <span>Create Test Paper</span>
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search test papers by title, description, or exam..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <select
                value={filterExam}
                onChange={(e) => setFilterExam(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Exams</option>
                <option value="upsc">UPSC</option>
                <option value="banking">Banking</option>
                <option value="engineering">Engineering</option>
              </select>
            </div>
            <div>
              <select
                value={filterDifficulty}
                onChange={(e) => setFilterDifficulty(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Difficulties</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>
        </div>

        {/* Test Papers List */}
        {filteredTestPapers.length > 0 ? (
          <div className="space-y-6">
            {filteredTestPapers.map((testPaper) => (
              <div key={testPaper.id} className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getDifficultyColor(testPaper.difficulty)}`}>
                        {testPaper.difficulty.toUpperCase()}
                      </span>
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {testPaper.exam.category.toUpperCase()}
                      </span>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        testPaper.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {testPaper.isActive ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{testPaper.title}</h3>
                    <p className="text-gray-600 mb-4">{testPaper.description}</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-2">
                        <BookOpen className="w-4 h-4" />
                        <span>{testPaper.exam.name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4" />
                        <span>{testPaper.duration} min</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Star className="w-4 h-4" />
                        <span>{testPaper.totalMarks} marks</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4" />
                        <span>{testPaper.attempts} attempts</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <button className="text-blue-600 hover:text-blue-900 p-2">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="text-indigo-600 hover:text-indigo-900 p-2">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="text-red-600 hover:text-red-900 p-2">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Questions Preview */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium text-gray-700">Questions ({testPaper.totalQuestions})</h4>
                    <span className="text-sm text-gray-500">Avg Score: {testPaper.averageScore.toFixed(1)}%</span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {testPaper.questions.slice(0, 4).map((question) => (
                      <div key={question.id} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium text-gray-600">{question.type.replace('_', ' ').toUpperCase()}</span>
                          <span className="text-xs text-gray-500">{question.points} pts</span>
                        </div>
                        <p className="text-sm text-gray-700 line-clamp-2">{question.question}</p>
                      </div>
                    ))}
                    {testPaper.questions.length > 4 && (
                      <div className="p-3 bg-gray-100 rounded-lg flex items-center justify-center">
                        <span className="text-sm text-gray-500">
                          +{testPaper.questions.length - 4} more questions
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>Created: {new Date(testPaper.createdAt).toLocaleDateString()}</span>
                    <span>Subject: {testPaper.subject.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200">
                      Preview
                    </button>
                    <button className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-full hover:bg-green-200">
                      Duplicate
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No test papers found</h3>
            <p className="text-gray-600 mb-6">Create your first test paper or adjust your search criteria.</p>
            <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 inline-flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>Create First Test Paper</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
