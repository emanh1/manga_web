import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const uploadSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  chapter: z.string().min(1, 'Chapter is required'),
  file: z.any()
    .refine((files) => files?.length == 1, 'File is required')
    .refine(
      (files) => {
        if (files?.length) {
          const file = files[0];
          const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];
          return validTypes.includes(file.type);
        }
        return false;
      },
      'Only .jpg, .png, and .pdf files are accepted'
    )
    .refine(
      (files) => files?.[0]?.size <= 10 * 1024 * 1024,
      'File size must be less than 10MB'
    ),
});

type UploadFormData = z.infer<typeof uploadSchema>;

export default function MangaUpload() {
  const { token } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<UploadFormData>({
    resolver: zodResolver(uploadSchema),
  });

  const onSubmit = async (data: UploadFormData) => {
    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('chapter', data.chapter);
      formData.append('file', data.file[0]);

      await axios.post('http://localhost:3000/api/manga/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success('Chapter uploaded successfully!');
      reset();
    } catch (error) {
      toast.error('Failed to upload chapter. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Upload Manga Chapter</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Manga Title
          </label>
          <input
            {...register('title')}
            type="text"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
          {errors.title?.message && (
            <p className="text-red-500 text-xs mt-1">{errors.title.message.toString()}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Chapter Number/Name
          </label>
          <input
            {...register('chapter')}
            type="text"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
          {errors.chapter?.message && (
            <p className="text-red-500 text-xs mt-1">{errors.chapter.message.toString()}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Chapter File
          </label>
          <input
            {...register('file')}
            type="file"
            accept=".jpg,.jpeg,.png,.pdf"
            className="mt-1 block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-medium
              file:bg-indigo-50 file:text-indigo-700
              hover:file:bg-indigo-100"
          />
          {errors.file?.message && (
            <p className="text-red-500 text-xs mt-1">{errors.file.message.toString()}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400"
        >
          {isLoading ? 'Uploading...' : 'Upload Chapter'}
        </button>
      </form>
    </div>
  );
}
