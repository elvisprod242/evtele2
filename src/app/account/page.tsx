
'use client';

import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import Link from 'next/link';
import { Tv, Rss, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { EditProfileDialog } from '@/components/auth/edit-profile-dialog';
import { Badge } from '@/components/ui/badge';


export default function AccountPage() {
  const { user: authUser, loading, logout } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const firestore = useFirestore();

  const [tvStreamUrl, setTvStreamUrl] = useState('https://terranoweb.duckdns.org/live/Evtele/index.m3u8');
  const [radioStreamUrl, setRadioStreamUrl] = useState('https://uk26freenew.listen2myradio.com/live.mp3?typeportmount=s1_27390_stream_642109194');
  const [defaultViews, setDefaultViews] = useState(10000);
  const [defaultLikes, setDefaultLikes] = useState(1000);
  const [defaultRadioViews, setDefaultRadioViews] = useState(2100);
  const [defaultRadioLikes, setDefaultRadioLikes] = useState(345);
  

  const statsDocRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'site_settings', 'stats');
  }, [firestore]);

  const { data: statsData, isLoading: statsLoading } = useDoc(statsDocRef);


  useEffect(() => {
    if (!loading && !authUser) {
      router.push('/login');
    }
    if (typeof window !== 'undefined') {
      const storedTvUrl = localStorage.getItem('tv-stream-url');
      if (storedTvUrl) setTvStreamUrl(storedTvUrl);
      
      const storedRadioUrl = localStorage.getItem('radio-stream-url');
      if(storedRadioUrl) setRadioStreamUrl(storedRadioUrl);
    }
     if (statsData) {
        setDefaultViews(statsData.defaultViews || 10000);
        setDefaultLikes(statsData.defaultLikes || 1000);
        setDefaultRadioViews(statsData.defaultRadioViews || 2100);
        setDefaultRadioLikes(statsData.defaultRadioLikes || 345);
    }
  }, [authUser, loading, router, statsData]);

  const handleSettingsSave = async (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('tv-stream-url', tvStreamUrl);
    localStorage.setItem('radio-stream-url', radioStreamUrl);

    if (statsDocRef) {
        try {
            await setDoc(statsDocRef, { 
                defaultViews: Number(defaultViews), 
                defaultLikes: Number(defaultLikes),
                defaultRadioViews: Number(defaultRadioViews),
                defaultRadioLikes: Number(defaultRadioLikes)
            }, { merge: true });
            toast({
                title: 'Paramètres enregistrés',
                description: 'Vos paramètres de streaming et statistiques ont été mis à jour.',
            });
        } catch (error) {
             console.error("Error saving stats:", error);
             toast({
                variant: 'destructive',
                title: 'Erreur',
                description: 'Impossible de sauvegarder les statistiques.',
            });
        }
    }
  }

  if (loading || !authUser) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const getInitials = (name: string) => {
    if (!name) return 'U';
    const names = name.split(' ');
    let initials = names[0].substring(0, 1).toUpperCase();
    
    if (names.length > 1) {
      initials += names[names.length - 1].substring(0, 1).toUpperCase();
    } else if (name.length > 1) {
      initials += name.substring(1, 2).toUpperCase();
    }
    return initials;
  }

  const displayName = authUser.displayName || authUser.email || 'Utilisateur';

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8">
            <Card>
                <CardHeader>
                <CardTitle>Paramètres</CardTitle>
                <CardDescription>Gérez les paramètres de l'application.</CardDescription>
                </CardHeader>
                <CardContent>
                {authUser.role === 'admin' ? (
                    <div className="space-y-6">
                    <div>
                        <h3 className="font-semibold text-lg">Gérer les paramètres globaux</h3>
                        <p className="text-sm text-muted-foreground">Mettez à jour les URLs de streaming et les statistiques par défaut.</p>
                    </div>
                    <form onSubmit={handleSettingsSave} className="space-y-4">
                        <div className="space-y-2">
                        <Label htmlFor="tv-stream-url">URL du flux TV</Label>
                        <Input id="tv-stream-url" placeholder="https://example.com/live.m3u8" value={tvStreamUrl} onChange={(e) => setTvStreamUrl(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                        <Label htmlFor="radio-stream-url">URL du flux Radio</Label>
                        <Input id="radio-stream-url" placeholder="https://example.com/radio.mp3" value={radioStreamUrl} onChange={(e) => setRadioStreamUrl(e.target.value)} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="default-views">Vues TV par défaut</Label>
                                <Input id="default-views" type="number" placeholder="10000" value={defaultViews} onChange={(e) => setDefaultViews(Number(e.target.value))} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="default-likes">"J'aime" TV par défaut</Label>
                                <Input id="default-likes" type="number" placeholder="1000" value={defaultLikes} onChange={(e) => setDefaultLikes(Number(e.target.value))} />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="default-radio-views">Auditeurs Radio par défaut</Label>
                                <Input id="default-radio-views" type="number" placeholder="2100" value={defaultRadioViews} onChange={(e) => setDefaultRadioViews(Number(e.target.value))} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="default-radio-likes">"J'aime" Radio par défaut</Label>
                                <Input id="default-radio-likes" type="number" placeholder="345" value={defaultRadioLikes} onChange={(e) => setDefaultRadioLikes(Number(e.target.value))} />
                            </div>
                        </div>
                        <Button type="submit" variant="accent">Enregistrer les modifications</Button>
                    </form>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <h3 className="font-semibold text-lg">Accès rapide</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Link href="/live-tv">
                                <Card className="hover:bg-muted/50 transition-colors">
                                    <CardContent className="p-6 flex flex-col items-center justify-center">
                                        <Tv className="h-8 w-8 mb-2 text-primary" />
                                        <p className="font-semibold">TV en direct</p>
                                    </CardContent>
                                </Card>
                            </Link>
                            <Link href="/radio">
                                <Card className="hover:bg-muted/50 transition-colors">
                                    <CardContent className="p-6 flex flex-col items-center justify-center">
                                        <Rss className="h-8 w-8 mb-2 text-primary" />
                                        <p className="font-semibold">Radio</p>
                                    </CardContent>
                                </Card>
                            </Link>
                        </div>
                    </div>
                )}
                </CardContent>
            </Card>
        </div>
        <div className="lg:col-span-4">
          <Card>
            <CardHeader className="items-center text-center">
              <Avatar className="h-24 w-24 mb-4">
                 <AvatarFallback className="text-3xl bg-accent text-accent-foreground">{getInitials(displayName)}</AvatarFallback>
              </Avatar>
               <div className="flex items-center gap-2">
                <CardTitle className="text-2xl font-headline">{displayName}</CardTitle>
                {authUser.role === 'admin' && <Badge>Admin</Badge>}
              </div>
              <CardDescription>{authUser.email}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
                <EditProfileDialog>
                    <Button variant="outline" className="w-full">Modifier le profil</Button>
                </EditProfileDialog>
                <Button variant="destructive" onClick={logout} className="w-full">
                    Se déconnecter
                </Button>
            </CardContent>
            <CardFooter className="flex justify-center text-xs text-muted-foreground gap-4">
                <a href="#" className="hover:text-primary">Conditions</a>
                <a href="#" className="hover:text-primary">Confidentialité</a>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}

    