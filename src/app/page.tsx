
'use client';

import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { CommentsSection } from '@/components/shared/comments-section';
import { LatestReplays } from '@/components/shared/latest-replays';
import { allShows, Show, Replay } from '@/lib/data';
import { ProgramCard, ProgramGuideHome } from '@/components/shared/program-card';
import { ThumbsUp, Eye } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { VideoPlayer } from '@/components/shared/video-player';
import {
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useFirestore, useCollection, useDoc, useMemoFirebase } from '@/firebase';
import { collection, query, where, doc, setDoc, orderBy, limit } from 'firebase/firestore';
import { isToday } from 'date-fns';


function HomePageClient() {
  const [views, setViews] = useState(10000);
  const [likes, setLikes] = useState(1000);
  const [isClient, setIsClient] = useState(false);
  const [tvStreamUrl, setTvStreamUrl] = useState('https://live20.bozztv.com/akamaissh101/ssh101/evtele2xrdc/playlist.m3u8');
  
  const firestore = useFirestore();

  const programsQuery = useMemoFirebase(() => {
      if (!firestore) return null;
      return query(collection(firestore, 'programs'), where('type', '==', 'tv'));
  }, [firestore]);

  const { data: todaysTvPrograms } = useCollection(programsQuery);

  const statsDocRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'site_settings', 'stats');
  }, [firestore]);

  const { data: statsData } = useDoc(statsDocRef);

  const replaysQuery = useMemoFirebase(() => {
      if (!firestore) return null;
      return query(
          collection(firestore, 'replays'),
          orderBy('published_at', 'desc'),
          limit(5)
      );
  }, [firestore]);
  const { data: latestReplays, isLoading: replaysLoading } = useCollection<Replay>(replaysQuery);
  
  const liveShow = {
    id: "live-tv-home",
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
    if(statsDocRef) {
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
    <div className="flex flex-col min-h-dvh">
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-8">
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
            <div className="lg:col-span-4 space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle className="font-headline">Guide des Programmes du Jour</CardTitle>
                  <CardDescription>
                    Les prochaines émissions TV et Radio.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {upcomingPrograms.slice(0, 3).map((program: any) => (
                    <div key={program.id}>
                      <ProgramCard program={program} />
                    </div>
                  ))}
                  <ProgramGuideHome />
                </CardContent>
              </Card>
            </div>
          </div>

          <Separator className="my-12" />

          <LatestReplays replays={latestReplays} isLoading={replaysLoading} />
        </div>
      </main>
    </div>
  );
}


export default function Home() {
  return (
    <HomePageClient />
  );
}
