'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Icon } from '@iconify/react';
import { BookGrid } from '@/components/library/BookGrid';
import { Container } from '@/components/ui/container';
import { BookCardProps } from '@/components/library/BookCard';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

interface Category {
  id: string;
  name: string;
  slug: string;
}

function LibraryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [books, setBooks] = useState<BookCardProps[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedGrade, setSelectedGrade] = useState(searchParams.get('grade') || 'all');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [selectedLanguage, setSelectedLanguage] = useState(searchParams.get('lang') || 'all');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'popular');

  useEffect(() => {
    fetchCategories();
    fetchBooks();
  }, [searchQuery, selectedGrade, selectedCategory, selectedLanguage, sortBy]);

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/library/categories', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setCategories(data.data);
        }
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');

      // Build query params
      const params = new URLSearchParams();
      if (searchQuery) params.append('q', searchQuery);
      if (selectedGrade !== 'all') params.append('grade', selectedGrade);
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      if (selectedLanguage !== 'all') params.append('language', selectedLanguage);
      params.append('sort', sortBy);
      params.append('limit', '20');

      const response = await fetch(`/api/library/books?${params.toString()}`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Transform API response to BookCardProps
          const transformedBooks: BookCardProps[] = data.data.map((book: any) => ({
            id: book.id,
            title: book.title,
            author: book.author,
            coverUrl: book.coverUrl,
            gradeLevel: book.gradeLevel,
            subject: book.subject,
            pageCount: book.pageCount,
            downloadCount: book.downloadCount,
            viewCount: book.viewCount,
            language: book.language,
            slug: book.slug,
          }));
          setBooks(transformedBooks);
        }
      }
    } catch (error) {
      console.error('Error fetching books:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchBooks();
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedGrade('all');
    setSelectedCategory('all');
    setSelectedLanguage('all');
    setSortBy('popular');
    router.push('/library');
  };

  const hasActiveFilters = searchQuery || selectedGrade !== 'all' || selectedCategory !== 'all' || selectedLanguage !== 'all' || sortBy !== 'popular';

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <section className="bg-white border-b border-gray-200 shadow-sm">
        <Container backgroundClassName="bg-white" className="py-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg">
              <Icon icon="solar:book-bookmark-bold-duotone" className="text-4xl text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Kutubxona</h1>
              <p className="text-gray-600 mt-1">Barcha darsliklar va qo'llanmalar</p>
            </div>
          </div>

          {/* Search & Filters */}
          <form onSubmit={handleSearch} className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Icon icon="solar:magnifer-bold" className="absolute left-4 top-1/2 -translate-y-1/2 text-xl text-gray-400" />
              <Input
                type="text"
                placeholder="Kitob, muallif yoki mavzu bo'yicha qidirish..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-6 text-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            {/* Filters Row */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {/* Grade Filter */}
              <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Sinf" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Barcha sinflar</SelectItem>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((grade) => (
                    <SelectItem key={grade} value={grade.toString()}>
                      {grade}-sinf
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Category Filter */}
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Kategoriya" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Barcha kategoriyalar</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.slug}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Language Filter */}
              <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Til" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Barcha tillar</SelectItem>
                  <SelectItem value="uz">O'zbekcha</SelectItem>
                  <SelectItem value="ru">Ruscha</SelectItem>
                  <SelectItem value="en">Inglizcha</SelectItem>
                </SelectContent>
              </Select>

              {/* Sort */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Tartiblash" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popular">Ommabop</SelectItem>
                  <SelectItem value="newest">Yangi</SelectItem>
                  <SelectItem value="title">Nom bo'yicha</SelectItem>
                  <SelectItem value="downloads">Ko'p yuklab olingan</SelectItem>
                </SelectContent>
              </Select>

              {/* Clear Filters */}
              {hasActiveFilters && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={clearFilters}
                  className="flex items-center gap-2"
                >
                  <Icon icon="solar:restart-bold" className="text-lg" />
                  Tozalash
                </Button>
              )}
            </div>
          </form>
        </Container>
      </section>

      {/* Books Grid */}
      <section className="py-12 bg-white">
        <Container backgroundClassName="bg-white">
        {/* Results Count */}
        {!loading && (
          <div className="mb-6 flex items-center justify-between">
            <p className="text-gray-600">
              <span className="font-semibold text-gray-900">{books.length}</span> ta kitob topildi
            </p>
          </div>
        )}

        <BookGrid books={books} loading={loading} emptyMessage="Hech qanday kitob topilmadi. Filtrlarni o'zgartiring." />
        </Container>
      </section>
    </div>
  );
}

export default function LibraryPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <LibraryContent />
    </Suspense>
  );
}
