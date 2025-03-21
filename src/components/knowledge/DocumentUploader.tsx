import React, { useState, useRef } from "react";
import {
  Upload,
  File,
  X,
  FileText,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface DocumentUploaderProps {
  onUpload: (files: File[]) => Promise<void>;
  acceptedFileTypes?: string[];
  maxFileSizeMB?: number;
  maxFiles?: number;
}

const DEFAULT_ACCEPTED_TYPES = [
  "application/pdf",
  "text/plain",
  "text/markdown",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
];

const DocumentUploader: React.FC<DocumentUploaderProps> = ({
  onUpload,
  acceptedFileTypes = DEFAULT_ACCEPTED_TYPES,
  maxFileSizeMB = 10,
  maxFiles = 5,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const validateFiles = (
    fileList: File[],
  ): { valid: File[]; errors: string[] } => {
    const valid: File[] = [];
    const errors: string[] = [];

    // Check if adding these files would exceed the max files limit
    if (files.length + fileList.length > maxFiles) {
      errors.push(`You can only upload a maximum of ${maxFiles} files`);
      return { valid, errors };
    }

    for (const file of fileList) {
      // Check file type
      if (!acceptedFileTypes.includes(file.type)) {
        errors.push(`${file.name}: File type not supported`);
        continue;
      }

      // Check file size
      if (file.size > maxFileSizeMB * 1024 * 1024) {
        errors.push(`${file.name}: File size exceeds ${maxFileSizeMB}MB`);
        continue;
      }

      valid.push(file);
    }

    return { valid, errors };
  };

  const processFiles = (fileList: FileList | null) => {
    if (!fileList) return;

    const fileArray = Array.from(fileList);
    const { valid, errors } = validateFiles(fileArray);

    if (errors.length > 0) {
      setError(errors.join("\n"));
      setTimeout(() => setError(null), 5000);
    }

    if (valid.length > 0) {
      setFiles((prev) => [...prev, ...valid]);
      setSuccess(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    processFiles(e.dataTransfer.files);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    processFiles(e.target.files);
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setUploading(true);
    setUploadProgress(0);
    setError(null);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 95) {
          clearInterval(progressInterval);
          return 95;
        }
        return prev + 5;
      });
    }, 200);

    try {
      await onUpload(files);
      clearInterval(progressInterval);
      setUploadProgress(100);
      setSuccess(true);
      setFiles([]);

      // Reset progress after a delay
      setTimeout(() => {
        setUploadProgress(0);
        setUploading(false);
      }, 1500);
    } catch (err) {
      clearInterval(progressInterval);
      setError(err instanceof Error ? err.message : "Failed to upload files");
      setUploadProgress(0);
      setUploading(false);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const getFileIcon = (file: File) => {
    if (file.type === "application/pdf") {
      return <FileText className="h-5 w-5 text-red-500" />;
    } else if (file.type.includes("word")) {
      return <FileText className="h-5 w-5 text-blue-500" />;
    } else if (file.type === "text/plain") {
      return <File className="h-5 w-5 text-gray-500" />;
    } else if (file.type === "text/markdown") {
      return <FileText className="h-5 w-5 text-purple-500" />;
    } else {
      return <File className="h-5 w-5 text-gray-500" />;
    }
  };

  const getFileTypeLabel = (file: File) => {
    if (file.type === "application/pdf") {
      return "PDF";
    } else if (file.type.includes("word")) {
      return "DOCX";
    } else if (file.type === "text/plain") {
      return "TXT";
    } else if (file.type === "text/markdown") {
      return "MD";
    } else {
      return "DOC";
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription className="whitespace-pre-line">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">Success</AlertTitle>
          <AlertDescription className="text-green-700">
            Files uploaded successfully!
          </AlertDescription>
        </Alert>
      )}

      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center ${isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/20"} transition-colors duration-200 cursor-pointer`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          multiple
          accept={acceptedFileTypes.join(",")}
          onChange={handleFileInputChange}
        />

        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="p-3 bg-primary/10 rounded-full">
            <Upload className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-lg font-medium">Drag & drop files here</h3>
          <p className="text-sm text-muted-foreground max-w-md">
            Upload documents to your knowledge base. Supported formats: PDF,
            TXT, DOCX, MD
          </p>
          <Button variant="outline" type="button" className="mt-2">
            Browse Files
          </Button>
          <div className="text-xs text-muted-foreground mt-2">
            Max {maxFiles} files, up to {maxFileSizeMB}MB each
          </div>
        </div>
      </div>

      {files.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium">
            Selected Files ({files.length})
          </h3>

          <div className="space-y-2">
            {files.map((file, index) => (
              <Card key={`${file.name}-${index}`} className="overflow-hidden">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getFileIcon(file)}
                      <div className="space-y-1">
                        <div className="flex items-center">
                          <span className="font-medium text-sm truncate max-w-[200px] sm:max-w-[300px]">
                            {file.name}
                          </span>
                          <Badge variant="outline" className="ml-2 text-xs">
                            {getFileTypeLabel(file)}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(index);
                      }}
                      disabled={uploading}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFiles([])}
              disabled={uploading}
            >
              Clear All
            </Button>

            <Button
              onClick={handleUpload}
              disabled={uploading || files.length === 0}
              className="ml-auto"
            >
              {uploading ? "Uploading..." : "Upload Files"}
            </Button>
          </div>

          {uploading && (
            <div className="space-y-1">
              <Progress value={uploadProgress} className="h-2" />
              <p className="text-xs text-right text-muted-foreground">
                {uploadProgress}%
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DocumentUploader;
