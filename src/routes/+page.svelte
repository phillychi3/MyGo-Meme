<script lang="ts">
	import { currentVideo, videoList, search, emotion } from '$lib/stores';
	import type { ItemData, ImageData } from '$lib/type';
	import { s3url, s3devurl } from '$lib/s3url';
	import { fly } from 'svelte/transition';
	import fizzy from 'fuzzy';
	import Imageload from '$lib/loadimage.svelte';
	import Infinitescrolling from '$lib/infinitescrolling.svelte';
	const { filter } = fizzy;

	let items = $state<ImageData[]>([]);
	let searchitem = $state<ImageData[]>([]);
	let showCopy = $state(false);
	let copytext = $state('');
	let imagepath = '';

	async function loadAllData() {
		let newItems: ImageData[] = [];
		for (let videos in $videoList) {
			const filePath = $videoList[videos].file;
			imagepath = $videoList[videos].image;
			try {
				const dataResponse = await fetch('/' + filePath);
				const thisItems = await dataResponse.json();
				const newItem = thisItems.map((item: ItemData) => {
					return {
						title: $videoList[videos].title,
						imagepath: s3url + imagepath + '/' + item.frame_filename,
						imagepath_short: imagepath + '/' + item.frame_filename,
						itemdata: item
					};
				});
				newItems = newItems.concat(newItem);
			} catch (error) {
				console.error('Error loading data:', error);
				items = [];
			}
		}
		setTimeout(() => {
			items = newItems;
			searchitem = newItems;
		}, 2000);
	}

	async function loadData() {
		if ($videoList[$currentVideo]) {
			const filePath = $videoList[$currentVideo].file;
			imagepath = $videoList[$currentVideo].image;
			try {
				const dataResponse = await fetch('/' + filePath);
				const thisItems = await dataResponse.json();
				const newItems = thisItems.map((item: ItemData) => {
					return {
						title: $videoList[$currentVideo].title,
						imagepath: s3url + imagepath + '/' + item.frame_filename,
						imagepath_short: imagepath + '/' + item.frame_filename,
						itemdata: item
					};
				});
				items = [];
				searchitem = [];
				setTimeout(() => {
					items = newItems;
					searchitem = newItems;
				}, 100);
			} catch (error) {
				console.error('Error loading data:', error);
				items = [];
			}
		}
	}

	async function copyImageUrl(imageUrl: string) {
		try {
			const response = await fetch(s3devurl + imageUrl);
			const blob = await response.blob();
			const img = new Image();
			const canvas = document.createElement('canvas');
			const ctx = canvas.getContext('2d');
			await new Promise((resolve, reject) => {
				img.onload = resolve;
				img.onerror = reject;
				img.src = URL.createObjectURL(blob);
			});
			canvas.width = img.width;
			canvas.height = img.height;
			ctx?.drawImage(img, 0, 0);
			canvas.toBlob(async (pngBlob) => {
				if (pngBlob) {
					try {
						const data = new ClipboardItem({
							'image/png': pngBlob
						});
						await navigator.clipboard.write([data]);
						copytext = '圖片已複製';
						showCopy = true;
						setTimeout(() => {
							showCopy = false;
						}, 2000);
					} catch (err) {
						copytext = '複製圖片失敗，將複製網址';
						await navigator.clipboard.writeText(imageUrl);
						showCopy = true;
						setTimeout(() => {
							showCopy = false;
						}, 2000);
					}
				}
			}, 'image/png');
		} catch (error) {
			console.error('複製失敗:', error);
			copytext = '複製圖片失敗，將複製網址';
			await navigator.clipboard.writeText(imageUrl);
			showCopy = true;
			setTimeout(() => {
				showCopy = false;
			}, 2000);
		}
	}

	$effect(() => {
		if (
			$videoList &&
			Object.keys($videoList).length > 0 &&
			$currentVideo &&
			$currentVideo !== '*'
		) {
			loadData();
		} else if ($videoList && Object.keys($videoList).length > 0 && $currentVideo === '*') {
			loadAllData();
		}
	});

	$effect(() => {
		if (items.length > 0) {
			if ($search || $emotion) {
				let result = filter($search, items, {
					extract: (item) => item.itemdata.text
				});
				if ($emotion) {
					searchitem = result
						.map((item) => item.original)
						.filter((item) => item.itemdata.emotion === $emotion);
				} else {
					searchitem = result.map((item) => item.original);
				}
			} else {
				searchitem = items;
			}
		}
	});

	let pageTitle = $derived(
		$videoList && $currentVideo && $videoList[$currentVideo]
			? `Mygo Meme - ${$videoList[$currentVideo].title}`
			: 'Mygo Meme'
	);
</script>

<svelte:head>
	<title>{pageTitle}</title>
</svelte:head>

{#if showCopy}
	<div class="fixed right-4 top-4 z-50" transition:fly={{ y: -20, duration: 200 }}>
		<div class="max-w-xs rounded-xl border border-gray-200 bg-white p-4 shadow-lg">
			<div class="flex items-center">
				<svg
					class="mr-2 h-5 w-5 text-green-500"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"
					></path>
				</svg>
				<p class="text-sm text-gray-700">{copytext}</p>
			</div>
		</div>
	</div>
{/if}

<Infinitescrolling items={searchitem}>
	<div slot="items" let:items>
		<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
			{#each items as item}
				<div class="rounded-lg border p-4 shadow-md">
					<button
						type="button"
						class="mb-4 flex h-48 w-full cursor-pointer items-center justify-center rounded-md bg-gray-200 transition-opacity hover:opacity-80"
						onclick={() => copyImageUrl(item.imagepath_short)}
						onkeydown={(e) => {
							if (e.key === 'Enter' || e.key === ' ') copyImageUrl(item.imagepath_short);
						}}
						aria-label="Copy image URL"
					>
						<Imageload
							class="h-48 w-full object-cover opacity-0 transition-opacity duration-300"
							src={item.imagepath}
							alt={item.imagepath}
						/>
					</button>
					<div class="space-y-2">
						<p>{item.itemdata.text}</p>
						<p>{item.title}</p>
						<p>
							Emotion: <span class="rounded-full bg-blue-100 px-2 py-1 text-sm"
								>{item.itemdata.emotion}</span
							>
						</p>
					</div>
				</div>
			{/each}
		</div>
	</div>
</Infinitescrolling>
