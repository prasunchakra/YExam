"use client";

import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Clock, Flag, CheckCircle, Circle, ArrowLeft, ArrowRight } from "lucide-react";

interface Question {
  id: string;
  question: string;
  type: string;
  marks: number;
  options: Array<{
    id: string;
    text: string;
    isCorrect: boolean;
  }>;
}

interface Section {
  id: string;
  name: string;
  questions: Question[];
}

interface TestPaper {
  id: string;
  title: string;
  duration: number;
  sections: Section[];
}

export default function ExamInterface() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const testPaperId = params.testPaperId as string;

  const [testPaper, setTestPaper] = useState<TestPaper | null>(null);
  const [currentSection, setCurrentSection] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [markedQuestions, setMarkedQuestions] = useState<Set<string>>(new Set());
  const [timeLeft, setTimeLeft] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    } else if (status === "authenticated") {
      fetchTestPaper();
    }
  }, [status, router, testPaperId]);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && testPaper) {
      handleSubmit();
    }
  }, [timeLeft, testPaper]);

  const fetchTestPaper = async () => {
    try {
      const response = await fetch(`/api/exam/${testPaperId}`);
      if (response.ok) {
        const data = await response.json();
        setTestPaper(data);
        setTimeLeft(data.duration * 60); // Convert minutes to seconds
      } else {
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Error fetching test paper:", error);
      router.push("/dashboard");
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const toggleMarkForReview = (questionId: string) => {
    setMarkedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

  const navigateToQuestion = (sectionIndex: number, questionIndex: number) => {
    setCurrentSection(sectionIndex);
    setCurrentQuestion(questionIndex);
  };

  const navigateQuestion = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      if (currentQuestion > 0) {
        setCurrentQuestion(currentQuestion - 1);
      } else if (currentSection > 0) {
        setCurrentSection(currentSection - 1);
        setCurrentQuestion(testPaper!.sections[currentSection - 1].questions.length - 1);
      }
    } else {
      if (currentQuestion < testPaper!.sections[currentSection].questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
      } else if (currentSection < testPaper!.sections.length - 1) {
        setCurrentSection(currentSection + 1);
        setCurrentQuestion(0);
      }
    }
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/exam/${testPaperId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          answers,
          timeSpent: (testPaper!.duration * 60) - timeLeft,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        router.push(`/results/${result.attemptId}`);
      } else {
        alert('Error submitting test. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting test:', error);
      alert('Error submitting test. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading exam...</p>
        </div>
      </div>
    );
  }

  if (!session || !testPaper) {
    return null;
  }

  const currentQ = testPaper.sections[currentSection].questions[currentQuestion];
  const totalQuestions = testPaper.sections.reduce((sum, section) => sum + section.questions.length, 0);
  const answeredQuestions = Object.keys(answers).length;
  const markedCount = markedQuestions.size;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">{testPaper.title}</h1>
              <p className="text-sm text-gray-600">
                Section {currentSection + 1} of {testPaper.sections.length} - Question {currentQuestion + 1} of {testPaper.sections[currentSection].questions.length}
              </p>
            </div>
            <div className="flex items-center space-x-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{answeredQuestions}/{totalQuestions}</div>
                <div className="text-xs text-gray-600">Answered</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{markedCount}</div>
                <div className="text-xs text-gray-600">Marked</div>
              </div>
              <div className="flex items-center space-x-2 bg-red-50 px-4 py-2 rounded-lg">
                <Clock className="w-5 h-5 text-red-600" />
                <span className="text-lg font-bold text-red-600">
                  {formatTime(timeLeft)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Question Palette */}
        <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto">
          <div className="p-4">
            <h3 className="font-semibold text-gray-900 mb-4">Question Palette</h3>
            <div className="space-y-4">
              {testPaper.sections.map((section, sectionIndex) => (
                <div key={section.id}>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">{section.name}</h4>
                  <div className="grid grid-cols-5 gap-2">
                    {section.questions.map((question, questionIndex) => {
                      const questionId = question.id;
                      const isAnswered = answers[questionId];
                      const isMarked = markedQuestions.has(questionId);
                      const isCurrent = sectionIndex === currentSection && questionIndex === currentQuestion;
                      
                      return (
                        <button
                          key={questionId}
                          onClick={() => navigateToQuestion(sectionIndex, questionIndex)}
                          className={`w-10 h-10 rounded-lg text-sm font-medium flex items-center justify-center ${
                            isCurrent
                              ? 'bg-blue-600 text-white'
                              : isAnswered
                              ? 'bg-green-100 text-green-800'
                              : isMarked
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {questionIndex + 1}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 space-y-2">
              <div className="flex items-center space-x-2 text-sm">
                <div className="w-4 h-4 bg-green-100 rounded"></div>
                <span className="text-gray-600">Answered</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <div className="w-4 h-4 bg-yellow-100 rounded"></div>
                <span className="text-gray-600">Marked for Review</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <div className="w-4 h-4 bg-gray-100 rounded"></div>
                <span className="text-gray-600">Not Answered</span>
              </div>
            </div>
          </div>
        </div>

        {/* Question Area */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-4">
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                        Question {currentQuestion + 1}
                      </span>
                      <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
                        {currentQ.marks} marks
                      </span>
                    </div>
                    <h2 className="text-lg font-medium text-gray-900 mb-6">
                      {currentQ.question}
                    </h2>
                  </div>
                  <button
                    onClick={() => toggleMarkForReview(currentQ.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium ${
                      markedQuestions.has(currentQ.id)
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <Flag className="w-4 h-4" />
                    <span>{markedQuestions.has(currentQ.id) ? 'Marked' : 'Mark for Review'}</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {currentQ.options.map((option) => (
                    <label
                      key={option.id}
                      className={`flex items-center space-x-3 p-4 rounded-lg border cursor-pointer hover:bg-gray-50 ${
                        answers[currentQ.id] === option.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200'
                      }`}
                    >
                      <input
                        type="radio"
                        name={`question-${currentQ.id}`}
                        value={option.id}
                        checked={answers[currentQ.id] === option.id}
                        onChange={(e) => handleAnswerChange(currentQ.id, e.target.value)}
                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <span className="text-gray-900">{option.text}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="bg-white border-t border-gray-200 p-4">
            <div className="max-w-4xl mx-auto flex items-center justify-between">
              <button
                onClick={() => navigateQuestion('prev')}
                disabled={currentSection === 0 && currentQuestion === 0}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <div className="flex items-center space-x-4">
                <button
                  onClick={() => navigateQuestion('next')}
                  disabled={currentSection === testPaper.sections.length - 1 && currentQuestion === testPaper.sections[currentSection].questions.length - 1}
                  className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>Next</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Test'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
