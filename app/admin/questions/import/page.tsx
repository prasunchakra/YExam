"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Upload, Download, FileText, CheckCircle, AlertCircle, ArrowLeft } from "lucide-react";

interface ImportResult {
  success: boolean;
  totalQuestions: number;
  importedQuestions: number;
  failedQuestions: number;
  errors: string[];
}

interface ImportTemplate {
  id: string;
  name: string;
  description: string;
  format: string;
  downloadUrl: string;
}

export default function AdminQuestionsImportPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isImporting, setIsImporting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [importHistory, setImportHistory] = useState<Array<{
    id: string;
    filename: string;
    totalQuestions: number;
    importedQuestions: number;
    failedQuestions: number;
    createdAt: string;
    status: 'success' | 'partial' | 'failed';
  }>>([]);

  const templates: ImportTemplate[] = [
    {
      id: '1',
      name: 'Multiple Choice Template',
      description: 'CSV template for multiple choice questions',
      format: 'CSV',
      downloadUrl: '/templates/multiple-choice-template.csv'
    },
    {
      id: '2',
      name: 'Mixed Question Types Template',
      description: 'Excel template supporting all question types',
      format: 'Excel',
      downloadUrl: '/templates/mixed-questions-template.xlsx'
    },
    {
      id: '3',
      name: 'True/False Template',
      description: 'CSV template for true/false questions',
      format: 'CSV',
      downloadUrl: '/templates/true-false-template.csv'
    }
  ];

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    } else if (status === "authenticated") {
      if (session.user?.role !== "ADMIN") {
        router.push("/dashboard");
      } else {
        fetchImportHistory();
      }
    }
  }, [status, router, session]);

  const fetchImportHistory = async () => {
    try {
      const response = await fetch("/api/admin/questions/import/history");
      if (response.ok) {
        const data = await response.json();
        setImportHistory(data);
      }
    } catch (error) {
      console.error("Error fetching import history:", error);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setImportResult(null);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) return;

    setIsImporting(true);
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch("/api/admin/questions/import", {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      setImportResult(result);
      
      if (result.success || result.importedQuestions > 0) {
        // Refresh import history
        fetchImportHistory();
      }
    } catch (error) {
      console.error("Error importing questions:", error);
      setImportResult({
        success: false,
        totalQuestions: 0,
        importedQuestions: 0,
        failedQuestions: 0,
        errors: ['Import failed due to a network error']
      });
    } finally {
      setIsImporting(false);
    }
  };

  const downloadTemplate = (template: ImportTemplate) => {
    // In a real application, this would download the actual template file
    console.log(`Downloading template: ${template.name}`);
    // For now, we'll just show an alert
    alert(`Template download would start: ${template.downloadUrl}`);
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading import page...</p>
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
        <div className="mb-8">
          <Link 
            href="/admin/questions" 
            className="text-blue-600 hover:text-blue-700 mb-4 inline-flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Questions</span>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Bulk Import Questions</h1>
          <p className="text-gray-600">Import multiple questions at once using CSV or Excel files</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Import Section */}
          <div>
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Import Questions</h2>
              
              {/* File Upload */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Select File</label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-gray-400 transition-colors">
                  <div className="space-y-1 text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                        <span>Upload a file</span>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          accept=".csv,.xlsx,.xls"
                          onChange={handleFileSelect}
                          className="sr-only"
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">CSV, Excel files up to 10MB</p>
                  </div>
                </div>
                
                {selectedFile && (
                  <div className="mt-2 flex items-center space-x-2 text-sm text-gray-600">
                    <FileText className="w-4 h-4" />
                    <span>{selectedFile.name}</span>
                    <span className="text-gray-400">({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)</span>
                  </div>
                )}
              </div>

              {/* Import Button */}
              <button
                onClick={handleImport}
                disabled={!selectedFile || isImporting}
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isImporting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Importing...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span>Import Questions</span>
                  </>
                )}
              </button>

              {/* Import Result */}
              {importResult && (
                <div className={`mt-6 p-4 rounded-lg ${
                  importResult.success 
                    ? 'bg-green-50 border border-green-200' 
                    : importResult.importedQuestions > 0
                    ? 'bg-yellow-50 border border-yellow-200'
                    : 'bg-red-50 border border-red-200'
                }`}>
                  <div className="flex items-start">
                    {importResult.success ? (
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                    )}
                    <div className="ml-3">
                      <h3 className={`text-sm font-medium ${
                        importResult.success 
                          ? 'text-green-800' 
                          : importResult.importedQuestions > 0
                          ? 'text-yellow-800'
                          : 'text-red-800'
                      }`}>
                        {importResult.success 
                          ? 'Import Successful' 
                          : importResult.importedQuestions > 0
                          ? 'Partial Import Success'
                          : 'Import Failed'
                        }
                      </h3>
                      <div className={`mt-2 text-sm ${
                        importResult.success 
                          ? 'text-green-700' 
                          : importResult.importedQuestions > 0
                          ? 'text-yellow-700'
                          : 'text-red-700'
                      }`}>
                        <p>Total Questions: {importResult.totalQuestions}</p>
                        <p>Imported: {importResult.importedQuestions}</p>
                        <p>Failed: {importResult.failedQuestions}</p>
                        {importResult.errors.length > 0 && (
                          <div className="mt-2">
                            <p className="font-medium">Errors:</p>
                            <ul className="list-disc list-inside">
                              {importResult.errors.map((error, index) => (
                                <li key={index}>{error}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Templates Section */}
          <div>
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Download Templates</h2>
              <p className="text-sm text-gray-600 mb-6">
                Use these templates to format your questions correctly before importing.
              </p>
              
              <div className="space-y-4">
                {templates.map((template) => (
                  <div key={template.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-gray-900">{template.name}</h3>
                      <p className="text-sm text-gray-500">{template.description}</p>
                      <span className="inline-block mt-1 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                        {template.format}
                      </span>
                    </div>
                    <button
                      onClick={() => downloadTemplate(template)}
                      className="ml-4 text-blue-600 hover:text-blue-700 flex items-center space-x-1"
                    >
                      <Download className="w-4 h-4" />
                      <span className="text-sm">Download</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Import History */}
            <div className="bg-white rounded-lg shadow-sm border p-6 mt-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Imports</h2>
              {importHistory.length > 0 ? (
                <div className="space-y-3">
                  {importHistory.slice(0, 5).map((importItem) => (
                    <div key={importItem.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{importItem.filename}</p>
                        <p className="text-xs text-gray-500">
                          {importItem.importedQuestions}/{importItem.totalQuestions} questions imported
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(importItem.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center">
                        {importItem.status === 'success' && (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        )}
                        {importItem.status === 'partial' && (
                          <AlertCircle className="w-4 h-4 text-yellow-500" />
                        )}
                        {importItem.status === 'failed' && (
                          <AlertCircle className="w-4 h-4 text-red-500" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No recent imports</p>
              )}
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">Import Instructions</h3>
          <div className="text-sm text-blue-800 space-y-2">
            <p><strong>Supported formats:</strong> CSV (.csv), Excel (.xlsx, .xls)</p>
            <p><strong>File size limit:</strong> 10MB maximum</p>
            <p><strong>Required columns:</strong> question, type, difficulty, subject, points</p>
            <p><strong>Optional columns:</strong> category, explanation, timeLimit, options (for multiple choice)</p>
            <p><strong>Question types:</strong> multiple_choice, true_false, short_answer, essay</p>
            <p><strong>Difficulty levels:</strong> easy, medium, hard</p>
          </div>
        </div>
      </div>
    </div>
  );
}
