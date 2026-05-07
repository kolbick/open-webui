<script lang="ts">
	import { getBrowserArtifactUrl, type BrowserArtifactFile } from '$lib/utils/browserArtifacts';
	import AgentBrowserShell from '../AgentBrowserShell.svelte';

	export let file: BrowserArtifactFile;

	$: title = file?.title || file?.name || 'Live browser';
	$: url = getBrowserArtifactUrl(file);
</script>

<div class="my-3 h-[560px] min-h-[380px] w-full">
	<AgentBrowserShell browserUrl={url} showAgentControls={false} />
</div>

<a class="sr-only" href={url} target="_blank" rel="noreferrer">{title}</a>
