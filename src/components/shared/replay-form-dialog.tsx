
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

interface Replay {
    id: string;
    title: string;
    description: string;
    thumbnail: string;
    video_url: string;
    duration: number;
    published_at: any;
    views: number;
    likes: number;
    category: string;
}

interface Category {
    id: string;
    name: string;
}

const replayFormSchema = z.object({
  title: z.string().min(1, 'Le titre est requis'),
  description: z.string().min(1, 'La description est requise'),
  category: z.string().min(1, 'La catégorie est requise'),
  published_at: z.date({ required_error: 'La date de publication est requise' }),
  duration: z.coerce.number().min(1, 'La durée est requise'),
  thumbnail: z.string().url('URL de miniature invalide'),
  video_url: z.string().url('URL de vidéo invalide'),
  views: z.coerce.number().min(0).default(0),
  likes: z.coerce.number().min(0).default(0),
});

type ReplayFormValues = z.infer<typeof replayFormSchema>;

export const ReplayFormDialog = ({
  mode,
  replay,
  categories,
  children,
}: {
  mode: 'add' | 'edit';
  replay?: Replay;
  categories: Category[];
  children: React.ReactNode;
}) => {
    const firestore = useFirestore();
    const [isOpen, setIsOpen] = React.useState(false);

    const defaultValues = React.useMemo<Partial<ReplayFormValues>>(
        () =>
        mode === 'edit' && replay
            ? {
                ...replay,
                published_at: replay.published_at?.toDate(),
            }
            : {
                title: '',
                description: '',
                category: '',
                published_at: new Date(),
                duration: 0,
                thumbnail: 'https://picsum.photos/seed/replay/400/300',
                video_url: '',
                views: 0,
                likes: 0,
            },
        [replay, mode]
    );

    const form = useForm<ReplayFormValues>({
        resolver: zodResolver(replayFormSchema),
        defaultValues,
    });
    
    React.useEffect(() => {
        if (isOpen) {
            form.reset(defaultValues);
        }
    }, [isOpen, form, defaultValues]);


  async function onSubmit(values: ReplayFormValues) {
    const dataToSave = { ...values };
    try {
        if (mode === 'add') {
            await addDoc(collection(firestore, 'replays'), dataToSave);
        } else if (replay) {
            await updateDoc(doc(firestore, 'replays', replay.id), dataToSave);
        }
        setIsOpen(false);
    } catch (error) {
        console.error("Error saving replay:", error);
    }
  }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{mode === 'add' ? 'Ajouter une nouvelle rediffusion' : 'Modifier la rediffusion'}</DialogTitle>
                    <DialogDescription>
                        Remplissez les détails de la vidéo de rediffusion.
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
                                    <Input placeholder="Titre de la vidéo" {...field} />
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
                                    <Textarea placeholder="Décrivez brièvement la vidéo..." {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                name="published_at"
                                render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Date de publication</FormLabel>
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
                        </div>
                        <FormField
                            control={form.control}
                            name="video_url"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>URL de la vidéo</FormLabel>
                                <FormControl>
                                    <Input placeholder="https://example.com/video.m3u8" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="thumbnail"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>URL de la miniature</FormLabel>
                                <FormControl>
                                    <Input placeholder="https://example.com/thumbnail.jpg" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                             <FormField
                                control={form.control}
                                name="duration"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Durée (secondes)</FormLabel>
                                    <FormControl>
                                        <Input type="number" placeholder="ex. 1800" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="views"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Vues</FormLabel>
                                    <FormControl>
                                        <Input type="number" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="likes"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>J'aime</FormLabel>
                                    <FormControl>
                                        <Input type="number" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                         <DialogFooter className='pt-4'>
                            <Button type="button" variant="secondary" onClick={() => setIsOpen(false)}>
                                Annuler
                            </Button>
                            <Button type="submit" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Enregistrer
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
