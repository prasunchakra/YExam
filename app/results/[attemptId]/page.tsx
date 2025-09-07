"use client";

import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Award, 
  TrendingUp, 
  BarChart3,
  ArrowLeft,
  Download,
  Share2
} from "lucide-react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface QuestionResult {
  id: string;
  question: string;
  selectedOption: string | null;
  correctOption: string;
  isCorrect: boolean;
  marksObtained: number;
  totalMarks: number;
  explanation?: string;
  options: Array<{
    id: string;
    text: string;
    isCorrect: boolean;
  }>;
}

interface TestResult {
  id: string;
  testPaper: {
    title: string;
    subject: {
      name: string;
      exam: {
        name: string;
        category: string;
      };
    };
  };
  totalMarks: number;
  obtainedMarks: number;
  percentage: number;
  rank: number;
  timeSpent: number;
  submittedAt: string;
  questions: QuestionResult[];
}

export default function ResultsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const attemptId = params.attemptId as string;

  const [result, setResult] = useState<TestResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'questions' | 'analysis'>('overview');

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    } else if (status === "authenticated") {
      fetchResult();
    }
  }, [status, router, attemptId]);

  const fetchResult = async () => {
    try {
      const response = await fetch(`/api/results/${attemptId}`);
      if (response.ok) {
        const data = await response.json();
        setResult(data);
      } else {
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Error fetching result:", error);
      router.push("/dashboard");
    } finally {
      setIsLoading(false);
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading results...</p>
        </div>
      </div>
    );
  }

  if (!session || !result) {
    return null;
  }

  const correctAnswers = result.questions.filter(q => q.isCorrect).length;
  const incorrectAnswers = result.questions.length - correctAnswers;
  const accuracy = result.questions.length > 0 ? Math.round((correctAnswers / result.questions.length) * 100) : 0;

  const pieData = [
    { name: 'Correct', value: correctAnswers, color: '#10B981' },
    { name: 'Incorrect', value: incorrectAnswers, color: '#EF4444' },
  ];

  const subjectWiseData = result.questions.reduce((acc, question) => {
    const subject = result.testPaper.subject.name;
    if (!acc[subject]) {
      acc[subject] = { correct: 0, total: 0 };
    }
    acc[subject].total += 1;
    if (question.isCorrect) {
      acc[subject].correct += 1;
    }
    return acc;
  }, {} as Record<string, { correct: number; total: number }>);

  const subjectChartData = Object.entries(subjectWiseData).map(([subject, data]) => ({
    subject,
    accuracy: Math.round((data.correct / data.total) * 100),
    correct: data.correct,
    total: data.total,
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link 
                href="/dashboard"
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Dashboard</span>
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{result.testPaper.title}</h1>
                <p className="text-gray-600">{result.testPaper.subject.exam.name} - {result.testPaper.subject.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg">
                <Download className="w-4 h-4" />
                <span>Download PDF</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg">
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Score Overview */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">{result.percentage}%</div>
              <div className="text-gray-600">Overall Score</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">{result.obtainedMarks}/{result.totalMarks}</div>
              <div className="text-gray-600">Marks Obtained</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 mb-2">#{result.rank}</div>
              <div className="text-gray-600">All India Rank</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-600 mb-2">{accuracy}%</div>
              <div className="text-gray-600">Accuracy</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', label: 'Overview', icon: BarChart3 },
                { id: 'questions', label: 'Question Review', icon: CheckCircle },
                { id: 'analysis', label: 'Detailed Analysis', icon: TrendingUp },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* Performance Chart */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Overview</h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {pieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={subjectChartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="subject" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="accuracy" fill="#3B82F6" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* Test Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Clock className="w-5 h-5 text-gray-600" />
                      <div>
                        <div className="text-sm text-gray-600">Time Spent</div>
                        <div className="font-semibold">{Math.round(result.timeSpent)} minutes</div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Award className="w-5 h-5 text-gray-600" />
                      <div>
                        <div className="text-sm text-gray-600">Questions Attempted</div>
                        <div className="font-semibold">{result.questions.length}</div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-gray-600" />
                      <div>
                        <div className="text-sm text-gray-600">Correct Answers</div>
                        <div className="font-semibold">{correctAnswers}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'questions' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Question-wise Review</h3>
                {result.questions.map((question, index) => (
                  <div key={question.id} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                          Q{index + 1}
                        </span>
                        <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
                          {question.totalMarks} marks
                        </span>
                        {question.isCorrect ? (
                          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                            Correct
                          </span>
                        ) : (
                          <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                            Incorrect
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-600">
                        {question.marksObtained}/{question.totalMarks} marks
                      </div>
                    </div>
                    
                    <h4 className="text-lg font-medium text-gray-900 mb-4">{question.question}</h4>
                    
                    <div className="space-y-2">
                      {question.options.map((option) => {
                        let optionClass = "p-3 rounded-lg border ";
                        if (option.isCorrect) {
                          optionClass += "border-green-500 bg-green-50 text-green-800";
                        } else if (question.selectedOption === option.id) {
                          optionClass += "border-red-500 bg-red-50 text-red-800";
                        } else {
                          optionClass += "border-gray-200 bg-gray-50 text-gray-700";
                        }
                        
                        return (
                          <div key={option.id} className={optionClass}>
                            <div className="flex items-center space-x-3">
                              {option.isCorrect ? (
                                <CheckCircle className="w-5 h-5 text-green-600" />
                              ) : question.selectedOption === option.id ? (
                                <XCircle className="w-5 h-5 text-red-600" />
                              ) : (
                                <div className="w-5 h-5 border-2 border-gray-300 rounded-full"></div>
                              )}
                              <span>{option.text}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    
                    {question.explanation && (
                      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                        <h5 className="font-medium text-blue-900 mb-2">Explanation:</h5>
                        <p className="text-blue-800 text-sm">{question.explanation}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'analysis' && (
              <div className="space-y-8">
                <h3 className="text-lg font-semibold text-gray-900">Detailed Analysis</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-4">Subject-wise Performance</h4>
                    <div className="space-y-3">
                      {subjectChartData.map((subject) => (
                        <div key={subject.subject} className="flex items-center justify-between">
                          <span className="text-gray-700">{subject.subject}</span>
                          <div className="flex items-center space-x-3">
                            <div className="w-32 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full" 
                                style={{ width: `${subject.accuracy}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium text-gray-900 w-12 text-right">
                              {subject.accuracy}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-4">Recommendations</h4>
                    <div className="space-y-3 text-sm text-gray-700">
                      {result.percentage >= 80 ? (
                        <p className="text-green-700">Excellent performance! Keep up the good work.</p>
                      ) : result.percentage >= 60 ? (
                        <p className="text-yellow-700">Good performance. Focus on weak areas for improvement.</p>
                      ) : (
                        <p className="text-red-700">Needs improvement. Consider more practice and revision.</p>
                      )}
                      
                      {subjectChartData.some(s => s.accuracy < 60) && (
                        <p>Focus more on subjects with lower accuracy scores.</p>
                      )}
                      
                      <p>Practice more mock tests to improve time management.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4">
          <Link
            href="/exams"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium"
          >
            Take Another Test
          </Link>
          <Link
            href="/dashboard"
            className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 font-medium"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
