<script lang="ts">
	import { onMount, createEventDispatcher } from 'svelte';

	interface InfiniteScrollEvents {
		load: { currentIndex: number };
	}

	let {
		items = [],
		pageSize = 30,
		threshold = 0.5
	} = $props<{
		items: any[];
		pageSize?: number;
		threshold?: number;
	}>();

	let currentIndex = $state(0);
	let loading = $state(false);
	let observer: IntersectionObserver;
	let observerElement: HTMLElement;

	const dispatch = createEventDispatcher<InfiniteScrollEvents>();

	function loadMore() {
		if (loading || currentIndex >= items.length) return;

		loading = true;
		currentIndex += pageSize;
		dispatch('load', { currentIndex });
		loading = false;
	}

	onMount(() => {
		observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting) {
					loadMore();
				}
			},
			{ threshold }
		);

		if (observerElement) {
			observer.observe(observerElement);
		}

		return () => observer?.disconnect();
	});
</script>
<div class="infinite-scroll-container">
	<slot name="items" items={items.slice(0, currentIndex + pageSize)} />
	<div bind:this={observerElement} class="observer-element">
		{#if loading}
			<slot name="loading">
				<div class="loading">載入中...</div>
			</slot>
		{/if}
	</div>
</div>

<style>
	.infinite-scroll-container {
		position: relative;
	}

	.observer-element {
		width: 100%;
		height: 20px;
	}

	.loading {
		text-align: center;
		padding: 1rem;
		color: #666;
	}
</style>
