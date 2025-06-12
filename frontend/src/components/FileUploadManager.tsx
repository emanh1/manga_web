import React, { useRef, useState, useEffect } from 'react';
import { toastUtil } from './toast';

interface UploadPreview {
  file: File;
  previewUrl: string;
}

interface Props {
  files: File[];
  setFiles: React.Dispatch<React.SetStateAction<File[]>>;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png'];

export default function FileUploadManager({ files, setFiles }: Props) {
  const [previews, setPreviews] = useState<UploadPreview[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const urls = files.map(file => ({
      file,
      previewUrl: URL.createObjectURL(file),
    }));
    setPreviews(urls);

    return () => {
      urls.forEach(p => URL.revokeObjectURL(p.previewUrl));
    };
  }, [files]);

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return 'Only JPEG and PNG files are allowed';
    }
    if (file.size > MAX_FILE_SIZE) {
      return `File size must be less than ${MAX_FILE_SIZE / (1024 * 1024)}MB`;
    }
    return null;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList) return;

    const newFiles: File[] = [];
    const errors: string[] = [];

    Array.from(fileList).forEach(file => {
      const error = validateFile(file);
      if (error) {
        errors.push(`${file.name}: ${error}`);
      } else {
        newFiles.push(file);
      }
    });

    if (errors.length > 0) {
      toastUtil.error(
        <div>
          <p>Some files were not added:</p>
          <ul className="list-disc pl-4 mt-2">
            {errors.map((error, i) => (
              <li key={i} className="text-sm">{error}</li>
            ))}
          </ul>
        </div>
      );
    }

    if (newFiles.length > 0) {
      setFiles(prev => [...prev, ...newFiles]);
      toastUtil.success(`Added ${newFiles.length} file(s)`);
    }
    
    e.target.value = '';
  };

  const handleRemove = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleRemoveAll = () => {
    setFiles([]);
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDrop = (index: number) => {
    if (draggedIndex === null || draggedIndex === index) return;

    const updated = [...files];
    const [moved] = updated.splice(draggedIndex, 1);
    updated.splice(index, 0, moved);
    setFiles(updated);
    setDraggedIndex(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <button
          type="button"
          className="bg-gray-100 px-3 py-1 rounded hover:bg-gray-200 text-sm"
          onClick={() => inputRef.current?.click()}
        >
          📤 Add Images
        </button>

        {files.length > 0 && (
          <button
            type="button"
            className="text-sm text-red-600 hover:underline"
            onClick={handleRemoveAll}
          >
            Remove All
          </button>
        )}

        <input
          type="file"
          accept="image/jpeg,image/png"
          multiple
          hidden
          ref={inputRef}
          onChange={handleFileChange}
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
        {previews.map((preview, index) => (
          <div
            key={`${preview.file.name}-${index}`}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(index)}
            className="relative border rounded-lg overflow-hidden group bg-white shadow-sm"
          >
            <img
              src={preview.previewUrl}
              alt={`Preview ${index + 1}`}
              className="w-full h-48 object-contain"
            />
            <button
              onClick={() => handleRemove(index)}
              className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 text-center font-bold opacity-0 group-hover:opacity-100 transition"
              title="Remove"
            >
              ×
            </button>
            <span className="absolute bottom-1 left-1 bg-black bg-opacity-60 text-white text-xs px-2 py-0.5 rounded">
              Page {index + 1}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

