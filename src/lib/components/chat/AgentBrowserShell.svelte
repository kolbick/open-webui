<script lang="ts">
	import ArrowsPointingOut from '$lib/components/icons/ArrowsPointingOut.svelte';
	import Link from '$lib/components/icons/Link.svelte';
	import Refresh from '$lib/components/icons/Refresh.svelte';

	export let browserUrl = '';
	type StatusEntry = {
		done?: boolean;
		action?: string;
		description?: string;
		urls?: string[];
		query?: string;
		hidden?: boolean;
	};

	export let statusEntries: StatusEntry[] = [];
	export let showAgentControls = true;
	export let onPause: () => void | Promise<void> = async () => {};
	export let onTakeOver: () => void | Promise<void> = async () => {};
	export let onResume: () => void | Promise<void> = async () => {};

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
	$: recentActions = visibleStatusEntries.slice(-4).reverse();
	$: statusOverlayLabel = getStatusOverlayLabel();
	$: statusDescription = getStatusDescription();
	$: browserAddress = getBrowserAddress(browserUrl);
	$: controlModeClass = getControlModeClass();
	$: modeRibbonLabel = getModeRibbonLabel();
	$: modeRibbonDescription = getModeRibbonDescription();
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

	const takeOver = async () => {
		controlMode = 'user';
		approvalDismissed = true;
		await onTakeOver();
	};

	const pauseAgent = async () => {
		controlMode = 'paused';
		await onPause();
	};

	const resumeAgent = async () => {
		controlMode = 'agent';
		approvalDismissed = false;
		await onResume();
	};

	const handleTrafficRed = async () => {
		await pauseAgent();
	};

	const handleTrafficYellow = async () => {
		await takeOver();
	};

	const handleTrafficGreen = async () => {
		await resumeAgent();
	};

	const getBrowserAddress = (url: string) => {
		if (!url) return 'Live browser session';

		try {
			const parsed = new URL(url, window?.location?.origin ?? 'http://localhost');
			return `${parsed.host}${parsed.pathname === '/' ? '' : parsed.pathname}`;
		} catch {
			return url;
		}
	};

	const getControlModeClass = () => {
		if (browserFailed) return 'mode-disconnected';
		if (approvalEntry) return 'mode-approval';
		return `mode-${controlMode}`;
	};

	const getModeRibbonLabel = () => {
		if (browserFailed) return 'Disconnected';
		if (approvalEntry) return 'Approval';
		if (controlMode === 'user') return 'You control';
		if (controlMode === 'paused') return 'Paused';
		return 'Agent control';
	};

	const getModeRibbonDescription = () => {
		if (browserFailed) return 'Reload required';
		if (approvalEntry) return 'Decision needed';
		if (controlMode === 'user') return 'Input active';
		if (controlMode === 'paused') return 'Automation stopped';
		return isWorking ? 'Automation live' : 'Standing by';
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
	class="agent-browser-shell {controlModeClass} relative isolate flex h-full min-h-0 flex-col overflow-hidden rounded-[1.4rem] border border-white/24 bg-[#0a2630]/92 text-white shadow-[0_34px_110px_rgba(4,42,52,0.42)] ring-1 ring-white/10 backdrop-blur-2xl {screenshotActive
		? 'screenshot-glow'
		: ''}"
>
	<div class="beach-backdrop pointer-events-none absolute inset-0 -z-20"></div>
	<div class="agent-stage-light pointer-events-none absolute inset-0 -z-10"></div>

	<div class="browser-toolbar flex min-h-16 shrink-0 items-center gap-3 border-b border-white/18 bg-white/[0.13] px-3.5 backdrop-blur-2xl">
		<div class="traffic-light flex shrink-0 items-center gap-2">
			<button
				type="button"
				class="traffic-button traffic-red size-3.5 rounded-full bg-[#ff5f57] shadow-[0_0_18px_rgba(255,95,87,0.42)] transition hover:scale-110 hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-white/50 active:scale-95"
				aria-label="Pause agent"
				title="Pause agent"
				on:click={handleTrafficRed}
			></button>
			<button
				type="button"
				class="traffic-button traffic-yellow size-3.5 rounded-full bg-[#f6bd3b] shadow-[0_0_18px_rgba(246,189,59,0.35)] transition hover:scale-110 hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-white/50 active:scale-95"
				aria-label="Take over browser"
				title="Take over browser"
				on:click={handleTrafficYellow}
			></button>
			<button
				type="button"
				class="traffic-button traffic-green size-3.5 rounded-full bg-[#35d07f] shadow-[0_0_18px_rgba(53,208,127,0.35)] transition hover:scale-110 hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-white/50 active:scale-95"
				aria-label="Resume agent"
				title="Resume agent"
				on:click={handleTrafficGreen}
			></button>
		</div>

		<div class="flex min-w-0 flex-1 justify-center">
			<div
				class="status-pill flex max-w-full items-center gap-2.5 rounded-full border border-white/24 bg-[#052735]/58 px-3 py-1.5 text-xs text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_10px_34px_rgba(0,34,44,0.2)] backdrop-blur"
			>
				<span class="activity-orbit {isWorking ? 'is-live' : ''}" aria-hidden="true">
					<span></span>
				</span>
				<span class="shrink-0 font-semibold">Agent Browser</span>
				<span class="hidden h-3.5 w-px bg-white/18 sm:block"></span>
				<span class="min-w-0 truncate text-cyan-50/76">{browserAddress}</span>
			</div>
		</div>

		{#if showAgentControls}
			<div class="mode-ribbon {controlModeClass} hidden shrink-0 items-center gap-2 rounded-full border px-2.5 py-1.5 text-xs backdrop-blur sm:flex">
				<span class="mode-ribbon-dot"></span>
				<span class="font-semibold">{modeRibbonLabel}</span>
				<span class="hidden text-white/56 lg:inline">{modeRibbonDescription}</span>
			</div>
		{/if}
	</div>

	<div class="browser-stage relative min-h-0 flex-1 overflow-hidden p-2.5">
		<div class="shoreline pointer-events-none absolute inset-x-0 bottom-0 z-0 h-20 opacity-70 blur-2xl"></div>
		<div class="stage-grid pointer-events-none absolute inset-0 z-0"></div>

		{#if !browserLoaded && !browserFailed}
			<div class="loading-state absolute inset-2.5 z-30 overflow-hidden rounded-[1.15rem] border border-white/24 bg-[#e7f7f3]/88 shadow-2xl">
				<div class="loading-sheen h-full w-full animate-pulse"></div>
				<div class="absolute left-5 top-5 h-3 w-40 rounded-full bg-white/70"></div>
				<div class="absolute left-5 top-12 h-3 w-64 rounded-full bg-white/40"></div>
				<div class="absolute bottom-5 left-5 h-16 w-72 rounded-2xl bg-[#063846]/34 backdrop-blur"></div>
			</div>
		{/if}

		{#if browserFailed}
			<div class="absolute inset-2.5 z-40 flex items-center justify-center rounded-[1.15rem] bg-[#082f3b]/82 p-6 text-center shadow-2xl backdrop-blur">
				<div class="max-w-sm rounded-2xl border border-red-200/30 bg-white/16 p-5 shadow-2xl backdrop-blur">
					<div class="text-sm font-semibold text-red-100">Disconnected</div>
					<div class="mt-2 text-sm text-red-100/72">The browser view stopped responding.</div>
					<button
						type="button"
						class="mt-4 rounded-full bg-white px-4 py-2 text-sm font-semibold text-gray-950 transition hover:bg-gray-200 active:scale-95"
						on:click={reloadBrowser}
					>
						Reconnect
					</button>
				</div>
			</div>
		{/if}

		{#if approvalEntry}
			<div class="absolute inset-2.5 z-50 flex items-center justify-center rounded-[1.15rem] bg-[#073140]/46 p-5 backdrop-blur-md">
				<div class="max-w-md rounded-2xl border border-white/24 bg-[#073140]/86 p-5 text-center shadow-2xl">
					<div class="text-base font-semibold">Approval needed</div>
					<div class="mt-2 text-sm leading-6 text-cyan-50/74">
						{approvalEntry.description || approvalEntry.action || 'The agent wants to submit this form.'}
					</div>
					<div class="mt-5 flex flex-wrap justify-center gap-2">
						<button
							type="button"
							class="rounded-full bg-white px-4 py-2 text-sm font-semibold text-gray-950 transition hover:bg-gray-200 active:scale-95"
							on:click={() => (approvalDismissed = true)}
						>
							Approve
						</button>
						<button
							type="button"
							class="rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-gray-100 transition hover:bg-white/12 active:scale-95"
							on:click={() => (approvalDismissed = true)}
						>
							Reject
						</button>
						{#if showAgentControls}
							<button
								type="button"
								class="rounded-full border border-cyan-200/35 bg-cyan-200/13 px-4 py-2 text-sm font-semibold text-cyan-50 transition hover:bg-cyan-200/22 active:scale-95"
								on:click={takeOver}
							>
								Take Over
							</button>
						{/if}
					</div>
				</div>
			</div>
		{/if}

		{#if isWorking}
			<div class="agent-scanline pointer-events-none absolute inset-x-5 top-5 z-30 h-px"></div>
		{/if}

		{#if clickActive}
			<div class="agent-click-ripple pointer-events-none absolute left-[54%] top-[46%] z-40 size-16 rounded-full border border-cyan-100/80"></div>
		{/if}

		{#if isWorking}
			<div class="agent-cursor pointer-events-none absolute left-[58%] top-[42%] z-40">
				<div class="agent-cursor-tail"></div>
				<div class="h-5 w-3 rotate-[-18deg] rounded-br-xl rounded-tl-xl border border-white/90 bg-cyan-200/88 shadow-[0_0_28px_rgba(125,243,255,0.62)]"></div>
			</div>
		{/if}

		<div
			class="status-card absolute bottom-5 left-5 z-40 max-w-[min(24rem,calc(100%-2.5rem))] rounded-2xl border border-white/24 bg-[#052c39]/76 p-3.5 shadow-[0_18px_54px_rgba(0,28,39,0.34)] backdrop-blur-2xl"
		>
			<div class="flex items-center gap-2.5">
				<span class="activity-orbit compact {isWorking ? 'is-live' : ''}" aria-hidden="true">
					<span></span>
				</span>
				<div class="min-w-0">
					<div class="truncate text-sm font-semibold">{statusOverlayLabel}</div>
					<div class="mt-0.5 truncate text-[11px] text-cyan-50/54">{modeRibbonDescription}</div>
				</div>
			</div>
			<div class="mt-2 line-clamp-2 text-xs leading-5 text-cyan-50/72">{statusDescription}</div>
			{#if typingActive}
				<div class="mt-2 flex gap-1">
					<span class="size-1.5 animate-bounce rounded-full bg-cyan-100"></span>
					<span class="size-1.5 animate-bounce rounded-full bg-cyan-100 [animation-delay:120ms]"></span>
					<span class="size-1.5 animate-bounce rounded-full bg-cyan-100 [animation-delay:240ms]"></span>
				</div>
			{/if}
		</div>

		<div class="browser-display {controlModeClass} relative z-10 h-full min-h-0 overflow-hidden rounded-[1.15rem] border border-white/24 bg-[#071f27] p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.16),0_22px_72px_rgba(0,24,34,0.42)]">
			<div class="browser-display-header flex h-8 shrink-0 items-center gap-2 rounded-t-[0.82rem] border-b border-white/10 bg-white/[0.075] px-3 text-[11px] text-cyan-50/62">
				<span class="size-1.5 shrink-0 rounded-full bg-cyan-200/70"></span>
				<span class="truncate">{browserAddress}</span>
			</div>
			<div class="relative h-[calc(100%-2rem)] min-h-0 overflow-hidden rounded-b-[0.82rem] bg-[#d9f3ef]">
				<div class="viewport-vignette pointer-events-none absolute inset-0 z-20"></div>
				{#key reloadKey}
					<iframe
						bind:this={iframeElement}
						class="h-full min-h-0 w-full border-0 bg-[#d9f3ef] transition duration-500 {controlMode ===
						'user'
							? 'brightness-110 saturate-105'
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
		</div>
	</div>

	<div class="action-feed border-t border-white/14 bg-white/[0.09] px-3.5 py-2.5 backdrop-blur">
		<div class="mb-2 flex items-center justify-between">
			<div class="text-[11px] font-semibold uppercase text-cyan-50/56">Live action feed</div>
			<div class="text-[11px] text-cyan-50/44">{recentActions.length || 1} recent</div>
		</div>
		<div class="feed-lane grid gap-1.5 sm:grid-cols-2">
			{#if recentActions.length === 0}
				<div class="feed-item rounded-xl border border-white/[0.16] bg-white/[0.105] px-3 py-2 text-xs text-cyan-50/74">
					<span class="feed-index">01</span>
					<span>Looking at page</span>
				</div>
			{:else}
				{#each recentActions as entry, index}
					<div class="feed-item rounded-xl border border-white/[0.16] bg-white/[0.105] px-3 py-2 transition hover:bg-white/[0.15]">
						<span class="feed-index">{String(recentActions.length - index).padStart(2, '0')}</span>
						<div class="min-w-0">
							<div class="truncate text-xs font-semibold text-cyan-50/86">{labelForAction(entry)}</div>
							{#if entry.description}
								<div class="mt-0.5 truncate text-[11px] text-cyan-50/46">{entry.description}</div>
							{/if}
						</div>
					</div>
				{/each}
			{/if}
		</div>
	</div>

	<div class="command-rail flex min-h-12 shrink-0 items-center gap-2 border-t border-white/14 bg-[#052632]/54 px-3.5 py-2 text-cyan-50/70 backdrop-blur-xl">
		<button
			type="button"
			class="command-button rounded-full p-2 transition hover:bg-white/12 hover:text-white active:scale-95"
			aria-label="Reload browser"
			title="Reload"
			on:click={reloadBrowser}
		>
			<Refresh className="size-4" />
		</button>
		<button
			type="button"
			class="command-button rounded-full p-2 transition hover:bg-white/12 hover:text-white active:scale-95"
			aria-label="Fullscreen browser"
			title="Fullscreen"
			on:click={openFullscreen}
		>
			<ArrowsPointingOut className="size-4" />
		</button>
		<a
			class="command-button rounded-full p-2 transition hover:bg-white/12 hover:text-white active:scale-95"
			href={browserUrl}
			target="_blank"
			rel="noreferrer"
			aria-label="Open browser in new tab"
			title="Open in new tab"
		>
			<Link className="size-4" />
		</a>
		<div class="min-w-0 flex-1 truncate rounded-full border border-white/12 bg-white/[0.075] px-3 py-1.5 text-xs shadow-inner shadow-black/10">
			{browserUrl}
		</div>
	</div>
</div>

<style>
	.agent-browser-shell {
		animation: agent-browser-enter 500ms cubic-bezier(0.2, 0.8, 0.2, 1);
	}

	.beach-backdrop {
		background:
			linear-gradient(137deg, rgba(6, 48, 58, 0.98) 0%, rgba(14, 93, 105, 0.9) 38%, rgba(227, 175, 105, 0.74) 78%, rgba(239, 116, 93, 0.34) 100%),
			radial-gradient(circle at 18% 6%, rgba(255, 232, 168, 0.5), transparent 26%);
	}

	.beach-backdrop::after {
		position: absolute;
		inset: auto -12% 0 -12%;
		height: 34%;
		content: '';
		background:
			radial-gradient(ellipse at 28% 10%, rgba(255, 255, 255, 0.36), transparent 35%),
			linear-gradient(178deg, rgba(246, 252, 246, 0.58), rgba(229, 196, 132, 0.28) 42%, rgba(107, 88, 62, 0.18));
		filter: blur(18px);
		opacity: 0.9;
		transform: rotate(-1deg);
	}

	.agent-stage-light {
		background:
			linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.12), transparent),
			radial-gradient(circle at 78% 18%, rgba(126, 222, 222, 0.28), transparent 28%),
			radial-gradient(circle at 18% 80%, rgba(255, 174, 120, 0.2), transparent 24%);
		mix-blend-mode: screen;
		animation: stage-light-drift 7s ease-in-out infinite;
	}

	.shoreline {
		background: linear-gradient(90deg, rgba(255, 255, 255, 0.32), rgba(112, 215, 218, 0.18), rgba(236, 202, 139, 0.22));
	}

	.stage-grid {
		background-image:
			linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
			linear-gradient(90deg, rgba(255, 255, 255, 0.04) 1px, transparent 1px);
		background-size: 42px 42px;
		mask-image: radial-gradient(circle at center, black, transparent 72%);
		opacity: 0.22;
	}

	.traffic-button {
		position: relative;
	}

	.traffic-button::after {
		position: absolute;
		inset: -6px;
		content: '';
		border-radius: 9999px;
		background: currentColor;
		opacity: 0;
		transform: scale(0.55);
		transition:
			opacity 160ms ease,
			transform 160ms ease;
	}

	.traffic-button:hover::after {
		opacity: 0.16;
		transform: scale(1);
	}

	.status-pill {
		animation: status-pill-settle 580ms cubic-bezier(0.2, 0.8, 0.2, 1);
	}

	.activity-orbit {
		position: relative;
		display: inline-flex;
		width: 16px;
		height: 16px;
		flex: 0 0 auto;
		align-items: center;
		justify-content: center;
		border: 1px solid rgba(207, 250, 254, 0.32);
		border-radius: 9999px;
	}

	.activity-orbit.compact {
		width: 18px;
		height: 18px;
	}

	.activity-orbit span {
		width: 6px;
		height: 6px;
		border-radius: 9999px;
		background: #a7f3d0;
		box-shadow: 0 0 18px rgba(167, 243, 208, 0.72);
	}

	.activity-orbit.is-live::before {
		position: absolute;
		inset: -4px;
		content: '';
		border-radius: inherit;
		border: 1px solid rgba(167, 243, 208, 0.45);
		animation: orbit-pulse 1.4s ease-out infinite;
	}

	.mode-ribbon {
		border-color: rgba(255, 255, 255, 0.16);
		background: rgba(255, 255, 255, 0.1);
	}

	.mode-ribbon-dot {
		width: 7px;
		height: 7px;
		border-radius: 9999px;
		background: #67e8f9;
		box-shadow: 0 0 16px rgba(103, 232, 249, 0.58);
	}

	.mode-user .mode-ribbon-dot {
		background: #93c5fd;
		box-shadow: 0 0 18px rgba(147, 197, 253, 0.62);
	}

	.mode-paused .mode-ribbon-dot {
		background: #fcd34d;
		box-shadow: 0 0 18px rgba(252, 211, 77, 0.56);
	}

	.mode-approval .mode-ribbon-dot,
	.mode-disconnected .mode-ribbon-dot {
		background: #fca5a5;
		box-shadow: 0 0 18px rgba(252, 165, 165, 0.58);
	}

	.browser-display {
		transition:
			box-shadow 280ms ease,
			border-color 280ms ease,
			transform 280ms ease;
	}

	.browser-display.mode-user {
		border-color: rgba(147, 197, 253, 0.5);
		box-shadow:
			inset 0 1px 0 rgba(255, 255, 255, 0.18),
			0 0 0 1px rgba(147, 197, 253, 0.18),
			0 24px 80px rgba(37, 99, 235, 0.24);
	}

	.browser-display.mode-paused {
		border-color: rgba(252, 211, 77, 0.46);
		box-shadow:
			inset 0 1px 0 rgba(255, 255, 255, 0.18),
			0 0 0 1px rgba(252, 211, 77, 0.15),
			0 24px 80px rgba(146, 64, 14, 0.22);
	}

	.viewport-vignette {
		box-shadow:
			inset 0 0 0 1px rgba(2, 44, 54, 0.12),
			inset 0 32px 60px rgba(0, 0, 0, 0.1),
			inset 0 -34px 58px rgba(0, 30, 40, 0.14);
	}

	.loading-sheen {
		background: linear-gradient(110deg, rgba(255, 255, 255, 0.16), rgba(255, 255, 255, 0.46), rgba(255, 255, 255, 0.14));
	}

	.status-card {
		animation: status-card-rise 540ms cubic-bezier(0.2, 0.8, 0.2, 1);
	}

	.feed-item {
		display: flex;
		min-width: 0;
		align-items: center;
		gap: 10px;
		animation: feed-slide 360ms cubic-bezier(0.2, 0.8, 0.2, 1);
	}

	.feed-index {
		display: inline-flex;
		width: 24px;
		height: 24px;
		flex: 0 0 auto;
		align-items: center;
		justify-content: center;
		border-radius: 9999px;
		background: rgba(255, 255, 255, 0.1);
		color: rgba(236, 254, 255, 0.62);
		font-size: 10px;
		font-weight: 700;
	}

	.command-button {
		box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.06);
	}

	.screenshot-glow {
		animation: screenshot-pulse 1.35s ease-in-out infinite;
	}

	.agent-scanline {
		background: linear-gradient(90deg, transparent, rgba(207, 250, 254, 0.78), transparent);
		filter: drop-shadow(0 0 14px rgba(103, 232, 249, 0.62));
		animation: scanline-sweep 2.35s ease-in-out infinite;
	}

	.agent-click-ripple {
		animation: click-ripple 860ms ease-out infinite;
	}

	.agent-cursor {
		animation: cursor-drift 2.2s ease-in-out infinite;
	}

	.agent-cursor-tail {
		position: absolute;
		left: -12px;
		top: 12px;
		width: 34px;
		height: 1px;
		background: linear-gradient(90deg, transparent, rgba(125, 243, 255, 0.5));
		transform: rotate(-18deg);
	}

	@media (max-width: 640px) {
		.browser-toolbar {
			min-height: 58px;
		}

		.status-pill {
			max-width: 100%;
		}

		.browser-stage {
			padding: 8px;
		}

		.status-card {
			bottom: 14px;
			left: 14px;
			max-width: calc(100% - 28px);
		}

		.action-feed {
			max-height: 150px;
			overflow: auto;
		}
	}

	@keyframes agent-browser-enter {
		from {
			opacity: 0;
			transform: translateY(14px) scale(0.982);
		}
		to {
			opacity: 1;
			transform: translateY(0) scale(1);
		}
	}

	@keyframes stage-light-drift {
		0%,
		100% {
			opacity: 0.72;
			transform: translate3d(-2%, 0, 0);
		}
		50% {
			opacity: 1;
			transform: translate3d(2%, 0, 0);
		}
	}

	@keyframes status-pill-settle {
		from {
			opacity: 0;
			transform: translateY(-6px) scale(0.98);
		}
		to {
			opacity: 1;
			transform: translateY(0) scale(1);
		}
	}

	@keyframes status-card-rise {
		from {
			opacity: 0;
			transform: translateY(10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@keyframes orbit-pulse {
		from {
			opacity: 0.82;
			transform: scale(0.6);
		}
		to {
			opacity: 0;
			transform: scale(1.45);
		}
	}

	@keyframes scanline-sweep {
		0%,
		100% {
			opacity: 0;
			transform: translate3d(-35%, 0, 0);
		}
		35%,
		65% {
			opacity: 1;
		}
		100% {
			transform: translate3d(35%, 0, 0);
		}
	}

	@keyframes screenshot-pulse {
		0%,
		100% {
			box-shadow: 0 34px 110px rgba(4, 42, 52, 0.42), 0 0 0 1px rgba(255, 255, 255, 0.1);
		}
		50% {
			box-shadow:
				0 34px 110px rgba(4, 42, 52, 0.42),
				0 0 0 2px rgba(125, 211, 252, 0.55),
				0 0 42px rgba(125, 211, 252, 0.32);
		}
	}

	@keyframes click-ripple {
		from {
			opacity: 0.9;
			transform: translate(-50%, -50%) scale(0.3);
		}
		to {
			opacity: 0;
			transform: translate(-50%, -50%) scale(1.72);
		}
	}

	@keyframes cursor-drift {
		0%,
		100% {
			transform: translate3d(0, 0, 0);
		}
		50% {
			transform: translate3d(10px, 7px, 0);
		}
	}

	@keyframes feed-slide {
		from {
			opacity: 0;
			transform: translateY(6px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>
