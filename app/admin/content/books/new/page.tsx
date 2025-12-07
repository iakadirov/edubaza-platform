'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Upload, FileText, ImagePlus, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';

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
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

import type { LibraryCategory } from '@/types/library';

export default function NewBookPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [categories, setCategories] = useState<LibraryCategory[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);

  const form = useForm({
    defaultValues: {
      titleUz: '',
      titleRu: '',
      titleEn: '',
      descriptionUz: '',
      descriptionRu: '',
      descriptionEn: '',
      bookType: 'BOOK',
      categoryId: '',
      subjectId: '',
      gradeNumber: '',
      authors: '',
      publisher: '',
      publishYear: '',
      isbn: '',
      pageCount: '',
      accessLevel: 'FREE',
      keywords: '',
    },
  });

  useEffect(() => {
    fetchCategories();
    fetchSubjects();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/library/categories');
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
      const response = await fetch('/api/subjects');
      const data = await response.json();
      if (data.success) {
        setSubjects(data.data);
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  const onSubmit = async (values: any) => {
    if (!pdfFile) {
      alert('PDF fayl yuklash majburiy!');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const formData = new FormData();
      formData.append('pdf', pdfFile);
      if (coverFile) {
        formData.append('cover', coverFile);
      }

      // Add all form fields
      Object.keys(values).forEach(key => {
        if (values[key]) {
          if (key === 'authors' || key === 'keywords') {
            // Convert comma-separated strings to arrays
            const arr = values[key].split(',').map((s: string) => s.trim()).filter(Boolean);
            formData.append(key, JSON.stringify(arr));
          } else {
            formData.append(key, values[key]);
          }
        }
      });

      const response = await fetch('/api/library/books', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        alert('Kitob muvaffaqiyatli qo\'shildi!');
        router.push('/admin/content/books');
      } else {
        alert('Xatolik: ' + data.error);
      }
    } catch (error) {
      console.error('Error creating book:', error);
      alert('Kitobni qo\'shishda xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Yangi kitob qo'shish</h1>
          <p className="text-muted-foreground">
            Kutubxonaga yangi kitob qo'shish
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Main Content - 2 columns */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Asosiy ma'lumotlar</CardTitle>
                  <CardDescription>
                    Kitob haqida asosiy ma'lumotlar
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="titleUz"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nomi (O'zbekcha) *</FormLabel>
                        <FormControl>
                          <Input placeholder="Matematika 5-sinf" {...field} required />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="titleRu"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nomi (Ruscha)</FormLabel>
                        <FormControl>
                          <Input placeholder="Математика 5 класс" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="titleEn"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nomi (Inglizcha)</FormLabel>
                        <FormControl>
                          <Input placeholder="Mathematics Grade 5" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="descriptionUz"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tavsif (O'zbekcha)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Kitob haqida qisqacha ma'lumot..."
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="descriptionRu"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tavsif (Ruscha)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Краткое описание книги..."
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Classification */}
              <Card>
                <CardHeader>
                  <CardTitle>Tasnif</CardTitle>
                  <CardDescription>
                    Kitob kategoriyasi va fani
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="bookType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Turi</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Turini tanlang" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="BOOK">Kitob</SelectItem>
                            <SelectItem value="JOURNAL">Jurnal</SelectItem>
                            <SelectItem value="MAGAZINE">Periodika</SelectItem>
                            <SelectItem value="WORKBOOK">Ish daftari</SelectItem>
                            <SelectItem value="REFERENCE">Ma'lumotnoma</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="categoryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Kategoriya</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Kategoriyani tanlang" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories.map((cat) => (
                              <SelectItem key={cat.id} value={cat.id}>
                                {cat.nameUz}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="subjectId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fan</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Fanni tanlang" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {subjects.map((subject) => (
                              <SelectItem key={subject.id} value={subject.id}>
                                {subject.nameUz}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="gradeNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sinf</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sinfni tanlang" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((grade) => (
                              <SelectItem key={grade} value={grade.toString()}>
                                {grade}-sinf
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Publishing Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Nashriyot ma'lumotlari</CardTitle>
                  <CardDescription>
                    Muallif, nashriyot va boshqa ma'lumotlar
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="authors"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mualliflar</FormLabel>
                        <FormControl>
                          <Input placeholder="A.Alimov, B.Bakirov" {...field} />
                        </FormControl>
                        <FormDescription>
                          Vergul bilan ajratilgan
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="publisher"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nashriyot</FormLabel>
                        <FormControl>
                          <Input placeholder="O'qituvchi nashriyoti" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="publishYear"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nashr yili</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="2024" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="isbn"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ISBN</FormLabel>
                        <FormControl>
                          <Input placeholder="978-9943-01-XXX-X" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="pageCount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sahifalar soni</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="150" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="keywords"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Kalit so'zlar</FormLabel>
                        <FormControl>
                          <Input placeholder="matematika, algebra, geometriya" {...field} />
                        </FormControl>
                        <FormDescription>
                          Vergul bilan ajratilgan
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Sidebar - 1 column */}
            <div className="space-y-6">
              {/* Files */}
              <Card>
                <CardHeader>
                  <CardTitle>Fayllar</CardTitle>
                  <CardDescription>
                    PDF va muqova rasm
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* PDF Upload */}
                  <div>
                    <Label>PDF fayl *</Label>
                    <div className="mt-2">
                      <label
                        htmlFor="pdf-upload"
                        className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          {pdfFile ? (
                            <>
                              <FileText className="w-8 h-8 mb-2 text-primary" />
                              <p className="text-sm text-muted-foreground">{pdfFile.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {(pdfFile.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </>
                          ) : (
                            <>
                              <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                              <p className="text-sm text-muted-foreground">
                                PDF faylni yuklash
                              </p>
                            </>
                          )}
                        </div>
                        <input
                          id="pdf-upload"
                          type="file"
                          className="hidden"
                          accept=".pdf"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) setPdfFile(file);
                          }}
                        />
                      </label>
                    </div>
                  </div>

                  {/* Cover Upload */}
                  <div>
                    <Label>Muqova rasmi</Label>
                    <div className="mt-2">
                      <label
                        htmlFor="cover-upload"
                        className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          {coverFile ? (
                            <>
                              <ImagePlus className="w-8 h-8 mb-2 text-primary" />
                              <p className="text-sm text-muted-foreground">{coverFile.name}</p>
                            </>
                          ) : (
                            <>
                              <ImagePlus className="w-8 h-8 mb-2 text-muted-foreground" />
                              <p className="text-sm text-muted-foreground">
                                Rasm yuklash
                              </p>
                            </>
                          )}
                        </div>
                        <input
                          id="cover-upload"
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) setCoverFile(file);
                          }}
                        />
                      </label>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Access Level */}
              <Card>
                <CardHeader>
                  <CardTitle>Kirish huquqi</CardTitle>
                  <CardDescription>
                    Kim ko'ra oladi
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="accessLevel"
                    render={({ field }) => (
                      <FormItem>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Tanlang" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="FREE">Bepul (Barchaga)</SelectItem>
                            <SelectItem value="PRO">PRO obuna</SelectItem>
                            <SelectItem value="SCHOOL">Maktab obunasi</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => router.back()}
                  disabled={loading}
                >
                  Bekor qilish
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Yuklanmoqda...
                    </>
                  ) : (
                    'Saqlash'
                  )}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
