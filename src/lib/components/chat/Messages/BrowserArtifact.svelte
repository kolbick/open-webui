<script lang="ts">
	import { getBrowserArtifactUrl, type BrowserArtifactFile } from '$lib/utils/browserArtifacts';
	import Computer from '$lib/components/icons/Computer.svelte';
	import ArrowsPointingOut from '$lib/components/icons/ArrowsPointingOut.svelte';
	import Link from '$lib/components/icons/Link.svelte';

	export let file: BrowserArtifactFile;

	let iframeElement: HTMLIFrameElement | null = null;

	$: title = file?.title || file?.name || 'Live browser';
	$: url = getBrowserArtifactUrl(file);

	const openFullscreen = () => {
		iframeElement?.requestFullscreen?.();
	};
</script>

<div
	class="my-3 w-full overflow-hidden rounded-xl border border-gray-200 bg-gray-50 text-gray-900 shadow-sm dark:border-gray-800 dark:bg-gray-950 dark:text-gray-100"
>
	<div
		class="flex min-h-12 items-center justify-between gap-2 border-b border-gray-200 px-3 py-2 dark:border-gray-800"
	>
		<div class="flex min-w-0 items-center gap-2">
			<div
				class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-cyan-50 text-cyan-700 dark:bg-cyan-950/50 dark:text-cyan-300"
			>
				<Computer className="size-4" />
			</div>
			<div class="min-w-0">
				<div class="truncate text-sm font-semibold">{title}</div>
				<div class="flex items-center gap-1.5 truncate text-xs text-gray-500 dark:text-gray-400">
					<span class="size-1.5 rounded-full bg-emerald-500"></span>
					Interactive Playwright session
				</div>
			</div>
		</div>

		<div class="flex shrink-0 items-center gap-1">
			<button
			type="button"
			class="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-900 dark:hover:text-gray-100"
			title="Fullscreen"
			on:click={openFullscreen}
		>
				<ArrowsPointingOut className="size-4" />
			</button>
		<a
			class="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-900 dark:hover:text-gray-100"
			href={url}
			target="_blank"
			rel="noreferrer"
				title="Open in new tab"
			>
				<Link className="size-4" />
			</a>
		</div>
	</div>

	<div class="h-[560px] min-h-[380px] w-full bg-black p-2">
		<div class="flex h-full min-h-0 flex-col overflow-hidden rounded-lg border border-gray-800 bg-black">
			<div class="flex h-9 shrink-0 items-center gap-2 border-b border-white/10 bg-gray-950 px-3">
				<div class="flex shrink-0 gap-1.5">
					<span class="size-2.5 rounded-full bg-red-400"></span>
					<span class="size-2.5 rounded-full bg-yellow-400"></span>
					<span class="size-2.5 rounded-full bg-emerald-400"></span>
				</div>
				<div class="min-w-0 flex-1 truncate rounded-full bg-white/8 px-3 py-1 text-xs text-gray-400">
					{url}
				</div>
			</div>

		<iframe
			bind:this={iframeElement}
				class="h-full min-h-0 w-full flex-1 border-0"
			src={url}
			title={title}
			sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-downloads"
			allow="clipboard-read; clipboard-write; fullscreen"
		/>
		</div>
	</div>
</div>
