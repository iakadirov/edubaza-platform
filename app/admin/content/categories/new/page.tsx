'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { ArrowLeft } from 'lucide-react';

interface Category {
  id: string;
  nameUz: string;
  nameRu: string | null;
}

interface Subject {
  id: string;
  name: string;
}

function generateSlug(text: string): string {
  const translitMap: Record<string, string> = {
    а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'yo', ж: 'zh',
    з: 'z', и: 'i', й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o',
    п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'h', ц: 'ts',
    ч: 'ch', ш: 'sh', щ: 'sch', ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya',
    ў: 'o', қ: 'q', ғ: 'g', ҳ: 'h',
  };

  return text
    .toLowerCase()
    .split('')
    .map((char) => translitMap[char] || char)
    .join('')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default function NewCategoryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);

  const [formData, setFormData] = useState({
    nameUz: '',
    nameRu: '',
    nameEn: '',
    slug: '',
    descriptionUz: '',
    parentCategoryId: '',
    linkedSubjectId: '',
    linkedGrade: '',
    categoryType: 'GENERAL' as 'GENERAL' | 'SUBJECT_SPECIFIC' | 'GRADE_SPECIFIC',
    icon: '',
    sortOrder: '0',
  });

  useEffect(() => {
    fetchCategories();
    fetchSubjects();
  }, []);

  useEffect(() => {
    if (formData.nameUz && !formData.slug) {
      setFormData((prev) => ({
        ...prev,
        slug: generateSlug(prev.nameUz),
      }));
    }
  }, [formData.nameUz]);

  const fetchCategories = async () => {
    try {
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
    }
  };

  const fetchSubjects = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/subjects', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setSubjects(data.subjects);
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');

      const payload = {
        nameUz: formData.nameUz,
        nameRu: formData.nameRu || null,
        nameEn: formData.nameEn || null,
        slug: formData.slug,
        descriptionUz: formData.descriptionUz || null,
        parentCategoryId: formData.parentCategoryId || null,
        linkedSubjectId: formData.linkedSubjectId || null,
        linkedGrade: formData.linkedGrade ? parseInt(formData.linkedGrade) : null,
        categoryType: formData.categoryType,
        icon: formData.icon || null,
        sortOrder: parseInt(formData.sortOrder),
      };

      const response = await fetch('/api/library/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        alert('Категория успешно создана!');
        router.push('/admin/content/categories');
      } else {
        alert('Ошибка: ' + data.error);
      }
    } catch (error) {
      console.error('Error creating category:', error);
      alert('Ошибка при создании категории');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Назад
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Добавить новую категорию</CardTitle>
          <CardDescription>
            Заполните информацию о категории для электронных книг
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="nameUz">Название (Узбекский) *</Label>
                <Input
                  id="nameUz"
                  value={formData.nameUz}
                  onChange={(e) =>
                    setFormData({ ...formData, nameUz: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <Label htmlFor="nameRu">Название (Русский)</Label>
                <Input
                  id="nameRu"
                  value={formData.nameRu}
                  onChange={(e) =>
                    setFormData({ ...formData, nameRu: e.target.value })
                  }
                />
              </div>

              <div>
                <Label htmlFor="nameEn">Название (Английский)</Label>
                <Input
                  id="nameEn"
                  value={formData.nameEn}
                  onChange={(e) =>
                    setFormData({ ...formData, nameEn: e.target.value })
                  }
                />
              </div>

              <div>
                <Label htmlFor="slug">Slug (URL) *</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData({ ...formData, slug: e.target.value })
                  }
                  required
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Автоматически генерируется из названия
                </p>
              </div>

              <div>
                <Label htmlFor="descriptionUz">Описание (Узбекский)</Label>
                <Textarea
                  id="descriptionUz"
                  value={formData.descriptionUz}
                  onChange={(e) =>
                    setFormData({ ...formData, descriptionUz: e.target.value })
                  }
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="categoryType">Тип категории *</Label>
                <Select
                  value={formData.categoryType}
                  onValueChange={(value: any) =>
                    setFormData({ ...formData, categoryType: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GENERAL">Общая</SelectItem>
                    <SelectItem value="SUBJECT_SPECIFIC">По предмету</SelectItem>
                    <SelectItem value="GRADE_SPECIFIC">По классу</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="parentCategory">Родительская категория</Label>
                <Select
                  value={formData.parentCategoryId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, parentCategoryId: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите родительскую категорию" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Нет (верхний уровень)</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.nameUz}
                        {cat.nameRu && ` (${cat.nameRu})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="linkedSubject">Связанный предмет</Label>
                <Select
                  value={formData.linkedSubjectId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, linkedSubjectId: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите предмет" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Нет связи</SelectItem>
                    {subjects.map((subject) => (
                      <SelectItem key={subject.id} value={subject.id}>
                        {subject.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="linkedGrade">Связанный класс</Label>
                <Select
                  value={formData.linkedGrade}
                  onValueChange={(value) =>
                    setFormData({ ...formData, linkedGrade: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите класс" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Нет связи</SelectItem>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((grade) => (
                      <SelectItem key={grade} value={grade.toString()}>
                        {grade} класс
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="icon">Иконка (эмодзи или имя иконки)</Label>
                <Input
                  id="icon"
                  value={formData.icon}
                  onChange={(e) =>
                    setFormData({ ...formData, icon: e.target.value })
                  }
                  placeholder="📚"
                />
              </div>

              <div>
                <Label htmlFor="sortOrder">Порядок сортировки</Label>
                <Input
                  id="sortOrder"
                  type="number"
                  value={formData.sortOrder}
                  onChange={(e) =>
                    setFormData({ ...formData, sortOrder: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={loading}>
                {loading ? 'Создание...' : 'Создать категорию'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Отмена
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
