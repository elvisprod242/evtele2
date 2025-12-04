
'use client';

import { VideoPlayer } from "@/components/shared/video-player";
import { CommentsSection } from "@/components/shared/comments-section";
import { ProgramCard } from "@/components/shared/program-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ThumbsUp, Eye } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { useFirestore, useCollection, useDoc, useMemoFirebase } from '@/firebase';
import { collection, query, where, doc, setDoc, orderBy, limit } from 'firebase/firestore';
import { Replay } from "@/lib/data";
import { LatestReplays } from "@/components/shared/latest-replays";
import { isToday } from "date-fns";


export default function LiveTvPage({}: {}) {
    const [views, setViews] = useState(10000);
    const [likes, setLikes] = useState(1000);
    const [isClient, setIsClient] = useState(false);
    const [tvStreamUrl, setTvStreamUrl] = useState('https://terranoweb.duckdns.org/live/Evtele/index.m3u8');
    
    const firestore = useFirestore();

    const programsQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'programs'), where('type', '==', 'tv'));
    }, [firestore]);

    const statsDocRef = useMemoFirebase(() => {
        if (!firestore) return null;
        return doc(firestore, 'site_settings', 'stats');
    }, [firestore]);

    const replaysQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(
            collection(firestore, 'replays'),
            orderBy('published_at', 'desc'),
            limit(5)
        );
    }, [firestore]);

    const { data: statsData } = useDoc(statsDocRef);
    const { data: todaysTvPrograms } = useCollection(programsQuery);
    const { data: latestReplays, isLoading: replaysLoading } = useCollection<Replay>(replaysQuery);

    
    const liveShow = {
        id: "live-tv",
        title: "TV en direct",
        description: "Regardez notre diffusion en direct.",
        genre: "Streaming",
        time: "",
        duration: "",
        category: "Live",
        guests: [],
        image: { id: '', description: '', imageUrl: '', imageHint: ''}
    };

    const upcomingPrograms = useMemo(() => {
        if (!todaysTvPrograms) return [];
        const now = new Date();
        const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        
        return todaysTvPrograms
          .filter(p => p.date && isToday(p.date.toDate()) && p.time >= currentTime)
          .sort((a, b) => a.time.localeCompare(b.time));
    }, [todaysTvPrograms]);

    useEffect(() => {
        setIsClient(true);
        const storedTvUrl = localStorage.getItem('tv-stream-url');
        if (storedTvUrl) {
            setTvStreamUrl(storedTvUrl);
        }
        if (statsData) {
            setViews(statsData.defaultViews ?? 10000);
            setLikes(statsData.defaultLikes ?? 1000);
        }
    }, [statsData]);

    const handleLike = () => {
        const newLikes = likes + 1;
        setLikes(newLikes);
        if (statsDocRef) {
            setDoc(statsDocRef, { defaultLikes: newLikes }, { merge: true });
        }
    };
    
    const formatViews = (num: number) => {
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'k';
        }
        return num.toString();
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <VideoPlayer show={liveShow} streamUrl={tvStreamUrl} />
                    <Card>
                        <CardContent className="flex items-center justify-between p-4">
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1.5">
                                    <Eye className="h-5 w-5" />
                                    <span>{isClient ? formatViews(views) : '...'} spectateurs</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={handleLike} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors p-2 rounded-md">
                                    <ThumbsUp className="h-5 w-5" />
                                    <span>{isClient ? likes.toLocaleString() : '...'} J'aime</span>
                                </button>
                            </div>
                        </CardContent>
                    </Card>
                    <CommentsSection programId={liveShow.id} />
                </div>
                <div className="lg:col-span-1 space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle className="font-headline">À suivre</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {upcomingPrograms && upcomingPrograms.slice(0, 4).map((program: any, index) => (
                                <div key={program.id}>
                                    <ProgramCard program={program} />
                                    {index < upcomingPrograms.slice(0, 4).length -1 && <Separator className="mt-4" />}
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>
            <Separator className="my-12" />
            <LatestReplays replays={latestReplays} isLoading={replaysLoading} />
        </div>
    );
}
