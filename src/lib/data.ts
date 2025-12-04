
import { placeholderImages } from './placeholder-images.json';
import data from './app-data.json';

export type PlaceHolderImage = {
    id: string;
    description: string;
    imageUrl: string;
    imageHint: string;
};

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'admin' | 'user';
}

export interface Program {
  id: string;
  title: string;
  time: string;
  duration: string;
}

export interface Show {
    id: string;
    title: string;
    description: string;
    genre: string;
    category: string;
    guests: string[];
    image: PlaceHolderImage;
}

export interface Comment {
    id: string;
    userId: string;
    username: string;
    text: string;
    timestamp: any; // Can be Date or FieldValue
}

export interface Replay {
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


// Attach correct image objects which can't be done in pure JSON
const allShowsWithImages: Show[] = data.allShows.map(show => ({
    ...show,
    image: placeholderImages.find(img => img.id === show.image)!,
}));

const podcastsWithImages = data.podcasts.map(podcast => ({
    ...podcast,
    image: placeholderImages.find(img => img.id === podcast.image)!,
}));

export const adminUser: User = {
    ...data.adminUser,
    avatar: placeholderImages.find(img => img.id === data.adminUser.avatar)?.imageUrl ?? ''
};

export const user: User = {
    ...data.user,
    avatar: placeholderImages.find(img => img.id === data.user.avatar)?.imageUrl ?? ''
};

const user1: User = { ...data.users[0], avatar: placeholderImages.find(img => img.id === data.users[0].avatar)?.imageUrl ?? '' };
const user2: User = { ...data.users[1], avatar: placeholderImages.find(img => img.id === data.users[1].avatar)?.imageUrl ?? '' };
const user3: User = { ...data.users[2], avatar: placeholderImages.find(img => img.id === data.users[2].avatar)?.imageUrl ?? '' };


const allUsers = [adminUser, user, user1, user2, user3];


export const allShows: Show[] = allShowsWithImages;
export const todaysTvPrograms: Program[] = data.todaysTvPrograms;
export const radioSchedule: Program[] = data.radioSchedule;
export const podcasts = podcastsWithImages;
export const reminders = data.reminders;
export const likedContent = data.likedContent;
export const mockViewingHistory = data.mockViewingHistory;
