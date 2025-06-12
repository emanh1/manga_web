import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTitleDetails } from '../hooks/useTitleDetails';
import { toastUtil } from '../components/toast';
import FileUploadManager from '../components/FileUploadManager';
import axiosInstance from '../api/axios';
import { useAuth } from '../contexts/AuthContext';

// --- Schema and Types ---
const uploadSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  malId: z.preprocess((val) => Number(val), z.number()),
  volume: z.preprocess((val) => val === '' ? undefined : Number(val), z.number().optional()),
  chapterNumber: z.preprocess((val) => val === '' ? undefined : Number(val), z.number().optional()),
  chapterTitle: z.string().optional(),
  language: z.string().min(1, 'Language is required'),
  isOneshot: z.boolean(),
  files: z
    .custom<FileList>((val) => val instanceof FileList)
    .refine((files) => files.length >= 1, 'At least one file is required')
    .refine((files) =>
      Array.from(files).every(file =>
        ['image/jpeg', 'image/png'].includes(file.type)
      ), 'Only .jpg and .png files are accepted'
    )
    .refine((files) =>
      Array.from(files).every(file => file.size <= 10 * 1024 * 1024),
      'Each file must be less than 10MB'
    ),
});

type UploadFormData = z.input<typeof uploadSchema>;

export default function TitleUpload() {
  const { user } = useAuth();
  const { titleId } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [failedFiles, setFailedFiles] = useState<{ name: string; error: string }[]>([]);
  const [ipfsNodeUrl, setIpfsNodeUrl] = useState<string>('http://localhost:5001/api/v0');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<UploadFormData>({
    resolver: zodResolver(uploadSchema),
    defaultValues: {
      isOneshot: false,
      malId: titleId ? Number(titleId) : undefined,
      volume: undefined,
      chapterNumber: undefined,
      chapterTitle: '',
      language: '',
      files: undefined as unknown as FileList,
      title: '',
    },
  });

  const malIdRaw = watch('malId');
  const malId = typeof malIdRaw === 'string' || typeof malIdRaw === 'number' ? malIdRaw : undefined;
  const isOneshot = watch('isOneshot');

  // Use the new hook
  const { title: selectedTitle } = useTitleDetails(malId);

  // Set malId from URL param if present
  useEffect(() => {
    if (titleId) {
      setValue('malId', Number(titleId));
    }
  }, [titleId, setValue]);

  // Set title from selectedTitle
  useEffect(() => {
    if (selectedTitle) {
      setValue('title', selectedTitle.title);
    }
  }, [selectedTitle, setValue]);

  // Sync files state with form
  useEffect(() => {
    const fileList = new DataTransfer();
    files.forEach(file => fileList.items.add(file));
    setValue('files', fileList.files, { shouldValidate: true });
  }, [files, setValue]);

  // --- Form Submission ---
  const onSubmit = async (data: UploadFormData) => {
    try {
      setIsLoading(true);
      setUploadProgress(0);
      setFailedFiles([]);

      const formData = new FormData();
      formData.append('title', data.title);
      if (data.malId) formData.append('malId', String(data.malId));
      if (data.volume !== undefined) formData.append('volume', String(data.volume));
      if (data.chapterNumber !== undefined) formData.append('chapterNumber', String(data.chapterNumber));
      if (data.chapterTitle) formData.append('chapterTitle', data.chapterTitle);
      formData.append('isOneshot', String(data.isOneshot));
      formData.append('language', data.language);
      formData.append('ipfsNodeUrl', ipfsNodeUrl);
      Array.from(data.files).forEach((file, index) => {
        formData.append('files', file);
        formData.append('fileOrder', String(index + 1));
      });
      if (user) {
        formData.append('userId', user.uuid);
      }

      await axiosInstance.post('/titles/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const progress = progressEvent.loaded / (progressEvent.total ?? 0) * 100;
          setUploadProgress(Math.round(progress));
        }
      });

      toastUtil.success('Upload successful');
      navigate('/');
    } catch (error: any) {
      console.error('Upload error:', error);
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        setFailedFiles(errors.map((err: any) => ({
          name: err.file,
          error: err.message
        })));
        toastUtil.error('Some files failed to upload. Please check the error list below.');
      } else {
        toastUtil.error(error.response?.data?.message || 'Failed to upload title');
      }
    } finally {
      setIsLoading(false);
      setUploadProgress(0);
    }
  };

  // --- Render ---
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Upload Title</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">IPFS Node/API URL</label>
          <input
            type="text"
            className="w-full px-3 py-2 border rounded-lg"
            value={ipfsNodeUrl}
            onChange={e => setIpfsNodeUrl(e.target.value)}
            placeholder="http://localhost:5001/api/v0"
            required
          />
          <div className="mt-1 text-xs text-gray-500">This is the IPFS node your files will be uploaded to.</div>
        </div>

        {selectedTitle ? (
          <div className="flex gap-4 items-start mb-4">
            <img
              src={selectedTitle.images.jpg.image_url}
              alt={selectedTitle.title}
              className="w-32 rounded-lg shadow-md"
            />
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Title</label>
              <div className="relative">
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded-lg bg-gray-50"
                  value={selectedTitle.title}
                  readOnly
                  {...register('title')}
                />
                <a
                  href={`/titles/${malId}`}
                  rel="noopener noreferrer"
                  className="absolute inset-0 flex items-center px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  {selectedTitle.title}
                </a>
              </div>
              <p className="mt-2 text-sm text-gray-600">
                {selectedTitle.synopsis?.slice(0, 200)}...
              </p>
            </div>
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              type="text"
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="Search title title..."
              {...register('title')}
            />
            {errors.title && (
              <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
            )}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-1">Language</label>
          <select
            className="w-full px-3 py-2 border rounded-lg"
            {...register('language')}
          >
            <option value="">Select a language</option>
            <option value="en">English</option>
            <option value="jp">Japanese</option>
            <option value="kr">Korean</option>
            <option value="cn">Chinese</option>
          </select>
          {errors.language && (
            <p className="text-red-500 text-sm mt-1">{errors.language.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Volume (optional)</label>
            <input
              type="number"
              className="w-full px-3 py-2 border rounded-lg disabled:opacity-20"
              {...register('volume')}
              disabled={isOneshot}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Chapter Number (optional)</label>
            <input
              type="number"
              className="w-full px-3 py-2 border rounded-lg disabled:opacity-20"
              {...register('chapterNumber')}
              disabled={isOneshot}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Chapter Title (optional)</label>
          <input
            type="text"
            className="w-full px-3 py-2 border rounded-lg disabled:opacity-20"
            placeholder="Enter chapter title..."
            {...register('chapterTitle')}
            disabled={isOneshot}
          />
        </div>

        <div>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              className="form-checkbox"
              {...register('isOneshot')}
            />
            <span className="text-sm font-medium">One-shot title</span>
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Upload</label>
          <FileUploadManager files={files} setFiles={setFiles} />
          {errors.files && (
            <p className="text-red-500 text-sm mt-1">{errors.files.message}</p>
          )}
        </div>

        {failedFiles.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <h3 className="text-red-800 font-medium mb-2">Failed Uploads:</h3>
            <ul className="list-disc pl-4">
              {failedFiles.map((file, index) => (
                <li key={index} className="text-red-600 text-sm">
                  {file.name}: {file.error}
                </li>
              ))}
            </ul>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-blue-300 relative overflow-hidden"
        >
          {isLoading ? (
            <>
              <div className="absolute inset-0 bg-blue-500" style={{ width: `${uploadProgress}%`, transition: 'width 0.3s ease-in-out' }} />
              <span className="relative">Uploading... {uploadProgress}%</span>
            </>
          ) : (
            'Upload Chapter'
          )}
        </button>
      </form>
    </div>
  );
}

