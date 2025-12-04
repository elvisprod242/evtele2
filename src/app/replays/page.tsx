
'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Loader2, GripVertical, Tag, PlusCircle, Eye, ThumbsUp, Calendar, Trash2, Edit, LayoutGrid, List } from 'lucide-react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc, deleteDoc } from 'firebase/firestore';
import { useAuth } from '@/lib/auth';
import { Separator } from '@/components/ui/separator';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { ReplayFormDialog } from '@/components/shared/replay-form-dialog';


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

const isValidImageUrl = (url: string | undefined | null): boolean => {
  if (!url) return false;
  try {
    const validHostnames = ['images.unsplash.com', 'picsum.photos', 'placehold.co', 'img.youtube.com'];
    const { hostname } = new URL(url);
    return validHostnames.includes(hostname);
  } catch (e) {
    return false;
  }
};

const formatCount = (num: number = 0) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
    return num.toString();
};

const formatDuration = (seconds: number = 0) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    if (hours > 0) {
        return `${hours}h ${minutes.toString().padStart(2, '0')}m`;
    }
    if (minutes > 0) {
        return `${minutes}m ${remainingSeconds.toString().padStart(2, '0')}s`;
    }
    return `${remainingSeconds}s`;
}

export default function ReplaysPage() {
    const firestore = useFirestore();
    const { user } = useAuth();
    const [selectedCategory, setSelectedCategory] = React.useState('All');
    const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid');

    const replaysQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return collection(firestore, 'replays')
    }, [firestore]);
    const { data: replays, isLoading: replaysLoading } = useCollection<Replay>(replaysQuery);

    const categoriesQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return collection(firestore, 'categories')
    }, [firestore]);
    const { data: categories, isLoading: categoriesLoading } = useCollection<Category>(categoriesQuery);
    
    const sortedCategories = React.useMemo(() => {
        if (!categories) return [];
        return [...categories].sort((a, b) => a.name.localeCompare(b.name));
    }, [categories]);

    const filteredReplays = React.useMemo(() => {
        if (!replays) return [];
        const categoryFiltered = selectedCategory === 'All'
            ? replays
            : replays.filter(replay => replay.category === selectedCategory);
        return categoryFiltered.sort((a,b) => b.published_at.toDate() - a.published_at.toDate());
    }, [replays, selectedCategory]);

    const handleDelete = async (replayId: string) => {
        if(window.confirm('Êtes-vous sûr de vouloir supprimer cette rediffusion ?')) {
            if(!firestore) return;
            await deleteDoc(doc(firestore, 'replays', replayId));
        }
    }


  return (
    <>
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold font-headline">Rediffusion</h1>
        <p className="text-muted-foreground mt-2">Retrouvez vos émissions et podcasts préférés à la demande.</p>
      </div>
      
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
                           Toutes
                        </Button>
                       {categoriesLoading && <div className="flex justify-center items-center py-4"><Loader2 className="h-6 w-6 animate-spin" /></div>}
                       {sortedCategories.map(category => (
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
                       {user && user.role === 'admin' && (
                        <>
                            <Separator className="my-4" />
                            <ReplayFormDialog mode="add" categories={sortedCategories}>
                                <Button variant="accent" className='w-full'>
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    Ajouter une rediffusion
                                </Button>
                            </ReplayFormDialog>
                        </>
                       )}
                    </CardContent>
                </Card>
            </aside>
            <main className="md:col-span-3">
                <div className='flex justify-end mb-4'>
                    <div className='flex items-center gap-1 bg-muted p-1 rounded-md'>
                        <Button variant={viewMode === 'grid' ? 'secondary' : 'ghost'} size='icon' onClick={() => setViewMode('grid')} className='h-8 w-8'>
                            <LayoutGrid className='h-4 w-4' />
                        </Button>
                        <Button variant={viewMode === 'list' ? 'secondary' : 'ghost'} size='icon' onClick={() => setViewMode('list')} className='h-8 w-8'>
                            <List className='h-4 w-4' />
                        </Button>
                    </div>
                </div>

                {replaysLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Array.from({length: 8}).map((_, i) => (
                            <Card key={i}><CardContent className="p-0"><div className="aspect-[4/3] w-full bg-muted animate-pulse" /></CardContent></Card>
                        ))}
                    </div>
                ) : filteredReplays.length === 0 ? (
                    <div className="text-center py-16 text-muted-foreground bg-muted/50 rounded-lg">
                        <p>Aucune rediffusion ne correspond à votre sélection.</p>
                    </div>
                ) : (
                    <>
                    {viewMode === 'grid' ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredReplays.map((replay) => (
                            <Card key={replay.id} className="overflow-hidden group w-full">
                               <CardContent className="p-0">
                                <div className="relative aspect-[4/3] w-full overflow-hidden block">
                                    <Image
                                        src={isValidImageUrl(replay.thumbnail) ? replay.thumbnail : `https://picsum.photos/seed/${replay.id}/400/300`}
                                        alt={replay.title}
                                        fill
                                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                                    <Link href={`/replays/${replay.id}`} className="absolute inset-0 flex items-center justify-center cursor-pointer">
                                        <div className="h-14 w-14 rounded-full bg-white/20 text-white backdrop-blur-sm transition-all duration-300 opacity-0 group-hover:opacity-100 group-hover:scale-110 flex items-center justify-center">
                                            <Play className="h-7 w-7 fill-current" />
                                        </div>
                                    </Link>
                                    <Badge variant="secondary" className="absolute bottom-2 right-2">{formatDuration(replay.duration)}</Badge>
                                </div>
                                <div className="p-3 bg-card">
                                    <h3 className="font-semibold font-headline truncate text-base">
                                         <Link href={`/replays/${replay.id}`} className="hover:underline">{replay.title}</Link>
                                    </h3>
                                    <div className='flex justify-between items-center'>
                                        <p className="text-sm text-muted-foreground truncate">{replay.category}</p>
                                        {user && user.role === 'admin' && (
                                            <div className='flex items-center' onClick={(e) => e.stopPropagation()}>
                                                <ReplayFormDialog mode="edit" replay={replay} categories={sortedCategories}>
                                                    <Button variant="ghost" size="icon" className='h-7 w-7'><Edit className='h-4 w-4' /></Button>
                                                </ReplayFormDialog>
                                                <Button variant="ghost" size="icon" className='text-destructive hover:text-destructive h-7 w-7' onClick={(e) => {e.preventDefault(); handleDelete(replay.id);}}><Trash2 className='h-4 w-4' /></Button>
                                            </div>
                                        )}
                                    </div>
                                    <div className="text-xs text-muted-foreground flex items-center gap-4 mt-2">
                                        <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {formatCount(replay.views)}</span>
                                        <span className="flex items-center gap-1"><ThumbsUp className="h-3 w-3" /> {formatCount(replay.likes)}</span>
                                        {replay.published_at && (
                                            <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {formatDistanceToNow(replay.published_at.toDate(), { addSuffix: true, locale: fr })}</span>
                                        )}
                                    </div>
                                </div>
                                </CardContent>
                            </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredReplays.map((replay) => (
                                <Card key={replay.id} className="overflow-hidden group w-full">
                                    <div className="flex">
                                        <div className="relative aspect-video w-48 flex-shrink-0">
                                            <Image
                                                src={isValidImageUrl(replay.thumbnail) ? replay.thumbnail : `https://picsum.photos/seed/${replay.id}/400/300`}
                                                alt={replay.title}
                                                fill
                                                className="object-cover"
                                            />
                                            <div className="absolute inset-0 bg-black/20" />
                                            <Link href={`/replays/${replay.id}`} className="absolute inset-0 flex items-center justify-center cursor-pointer">
                                                <div className="h-10 w-10 rounded-full bg-white/30 text-white backdrop-blur-sm transition-all duration-300 opacity-0 group-hover:opacity-100 flex items-center justify-center">
                                                    <Play className="h-5 w-5 fill-current" />
                                                </div>
                                            </Link>
                                             <Badge variant="secondary" className="absolute bottom-1 right-1 text-xs">{formatDuration(replay.duration)}</Badge>
                                        </div>
                                        <div className="p-4 flex-1 flex justify-between">
                                            <div>
                                                <Badge variant='outline'>{replay.category}</Badge>
                                                <h3 className="font-semibold font-headline text-lg mt-1">
                                                    <Link href={`/replays/${replay.id}`} className="hover:underline">{replay.title}</Link>
                                                </h3>
                                                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{replay.description}</p>
                                                <div className="text-xs text-muted-foreground flex items-center gap-4 mt-3">
                                                    <span className="flex items-center gap-1.5"><Eye className="h-3.5 w-3.5" /> {formatCount(replay.views)} vues</span>
                                                    <span className="flex items-center gap-1.5"><ThumbsUp className="h-3.5 w-3.5" /> {formatCount(replay.likes)} J'aime</span>
                                                    {replay.published_at && (
                                                        <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> {formatDistanceToNow(replay.published_at.toDate(), { addSuffix: true, locale: fr })}</span>
                                                    )}
                                                </div>
                                            </div>
                                            {user && user.role === 'admin' && (
                                                <div className='flex flex-col items-center opacity-0 group-hover:opacity-100 transition-opacity' onClick={(e) => e.stopPropagation()}>
                                                    <ReplayFormDialog mode="edit" replay={replay} categories={sortedCategories}>
                                                        <Button variant="ghost" size="icon"><Edit className='h-4 w-4' /></Button>
                                                    </ReplayFormDialog>
                                                    <Button variant="ghost" size="icon" className='text-destructive hover:text-destructive' onClick={(e) => {e.preventDefault(); handleDelete(replay.id);}}><Trash2 className='h-4 w-4' /></Button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                    </>
                )}
            </main>
      </div>
    </div>
    </>
  );
}
