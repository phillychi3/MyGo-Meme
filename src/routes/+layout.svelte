<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { currentVideo, videoList } from '$lib/stores';
	import type { VideoList } from '$lib/type';

	let { children } = $props();

	onMount(async () => {
		const response = await fetch('/allvideos.json');
		const data = await response.json();
		videoList.set(data);
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
		</div>
	</nav>

	<main class="container mx-auto p-4">
		{@render children()}
	</main>
</div>
