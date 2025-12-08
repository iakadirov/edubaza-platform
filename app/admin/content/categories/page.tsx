'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Plus, Search, MoreVertical, Pencil, Trash2, FolderTree } from 'lucide-react';

interface LibraryCategory {
  id: string;
  nameUz: string;
  nameRu: string | null;
  nameEn: string | null;
  slug: string;
  descriptionUz: string | null;
  parentCategoryId: string | null;
  linkedSubjectId: string | null;
  linkedGrade: number | null;
  categoryType: 'GENERAL' | 'SUBJECT_SPECIFIC' | 'GRADE_SPECIFIC';
  icon: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export default function CategoriesAdminPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<LibraryCategory[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<LibraryCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'GENERAL' | 'SUBJECT_SPECIFIC' | 'GRADE_SPECIFIC'>('all');

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    filterCategories();
  }, [categories, search, filter]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const response = await fetch('/api/library/categories', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setCategories(data.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterCategories = () => {
    let filtered = [...categories];

    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (cat) =>
          cat.nameUz.toLowerCase().includes(searchLower) ||
          cat.nameRu?.toLowerCase().includes(searchLower) ||
          cat.slug.toLowerCase().includes(searchLower)
      );
    }

    if (filter !== 'all') {
      filtered = filtered.filter((cat) => cat.categoryType === filter);
    }

    setFilteredCategories(filtered);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Вы уверены, что хотите удалить эту категорию?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/library/categories/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        fetchCategories();
      } else {
        alert('Ошибка при удалении категории: ' + data.error);
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Ошибка при удалении категории');
    }
  };

  const getCategoryTypeBadge = (type: string) => {
    const badges = {
      GENERAL: <Badge variant="secondary">Общая</Badge>,
      SUBJECT_SPECIFIC: <Badge variant="default">По предмету</Badge>,
      GRADE_SPECIFIC: <Badge variant="outline">По классу</Badge>,
    };
    return badges[type as keyof typeof badges] || <Badge>{type}</Badge>;
  };

  const buildCategoryTree = (parentId: string | null = null, level: number = 0): LibraryCategory[] => {
    return filteredCategories
      .filter((cat) => cat.parentCategoryId === parentId)
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .flatMap((cat) => [
        { ...cat, level },
        ...buildCategoryTree(cat.id, level + 1),
      ]);
  };

  const hierarchicalCategories = buildCategoryTree();

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Управление категориями</h1>
          <p className="text-gray-500 mt-1">
            Создавайте и управляйте категориями для электронных книг
          </p>
        </div>
        <Button onClick={() => router.push('/admin/content/categories/new')}>
          <Plus className="mr-2 h-4 w-4" />
          Добавить категорию
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Фильтры</CardTitle>
          <CardDescription>Поиск и фильтрация категорий</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Поиск категорий..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                onClick={() => setFilter('all')}
              >
                Все
              </Button>
              <Button
                variant={filter === 'GENERAL' ? 'default' : 'outline'}
                onClick={() => setFilter('GENERAL')}
              >
                Общие
              </Button>
              <Button
                variant={filter === 'SUBJECT_SPECIFIC' ? 'default' : 'outline'}
                onClick={() => setFilter('SUBJECT_SPECIFIC')}
              >
                По предметам
              </Button>
              <Button
                variant={filter === 'GRADE_SPECIFIC' ? 'default' : 'outline'}
                onClick={() => setFilter('GRADE_SPECIFIC')}
              >
                По классам
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Категории ({hierarchicalCategories.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Загрузка...</div>
          ) : hierarchicalCategories.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Категории не найдены
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Название</TableHead>
                  <TableHead>Тип</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Порядок</TableHead>
                  <TableHead className="text-right">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {hierarchicalCategories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {category.level > 0 && (
                          <span style={{ marginLeft: `${category.level * 20}px` }}>
                            <FolderTree className="h-4 w-4 text-muted-foreground" />
                          </span>
                        )}
                        <div>
                          <div className="font-medium">{category.nameUz}</div>
                          {category.nameRu && (
                            <div className="text-sm text-muted-foreground">
                              {category.nameRu}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getCategoryTypeBadge(category.categoryType)}</TableCell>
                    <TableCell>
                      <code className="text-sm bg-muted px-2 py-1 rounded">
                        {category.slug}
                      </code>
                    </TableCell>
                    <TableCell>{category.sortOrder}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() =>
                              router.push(`/admin/content/categories/${category.id}/edit`)
                            }
                          >
                            <Pencil className="mr-2 h-4 w-4" />
                            Редактировать
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(category.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Удалить
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
