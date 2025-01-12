<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { currentVideo, videoList, search } from '$lib/stores';
	import type { VideoList } from '$lib/type';

	let { children } = $props();

	onMount(async () => {
		const response = await fetch('/allvideos.json');
		const data = await response.json();
		videoList.set(data);
		console.log('%c Mygo Meme %c https://github.com/phillychi3/MyGo-Meme', 'background-color: #77bbdd;color:#fff;padding:5px 0;', 'background-color: #393D49;color:#fff;padding:4px 0;border:1px solid #77bbdd;');
	});

	function handleVideoChange(event: Event) {
		const select = event.target as HTMLSelectElement;
		currentVideo.set(select.value);
	}
</script>

<div class="min-h-screen bg-gray-50">
	<nav class="bg-white p-4 shadow-sm">
		<div class="container mx-auto">
			<select
				class="w-full rounded-md border p-2 md:w-64"
				onchange={handleVideoChange}
				value={$currentVideo}
			>
				{#each Object.entries($videoList) as [id, video]}
					<option value={id}>{video.title}</option>
				{/each}
			</select>
			<input
				type="text"
				class="w-full rounded-md border p-2 md:w-64"
				placeholder="Search"
				bind:value={$search}
			/>
		</div>
	</nav>

	<main class="container mx-auto p-4">
		{@render children()}
	</main>
</div>
