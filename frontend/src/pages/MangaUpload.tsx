import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { getMangaDetails } from '../api/jikan';
import type { TMangaDetails } from '../types/manga';
import toast from 'react-hot-toast';
import FileUploadManager from '../components/FileUploadManager';

const uploadSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  malId: z.string(),
  volume: z.string().optional(),
  chapter: z.string().optional(),
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

type UploadFormData = z.infer<typeof uploadSchema>;

export default function MangaUpload() {
  const { mangaId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedManga, setSelectedManga] = useState<TMangaDetails | null>(null);

  const [files, setFiles] = useState<File[]>([]);

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
    },
  });

  const malId = watch('malId');
  const isOneshot = watch('isOneshot');
  useEffect(() => {
    if (mangaId) {
      setValue('malId', mangaId);
    }
  }, [mangaId, setValue]);

  useEffect(() => {
    if (malId) {
      const fetchMangaDetails = async () => {
        try {
          const details = await getMangaDetails(Number(malId));
          setSelectedManga(details);
          setValue('title', details.title);
        } catch (error) {
          console.error('Error fetching manga details:', error);
          toast.error('Failed to fetch manga details');
        }
      };
      fetchMangaDetails();
    }
  }, [malId, setValue]);

  useEffect(() => {
    const fileList = new DataTransfer();
    files.forEach(file => fileList.items.add(file));
    setValue('files', fileList.files, { shouldValidate: true });
  }, [files, setValue]);

  const onSubmit = async (data: UploadFormData) => {
    try {
      setIsLoading(true);
      const formData = new FormData();

      formData.append('title', data.title);
      if (data.malId) formData.append('malId', data.malId);
      if (data.volume) formData.append('volume', data.volume);
      if (data.chapter) formData.append('chapter', data.chapter);
      if (data.chapterTitle) formData.append('chapterTitle', data.chapterTitle);
      formData.append('isOneshot', String(data.isOneshot));
      formData.append('language', data.language);

      Array.from(data.files).forEach((file, index) => {
        formData.append('files', file);
        formData.append('fileOrder', String(index + 1));
      });

      await axios.post('/api/upload', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('Upload successful');
      navigate('/');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload manga');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Upload Manga</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {selectedManga ? (
          <div className="flex gap-4 items-start mb-4">
            <img
              src={selectedManga.images.jpg.image_url}
              alt={selectedManga.title}
              className="w-32 rounded-lg shadow-md"
            />
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Title</label>
              <div className="relative">
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded-lg bg-gray-50"
                  value={selectedManga.title}
                  readOnly
                  {...register('title')}
                />
                <a
                  href={`/manga/${malId}`}
                  rel="noopener noreferrer"
                  className="absolute inset-0 flex items-center px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  {selectedManga.title}
                </a>
              </div>
              <p className="mt-2 text-sm text-gray-600">
                {selectedManga.synopsis?.slice(0, 200)}...
              </p>
            </div>
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              type="text"
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="Search manga title..."
              {...register('title')}
              onChange={(e) => {
                register('title').onChange(e);
              }}
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
              {...register('chapter')}
              disabled={isOneshot}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Chapter Title (optional)</label>
          <input
            type="text"
            className="w-full px-3 py-2 border rounded-lg"
            placeholder="Enter chapter title..."
            {...register('chapterTitle')}
          />
        </div>

        <div>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              className="form-checkbox"
              {...register('isOneshot')}
            />
            <span className="text-sm font-medium">One-shot manga</span>
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Upload</label>
          <FileUploadManager files={files} setFiles={setFiles} />
          {errors.files && (
            <p className="text-red-500 text-sm mt-1">{errors.files.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-blue-300"
        >
          {isLoading ? 'Uploading...' : 'Upload Chapter'}
        </button>
      </form>
    </div>
  );
}

