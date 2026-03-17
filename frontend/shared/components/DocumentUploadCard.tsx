"use client";

import { useState, useCallback } from "react";
import { UploadCloud, File, X, Loader2 } from "lucide-react";

interface DocumentUploadCardProps {
  onUpload: (file: File) => Promise<void>;
  isUploading: boolean;
}

export function DocumentUploadCard({ onUpload, isUploading }: DocumentUploadCardProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === "application/pdf") {
        setSelectedFile(file);
      } else {
        // toast error could go here
      }
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUploadClick = async () => {
    if (selectedFile) {
      await onUpload(selectedFile);
      setSelectedFile(null); // Reset after upload
    }
  };

  return (
    <div className="glass-card rounded-xl p-8 text-center max-w-xl mx-auto border-dashed border-2 transition-all duration-300 ${dragActive ? 'border-primary bg-primary/5' : 'border-border'}">
      <input
        type="file"
        accept=".pdf"
        className="hidden"
        id="file-upload"
        onChange={handleFileChange}
        disabled={isUploading}
      />
      
      {!selectedFile ? (
        <label
          htmlFor="file-upload"
          className="flex flex-col items-center justify-center cursor-pointer min-h-[160px]"
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 text-primary">
            <UploadCloud size={32} />
          </div>
          <h3 className="text-xl font-semibold mb-2">Upload your research</h3>
          <p className="text-muted-foreground text-sm max-w-[250px]">
            Drag and drop your PDF here, or click to browse (max 20MB)
          </p>
        </label>
      ) : (
        <div className="flex flex-col items-center justify-center min-h-[160px]">
          <div className="flex items-center gap-3 bg-secondary/50 p-4 rounded-lg border border-border mb-6">
            <File size={24} className="text-primary" />
            <div className="text-left max-w-[200px]">
              <p className="text-sm font-medium truncate">{selectedFile.name}</p>
              <p className="text-xs text-muted-foreground">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <button
              onClick={() => setSelectedFile(null)}
              className="p-1.5 hover:bg-destructive/10 text-muted-foreground hover:text-destructive rounded-md transition-colors"
              disabled={isUploading}
            >
              <X size={16} />
            </button>
          </div>
          
          <button
            onClick={handleUploadClick}
            disabled={isUploading}
            className="w-full max-w-[250px] bg-primary text-primary-foreground hover:bg-primary/90 font-medium py-2.5 px-4 rounded-lg flex justify-center items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
          >
            {isUploading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                Confirm Upload
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
