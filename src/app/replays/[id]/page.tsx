
'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useFirestore, useDoc, useCollection, useMemoFirebase } from '@/firebase';
import { doc, collection, query, where, limit, updateDoc, increment } from 'firebase/firestore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ThumbsUp, Eye, Calendar, Loader2, Play } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import ReactPlayer from 'react-player';
import { Badge } from '@/components/ui/badge';
import { useParams } from 'next/navigation';

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


export default function ReplayDetailPage() {
    const params = useParams<{ id: string }>();
    const replayId = params.id;
    const firestore = useFirestore();
    const [isClient, setIsClient] = React.useState(false);

    const replayRef = useMemoFirebase(() => {
        if (!firestore || !replayId) return null;
        return doc(firestore, 'replays', replayId);
    }, [firestore, replayId]);

    const { data: replay, isLoading: replayLoading } = useDoc<Replay>(replayRef);

    const relatedReplaysQuery = useMemoFirebase(() => {
        if (!firestore || !replay) return null;
        return query(
            collection(firestore, 'replays'),
            where('category', '==', replay.category),
            where('__name__', '!=', replay.id),
            limit(4)
        );
    }, [firestore, replay]);

    const { data: relatedReplays, isLoading: relatedLoading } = useCollection<Replay>(relatedReplaysQuery);

    React.useEffect(() => {
        setIsClient(true);
        if (replayRef) {
             updateDoc(replayRef, { views: increment(1) }).catch(console.error);
        }
    }, [replayRef]);

    const handleLike = () => {
        if (replayRef) {
            updateDoc(replayRef, { likes: increment(1) }).catch(console.error);
        }
    }

    if (replayLoading) {
        return <div className="flex justify-center items-center h-[80vh]"><Loader2 className="h-16 w-16 animate-spin" /></div>;
    }
    
    if (!replay) {
        return <div className="flex justify-center items-center h-[80vh]"><p>Rediffusion non trouvée.</p></div>;
    }

    return (
        <>
        <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 space-y-6">
                    <div className="aspect-video w-full bg-black rounded-lg overflow-hidden shadow-2xl">
                        {isClient ? (
                            <ReactPlayer
                                url={replay.video_url}
                                width="100%"
                                height="100%"
                                controls
                                playing={true}
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-muted">
                                <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
                            </div>
                        )}
                    </div>
                    <div>
                        <Badge variant="secondary">{replay.category}</Badge>
                        <h1 className="text-3xl lg:text-4xl font-bold font-headline mt-2">{replay.title}</h1>
                        <div className="text-sm text-muted-foreground flex items-center gap-4 mt-3 flex-wrap">
                            <span className="flex items-center gap-1.5"><Eye className="h-4 w-4" /> {formatCount(replay.views)} vues</span>
                            <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" /> Publié {replay.published_at ? formatDistanceToNow(replay.published_at.toDate(), { addSuffix: true, locale: fr }) : '...'}</span>
                        </div>
                        <p className="text-muted-foreground mt-4">{replay.description}</p>
                    </div>
                     <Button onClick={handleLike} variant="outline" size="lg" className="w-full sm:w-auto">
                        <ThumbsUp className="mr-2 h-5 w-5" /> {formatCount(replay.likes)} J'aime
                    </Button>
                </div>
                <div className="lg:col-span-4 space-y-6">
                    <h2 className="text-2xl font-bold font-headline">Dans la même catégorie</h2>
                     {relatedLoading &&  <Loader2 className="h-6 w-6 animate-spin" />}
                     <div className="space-y-4">
                        {relatedReplays && relatedReplays.map(related => (
                             <Card key={related.id} className="overflow-hidden group w-full">
                               <div className="flex items-center gap-4 p-2">
                                    <div className="relative aspect-video w-32 flex-shrink-0">
                                        <Image
                                            src={isValidImageUrl(related.thumbnail) ? related.thumbnail : `https://picsum.photos/seed/${related.id}/400/300`}
                                            alt={related.title}
                                            fill
                                            className="object-cover rounded-md"
                                        />
                                        <div className="absolute inset-0 bg-black/20" />
                                        <Link href={`/replays/${related.id}`} className="absolute inset-0 flex items-center justify-center cursor-pointer">
                                            <div className="h-8 w-8 rounded-full bg-white/30 text-white backdrop-blur-sm transition-all duration-300 opacity-0 group-hover:opacity-100 flex items-center justify-center">
                                                <Play className="h-4 w-4 fill-current" />
                                            </div>
                                        </Link>
                                        <Badge variant="secondary" className="absolute bottom-1 right-1 text-xs">{formatDuration(related.duration)}</Badge>
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold font-headline truncate text-sm leading-tight">
                                            <Link href={`/replays/${related.id}`} className="hover:underline">{related.title}</Link>
                                        </h3>
                                        <p className="text-xs text-muted-foreground">{formatCount(related.views)} vues</p>
                                    </div>
                               </div>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        </div>
        </>
    );
}

