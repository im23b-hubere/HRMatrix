"use client";

import { useState, useRef } from "react";
import { Upload, File, X, CheckCircle, AlertCircle } from "lucide-react";

interface CVUploadFormProps {
  onUploadSuccess: () => void;
  jobPostingId?: string;
}

export default function CVUploadForm({ onUploadSuccess, jobPostingId }: CVUploadFormProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileSelect = (file: File) => {
    // Dateityp validieren
    const allowedTypes = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    if (!allowedTypes.includes(file.type)) {
      setErrorMessage("Nur PDF und DOCX Dateien sind erlaubt");
      setUploadStatus("error");
      return;
    }

    // Dateigröße validieren (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage("Datei ist zu groß (max 10MB)");
      setUploadStatus("error");
      return;
    }

    setSelectedFile(file);
    setErrorMessage("");
    setUploadStatus("idle");
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setUploadStatus("idle");

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      if (jobPostingId) {
        formData.append("jobPostingId", jobPostingId);
      }

      const response = await fetch("/api/cv/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setUploadStatus("success");
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        onUploadSuccess();
        
        // Status nach 3 Sekunden zurücksetzen
        setTimeout(() => {
          setUploadStatus("idle");
        }, 3000);
      } else {
        setErrorMessage(data.error || "Upload fehlgeschlagen");
        setUploadStatus("error");
      }
    } catch (error) {
      setErrorMessage("Netzwerkfehler beim Upload");
      setUploadStatus("error");
    } finally {
      setUploading(false);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setErrorMessage("");
    setUploadStatus("idle");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">CV hochladen</h3>
        <p className="text-sm text-gray-600">
          Ziehe eine PDF oder DOCX Datei hierher oder klicke zum Auswählen
        </p>
      </div>

      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
          isDragging
            ? "border-blue-400 bg-blue-50"
            : selectedFile
            ? "border-green-400 bg-green-50"
            : "border-gray-300 bg-gray-50 hover:border-gray-400"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx"
          onChange={handleFileInputChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />

        {!selectedFile ? (
          <div className="space-y-4">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-900">
                Datei hierher ziehen oder klicken
              </p>
              <p className="text-xs text-gray-500 mt-1">
                PDF oder DOCX, max. 10MB
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <File className="mx-auto h-8 w-8 text-green-500" />
            <div>
              <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
              <p className="text-xs text-gray-500">{formatFileSize(selectedFile.size)}</p>
            </div>
            <button
              onClick={removeFile}
              className="inline-flex items-center px-3 py-1 text-xs font-medium text-red-600 hover:text-red-700"
            >
              <X className="h-4 w-4 mr-1" />
              Entfernen
            </button>
          </div>
        )}
      </div>

      {/* Status Messages */}
      {uploadStatus === "success" && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center">
          <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
          <span className="text-sm text-green-700">CV erfolgreich hochgeladen!</span>
        </div>
      )}

      {uploadStatus === "error" && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center">
          <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
          <span className="text-sm text-red-700">{errorMessage}</span>
        </div>
      )}

      {/* Upload Button */}
      {selectedFile && (
        <div className="mt-6">
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            {uploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Wird hochgeladen...
              </>
            ) : (
              "CV hochladen"
            )}
          </button>
        </div>
      )}
    </div>
  );
}
