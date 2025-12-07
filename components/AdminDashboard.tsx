'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useLanguage } from './LanguageProvider';
import type { AdminSession } from '@/lib/auth';

const translations = {
  he: {
    dashboard: 'לוח בקרה למנהלים',
    welcome: 'שלום',
    logout: 'התנתק',
    loggingOut: 'מתנתק...',
    loading: 'טוען נתונים...',
    
    // Stats
    totalProjects: 'סה״כ פרויקטים',
    projectsWithIssues: 'פרויקטים עם בעיות',
    totalIssues: 'סה״כ בעיות',
    totalValue: 'ערך כולל',
    avgValue: 'ערך ממוצע',
    needsReview: 'דורש בדיקה',
    approved: 'אושר',
    pendingAnalysis: 'ממתין לניתוח',
    recentProjects: 'פרויקטים חדשים (7 ימים)',
    
    // Approvals
    laApproval: 'אישור ועדה מקומית',
    avivaApproval: 'אישור אביבה',
    
    // Projects table
    projectsOverview: 'סקירת פרויקטים',
    kibbutz: 'קיבוץ',
    projectName: 'שם הפרויקט',
    submitter: 'שם מגיש',
    price: 'מחיר',
    status: 'סטטוס',
    issues: 'בעיות',
    aiStatus: 'סטטוס AI',
    actions: 'פעולות',
    view: 'צפה',
    noProjects: 'אין פרויקטים במערכת',
    noIssues: 'אין בעיות',
    files: 'קבצים',
    noFiles: 'אין קבצים',
    fileName: 'שם קובץ',
    fileType: 'סוג',
    fileSize: 'גודל',
    uploadedAt: 'הועלה בתאריך',
    
    // Status values
    draft: 'טיוטה',
    submitted: 'הוגש',
    reviewed: 'נבדק',
    
    // AI Status
    aiApproved: '✓ אושר',
    aiNeedsReview: '⚠ דורש בדיקה',
    aiPending: '○ ממתין',
    
    // Approvals
    yes: 'כן',
    no: 'לא',
    pending: 'ממתין',
    
    currency: '₪',
  },
  en: {
    dashboard: 'Admin Dashboard',
    welcome: 'Welcome',
    logout: 'Logout',
    loggingOut: 'Logging out...',
    loading: 'Loading data...',
    
    // Stats
    totalProjects: 'Total Projects',
    projectsWithIssues: 'Projects with Issues',
    totalIssues: 'Total Issues',
    totalValue: 'Total Value',
    avgValue: 'Average Value',
    needsReview: 'Needs Review',
    approved: 'Approved',
    pendingAnalysis: 'Pending Analysis',
    recentProjects: 'Recent Projects (7 days)',
    
    // Approvals
    laApproval: 'LA Approval',
    avivaApproval: 'Aviva Approval',
    
    // Projects table
    projectsOverview: 'Projects Overview',
    kibbutz: 'Kibbutz',
    projectName: 'Project Name',
    submitter: 'Submitter',
    price: 'Price',
    status: 'Status',
    issues: 'Issues',
    aiStatus: 'AI Status',
    actions: 'Actions',
    view: 'View',
    noProjects: 'No projects in the system',
    noIssues: 'No issues',
    files: 'Files',
    noFiles: 'No files',
    fileName: 'File Name',
    fileType: 'Type',
    fileSize: 'Size',
    uploadedAt: 'Uploaded',
    
    // Status values
    draft: 'Draft',
    submitted: 'Submitted',
    reviewed: 'Reviewed',
    
    // AI Status
    aiApproved: '✓ Approved',
    aiNeedsReview: '⚠ Needs Review',
    aiPending: '○ Pending',
    
    // Approvals
    yes: 'Yes',
    no: 'No',
    pending: 'Pending',
    
    currency: '₪',
  },
};

interface ProjectFile {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  mimeType: string;
  createdAt: string;
  downloadUrl: string | null;
}

interface Project {
  id: string;
  kibbutzName: string;
  projectName: string;
  submitterName: string;
  submitterEmail: string;
  submitterPhone: string;
  invoicePrice: number | null;
  status: string;
  laApproval: boolean | null;
  avivaApproval: boolean | null;
  additionalNotes: string | null;
  createdAt: string;
  updatedAt: string;
  filesCount: number;
  files: ProjectFile[];
  analysis: {
    isApproved: boolean | null;
    analysisNotes: string | null;
    confidenceScore: number | null;
    issues: string[];
    createdAt: string;
  } | null;
}

interface DashboardData {
  stats: {
    totalProjects: number;
    submittedProjects: number;
    draftProjects: number;
    totalValue: number;
    avgValue: number;
    laApprovedCount: number;
    avivaApprovedCount: number;
    projectsWithIssues: number;
    totalIssues: number;
    approvedByAI: number;
    needsReview: number;
    pendingAnalysis: number;
  };
  projects: Project[];
  fileTypeStats: Record<string, number>;
  projectsByKibbutz: Record<string, number>;
  recentProjects: number;
}

interface AdminDashboardProps {
  session: AdminSession;
}

export default function AdminDashboard({ session }: AdminDashboardProps) {
  const router = useRouter();
  const { language } = useLanguage();
  const t = translations[language];
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<DashboardData | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/admin/dashboard');
      if (response.ok) {
        const dashboardData = await response.json();
        setData(dashboardData);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setDataLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await fetch('/api/admin/logout', {
        method: 'POST',
      });
      router.push('/admin/login');
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
      setLoading(false);
    }
  };

  const formatCurrency = (value: number | null) => {
    if (!value) return '—';
    return new Intl.NumberFormat(language === 'he' ? 'he-IL' : 'en-US').format(value);
  };

  const getAIStatusLabel = (analysis: Project['analysis']) => {
    if (!analysis) return t.aiPending;
    if (analysis.isApproved === true) return t.aiApproved;
    if (analysis.isApproved === false) return t.aiNeedsReview;
    return t.aiPending;
  };

  const getAIStatusColor = (analysis: Project['analysis']) => {
    if (!analysis) return 'text-gray-500';
    if (analysis.isApproved === true) return 'text-green-600';
    if (analysis.isApproved === false) return 'text-red-600';
    return 'text-gray-500';
  };

  const toggleProjectExpansion = (projectId: string) => {
    setExpandedProjects(prev => {
      const newSet = new Set(prev);
      if (newSet.has(projectId)) {
        newSet.delete(projectId);
      } else {
        newSet.add(projectId);
      }
      return newSet;
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileTypeLabel = (fileType: string) => {
    const labels: Record<string, { he: string; en: string }> = {
      invoice: { he: 'חשבונית', en: 'Invoice' },
      proposal: { he: 'הצעה', en: 'Proposal' },
      tender: { he: 'מכרז', en: 'Tender' },
      committee_approval: { he: 'אישור ועדה', en: 'Committee Approval' },
      charge_notice: { he: 'הודעת חיוב', en: 'Charge Notice' },
    };
    return labels[fileType]?.[language] || fileType;
  };

  if (dataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">{t.loading}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {t.dashboard}
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                {t.welcome}, {session.name}
              </p>
            </div>
            <button
              onClick={handleLogout}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              {loading ? t.loggingOut : t.logout}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-6 py-8 w-full">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Total Projects */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  {t.totalProjects}
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {data?.stats.totalProjects || 0}
                </p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Projects with Issues */}
          <div className="bg-white rounded-xl border border-red-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  {t.projectsWithIssues}
                </p>
                <p className="text-3xl font-bold text-red-600 mt-2">
                  {data?.stats.projectsWithIssues || 0}
                </p>
              </div>
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Total Issues */}
          <div className="bg-white rounded-xl border border-orange-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  {t.totalIssues}
                </p>
                <p className="text-3xl font-bold text-orange-600 mt-2">
                  {data?.stats.totalIssues || 0}
                </p>
              </div>
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Total Value */}
          <div className="bg-white rounded-xl border border-green-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  {t.totalValue}
                </p>
                <p className="text-3xl font-bold text-green-600 mt-2">
                  {formatCurrency(data?.stats.totalValue || 0)} {t.currency}
                </p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Secondary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-xs font-medium text-gray-500 mb-2">{t.needsReview}</p>
            <p className="text-2xl font-bold text-gray-900">{data?.stats.needsReview || 0}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-xs font-medium text-gray-500 mb-2">{t.approved}</p>
            <p className="text-2xl font-bold text-gray-900">{data?.stats.approvedByAI || 0}</p>
          </div>
          <div className="bg-white rounded-lg border border-green-200 p-4">
            <p className="text-xs font-medium text-gray-500 mb-2">{t.laApproval}</p>
            <p className="text-2xl font-bold text-green-600">{data?.stats.laApprovedCount || 0}</p>
          </div>
          <div className="bg-white rounded-lg border border-blue-200 p-4">
            <p className="text-xs font-medium text-gray-500 mb-2">{t.avivaApproval}</p>
            <p className="text-2xl font-bold text-blue-600">{data?.stats.avivaApprovedCount || 0}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-xs font-medium text-gray-500 mb-2">{t.recentProjects}</p>
            <p className="text-2xl font-bold text-gray-900">{data?.recentProjects || 0}</p>
          </div>
        </div>

        {/* Projects Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-900">{t.projectsOverview}</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-start text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {t.kibbutz}
                  </th>
                  <th className="px-6 py-3 text-start text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {t.projectName}
                  </th>
                  <th className="px-6 py-3 text-start text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {t.submitter}
                  </th>
                  <th className="px-6 py-3 text-start text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {t.price}
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {t.laApproval}
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {t.avivaApproval}
                  </th>
                  <th className="px-6 py-3 text-start text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {t.aiStatus}
                  </th>
                  <th className="px-6 py-3 text-start text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {t.issues}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data?.projects && data.projects.length > 0 ? (
                  data.projects.map((project) => {
                    const isExpanded = expandedProjects.has(project.id);
                    return (
                      <React.Fragment key={project.id}>
                        <tr 
                          className="hover:bg-gray-50 transition-colors cursor-pointer"
                          onClick={() => toggleProjectExpansion(project.id)}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <svg 
                                className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                              <div className="text-sm font-medium text-gray-900">{project.kibbutzName}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">{project.projectName || '—'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{project.submitterName}</div>
                            <div className="text-xs text-gray-500">{project.submitterEmail}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {formatCurrency(project.invoicePrice)} {project.invoicePrice ? t.currency : ''}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            {project.laApproval === true ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                ✓ {t.yes}
                              </span>
                            ) : project.laApproval === false ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                ✗ {t.no}
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                ○ {t.pending}
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            {project.avivaApproval === true ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                ✓ {t.yes}
                              </span>
                            ) : project.avivaApproval === false ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                ✗ {t.no}
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                ○ {t.pending}
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`text-sm font-medium ${getAIStatusColor(project.analysis)}`}>
                              {getAIStatusLabel(project.analysis)}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {project.analysis?.issues && project.analysis.issues.length > 0 ? (
                              <div className="space-y-1">
                                {project.analysis.issues.map((issue, idx) => (
                                  <div key={idx} className="flex items-start gap-2">
                                    <span className="text-red-500 text-xs mt-0.5">●</span>
                                    <span className="text-xs text-gray-700">{issue}</span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <span className="text-xs text-gray-400">{t.noIssues}</span>
                            )}
                          </td>
                        </tr>
                        {isExpanded && (
                          <tr>
                            <td colSpan={8} className="px-6 py-4 bg-gray-50">
                              <div className="space-y-3">
                                <div className="flex items-center gap-2 mb-3">
                                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                  </svg>
                                  <h4 className="font-semibold text-gray-900">{t.files} ({project.filesCount})</h4>
                                </div>
                                
                                {project.files && project.files.length > 0 ? (
                                  <div className="space-y-2">
                                    {project.files.map((file) => (
                                      <div key={file.id} className="bg-white rounded-lg border border-gray-200 p-3 hover:shadow-sm transition-shadow">
                                        <div className="flex items-start justify-between gap-4">
                                          <div className="flex items-start gap-3 flex-1 min-w-0">
                                            <div className="flex-shrink-0 mt-1">
                                              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                              </svg>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                              {file.downloadUrl ? (
                                                <a 
                                                  href={file.downloadUrl}
                                                  target="_blank"
                                                  rel="noopener noreferrer"
                                                  className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline truncate block"
                                                  onClick={(e) => e.stopPropagation()}
                                                >
                                                  {file.fileName}
                                                </a>
                                              ) : (
                                                <p className="text-sm font-medium text-gray-900 truncate">
                                                  {file.fileName}
                                                </p>
                                              )}
                                              <div className="flex items-center gap-3 mt-1">
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                                  {getFileTypeLabel(file.fileType)}
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                  {formatFileSize(file.fileSize)}
                                                </span>
                                                <span className="text-xs text-gray-400">
                                                  {new Date(file.createdAt).toLocaleDateString(language === 'he' ? 'he-IL' : 'en-US')}
                                                </span>
                                              </div>
                                            </div>
                                          </div>
                                          {file.downloadUrl && (
                                            <a
                                              href={file.downloadUrl}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              onClick={(e) => e.stopPropagation()}
                                              className="flex-shrink-0 p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                              title={language === 'he' ? 'הורד קובץ' : 'Download file'}
                                            >
                                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                              </svg>
                                            </a>
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-sm text-gray-500">{t.noFiles}</p>
                                )}
                                
                                {project.additionalNotes && (
                                  <div className="mt-4 pt-4 border-t border-gray-200">
                                    <h5 className="text-xs font-semibold text-gray-600 mb-2">
                                      {language === 'he' ? 'הערות נוספות' : 'Additional Notes'}
                                    </h5>
                                    <p className="text-sm text-gray-700">{project.additionalNotes}</p>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                      {t.noProjects}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-4 text-center text-xs text-gray-500">
        <p>© 2025 {language === 'he' ? 'הצעות פרויקטים לקיבוצים' : 'Village Project Proposals'}. {language === 'he' ? 'כל הזכויות שמורות' : 'All rights reserved'}.</p>
      </footer>
    </div>
  );
}
