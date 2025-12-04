
'use client';

import Link from 'next/link';
import { Tv, Rss, Tv2, CalendarDays, User, Menu, Search, History, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/lib/auth';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import Image from 'next/image';
import { Separator } from '../ui/separator';

const navLinks = [
  { href: '/live-tv', label: 'TV en direct', icon: Tv2 },
  { href: '/radio', label: 'Radio', icon: Rss },
  { href: '/program-guide', label: 'Guide des Programmes', icon: CalendarDays },
  { href: '/replays', label: 'Rediffusion', icon: History },
];

export function Header() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  
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

  const renderNavLinks = (isMobile = false) => (
      navLinks.map((link) => (
        <Button
          key={link.href}
          variant="ghost"
          asChild
          className={cn(
            'justify-start',
            pathname === link.href
              ? 'bg-accent text-accent-foreground'
              : 'hover:bg-accent/50',
            isMobile ? 'w-full text-md py-5' : ''
          )}
        >
          <Link href={link.href}>
            <link.icon className="mr-2 h-4 w-4" />
            {link.label}
          </Link>
        </Button>
      ))
  )

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/ev-tele.png" alt="Ev - Télé Logo" width={32} height={32} className="rounded-md" />
            <span className="font-bold font-headline text-lg">Ev - Télé</span>
          </Link>
        </div>
        
        <nav className="hidden md:flex items-center space-x-2 lg:space-x-4 ml-auto">
          {renderNavLinks()}
          <div className="flex items-center gap-2 border-l border-border pl-4">
             <Button variant="ghost" size="icon">
                <Search className="h-4 w-4" />
             </Button>
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-accent text-accent-foreground">{getInitials(user.displayName || user.email || '')}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.displayName || 'Utilisateur'}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/account">
                      <User className="mr-2 h-4 w-4" />
                      <span>Mon Compte</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout}>Se déconnecter</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild variant="accent">
                <Link href="/login">Connexion</Link>
              </Button>
            )}
          </div>
        </nav>

        <div className="ml-auto flex md:hidden">
           <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Ouvrir le menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px] p-0">
                <SheetHeader className='p-6 text-left'>
                    {user ? (
                        <>
                            <SheetTitle>Menu utilisateur</SheetTitle>
                            <SheetDescription>
                                Accédez à votre compte ou déconnectez-vous.
                            </SheetDescription>
                        </>
                    ) : (
                        <>
                            <SheetTitle>Navigation</SheetTitle>
                            <SheetDescription>
                                Naviguez à travers les sections principales.
                            </SheetDescription>
                        </>
                    )}
                </SheetHeader>
                {user && (
                    <div className='p-6 pt-2'>
                        <div className="flex items-center gap-3">
                            <Avatar className="h-12 w-12">
                                <AvatarFallback className="text-xl bg-accent text-accent-foreground">
                                    {getInitials(user.displayName || user.email || '')}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="text-md font-semibold leading-none">{user.displayName || 'Utilisateur'}</p>
                                <p className="text-sm text-muted-foreground">{user.email}</p>
                            </div>
                        </div>
                    </div>
                )}
                <Separator />
              <nav className="flex flex-col space-y-2 p-4">
                {renderNavLinks(true)}
                 <Button
                    variant="ghost"
                    asChild
                    className={cn(
                        'justify-start w-full text-md py-5',
                        pathname === '/account'
                        ? 'bg-accent text-accent-foreground'
                        : 'hover:bg-accent/50'
                    )}
                    >
                    <Link href={user ? '/account' : '/login'}>
                        <User className="mr-2 h-4 w-4" />
                        {user ? 'Mon Compte' : 'Connexion'}
                    </Link>
                </Button>
              </nav>
               {user && (
                <>
                    <Separator />
                     <div className='p-4'>
                        <Button
                            variant="ghost"
                            onClick={logout}
                            className="justify-start w-full text-md py-5 text-red-500 hover:text-red-500 hover:bg-red-500/10"
                            >
                            <LogOut className="mr-2 h-4 w-4" />
                            Se déconnecter
                        </Button>
                     </div>
                </>
                )}
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
