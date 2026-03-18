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
            <span className="text-primary">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18.63 7.1499C18.67 7.7599 18.62 8.4499 18.5 9.2199L17.77 13.9099C17.15 17.8199 15.34 19.1399 11.43 18.5299L6.73999 17.7899C5.38999 17.5799 4.34999 17.2199 3.58999 16.6799C2.13999 15.6699 1.71999 14.0099 2.11999 11.4499L2.85999 6.7599C3.47999 2.8499 5.28999 1.5299 9.19999 2.1399L13.89 2.8799C17.03 3.3699 18.5 4.6499 18.63 7.1499Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M20.5 13.4699L19 17.9799C17.75 21.7399 15.75 22.7399 11.99 21.4899L7.48003 19.9899C5.21003 19.2399 3.95003 18.1999 3.59003 16.6799C4.35003 17.2199 5.39003 17.5799 6.74003 17.7899L11.43 18.5299C15.34 19.1399 17.15 17.8199 17.77 13.9099L18.5 9.2199C18.62 8.4499 18.67 7.7599 18.63 7.1499C21.02 8.4199 21.54 10.3399 20.5 13.4699Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M8.24 8.98C9.20098 8.98 9.98 8.20098 9.98 7.24C9.98 6.27902 9.20098 5.5 8.24 5.5C7.27902 5.5 6.5 6.27902 6.5 7.24C6.5 8.20098 7.27902 8.98 8.24 8.98Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </span>
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
            className="w-full max-w-[250px] bg-primary text-primary-foreground cursor-pointer font-medium py-2.5 px-4 rounded-md flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
