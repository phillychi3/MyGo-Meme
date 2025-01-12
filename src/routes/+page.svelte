<script lang="ts">
	import { currentVideo, videoList, search, emotion } from '$lib/stores';
	import type { ItemData } from '$lib/type';
	import { s3url } from '$lib/s3url';
	import { fly } from 'svelte/transition';
	import fizzy from 'fuzzy';
	const { filter } = fizzy;

	let items = $state<ItemData[]>([]);
	let searchitem = $state<ItemData[]>([]);
	let imagepath = $state<string>('');
	let showCopySuccess = $state(false);
	async function loadData() {
		if ($videoList[$currentVideo]) {
			const filePath = $videoList[$currentVideo].file;
			imagepath = $videoList[$currentVideo].image;
			try {
				const dataResponse = await fetch('/' + filePath);
				items = await dataResponse.json();
			} catch (error) {
				console.error('Error loading data:', error);
				items = [];
			}
		}
	}

	async function copyImageUrl(imageUrl: string) {
		try {
			await navigator.clipboard.writeText(imageUrl);
			showCopySuccess = true;
			setTimeout(() => {
				showCopySuccess = false;
			}, 2000);
		} catch (err) {
			console.error('複製失敗:', err);
		}
	}

	$effect(() => {
		if ($videoList && Object.keys($videoList).length > 0 && $currentVideo) {
			loadData();
		}
	});

	$effect(() => {
		if (items.length > 0) {
			if ($search || $emotion) {
				let result = filter($search, items, {
					extract: (item) => item.text
				});
				if ($emotion) {
					searchitem = result
						.map((item) => item.original)
						.filter((item) => item.emotion === $emotion);
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

{#if showCopySuccess}
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
				<p class="text-sm text-gray-700">圖片網址已複製</p>
			</div>
		</div>
	</div>
{/if}

<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
	{#each searchitem as item}
		<div class="rounded-lg border p-4 shadow-md">
			<button
				type="button"
				class="mb-4 flex h-48 w-full cursor-pointer items-center justify-center rounded-md bg-gray-200 transition-opacity hover:opacity-80"
				onclick={() => copyImageUrl(s3url + imagepath + '/' + item.frame_filename)}
				onkeydown={(e) => {
					if (e.key === 'Enter' || e.key === ' ')
						copyImageUrl(s3url + imagepath + '/' + item.frame_filename);
				}}
				aria-label="Copy image URL"
			>
				<img class="h-48" src={s3url + imagepath + '/' + item.frame_filename} alt="Thumbnail" />
			</button>
			<div class="space-y-2">
				<p>Time: {item.time}s</p>
				<p>
					Emotion: <span class="rounded-full bg-blue-100 px-2 py-1 text-sm">{item.emotion}</span>
				</p>
				<div class="flex flex-wrap gap-1">
					{#each item.objects as object}
						<span class="rounded-full bg-gray-100 px-2 py-1 text-sm">{object}</span>
					{/each}
				</div>
			</div>
		</div>
	{/each}
</div>
