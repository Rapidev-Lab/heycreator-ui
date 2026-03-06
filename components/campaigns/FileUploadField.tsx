"use client";

import {
  UploadCloud,
  X,
  FileText,
  Image as ImageIcon,
  PlusCircle,
  Film,
} from "lucide-react";
import { useState, useEffect } from "react";

interface NewUploadedFile {
  file: File;
  preview?: string;
  isVideo?: boolean;
}

export interface ExistingUploadedFile {
  name: string;
  url: string;
  path?: string;
  size?: number;
  type?: string;
}

interface FileUploadFieldProps {
  id: string;
  label: string;
  subLabel: string;
  buttonText: string;
  acceptedFileTypes: string;
  required?: boolean;
  multiple?: boolean;
  showImagePreviews?: boolean;
  onChange?: (files: File[]) => void;
  value?: File[];
  existingFiles?: ExistingUploadedFile[];
  onRemoveExisting?: (index: number) => void;
}

export default function FileUploadField({
  id,
  label,
  subLabel,
  buttonText,
  acceptedFileTypes,
  required,
  multiple = true,
  showImagePreviews = false,
  onChange,
  value = [],
  existingFiles = [],
  onRemoveExisting,
}: FileUploadFieldProps) {
  const [uploadedFiles, setUploadedFiles] = useState<NewUploadedFile[]>([]);

  useEffect(() => {
    if (value.length > 0 && uploadedFiles.length === 0) {
      const restoredFiles: NewUploadedFile[] = value.map((file) => {
        const uploadedFile: NewUploadedFile = { file };
        if (file.type.startsWith("image/") || file.type.startsWith("video/")) {
          uploadedFile.preview = URL.createObjectURL(file);
        }
        uploadedFile.isVideo = file.type.startsWith("video/");
        return uploadedFile;
      });
      setUploadedFiles(restoredFiles);
    } else if (value.length === 0 && uploadedFiles.length > 0) {
      setUploadedFiles([]);
    }
  }, [value]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newFiles: NewUploadedFile[] = Array.from(files).map((file) => {
        const uploadedFile: NewUploadedFile = { file };
        if (file.type.startsWith("image/") || file.type.startsWith("video/")) {
          uploadedFile.preview = URL.createObjectURL(file);
        }
        uploadedFile.isVideo = file.type.startsWith("video/");
        return uploadedFile;
      });

      const allFiles = multiple ? [...uploadedFiles, ...newFiles] : newFiles;
      setUploadedFiles(allFiles);
      onChange?.(allFiles.map((f) => f.file));
    }
    event.target.value = "";
  };

  const handleRemoveFile = (index: number) => {
    const newFiles = uploadedFiles.filter((_, i) => i !== index);
    setUploadedFiles(newFiles);
    onChange?.(newFiles.map((f) => f.file));
  };

  const totalFilesCount = existingFiles.length + uploadedFiles.length;

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-semibold text-brand-navy-dark mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      {/* Upload Area styled to match Figma */}
      {(totalFilesCount === 0 || multiple) && (
        <label
          htmlFor={id}
          className={`flex flex-col items-center justify-center w-full min-h-[160px] border-2 border-gray-200 rounded-[12px] bg-[#F9FAFB]/50 hover:bg-gray-50 transition-all cursor-pointer group ${totalFilesCount > 0 ? "mt-4" : ""}`}
        >
            {id === "campaign-assets-upload" && (
              <PlusCircle className="h-12 w-12 text-gray-500 mb-4" strokeWidth={1.25}/>
            )}
            {id === "mood-board-upload" && (
              <ImageIcon className="h-12 w-12 text-gray-500 mb-4" strokeWidth={1.25} />
            )}
            {(id === "campaign-brief-upload" || id === "contract-nda-upload") && (
              <FileText className="h-12 w-12 text-gray-500 mb-4" strokeWidth={1.25} />
            )}
            

          <div className="text-center px-4">
            <p className="text-sm font-bold text-brand-navy-dark">{buttonText}</p>
            {subLabel && (
              <p className="text-xs text-gray-400 mt-1">{subLabel}</p>
            )}
          </div>

          <input
            id={id}
            type="file"
            className="sr-only"
            accept={acceptedFileTypes}
            multiple={multiple}
            onChange={handleFileChange}
          />
        </label>
      )}

      {/* Previews */}
      {totalFilesCount > 0 && (
        <div
          className={`mt-4 ${showImagePreviews ? "grid grid-cols-2 sm:grid-cols-3 gap-3" : "space-y-2"}`}
        >
          {existingFiles.map((file, i) =>
            showImagePreviews ? (
              <MediaPreview
                key={`ex-${i}`}
                url={file.url}
                name={file.name}
                onRemove={() => onRemoveExisting?.(i)}
                isVideo={file.type?.startsWith('video') || /\.(mp4|mov|webm|avi|mkv)(\?|$)/i.test(file.url)}
              />
            ) : (
              <FileRow
                key={`ex-${i}`}
                name={file.name}
                onRemove={() => onRemoveExisting?.(i)}
                isExisting
              />
            ),
          )}
          {uploadedFiles.map((file, i) =>
            showImagePreviews ? (
              <MediaPreview
                key={`new-${i}`}
                url={file.preview}
                name={file.file.name}
                onRemove={() => handleRemoveFile(i)}
                isNew
                isVideo={file.isVideo}
              />
            ) : (
              <FileRow
                key={`new-${i}`}
                name={file.file.name}
                onRemove={() => handleRemoveFile(i)}
              />
            ),
          )}
        </div>
      )}
    </div>
  );
}

function MediaPreview({
  url,
  name,
  onRemove,
  isNew,
  isVideo,
}: {
  url?: string;
  name?: string;
  onRemove: () => void;
  isNew?: boolean;
  isVideo?: boolean;
}) {
  const isDocument = !url || (!isVideo && name && /\.(pdf|doc|docx|ppt|pptx|zip)$/i.test(name));

  return (
    <div className="relative aspect-square rounded-2xl overflow-hidden border border-gray-100 group shadow-sm">
      {isVideo ? (
        <div className="w-full h-full bg-gray-900 flex items-center justify-center">
          <video
            src={url}
            className="w-full h-full object-cover"
            muted
            preload="metadata"
          />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-10 h-10 bg-white/80 rounded-full flex items-center justify-center">
              <Film className="w-5 h-5 text-gray-800" />
            </div>
          </div>
        </div>
      ) : isDocument ? (
        <div className="w-full h-full bg-gray-50 flex flex-col items-center justify-center gap-2 p-3">
          <FileText className="w-10 h-10 text-gray-400" />
          {name && (
            <span className="text-xs text-gray-500 text-center truncate w-full px-2">
              {name}
            </span>
          )}
        </div>
      ) : (
        <img src={url} className="w-full h-full object-cover" alt="preview" />
      )}
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        <button
          onClick={onRemove}
          className="p-2 bg-white rounded-full text-red-500 hover:scale-110 transition-transform"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      {isNew && (
        <span className="absolute top-2 left-2 px-2 py-0.5 bg-brand-navy-dark text-[10px] text-white rounded-full">
          New
        </span>
      )}
    </div>
  );
}

function FileRow({
  name,
  onRemove,
  isExisting,
}: {
  name: string;
  onRemove: () => void;
  isExisting?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between p-6 rounded-xl border ${isExisting ? "border-green-100 bg-green-50/50" : "border-gray-100 bg-white"}`}
    >
      <div className="flex items-center gap-3 truncate">
        <FileText
          className={`w-5 h-5 ${isExisting ? "text-green-500" : "text-gray-400"}`}
        />
        <span className="text-sm font-medium text-gray-700 truncate">
          {name}
        </span>
      </div>
      <button
        onClick={onRemove}
        className="p-1 hover:bg-gray-100 rounded-full text-gray-400 hover:text-red-500 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
