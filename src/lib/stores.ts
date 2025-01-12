import { writable } from 'svelte/store';
import type { VideoList } from '$lib/type';

export const currentVideo = writable<string>('mygo-1');
export const videoList = writable<VideoList>({});
export const search = writable<string>('');
export const emotion = writable<string>('');
