export const DEFAULT_BROWSER_ARTIFACT_URL =
	'/browser/vnc.html?autoconnect=1&resize=remote&path=browser/websockify#password=zL6qUhJBCVoqS9w44Goo3qjW';

export type BrowserArtifactFile = {
	type?: string;
	artifact_type?: string;
	artifactType?: string;
	url?: string;
	name?: string;
	title?: string;
};

export const getDefaultBrowserArtifactUrl = () => DEFAULT_BROWSER_ARTIFACT_URL;

export const isBrowserArtifact = (file: unknown): file is BrowserArtifactFile => {
	if (!file || typeof file !== 'object') {
		return false;
	}

	const item = file as BrowserArtifactFile;
	return (
		item.type === 'browser' ||
		(item.type === 'artifact' && (item.artifact_type === 'browser' || item.artifactType === 'browser'))
	);
};

export const getBrowserArtifactUrl = (file?: BrowserArtifactFile) => {
	return file?.url || DEFAULT_BROWSER_ARTIFACT_URL;
};

export const getBrowserArtifacts = (files: unknown[] = []) => {
	return files.filter(isBrowserArtifact);
};

export const createBrowserArtifactFile = (): BrowserArtifactFile => ({
	type: 'browser',
	name: 'Live browser',
	title: 'Live browser',
	url: DEFAULT_BROWSER_ARTIFACT_URL
});
