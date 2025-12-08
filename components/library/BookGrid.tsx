import { BookCard, BookCardProps } from './BookCard';

export interface BookGridProps {
  books: BookCardProps[];
  loading?: boolean;
  emptyMessage?: string;
}

export function BookGrid({ books, loading = false, emptyMessage = "Kitoblar topilmadi" }: BookGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 aspect-[3/4] rounded-lg mb-3" />
            <div className="h-4 bg-gray-200 rounded mb-2" />
            <div className="h-3 bg-gray-200 rounded w-2/3" />
          </div>
        ))}
      </div>
    );
  }

  if (books.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-6xl mb-4">📚</div>
        <p className="text-lg text-gray-600">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {books.map((book) => (
        <BookCard key={book.id} {...book} />
      ))}
    </div>
  );
}
