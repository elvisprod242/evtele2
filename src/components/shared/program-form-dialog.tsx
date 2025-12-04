
'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, Calendar as CalendarIcon } from 'lucide-react';
import { useFirestore } from '@/firebase';
import { collection, doc, addDoc, updateDoc } from 'firebase/firestore';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

import { Button } from '@/components/ui/button';
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
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

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

const programFormSchema = z.object({
  title: z.string().min(1, 'Le titre est requis'),
  description: z.string().min(1, 'La description est requise'),
  date: z.date({ required_error: 'La date est requise' }),
  time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "L'heure doit être au format HH:MM"),
  duration: z.string().min(1, 'La durée est requise'),
  category: z.string().min(1, 'La catégorie est requise'),
  guests: z.string().optional(),
  imageUrl: z.string().url('Veuillez entrer une URL valide').optional().or(z.literal('')),
});


export const ProgramFormDialog = ({
  mode,
  program,
  categories,
  children,
  type,
  currentDate,
}: {
  mode: 'add' | 'edit';
  program?: Program;
  categories: Category[];
  children: React.ReactNode;
  type: 'tv' | 'radio';
  currentDate?: Date;
}) => {
    const firestore = useFirestore();
    const [isOpen, setIsOpen] = React.useState(false);
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const form = useForm<z.infer<typeof programFormSchema>>({
        resolver: zodResolver(programFormSchema),
        defaultValues: {
            title: program?.title || '',
            description: program?.description || '',
            date: program?.date ? program.date.toDate() : (currentDate || new Date()),
            time: program?.time || '',
            duration: program?.duration || '',
            category: program?.category || '',
            guests: program?.guests || '',
            imageUrl: program?.imageUrl || '',
        },
    });

  React.useEffect(() => {
    if (isOpen) {
        if (mode === 'edit' && program) {
            form.reset({
                title: program.title,
                description: program.description,
                date: program.date.toDate(),
                time: program.time,
                duration: program.duration,
                category: program.category,
                guests: program.guests,
                imageUrl: program.imageUrl,
            });
        } else {
            form.reset({
                title: '',
                description: '',
                date: currentDate || new Date(),
                time: '',
                duration: '',
                category: '',
                guests: '',
                imageUrl: 'https://picsum.photos/seed/1/600/400',
            });
        }
    }
}, [program, mode, form, isOpen, currentDate]);


  async function onSubmit(values: z.infer<typeof programFormSchema>) {
    setIsSubmitting(true);
    const programData = {...values, type};
    try {
        if (mode === 'add') {
            await addDoc(collection(firestore, 'programs'), programData);
        } else if (program) {
            await updateDoc(doc(firestore, 'programs', program.id), programData);
        }
        setIsOpen(false);
    } catch (error) {
        console.error("Error saving program:", error);
    } finally {
        setIsSubmitting(false);
    }
  }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>{mode === 'add' ? 'Ajouter un nouveau programme' : 'Modifier le programme'}</DialogTitle>
                    <DialogDescription>
                        Remplissez les détails du programme TV ou Radio.
                    </DialogDescription>
                </DialogHeader>
                 <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto p-1 pr-4">
                        <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Titre</FormLabel>
                            <FormControl>
                                <Input placeholder="ex. Midnight Metro" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                         <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Description</FormLabel>
                                <FormControl>
                                    <Textarea placeholder="Décrivez brièvement le programme..." {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="grid grid-cols-2 gap-4">
                             <FormField
                                control={form.control}
                                name="date"
                                render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Date</FormLabel>
                                    <Popover>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                            "pl-3 text-left font-normal",
                                            !field.value && "text-muted-foreground"
                                            )}
                                        >
                                            {field.value ? (
                                            format(field.value, "PPP", { locale: fr })
                                            ) : (
                                            <span>Choisir une date</span>
                                            )}
                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                        </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={field.value}
                                            onSelect={field.onChange}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                            <FormField
                            control={form.control}
                            name="time"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Heure</FormLabel>
                                <FormControl>
                                    <Input type="time" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                            />
                        </div>
                         <FormField
                        control={form.control}
                        name="duration"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Durée</FormLabel>
                            <FormControl>
                                <Input placeholder="ex. 60 min" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                        <FormField
                            control={form.control}
                            name="category"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Catégorie</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Sélectionnez une catégorie" />
                                    </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                    {categories.map(category => (
                                        <SelectItem key={category.id} value={category.name}>{category.name}</SelectItem>
                                    ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="guests"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Invités</FormLabel>
                                <FormControl>
                                    <Input placeholder="ex. John Doe, Jane Smith (séparés par une virgule)" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="imageUrl"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>URL de l'image</FormLabel>
                                <FormControl>
                                    <Input placeholder="https://example.com/image.png" {...field} />
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
                                Enregistrer
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
