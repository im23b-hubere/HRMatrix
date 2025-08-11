"use client";

import { useState, useEffect } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "../../api/auth/[...nextauth]/authOptions";
import CVUploadForm from "../CVUploadForm";
import { FileText, Search, Filter, Download, Eye, Star, Calendar } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface CV {
  id: number;
  fileName: string;
  originalName: string;
  fileSize: number;
  fileType: string;
  filePath: string;
  status: string;
  uploadedBy: string;
  jobPosting?: string;
  avgRating?: number;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export default function CVDashboardPage() {
  const [cvs, setCvs] = useState<CV[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [showUpload, setShowUpload] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const statusOptions = [
    { value: "ALL", label: "Alle Status" },
    { value: "NEW", label: "Neu" },
    { value: "IN_REVIEW", label: "In Bearbeitung" },
    { value: "SHORTLISTED", label: "Shortlist" },
    { value: "INTERVIEWED", label: "Interviewt" },
    { value: "ACCEPTED", label: "Angenommen" },
    { value: "REJECTED", label: "Abgelehnt" }
  ];

  const router = useRouter();

  const fetchCVs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter !== "ALL" && { status: statusFilter })
      });

      const response = await fetch(`/api/cv?${params}`);
      const data = await response.json();

      if (data.success) {
        setCvs(data.cvs);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error("Fehler beim Laden der CVs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCVs();
  }, [currentPage, searchTerm, statusFilter]);

  const handleUploadSuccess = () => {
    fetchCVs();
    setShowUpload(false);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });
  };

  const getStatusColor = (status: string) => {
    const colors = {
      NEW: "bg-blue-100 text-blue-800",
      IN_REVIEW: "bg-yellow-100 text-yellow-800",
      SHORTLISTED: "bg-purple-100 text-purple-800",
      INTERVIEWED: "bg-orange-100 text-orange-800",
      ACCEPTED: "bg-green-100 text-green-800",
      REJECTED: "bg-red-100 text-red-800"
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      NEW: "Neu",
      IN_REVIEW: "In Bearbeitung",
      SHORTLISTED: "Shortlist",
      INTERVIEWED: "Interviewt",
      ACCEPTED: "Angenommen",
      REJECTED: "Abgelehnt"
    };
    return labels[status as keyof typeof labels] || status;
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Image
                src="/Logo.png"
                alt="HRMatrix Logo"
                width={150}
                height={150}
                className="object-contain"
                priority
              />
            </div>
            <Link 
              href="/dashboard"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              ← Zurück zum Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white/95 rounded-2xl shadow-lg p-8 backdrop-blur-sm border border-gray-100">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold text-gray-900">CV Manager</h1>
              <p className="text-gray-600">Verwalte und bewerte Bewerbungen</p>
            </div>
            <button
              onClick={() => setShowUpload(!showUpload)}
              className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors flex items-center"
            >
              <FileText className="h-5 w-5 mr-2" />
              CV hochladen
            </button>
          </div>

          {/* Upload Form */}
          {showUpload && (
            <div className="mb-8">
              <CVUploadForm onUploadSuccess={handleUploadSuccess} />
            </div>
          )}

          {/* Filters */}
          <div className="mb-6 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="CVs durchsuchen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-10 pr-8 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* CV List */}
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : cvs.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Keine CVs gefunden</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || statusFilter !== "ALL" 
                  ? "Versuche andere Suchkriterien" 
                  : "Lade deine erste CV hoch"
                }
              </p>
              {!searchTerm && statusFilter === "ALL" && (
                <button
                  onClick={() => setShowUpload(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  CV hochladen
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {cvs.map((cv) => (
                <div
                  key={cv.id}
                  className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => router.push(`/dashboard/cv/${cv.id}`)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <FileText className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {cv.originalName}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                          <span>{formatFileSize(cv.fileSize)}</span>
                          <span>•</span>
                          <span>Hochgeladen von {cv.uploadedBy}</span>
                          <span>•</span>
                          <span className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {formatDate(cv.createdAt)}
                          </span>
                          {cv.jobPosting && (
                            <>
                              <span>•</span>
                              <span className="text-blue-600">{cv.jobPosting}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      {/* Rating */}
                      {cv.avgRating && (
                        <div className="flex items-center text-sm">
                          <Star className="h-4 w-4 text-yellow-400 mr-1" />
                          <span className="font-medium">{cv.avgRating}</span>
                          <span className="text-gray-500 ml-1">({cv.reviewCount})</span>
                        </div>
                      )}
                      
                      {/* Status */}
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(cv.status)}`}>
                        {getStatusLabel(cv.status)}
                      </span>
                      
                      {/* Actions */}
                      <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
                        <a
                          href={cv.filePath}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Ansehen"
                        >
                          <Eye className="h-4 w-4" />
                        </a>
                        <a
                          href={cv.filePath}
                          download
                          className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Herunterladen"
                        >
                          <Download className="h-4 w-4" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div className="mt-8 flex justify-center">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Zurück
                </button>
                
                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-2 text-sm font-medium rounded-lg ${
                      page === currentPage
                        ? "bg-blue-600 text-white"
                        : "text-gray-500 bg-white border border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {page}
                  </button>
                ))}
                
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === pagination.pages}
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Weiter
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
