
'use client';

import * as React from 'react';
import { format, isSameDay, isBefore, startOfDay } from 'date-fns';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, PlusCircle, Clock, Tag, Users, Tv, GripVertical, Edit, Trash2, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import { useAuth } from '@/lib/auth';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc, addDoc, deleteDoc } from 'firebase/firestore';
import { ProgramFormDialog } from '@/components/shared/program-form-dialog';


interface Program {
    id: string;
    title: string;
    description: string;
    date: any;
    time: string;
    duration: string;
    category: string;
    guests: string;
    imageUrl: string;
    type: 'tv' | 'radio';
}

interface Category {
    id: string;
    name: string;
}

const isValidImageUrl = (url: string | undefined | null): boolean => {
  if (!url) return false;
  try {
    const validHostnames = ['images.unsplash.com', 'picsum.photos', 'placehold.co'];
    const { hostname } = new URL(url);
    return validHostnames.includes(hostname);
  } catch (e) {
    return false;
  }
};


const ProgramDetailDialog = ({ program, children }: { program: Program; children: React.ReactNode }) => {
    return (
        <Dialog>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className='font-headline text-2xl'>{program.title}</DialogTitle>
                    <DialogDescription className='flex items-center gap-4'>
                        <span className='flex items-center gap-1.5'><Clock className='h-4 w-4' /> {program.time}</span>
                        <span className='flex items-center gap-1.5'><CalendarIcon className='h-4 w-4' /> {program.duration}</span>
                    </DialogDescription>
                </DialogHeader>
                <div className='py-4 space-y-4'>
                    <div className="relative aspect-video w-full overflow-hidden rounded-lg">
                            <Image src={isValidImageUrl(program.imageUrl) ? program.imageUrl : `https://picsum.photos/seed/${program.id}/600/400`} alt={program.title} fill className="object-cover" />
                    </div>
                    <p className="text-sm text-muted-foreground">{program.description}</p>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="flex items-start gap-2">
                            <Tv className="h-4 w-4 mt-1 flex-shrink-0" />
                            <div>
                                <span className="font-semibold">Catégorie:</span> 
                                <p>{program.category}</p>
                            </div>
                        </div>
                    </div>
                    {program.guests && (
                            <div className="flex items-start gap-2 text-sm">
                            <Users className="h-4 w-4 mt-1 flex-shrink-0" />
                            <div>
                                <span className="font-semibold">Invités:</span>
                                <div className="flex flex-wrap gap-2 mt-1">
                                    {program.guests.split(',').map(guest => guest.trim()).map(guest => <Badge key={guest} variant="secondary">{guest}</Badge>)}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                <Button className="w-full" variant="accent">
                    Définir un rappel
                </Button>
            </DialogContent>
        </Dialog>
    );
};

const addCategorySchema = z.object({
    name: z.string().min(1, 'Le nom de la catégorie est requis'),
});

const AddCategoryDialog = ({ onAddCategory }: { onAddCategory: (name: string) => void }) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const firestore = useFirestore();
    const form = useForm<z.infer<typeof addCategorySchema>>({
        resolver: zodResolver(addCategorySchema),
        defaultValues: { name: '' },
    });

    async function onSubmit(values: z.infer<typeof addCategorySchema>) {
        setIsSubmitting(true);
        try {
            if(!firestore) return;
            await addDoc(collection(firestore, 'categories'), values);
            onAddCategory(values.name);
            form.reset();
            setIsOpen(false);
        } catch (error) {
            console.error("Error adding category:", error);
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="w-full mt-2">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Ajouter une catégorie
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Ajouter une nouvelle catégorie</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nom de la catégorie</FormLabel>
                                    <FormControl>
                                        <Input placeholder="ex. Comédie" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                             <Button type="button" variant="secondary" onClick={() => setIsOpen(false)}>
                                    Annuler
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Ajouter
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};


export default function ProgramGuidePage() {
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const { user } = useAuth();
  const [activeTab, setActiveTab] = React.useState<'tv' | 'radio'>('tv');
  const [selectedCategory, setSelectedCategory] = React.useState('All');
  
  const firestore = useFirestore();

  const programsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'programs')
  }, [firestore]);
  const { data: programs, isLoading: programsLoading } = useCollection<Program>(programsQuery);

  const categoriesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'categories')
  }, [firestore]);
  const { data: categories, isLoading: categoriesLoading } = useCollection<Category>(categoriesQuery);

  const handleAddCategory = (newCategory: string) => {
    // The list will update automatically via Firestore's real-time subscription
  };

  const handleDeleteProgram = async (programId: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce programme ?")) {
        try {
            if(!firestore) return;
            await deleteDoc(doc(firestore, 'programs', programId));
        } catch (error) {
            console.error("Error deleting program:", error);
        }
    }
  };


  const handleDateChange = (newDate: Date | undefined) => {
    setDate(newDate);
  }

  const handlePreviousDay = () => {
    if (date) {
      const prevDay = new Date(date);
      prevDay.setDate(date.getDate() - 1);
      setDate(prevDay);
    }
  };

  const handleNextDay = () => {
    if (date) {
      const nextDay = new Date(date);
      nextDay.setDate(date.getDate() + 1);
      setDate(nextDay);
    }
  };

  const filteredPrograms = React.useMemo(() => {
    if (!programs || !date) return [];

    const today = new Date();
    
    // Filter by selected date, ensuring program has a valid date
    const dateFiltered = programs.filter(p => p.date && isSameDay(p.date.toDate(), date));

    // Filter by type (tv/radio)
    const typeFiltered = dateFiltered.filter(p => p.type === activeTab);
    
    // Filter by category
    const categoryFiltered = selectedCategory === 'All'
      ? typeFiltered
      : typeFiltered.filter(program => program.category === selectedCategory);

    // If it's today, filter out past programs
    if (isSameDay(date, today)) {
        const currentTime = `${today.getHours().toString().padStart(2, '0')}:${today.getMinutes().toString().padStart(2, '0')}`;
        return categoryFiltered
          .filter(p => p.time >= currentTime)
          .sort((a, b) => a.time.localeCompare(b.time));
    }

    // For future dates, just sort by time
    return categoryFiltered.sort((a, b) => a.time.localeCompare(b.time));

  }, [programs, selectedCategory, activeTab, date]);

  const sortedCategories = useMemo(() => {
    if (!categories) return [];
    return [...categories].sort((a, b) => a.name.localeCompare(b.name));
  }, [categories]);


  const renderProgramList = (programsToList: Program[]) => {
    if (programsLoading) {
        return <div className="flex justify-center items-center py-16"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }
    
    const today = new Date();
    if (date && isBefore(startOfDay(date), startOfDay(today))) {
       return (
            <div className="text-center py-16 text-muted-foreground">
                <p>Il n'y a pas de programmes pour les dates passées.</p>
            </div>
        )
    }

    if (programsToList.length === 0) {
        return (
            <div className="text-center py-16 text-muted-foreground">
                <p>Aucun programme à venir ne correspond à votre sélection pour aujourd'hui.</p>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {programsToList.map((program) => (
                <Card key={program.id} className="group hover:bg-muted/50 transition-colors">
                    <CardContent className="p-4 flex items-center gap-4">
                        <ProgramDetailDialog program={program}>
                             <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-md cursor-pointer">
                                <Image
                                    src={isValidImageUrl(program.imageUrl) ? program.imageUrl : `https://picsum.photos/seed/${program.id}/200/200`}
                                    alt={program.title}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        </ProgramDetailDialog>
                        <div className="flex-1">
                            <h4 className="font-semibold font-headline">{program.title}</h4>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                                <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" />{program.time}</span>
                                <span className="flex items-center gap-1.5"><CalendarIcon className="h-4 w-4" />{program.duration}</span>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-2">
                                <Badge variant="secondary">{program.category}</Badge>
                            </div>
                            {program.guests && (
                            <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-2">
                                <Users className="h-4 w-4" />
                                <span>{program.guests}</span>
                            </div>
                            )}
                        </div>
                         {user && user.role === 'admin' && (
                            <div className="flex flex-col items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <ProgramFormDialog mode="edit" program={program} categories={sortedCategories || []} type={activeTab} currentDate={date}>
                                    <Button variant="ghost" size="icon">
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                </ProgramFormDialog>
                                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDeleteProgram(program.id)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            ))}
        </div>
    );
  };


  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
            <h1 className="text-4xl font-bold font-headline">Guide des Programmes</h1>
            <p className="text-muted-foreground">Découvrez ce qui est diffusé à la TV et à la Radio.</p>
        </div>
        <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={handlePreviousDay}>
                <ChevronLeft className="h-4 w-4" />
            </Button>
            <Popover>
            <PopoverTrigger asChild>
                <Button
                id="date"
                variant={'outline'}
                className={cn(
                    'w-[200px] justify-start text-left font-normal',
                    !date && 'text-muted-foreground'
                )}
                >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, 'PPP') : <span>Choisir une date</span>}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                initialFocus
                mode="single"
                selected={date}
                onSelect={handleDateChange}
                />
            </PopoverContent>
            </Popover>
            <Button variant="outline" size="icon" onClick={handleNextDay}>
                <ChevronRight className="h-4 w-4" />
            </Button>
        </div>
      </div>

       <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'tv' | 'radio')} className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-sm mx-auto mb-8">
          <TabsTrigger value="tv">TV en direct</TabsTrigger>
          <TabsTrigger value="radio">Radio</TabsTrigger>
        </TabsList>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <aside className="md:col-span-1">
                <Card>
                    <CardHeader>
                        <CardTitle className='font-headline'>Catégories</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                       <Button 
                            variant={selectedCategory === 'All' ? 'secondary' : 'ghost'}
                            className="w-full justify-start"
                            onClick={() => setSelectedCategory('All')}
                        >
                           <GripVertical className="mr-2 h-4 w-4" />
                           All
                        </Button>
                       {categoriesLoading && <div className="flex justify-center items-center py-4"><Loader2 className="h-6 w-6 animate-spin" /></div>}
                       {sortedCategories && sortedCategories.map(category => (
                            <Button 
                                key={category.id} 
                                variant={selectedCategory === category.name ? 'secondary' : 'ghost'}
                                className="w-full justify-start"
                                onClick={() => setSelectedCategory(category.name)}
                            >
                               <Tag className="mr-2 h-4 w-4" />
                               {category.name}
                            </Button>
                       ))}
                       <Separator className="my-4" />
                       {user && user.role === 'admin' && (
                        <>
                            <ProgramFormDialog mode="add" categories={sortedCategories || []} type={activeTab} currentDate={date}>
                                <Button variant="accent" className='w-full'>
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    Ajouter un programme
                                </Button>
                            </ProgramFormDialog>
                            <AddCategoryDialog onAddCategory={handleAddCategory} />
                        </>
                       )}
                    </CardContent>
                </Card>
            </aside>
            <main className="md:col-span-3">
                 <TabsContent value="tv" className="mt-0">
                    {renderProgramList(filteredPrograms)}
                </TabsContent>
                <TabsContent value="radio" className="mt-0">
                   {renderProgramList(filteredPrograms)}
                </TabsContent>
            </main>
        </div>
      </Tabs>
    </div>
  );
}

    