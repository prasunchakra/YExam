"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Download, FileText, Calendar, Filter, CheckCircle } from "lucide-react";

interface ExportOptions {
  format: 'csv' | 'excel' | 'pdf';
  dateRange: {
    start: string;
    end: string;
  };
  includeFields: string[];
  filterBy: {
    role: string;
    status: string;
    activity: string;
  };
}

export default function AdminUsersExportPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isExporting, setIsExporting] = useState(false);
  const [exportHistory, setExportHistory] = useState<Array<{
    id: string;
    filename: string;
    format: string;
    recordCount: number;
    createdAt: string;
    status: 'completed' | 'processing' | 'failed';
  }>>([]);
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'csv',
    dateRange: {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0]
    },
    includeFields: ['name', 'email', 'role', 'createdAt', 'lastLogin', 'totalAttempts', 'averageScore'],
    filterBy: {
      role: 'all',
      status: 'all',
      activity: 'all'
    }
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    } else if (status === "authenticated") {
      if (session.user?.role !== "ADMIN") {
        router.push("/dashboard");
      } else {
        fetchExportHistory();
      }
    }
  }, [status, router, session]);

  const fetchExportHistory = async () => {
    try {
      const response = await fetch("/api/admin/users/export/history");
      if (response.ok) {
        const data = await response.json();
        setExportHistory(data);
      }
    } catch (error) {
      console.error("Error fetching export history:", error);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const response = await fetch("/api/admin/users/export", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(exportOptions),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `users-export-${new Date().toISOString().split('T')[0]}.${exportOptions.format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        // Refresh export history
        fetchExportHistory();
      } else {
        console.error('Export failed');
      }
    } catch (error) {
      console.error("Error exporting users:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const toggleField = (field: string) => {
    setExportOptions(prev => ({
      ...prev,
      includeFields: prev.includeFields.includes(field)
        ? prev.includeFields.filter(f => f !== field)
        : [...prev.includeFields, field]
    }));
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading export page...</p>
        </div>
      </div>
    );
  }

  if (!session || session.user?.role !== "ADMIN") {
    return null;
  }

  const availableFields = [
    { key: 'name', label: 'Full Name' },
    { key: 'email', label: 'Email Address' },
    { key: 'role', label: 'User Role' },
    { key: 'createdAt', label: 'Registration Date' },
    { key: 'lastLogin', label: 'Last Login' },
    { key: 'totalAttempts', label: 'Total Test Attempts' },
    { key: 'averageScore', label: 'Average Score' },
    { key: 'isActive', label: 'Account Status' },
    { key: 'phone', label: 'Phone Number' },
    { key: 'address', label: 'Address' }
  ];

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
            href="/admin/users" 
            className="text-blue-600 hover:text-blue-700 mb-4 inline-block"
          >
            ← Back to User Management
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Export User Data</h1>
          <p className="text-gray-600">Export user information in various formats for analysis and reporting</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Export Configuration */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Export Configuration</h2>
              
              {/* Format Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">Export Format</label>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { value: 'csv', label: 'CSV', icon: FileText },
                    { value: 'excel', label: 'Excel', icon: FileText },
                    { value: 'pdf', label: 'PDF', icon: FileText }
                  ].map((format) => (
                    <button
                      key={format.value}
                      onClick={() => setExportOptions(prev => ({ ...prev, format: format.value as any }))}
                      className={`p-4 border rounded-lg text-center hover:bg-gray-50 ${
                        exportOptions.format === format.value
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-300 text-gray-700'
                      }`}
                    >
                      <format.icon className="w-6 h-6 mx-auto mb-2" />
                      <span className="text-sm font-medium">{format.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Date Range */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">Date Range</label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Start Date</label>
                    <input
                      type="date"
                      value={exportOptions.dateRange.start}
                      onChange={(e) => setExportOptions(prev => ({
                        ...prev,
                        dateRange: { ...prev.dateRange, start: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">End Date</label>
                    <input
                      type="date"
                      value={exportOptions.dateRange.end}
                      onChange={(e) => setExportOptions(prev => ({
                        ...prev,
                        dateRange: { ...prev.dateRange, end: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Filters */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">Filters</label>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Role</label>
                    <select
                      value={exportOptions.filterBy.role}
                      onChange={(e) => setExportOptions(prev => ({
                        ...prev,
                        filterBy: { ...prev.filterBy, role: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">All Roles</option>
                      <option value="admin">Admin</option>
                      <option value="user">User</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Status</label>
                    <select
                      value={exportOptions.filterBy.status}
                      onChange={(e) => setExportOptions(prev => ({
                        ...prev,
                        filterBy: { ...prev.filterBy, status: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">All Status</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Activity</label>
                    <select
                      value={exportOptions.filterBy.activity}
                      onChange={(e) => setExportOptions(prev => ({
                        ...prev,
                        filterBy: { ...prev.filterBy, activity: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">All Users</option>
                      <option value="active">Recently Active</option>
                      <option value="inactive">Inactive Users</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Fields Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">Include Fields</label>
                <div className="grid grid-cols-2 gap-2">
                  {availableFields.map((field) => (
                    <label key={field.key} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={exportOptions.includeFields.includes(field.key)}
                        onChange={() => toggleField(field.key)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{field.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Export Button */}
              <button
                onClick={handleExport}
                disabled={isExporting || exportOptions.includeFields.length === 0}
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isExporting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Exporting...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Export Data</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Export History */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Exports</h2>
              {exportHistory.length > 0 ? (
                <div className="space-y-3">
                  {exportHistory.slice(0, 5).map((exportItem) => (
                    <div key={exportItem.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{exportItem.filename}</p>
                        <p className="text-xs text-gray-500">
                          {exportItem.recordCount} records • {exportItem.format.toUpperCase()}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(exportItem.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center">
                        {exportItem.status === 'completed' && (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        )}
                        {exportItem.status === 'processing' && (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        )}
                        {exportItem.status === 'failed' && (
                          <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No recent exports</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
