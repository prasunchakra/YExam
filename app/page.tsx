import Image from "next/image";
import Link from "next/link";
import { BookOpen, Users, Award, Clock, TrendingUp, Target } from "lucide-react";

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

const features = [
  {
    icon: Clock,
    title: "Realistic Test Environment",
    description: "Experience actual exam conditions with persistent timers and section-wise navigation"
  },
  {
    icon: Award,
    title: "Instant Results & Analysis",
    description: "Get detailed performance reports with percentile, rank, and subject-wise analysis"
  },
  {
    icon: Target,
    title: "Custom Quiz Builder",
    description: "Create personalized practice tests by selecting specific subjects and topics"
  },
  {
    icon: TrendingUp,
    title: "Performance Tracking",
    description: "Monitor your progress over time with comprehensive analytics and insights"
  }
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <Image
                src="/YExam.png"
                alt="YExam Logo"
                width={40}
                height={40}
                className="rounded-lg"
              />
              <span className="text-2xl font-bold text-gray-900">YExam</span>
            </div>
            <nav className="hidden md:flex space-x-8">
              <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">Dashboard</Link>
              <Link href="/exams" className="text-gray-600 hover:text-gray-900">Exams</Link>
              <Link href="/quiz" className="text-gray-600 hover:text-gray-900">Quiz Builder</Link>
              <Link href="/auth/signin" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">Sign In</Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Master Your Competitive Exams
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Prepare for UPSC, Banking, IIT JEE, NEET, CAT and more with our comprehensive mock exam platform. 
            Practice with realistic test environments and track your progress.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/auth/signup" 
              className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Start Free Trial
            </Link>
            <Link 
              href="/exams" 
              className="border border-blue-600 text-blue-600 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              Browse Exams
            </Link>
          </div>
        </div>
      </section>

      {/* Exam Categories */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Choose Your Exam Category
          </h2>
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
      </section>

      {/* Features */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Why Choose YExam?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center text-white">
            <div>
              <div className="text-4xl font-bold mb-2">10,000+</div>
              <div className="text-blue-100">Active Students</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">500+</div>
              <div className="text-blue-100">Mock Tests</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">50,000+</div>
              <div className="text-blue-100">Questions</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">95%</div>
              <div className="text-blue-100">Success Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <Image
                  src="/YExam.png"
                  alt="YExam Logo"
                  width={32}
                  height={32}
                  className="rounded-lg"
                />
                <span className="text-xl font-bold">YExam</span>
              </div>
              <p className="text-gray-400 text-sm">
                Your trusted partner for competitive exam preparation.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Exams</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/exams/upsc" className="hover:text-white">UPSC</Link></li>
                <li><Link href="/exams/banking" className="hover:text-white">Banking</Link></li>
                <li><Link href="/exams/engineering" className="hover:text-white">IIT JEE</Link></li>
                <li><Link href="/exams/medical" className="hover:text-white">NEET</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Features</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/dashboard" className="hover:text-white">Dashboard</Link></li>
                <li><Link href="/quiz" className="hover:text-white">Quiz Builder</Link></li>
                <li><Link href="/results" className="hover:text-white">Results</Link></li>
                <li><Link href="/analytics" className="hover:text-white">Analytics</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/help" className="hover:text-white">Help Center</Link></li>
                <li><Link href="/contact" className="hover:text-white">Contact Us</Link></li>
                <li><Link href="/privacy" className="hover:text-white">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-white">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            © 2024 YExam. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
