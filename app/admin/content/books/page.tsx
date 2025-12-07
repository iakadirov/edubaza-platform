'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Search,
  Filter,
  Eye,
  Download,
  Edit,
  Trash2,
  BookOpen,
  MoreHorizontal
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import type { LibraryBook } from '@/types/library';

// Utility function for formatting file size
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

export default function BooksAdminPage() {
  const router = useRouter();
  const [books, setBooks] = useState<LibraryBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchBooks();
  }, [page, search, filter]);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(search && { search }),
        ...(filter !== 'all' && { accessLevel: filter }),
      });

      const response = await fetch(`/api/library/books?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setBooks(data.data);
        setTotal(data.pagination.total);
      }
    } catch (error) {
      console.error('Error fetching books:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (bookId: string) => {
    if (!confirm('Rostdan ham ushbu kitobni o\'chirmoqchimisiz?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/library/books/${bookId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        fetchBooks(); // Refresh list
      } else {
        alert('Xatolik: ' + data.error);
      }
    } catch (error) {
      console.error('Error deleting book:', error);
      alert('Kitobni o\'chirishda xatolik yuz berdi');
    }
  };

  const getAccessLevelBadge = (level: string) => {
    switch (level) {
      case 'FREE':
        return <Badge variant="outline" className="bg-green-50 text-green-700">Bepul</Badge>;
      case 'PRO':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700">PRO</Badge>;
      case 'SCHOOL':
        return <Badge variant="outline" className="bg-purple-50 text-purple-700">Maktab</Badge>;
      default:
        return <Badge variant="outline">{level}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Kitoblar</h1>
          <p className="text-muted-foreground">
            Kutubxona kitoblarini boshqarish
          </p>
        </div>
        <Button onClick={() => router.push('/admin/content/books/new')}>
          <Plus className="mr-2 h-4 w-4" />
          Yangi kitob
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Jami kitoblar
            </CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Faol kitoblar
            </CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {books.filter(b => b.isActive).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Jami ko'rishlar
            </CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {books.reduce((sum, b) => sum + b.viewsCount, 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Yuklab olishlar
            </CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {books.reduce((sum, b) => sum + b.downloadsCount, 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Kitoblar ro'yxati</CardTitle>
          <CardDescription>
            Barcha kitoblarni ko'rish va boshqarish
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Kitob nomi, muallif yoki ISBN..."
                className="pl-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrlash" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Barcha kitoblar</SelectItem>
                <SelectItem value="FREE">Bepul</SelectItem>
                <SelectItem value="PRO">PRO</SelectItem>
                <SelectItem value="SCHOOL">Maktab</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Books Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]"></TableHead>
                  <TableHead>Nomi</TableHead>
                  <TableHead>Mualliflar</TableHead>
                  <TableHead>Kategoriya</TableHead>
                  <TableHead>Kirish</TableHead>
                  <TableHead>Hajmi</TableHead>
                  <TableHead>Statistika</TableHead>
                  <TableHead className="w-[70px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-10">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : books.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-10 text-muted-foreground">
                      Kitoblar topilmadi
                    </TableCell>
                  </TableRow>
                ) : (
                  books.map((book) => (
                    <TableRow key={book.id}>
                      <TableCell>
                        {book.coverImageUrl ? (
                          <img
                            src={book.coverImageUrl}
                            alt={book.titleUz}
                            className="w-10 h-14 object-cover rounded"
                          />
                        ) : (
                          <div className="w-10 h-14 bg-muted rounded flex items-center justify-center">
                            <BookOpen className="h-5 w-5 text-muted-foreground" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{book.titleUz}</div>
                        {book.titleRu && (
                          <div className="text-sm text-muted-foreground">{book.titleRu}</div>
                        )}
                      </TableCell>
                      <TableCell>
                        {book.authors && book.authors.length > 0 ? (
                          <div className="text-sm">{book.authors.join(', ')}</div>
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {book.categoryId ? 'Kategoriya' : '-'}
                        </span>
                      </TableCell>
                      <TableCell>
                        {getAccessLevelBadge(book.accessLevel)}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {formatFileSize(book.pdfSizeBytes)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm space-y-1">
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Eye className="h-3 w-3" />
                            <span>{book.viewsCount}</span>
                          </div>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Download className="h-3 w-3" />
                            <span>{book.downloadsCount}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Amallar</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => router.push(`/admin/content/books/${book.id}`)}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              Ko'rish
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => router.push(`/admin/content/books/${book.id}/edit`)}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Tahrirlash
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => handleDelete(book.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              O'chirish
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {total > 20 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                {total} tadan {((page - 1) * 20) + 1}-{Math.min(page * 20, total)}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Oldingi
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => p + 1)}
                  disabled={page * 20 >= total}
                >
                  Keyingi
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
