
'use client';

import { useAuth } from '@/lib/auth';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';
import { Comment as CommentType } from '@/lib/data';
import { useState, useMemo } from 'react';
import { Loader2 } from 'lucide-react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, addDoc, serverTimestamp, query, orderBy, limit } from 'firebase/firestore';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface CommentsSectionProps {
  programId: string;
}

export function CommentsSection({ programId }: CommentsSectionProps) {
  const { user: authUser } = useAuth();
  const firestore = useFirestore();

  const commentsQuery = useMemoFirebase(() => {
    if (!firestore || !programId) return null;
    return query(
        collection(firestore, 'programs', programId, 'comments'), 
        orderBy('timestamp', 'desc'),
        limit(20)
    );
  }, [firestore, programId]);

  const { data: comments, isLoading } = useCollection<CommentType>(commentsQuery);

  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleSubmitComment = async () => {
    if (newComment.trim() && authUser && firestore && programId) {
        setIsSubmitting(true);
        try {
            await addDoc(collection(firestore, 'programs', programId, 'comments'), {
                userId: authUser.uid,
                username: authUser.displayName || 'Utilisateur anonyme',
                text: newComment,
                timestamp: serverTimestamp(),
            });
            setNewComment('');
        } catch (error) {
            console.error("Error adding comment:", error);
        } finally {
            setIsSubmitting(false);
        }
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Commentaires en direct</CardTitle>
        <CardDescription>
          Rejoignez la conversation sur ce qui est à l'antenne.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {authUser ? (
          <div className="flex gap-4">
            <Avatar>
              <AvatarFallback className="bg-accent text-accent-foreground">{getInitials(authUser.displayName || authUser.email || '')}</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2">
              <Textarea
                placeholder="Ajouter un commentaire public..."
                className="w-full"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                disabled={isSubmitting}
              />
              <div className="flex justify-end">
                <Button variant="accent" onClick={handleSubmitComment} disabled={isSubmitting || !newComment.trim()}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isSubmitting ? 'Publication...' : 'Commenter'}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center bg-muted/50 p-6 rounded-lg">
            <p className="mb-2">Vous voulez participer à la discussion?</p>
            <Button asChild variant="accent">
              <Link href="/login">Connectez-vous pour commenter</Link>
            </Button>
          </div>
        )}

        <div className="space-y-4">
            {isLoading && <div className="flex justify-center items-center py-4"><Loader2 className="h-6 w-6 animate-spin" /></div>}
          {comments && comments.map((comment) => (
            <div key={comment.id} className="flex gap-4">
              <Avatar>
                <AvatarFallback className="bg-accent text-accent-foreground">
                  {getInitials(comment.username)}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-baseline gap-2">
                  <p className="font-semibold text-sm">{comment.username}</p>
                  <p className="text-xs text-muted-foreground">
                    {comment.timestamp ? formatDistanceToNow(comment.timestamp.toDate(), { addSuffix: true, locale: fr }) : 'à l\'instant'}
                  </p>
                </div>
                <p className="text-sm mt-1">{comment.text}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
