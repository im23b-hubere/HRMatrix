"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { FileText, Star, Calendar, User, Download, Eye, ArrowLeft, MessageSquare, CheckCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface CV {
  id: number;
  fileName: string;
  originalName: string;
  fileSize: number;
  fileType: string;
  filePath: string;
  status: string;
  uploadedBy: string;
  jobPosting?: {
    id: number;
    title: string;
    description: string;
  };
  createdAt: string;
  updatedAt: string;
  reviews: Review[];
  averages: {
    rating: number | null;
    skills: number | null;
    experience: number | null;
    fit: number | null;
  };
  reviewCount: number;
}

interface Review {
  id: number;
  rating: number;
  skills: number;
  experience: number;
  fit: number;
  comments: string | null;
  status: string;
  reviewer: string;
  createdAt: string;
}

export default function CVDetailPage() {
  const params = useParams();
  const [cv, setCv] = useState<CV | null>(null);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewData, setReviewData] = useState({
    rating: 0,
    skills: 0,
    experience: 0,
    fit: 0,
    comments: ""
  });
  const [submitting, setSubmitting] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);

  const statusOptions = [
    { value: "NEW", label: "Neu", color: "bg-blue-100 text-blue-800" },
    { value: "IN_REVIEW", label: "In Bearbeitung", color: "bg-yellow-100 text-yellow-800" },
    { value: "SHORTLISTED", label: "Shortlist", color: "bg-purple-100 text-purple-800" },
    { value: "INTERVIEWED", label: "Interviewt", color: "bg-orange-100 text-orange-800" },
    { value: "ACCEPTED", label: "Angenommen", color: "bg-green-100 text-green-800" },
    { value: "REJECTED", label: "Abgelehnt", color: "bg-red-100 text-red-800" }
  ];

  const fetchCVDetails = useCallback(async () => {
    try {
      const response = await fetch(`/api/cv/${params.id}`);
      const data = await response.json();

      if (data.success) {
        setCv(data.cv);
      } else {
        console.error("Fehler beim Laden der CV Details");
      }
    } catch (error) {
      console.error("Fehler:", error);
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    fetchCVDetails();
  }, [fetchCVDetails]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch(`/api/cv/${params.id}/review`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reviewData),
      });

      const data = await response.json();

      if (data.success) {
        setShowReviewForm(false);
        setReviewData({ rating: 0, skills: 0, experience: 0, fit: 0, comments: "" });
        fetchCVDetails(); // CV Details neu laden
      } else {
        alert(data.error || "Fehler beim Erstellen der Bewertung");
      }
    } catch (error) {
      console.error("Fehler:", error);
      alert("Netzwerkfehler");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusUpdate = async (newStatus: string) => {
    setStatusUpdating(true);

    try {
      const response = await fetch(`/api/cv/${params.id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (data.success) {
        fetchCVDetails(); // CV Details neu laden
      } else {
        alert(data.error || "Fehler beim Aktualisieren des Status");
      }
    } catch (error) {
      console.error("Fehler:", error);
      alert("Netzwerkfehler");
    } finally {
      setStatusUpdating(false);
    }
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
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? "text-yellow-400 fill-current" : "text-gray-300"
        }`}
      />
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!cv) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">CV nicht gefunden</h1>
          <Link
            href="/dashboard/cv"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Zurück zur CV Liste
          </Link>
        </div>
      </div>
    );
  }

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
              href="/dashboard/cv"
              className="text-gray-600 hover:text-gray-900 transition-colors flex items-center"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Zurück zur CV Liste
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* CV Header */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center">
                    <FileText className="h-8 w-8 text-blue-600" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">{cv.originalName}</h1>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                      <span>{formatFileSize(cv.fileSize)}</span>
                      <span>•</span>
                      <span className="flex items-center">
                        <User className="h-4 w-4 mr-1" />
                        {cv.uploadedBy}
                      </span>
                      <span>•</span>
                      <span className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {formatDate(cv.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <a
                    href={cv.filePath}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Ansehen"
                  >
                    <Eye className="h-5 w-5" />
                  </a>
                  <a
                    href={cv.filePath}
                    download
                    className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    title="Herunterladen"
                  >
                    <Download className="h-5 w-5" />
                  </a>
                </div>
              </div>

              {/* Status */}
              <div className="mt-6 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium text-gray-700">Status:</span>
                  <select
                    value={cv.status}
                    onChange={(e) => handleStatusUpdate(e.target.value)}
                    disabled={statusUpdating}
                    className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {statusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {statusUpdating && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  )}
                </div>
                {cv.jobPosting && (
                  <div className="text-sm">
                    <span className="text-gray-600">Stelle:</span>
                    <span className="ml-2 font-medium text-blue-600">{cv.jobPosting.title}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Reviews */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Bewertungen ({cv.reviewCount})</h2>
                <button
                  onClick={() => setShowReviewForm(!showReviewForm)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Bewertung hinzufügen
                </button>
              </div>

              {/* Review Form */}
              {showReviewForm && (
                <form onSubmit={handleReviewSubmit} className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Gesamtbewertung
                      </label>
                      <div className="flex space-x-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setReviewData({ ...reviewData, rating: star })}
                            className="focus:outline-none"
                          >
                            <Star
                              className={`h-6 w-6 ${
                                star <= reviewData.rating ? "text-yellow-400 fill-current" : "text-gray-300"
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Skills
                      </label>
                      <div className="flex space-x-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setReviewData({ ...reviewData, skills: star })}
                            className="focus:outline-none"
                          >
                            <Star
                              className={`h-6 w-6 ${
                                star <= reviewData.skills ? "text-yellow-400 fill-current" : "text-gray-300"
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Erfahrung
                      </label>
                      <div className="flex space-x-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setReviewData({ ...reviewData, experience: star })}
                            className="focus:outline-none"
                          >
                            <Star
                              className={`h-6 w-6 ${
                                star <= reviewData.experience ? "text-yellow-400 fill-current" : "text-gray-300"
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Passung
                      </label>
                      <div className="flex space-x-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setReviewData({ ...reviewData, fit: star })}
                            className="focus:outline-none"
                          >
                            <Star
                              className={`h-6 w-6 ${
                                star <= reviewData.fit ? "text-yellow-400 fill-current" : "text-gray-300"
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kommentare
                    </label>
                    <textarea
                      value={reviewData.comments}
                      onChange={(e) => setReviewData({ ...reviewData, comments: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Optionale Kommentare..."
                    />
                  </div>
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowReviewForm(false)}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      Abbrechen
                    </button>
                    <button
                      type="submit"
                      disabled={submitting || !reviewData.rating || !reviewData.skills || !reviewData.experience || !reviewData.fit}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                    >
                      {submitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Wird gespeichert...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Bewertung speichern
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}

              {/* Reviews List */}
              {cv.reviews.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-600">Noch keine Bewertungen vorhanden</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cv.reviews.map((review) => (
                    <div key={review.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-medium text-gray-900">{review.reviewer}</h4>
                          <p className="text-sm text-gray-600">{formatDate(review.createdAt)}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                        <div>
                          <span className="text-sm text-gray-600">Gesamt:</span>
                          <div className="flex">{renderStars(review.rating)}</div>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600">Skills:</span>
                          <div className="flex">{renderStars(review.skills)}</div>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600">Erfahrung:</span>
                          <div className="flex">{renderStars(review.experience)}</div>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600">Passung:</span>
                          <div className="flex">{renderStars(review.fit)}</div>
                        </div>
                      </div>
                      {review.comments && (
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-sm text-gray-700">{review.comments}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Average Ratings */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Durchschnittsbewertungen</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Gesamt:</span>
                  <div className="flex items-center">
                    {cv.averages.rating ? (
                      <>
                        <div className="flex mr-2">{renderStars(Math.round(cv.averages.rating))}</div>
                        <span className="text-sm font-medium">{cv.averages.rating}</span>
                      </>
                    ) : (
                      <span className="text-sm text-gray-400">Keine Bewertung</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Skills:</span>
                  <div className="flex items-center">
                    {cv.averages.skills ? (
                      <>
                        <div className="flex mr-2">{renderStars(Math.round(cv.averages.skills))}</div>
                        <span className="text-sm font-medium">{cv.averages.skills}</span>
                      </>
                    ) : (
                      <span className="text-sm text-gray-400">Keine Bewertung</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Erfahrung:</span>
                  <div className="flex items-center">
                    {cv.averages.experience ? (
                      <>
                        <div className="flex mr-2">{renderStars(Math.round(cv.averages.experience))}</div>
                        <span className="text-sm font-medium">{cv.averages.experience}</span>
                      </>
                    ) : (
                      <span className="text-sm text-gray-400">Keine Bewertung</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Passung:</span>
                  <div className="flex items-center">
                    {cv.averages.fit ? (
                      <>
                        <div className="flex mr-2">{renderStars(Math.round(cv.averages.fit))}</div>
                        <span className="text-sm font-medium">{cv.averages.fit}</span>
                      </>
                    ) : (
                      <span className="text-sm text-gray-400">Keine Bewertung</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Job Posting Info */}
            {cv.jobPosting && (
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Stellenausschreibung</h3>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">{cv.jobPosting.title}</h4>
                  <p className="text-sm text-gray-600 line-clamp-3">{cv.jobPosting.description}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
