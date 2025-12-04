
'use client';

import { AudioPlayer } from "@/components/shared/audio-player";
import { CommentsSection } from "@/components/shared/comments-section";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { podcasts } from "@/lib/data";
import Image from "next/image";
import { Play, ThumbsUp, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';


export default function RadioPage() {
    const [radioStreamUrl, setRadioStreamUrl] = useState('https://uk26freenew.listen2myradio.com/live.mp3?typeportmount=s1_27390_stream_642109194');
    const [views, setViews] = useState(2100);
    const [likes, setLikes] = useState(345);
    const [isClient, setIsClient] = useState(false);
    
    const firestore = useFirestore();

    const statsDocRef = useMemoFirebase(() => {
        if (!firestore) return null;
        return doc(firestore, 'site_settings', 'stats');
    }, [firestore]);

    const { data: statsData } = useDoc(statsDocRef);

    const liveShow = {
        id: "live-radio",
        title: "Radio en direct",
        description: "Écoutez notre diffusion en direct.",
        genre: "Streaming",
        time: "",
        duration: "",
        category: "Live",
        guests: [],
        image: { id: '', description: '', imageUrl: '', imageHint: ''}
    };

     useEffect(() => {
        setIsClient(true);
        const storedRadioUrl = localStorage.getItem('radio-stream-url');
        if (storedRadioUrl) {
            setRadioStreamUrl(storedRadioUrl);
        }
        if (statsData) {
            // Use radio specific stats if they exist, otherwise fall back to defaults
            setViews(statsData.defaultRadioViews ?? statsData.defaultViews ?? 2100);
            setLikes(statsData.defaultRadioLikes ?? statsData.defaultLikes ?? 345);
        }
    }, [statsData]);

    const handleLike = () => {
        const newLikes = likes + 1;
        setLikes(newLikes);
        if (statsDocRef) {
            // Use a specific field for radio likes to not conflict with TV
            setDoc(statsDocRef, { defaultRadioLikes: newLikes }, { merge: true });
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
             <h1 className="text-4xl font-bold font-headline mb-2">Radio en direct</h1>
            <p className="text-muted-foreground mb-8">Écoutez notre diffusion en direct.</p>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <AudioPlayer show={liveShow} streamUrl={radioStreamUrl} />
                     <Card>
                        <CardContent className="flex items-center justify-between p-4">
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1.5">
                                    <Eye className="h-5 w-5" />
                                    <span>{isClient ? formatViews(views) : '...'} auditeurs</span>
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
                </div>
                 <div className="lg:col-span-1">
                    <CommentsSection programId={liveShow.id} />
                </div>
            </div>
        </div>
    )
}
