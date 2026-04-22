<script>
	import { getContext, onMount } from 'svelte';
	const i18n = getContext('i18n');

	import Marquee from './common/Marquee.svelte';
	import SlideShow from './common/SlideShow.svelte';
	import ArrowRightCircle from './icons/ArrowRightCircle.svelte';

	export let show = true;
	export let getStartedHandler = () => {};

	function setLogoImage() {
		const logo = document.getElementById('logo');

		if (logo) {
			const isDarkMode = document.documentElement.classList.contains('dark');

			if (isDarkMode) {
				const darkImage = new Image();
				darkImage.src = `/logo-128.png`;

				darkImage.onload = () => {
					logo.src = `/logo-128.png`;
					logo.style.filter = '';
				};

				darkImage.onerror = () => {
					logo.style.filter = '';
				};
			}
		}
	}

	$: if (show) {
		setLogoImage();
	}
</script>

{#if show}
	<div class="w-full h-screen max-h-[100dvh] text-white relative overflow-hidden onboarding-shell">
		<div class="onboarding-glow onboarding-glow-top" aria-hidden="true"></div>
		<div class="onboarding-glow onboarding-glow-bottom" aria-hidden="true"></div>
		<div class="fixed m-10 z-50">
			<div class="flex space-x-2">
				<div class=" self-center">
					<img
						id="logo"
						crossorigin="anonymous"
						src="/logo-128.png"
						class="size-10 rounded-xl border border-amber-300/50 bg-purple-950/55 p-1.5 shadow-xl shadow-purple-950/60"
						alt="logo"
					/>
				</div>
			</div>
		</div>

		<SlideShow duration={5000} />

		<div class="w-full h-full absolute top-0 left-0 bg-linear-to-t from-20% from-black/70 to-transparent"></div>

		<div class="w-full h-full absolute top-0 left-0 backdrop-blur-xs bg-purple-950/55"></div>

		<div class="relative bg-transparent w-full h-screen max-h-[100dvh] flex z-10">
			<div class="flex flex-col justify-end w-full items-center pb-10 text-center">
				<div class="text-5xl lg:text-7xl font-secondary text-amber-100 drop-shadow-[0_0_28px_rgba(250,204,21,0.25)]">
					<Marquee
						duration={5000}
						words={[
							$i18n.t('Your AI, your rules'),
							$i18n.t('Private by design'),
							$i18n.t('No subscriptions'),
							$i18n.t('Runs on your machine'),
							$i18n.t('Always available'),
							$i18n.t('Fully offline'),
							$i18n.t('Your data stays yours'),
							$i18n.t('No cloud required'),
							$i18n.t('Built for you'),
							$i18n.t('Sail with Kolb-Bot')
						]}
					/>

					<div class="mt-0.5 text-amber-300/95">{$i18n.t(`on your terms`)}</div>
				</div>

				<div class="flex justify-center mt-8">
					<div class="flex flex-col justify-center items-center">
						<button
							aria-label={$i18n.t('Get started')}
							class="relative z-20 flex p-1 rounded-full onboarding-cta transition font-medium text-sm"
							on:click={() => {
								getStartedHandler();
							}}
						>
							<ArrowRightCircle className="size-6" aria-hidden="true" />
						</button>
						<div class="mt-1.5 font-primary text-base font-medium" aria-hidden="true">
							{$i18n.t(`Get started`)}
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
{/if}

<style>
	.onboarding-shell {
		background:
			radial-gradient(circle at 14% 12%, rgba(250, 204, 21, 0.2), transparent 34%),
			radial-gradient(circle at 80% 18%, rgba(232, 121, 249, 0.26), transparent 38%),
			linear-gradient(145deg, #140020 0%, #23043e 48%, #18012a 100%);
	}

	.onboarding-glow {
		position: absolute;
		width: 21rem;
		height: 21rem;
		border-radius: 9999px;
		filter: blur(54px);
		opacity: 0.25;
	}

	.onboarding-glow-top {
		top: -6rem;
		right: -5rem;
		background: #facc15;
	}

	.onboarding-glow-bottom {
		bottom: -8rem;
		left: -4rem;
		background: #a855f7;
	}

	.onboarding-cta {
		border: 1px solid rgba(250, 204, 21, 0.48);
		background: linear-gradient(115deg, rgba(147, 51, 234, 0.95), rgba(126, 34, 206, 0.9));
		color: #fef3c7;
		box-shadow: 0 8px 30px rgba(15, 23, 42, 0.4);
	}

	.onboarding-cta:hover {
		background: linear-gradient(115deg, rgba(168, 85, 247, 0.97), rgba(147, 51, 234, 0.94));
		color: #fef08a;
	}
</style>
