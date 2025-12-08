import Link from 'next/link';
import Image from 'next/image';
import { Icon } from '@iconify/react';

export interface BookCardProps {
  id: string;
  title: string;
  author: string;
  coverUrl: string | null;
  gradeLevel: number;
  subject: string;
  pageCount?: number;
  downloadCount?: number;
  viewCount?: number;
  language?: string;
  slug: string;
}

export function BookCard({
  id,
  title,
  author,
  coverUrl,
  gradeLevel,
  subject,
  pageCount,
  downloadCount,
  viewCount,
  language = 'uz',
  slug,
}: BookCardProps) {
  return (
    <Link
      href={`/library/${slug}`}
      className="group bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-200 hover:border-blue-400"
    >
      {/* Book Cover */}
      <div className="relative aspect-[3/4] bg-gradient-to-br from-blue-50 to-purple-50 overflow-hidden">
        {coverUrl ? (
          <Image
            src={coverUrl}
            alt={title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <Icon
              icon="solar:book-bookmark-bold-duotone"
              className="text-6xl text-gray-300"
            />
          </div>
        )}

        {/* Grade Badge */}
        <div className="absolute top-2 right-2 bg-blue-600 text-white px-2 py-1 rounded-md text-xs font-bold shadow-lg">
          {gradeLevel}-sinf
        </div>

        {/* Language Badge */}
        {language && (
          <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-medium text-gray-700">
            {language.toUpperCase()}
          </div>
        )}
      </div>

      {/* Book Info */}
      <div className="p-4">
        {/* Subject */}
        <div className="flex items-center gap-1.5 mb-2">
          <Icon icon="solar:book-bold" className="text-sm text-blue-600" />
          <span className="text-xs font-medium text-blue-600">{subject}</span>
        </div>

        {/* Title */}
        <h3 className="font-bold text-gray-900 line-clamp-2 mb-1 group-hover:text-blue-600 transition-colors">
          {title}
        </h3>

        {/* Author */}
        <p className="text-sm text-gray-600 mb-3 line-clamp-1">{author}</p>

        {/* Stats */}
        <div className="flex items-center gap-3 text-xs text-gray-500">
          {pageCount && (
            <div className="flex items-center gap-1">
              <Icon icon="solar:document-text-bold" className="text-sm" />
              <span>{pageCount} bet</span>
            </div>
          )}
          {viewCount !== undefined && viewCount > 0 && (
            <div className="flex items-center gap-1">
              <Icon icon="solar:eye-bold" className="text-sm" />
              <span>{viewCount}</span>
            </div>
          )}
          {downloadCount !== undefined && downloadCount > 0 && (
            <div className="flex items-center gap-1">
              <Icon icon="solar:download-minimalistic-bold" className="text-sm" />
              <span>{downloadCount}</span>
            </div>
          )}
        </div>

        {/* Read Button */}
        <div className="mt-4 pt-3 border-t border-gray-100">
          <div className="flex items-center justify-center gap-2 text-sm font-medium text-blue-600 group-hover:text-blue-700">
            <Icon icon="solar:book-2-bold" className="text-lg" />
            <span>O'qish</span>
            <Icon
              icon="solar:arrow-right-bold"
              className="text-lg group-hover:translate-x-1 transition-transform"
            />
          </div>
        </div>
      </div>
    </Link>
  );
}
