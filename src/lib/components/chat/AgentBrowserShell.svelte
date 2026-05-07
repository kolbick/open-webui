<script lang="ts">
	import ArrowsPointingOut from '$lib/components/icons/ArrowsPointingOut.svelte';
	import Link from '$lib/components/icons/Link.svelte';
	import Refresh from '$lib/components/icons/Refresh.svelte';

	type StatusEntry = {
		done?: boolean;
		action?: string;
		description?: string;
		urls?: string[];
		query?: string;
		hidden?: boolean;
	};

	export let browserUrl = '';
	export let statusEntries: StatusEntry[] = [];

	type ControlMode = 'agent' | 'user' | 'paused';

	let iframeElement: HTMLIFrameElement | null = null;
	let reloadKey = 0;
	let browserLoaded = false;
	let browserFailed = false;
	let controlMode: ControlMode = 'agent';
	let approvalDismissed = false;

	$: visibleStatusEntries = statusEntries.filter((entry) => !entry?.hidden);
	$: latestEntry = visibleStatusEntries.at(-1) ?? null;
	$: latestText = `${latestEntry?.action ?? ''} ${latestEntry?.description ?? ''} ${latestEntry?.query ?? ''}`.toLowerCase();
	$: approvalEntry =
		!approvalDismissed &&
		visibleStatusEntries.find((entry) => {
			const text = `${entry?.action ?? ''} ${entry?.description ?? ''}`.toLowerCase();
			return (
				text.includes('approval') ||
				text.includes('permission') ||
				text.includes('confirm') ||
				text.includes('submit')
			);
		});
	$: recentActions = visibleStatusEntries.slice(-5).reverse();
	$: statusOverlayLabel = getStatusOverlayLabel();
	$: statusDescription = getStatusDescription();
	$: isWorking = controlMode === 'agent' && browserLoaded && !browserFailed && !approvalEntry;
	$: screenshotActive = latestText.includes('screenshot') || latestText.includes('capture');
	$: clickActive = latestText.includes('click') || latestText.includes('press');
	$: typingActive = latestText.includes('typ') || latestText.includes('fill');

	const reloadBrowser = () => {
		browserLoaded = false;
		browserFailed = false;
		reloadKey += 1;
	};

	const openFullscreen = () => {
		iframeElement?.requestFullscreen?.();
	};

	const takeOver = () => {
		controlMode = 'user';
		approvalDismissed = true;
	};

	const pauseAgent = () => {
		controlMode = 'paused';
	};

	const resumeAgent = () => {
		controlMode = 'agent';
		approvalDismissed = false;
	};

	const getStatusOverlayLabel = () => {
		if (browserFailed) return 'Disconnected';
		if (!browserLoaded) return 'Connecting';
		if (approvalEntry) return 'Waiting for approval';
		if (controlMode === 'user') return 'User controlling';
		if (controlMode === 'paused') return 'Paused';
		if (latestText.includes('click')) return 'Clicking';
		if (latestText.includes('typ') || latestText.includes('fill')) return 'Typing';
		if (latestText.includes('read') || latestText.includes('scan')) return 'Reading page';
		if (latestText.includes('wait')) return 'Waiting for page';
		if (latestText.includes('screenshot') || latestText.includes('capture')) return 'Taking screenshot';
		return 'Agent working';
	};

	const getStatusDescription = () => {
		if (browserFailed) return 'The live browser connection needs a reload.';
		if (!browserLoaded) return 'Opening the visible browser session.';
		if (approvalEntry) return approvalEntry.description || approvalEntry.action || 'The agent needs permission.';
		if (controlMode === 'user') return 'Your input is active in the browser.';
		if (controlMode === 'paused') return 'Agent control is visually paused.';
		return latestEntry?.description || latestEntry?.action || 'Watching the page and preparing the next step.';
	};

	const labelForAction = (entry: StatusEntry) => {
		const text = `${entry?.action ?? ''} ${entry?.description ?? ''}`.toLowerCase();
		if (text.includes('click')) return 'Clicking button';
		if (text.includes('typ') || text.includes('fill')) return 'Typing';
		if (text.includes('screenshot') || text.includes('capture')) return 'Taking screenshot';
		if (text.includes('link') || text.includes('open')) return 'Opening link';
		if (text.includes('wait')) return 'Waiting for page';
		if (text.includes('approval') || text.includes('permission')) return 'Needs approval';
		if (text.includes('error') || text.includes('failed')) return 'Error';
		if (text.includes('read') || text.includes('scan')) return 'Reading content';
		return entry?.action || 'Looking at page';
	};
</script>

<div
	class="agent-browser-shell flex h-full min-h-0 flex-col overflow-hidden rounded-[1.35rem] border border-white/10 bg-[#070b12]/95 text-white shadow-[0_28px_90px_rgba(2,6,23,0.42)] ring-1 ring-black/30 backdrop-blur-xl {controlMode ===
	'user'
		? 'ring-2 ring-cyan-300/50'
		: controlMode === 'paused'
			? 'ring-2 ring-amber-300/40'
			: screenshotActive
				? 'screenshot-glow'
				: ''}"
>
	<div
		class="flex min-h-14 shrink-0 items-center gap-3 border-b border-white/10 bg-white/[0.055] px-3.5 backdrop-blur-xl"
	>
		<div class="traffic-light flex shrink-0 items-center gap-1.5" aria-hidden="true">
			<span class="size-3 rounded-full bg-[#ff5f57] shadow-[0_0_14px_rgba(255,95,87,0.35)]"></span>
			<span class="size-3 rounded-full bg-[#febc2e] shadow-[0_0_14px_rgba(254,188,46,0.28)]"></span>
			<span class="size-3 rounded-full bg-[#28c840] shadow-[0_0_14px_rgba(40,200,64,0.28)]"></span>
		</div>

		<div class="flex min-w-0 flex-1 justify-center">
			<div
				class="status-pill flex max-w-full items-center gap-2 rounded-full border border-white/10 bg-black/30 px-3 py-1.5 text-xs text-gray-200 shadow-inner shadow-black/30 backdrop-blur"
			>
				<span
					class="size-1.5 shrink-0 rounded-full {isWorking
						? 'animate-pulse bg-emerald-300'
						: controlMode === 'user'
							? 'bg-cyan-300'
							: controlMode === 'paused'
								? 'bg-amber-300'
								: browserFailed
									? 'bg-red-300'
									: 'bg-sky-300'}"
				></span>
				<span class="shrink-0 font-medium">Agent Browser</span>
				<span class="hidden h-3 w-px bg-white/15 sm:block"></span>
				<span class="truncate text-gray-400">{statusOverlayLabel}</span>
			</div>
		</div>

		<div class="flex shrink-0 items-center gap-1.5">
			<button
				type="button"
				class="rounded-full border border-white/10 px-2.5 py-1.5 text-xs font-medium text-gray-300 transition hover:border-white/20 hover:bg-white/10 hover:text-white active:scale-95"
				on:click={pauseAgent}
			>
				Pause
			</button>
			<button
				type="button"
				class="rounded-full border border-cyan-300/25 bg-cyan-300/10 px-2.5 py-1.5 text-xs font-medium text-cyan-100 transition hover:bg-cyan-300/20 active:scale-95"
				on:click={takeOver}
			>
				Take Over
			</button>
			<button
				type="button"
				class="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-2.5 py-1.5 text-xs font-medium text-emerald-100 transition hover:bg-emerald-300/20 active:scale-95"
				on:click={resumeAgent}
			>
				Resume
			</button>
		</div>
	</div>

	<div class="relative min-h-0 flex-1 overflow-hidden bg-black">
		{#if !browserLoaded && !browserFailed}
			<div class="absolute inset-0 z-20 bg-gray-950">
				<div class="h-full w-full animate-pulse bg-[linear-gradient(110deg,rgba(15,23,42,0.9),rgba(30,41,59,0.72),rgba(15,23,42,0.9))]"></div>
				<div class="absolute left-5 top-5 h-3 w-40 rounded-full bg-white/10"></div>
				<div class="absolute left-5 top-12 h-3 w-64 rounded-full bg-white/5"></div>
				<div class="absolute bottom-5 left-5 h-14 w-64 rounded-2xl bg-white/[0.08]"></div>
			</div>
		{/if}

		{#if browserFailed}
			<div class="absolute inset-0 z-30 flex items-center justify-center bg-gray-950/95 p-6 text-center">
				<div class="max-w-sm rounded-3xl border border-red-300/20 bg-red-950/20 p-5 shadow-2xl backdrop-blur">
					<div class="text-sm font-semibold text-red-100">Disconnected</div>
					<div class="mt-2 text-sm text-red-100/70">The browser view stopped responding.</div>
					<button
						type="button"
						class="mt-4 rounded-full bg-white px-4 py-2 text-sm font-medium text-gray-950 transition hover:bg-gray-200"
						on:click={reloadBrowser}
					>
						Reconnect
					</button>
				</div>
			</div>
		{/if}

		{#if approvalEntry}
			<div class="absolute inset-0 z-40 flex items-center justify-center bg-gray-950/45 p-5 backdrop-blur-md">
				<div class="max-w-md rounded-3xl border border-white/15 bg-gray-950/80 p-5 text-center shadow-2xl">
					<div class="text-base font-semibold">Approval needed</div>
					<div class="mt-2 text-sm leading-6 text-gray-300">
						{approvalEntry.description || approvalEntry.action || 'The agent wants to submit this form.'}
					</div>
					<div class="mt-5 flex flex-wrap justify-center gap-2">
						<button
							type="button"
							class="rounded-full bg-white px-4 py-2 text-sm font-medium text-gray-950 transition hover:bg-gray-200"
							on:click={() => (approvalDismissed = true)}
						>
							Approve
						</button>
						<button
							type="button"
							class="rounded-full border border-white/15 px-4 py-2 text-sm font-medium text-gray-200 transition hover:bg-white/10"
							on:click={() => (approvalDismissed = true)}
						>
							Reject
						</button>
						<button
							type="button"
							class="rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-2 text-sm font-medium text-cyan-100 transition hover:bg-cyan-300/20"
							on:click={takeOver}
						>
							Take Over
						</button>
					</div>
				</div>
			</div>
		{/if}

		{#if clickActive}
			<div class="agent-click-ripple pointer-events-none absolute left-[54%] top-[46%] z-30 size-14 rounded-full border border-cyan-200/70"></div>
		{/if}

		{#if isWorking}
			<div class="agent-cursor pointer-events-none absolute left-[58%] top-[42%] z-30">
				<div class="h-5 w-3 rotate-[-18deg] rounded-br-xl rounded-tl-xl border border-white/80 bg-cyan-300/80 shadow-[0_0_22px_rgba(103,232,249,0.55)]"></div>
			</div>
		{/if}

		<div
			class="absolute bottom-4 left-4 z-30 max-w-[min(22rem,calc(100%-2rem))] rounded-2xl border border-white/10 bg-gray-950/72 p-3 shadow-2xl backdrop-blur-xl"
		>
			<div class="flex items-center gap-2">
				<span
					class="size-2 rounded-full {isWorking
						? 'animate-pulse bg-emerald-300'
						: controlMode === 'user'
							? 'bg-cyan-300'
							: controlMode === 'paused'
								? 'bg-amber-300'
								: browserFailed
									? 'bg-red-300'
									: 'bg-sky-300'}"
				></span>
				<div class="text-sm font-semibold">{statusOverlayLabel}</div>
			</div>
			<div class="mt-1 line-clamp-2 text-xs leading-5 text-gray-300">{statusDescription}</div>
			{#if typingActive}
				<div class="mt-2 flex gap-1">
					<span class="size-1.5 animate-bounce rounded-full bg-cyan-200"></span>
					<span class="size-1.5 animate-bounce rounded-full bg-cyan-200 [animation-delay:120ms]"></span>
					<span class="size-1.5 animate-bounce rounded-full bg-cyan-200 [animation-delay:240ms]"></span>
				</div>
			{/if}
		</div>

		{#key reloadKey}
			<iframe
				bind:this={iframeElement}
				class="h-full min-h-0 w-full border-0 bg-black transition duration-300 {controlMode ===
				'user'
					? 'brightness-110'
					: controlMode === 'paused'
						? 'brightness-75 saturate-75'
						: ''}"
				src={browserUrl}
				title="Live browser"
				sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-downloads"
				allow="clipboard-read; clipboard-write; fullscreen"
				on:load={() => {
					browserLoaded = true;
					browserFailed = false;
				}}
				on:error={() => {
					browserLoaded = false;
					browserFailed = true;
				}}
			/>
		{/key}
	</div>

	<div class="border-t border-white/10 bg-white/[0.045] px-3.5 py-2.5">
		<div class="mb-2 flex items-center justify-between">
			<div class="text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">Live action feed</div>
			<div class="text-xs text-gray-500">{recentActions.length || 1} recent</div>
		</div>
		<div class="grid gap-1.5 sm:grid-cols-2">
			{#if recentActions.length === 0}
				<div class="rounded-2xl border border-white/[0.08] bg-white/[0.035] px-3 py-2 text-xs text-gray-400">
					Looking at page
				</div>
			{:else}
				{#each recentActions as entry}
					<div class="rounded-2xl border border-white/[0.08] bg-white/[0.035] px-3 py-2 transition hover:bg-white/[0.06]">
						<div class="truncate text-xs font-medium text-gray-200">{labelForAction(entry)}</div>
						{#if entry.description}
							<div class="mt-0.5 truncate text-xs text-gray-500">{entry.description}</div>
						{/if}
					</div>
				{/each}
			{/if}
		</div>
	</div>

	<div class="flex min-h-11 shrink-0 items-center gap-2 border-t border-white/10 bg-black/20 px-3.5 py-2 text-gray-400">
		<button
			type="button"
			class="rounded-full p-1.5 transition hover:bg-white/10 hover:text-white active:scale-95"
			aria-label="Reload browser"
			title="Reload"
			on:click={reloadBrowser}
		>
			<Refresh className="size-4" />
		</button>
		<button
			type="button"
			class="rounded-full p-1.5 transition hover:bg-white/10 hover:text-white active:scale-95"
			aria-label="Fullscreen browser"
			title="Fullscreen"
			on:click={openFullscreen}
		>
			<ArrowsPointingOut className="size-4" />
		</button>
		<a
			class="rounded-full p-1.5 transition hover:bg-white/10 hover:text-white active:scale-95"
			href={browserUrl}
			target="_blank"
			rel="noreferrer"
			aria-label="Open browser in new tab"
			title="Open in new tab"
		>
			<Link className="size-4" />
		</a>
		<div class="min-w-0 flex-1 truncate rounded-full bg-white/[0.055] px-3 py-1.5 text-xs">
			{browserUrl}
		</div>
	</div>
</div>

<style>
	.agent-browser-shell {
		animation: agent-browser-enter 420ms cubic-bezier(0.2, 0.8, 0.2, 1);
	}

	.screenshot-glow {
		animation: screenshot-pulse 1.35s ease-in-out infinite;
	}

	.agent-click-ripple {
		animation: click-ripple 900ms ease-out infinite;
	}

	.agent-cursor {
		animation: cursor-drift 2.2s ease-in-out infinite;
	}

	@keyframes agent-browser-enter {
		from {
			opacity: 0;
			transform: translateY(12px) scale(0.985);
		}
		to {
			opacity: 1;
			transform: translateY(0) scale(1);
		}
	}

	@keyframes screenshot-pulse {
		0%,
		100% {
			box-shadow: 0 28px 90px rgba(2, 6, 23, 0.42), 0 0 0 1px rgba(255, 255, 255, 0.1);
		}
		50% {
			box-shadow: 0 28px 90px rgba(2, 6, 23, 0.42), 0 0 0 2px rgba(125, 211, 252, 0.55),
				0 0 34px rgba(125, 211, 252, 0.28);
		}
	}

	@keyframes click-ripple {
		from {
			opacity: 0.85;
			transform: translate(-50%, -50%) scale(0.35);
		}
		to {
			opacity: 0;
			transform: translate(-50%, -50%) scale(1.65);
		}
	}

	@keyframes cursor-drift {
		0%,
		100% {
			transform: translate3d(0, 0, 0);
		}
		50% {
			transform: translate3d(8px, 6px, 0);
		}
	}
</style>
