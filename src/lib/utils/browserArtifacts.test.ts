import { describe, expect, it } from 'vitest';

import {
	createBrowserArtifactFile,
	getBrowserArtifacts,
	getDefaultBrowserArtifactUrl,
	isBrowserArtifact
} from './browserArtifacts';

describe('browser artifact files', () => {
	it('detects explicit browser file entries', () => {
		expect(isBrowserArtifact({ type: 'browser', url: '/browser/vnc.html' })).toBe(true);
	});

	it('detects artifact file entries marked as browser artifacts', () => {
		expect(isBrowserArtifact({ type: 'artifact', artifact_type: 'browser' })).toBe(true);
	});

	it('filters non-browser files out of mixed message files', () => {
		const artifacts = getBrowserArtifacts([
			{ type: 'image', url: '/image.png' },
			{ type: 'browser', url: '/browser/vnc.html' }
		]);

		expect(artifacts).toEqual([{ type: 'browser', url: '/browser/vnc.html' }]);
	});

	it('uses the routed noVNC viewer by default', () => {
		expect(getDefaultBrowserArtifactUrl()).toBe(
			'/browser/vnc.html?autoconnect=1&resize=remote&path=browser/websockify#password=zL6qUhJBCVoqS9w44Goo3qjW'
		);
	});

	it('creates the browser artifact file used by the chat button', () => {
		expect(createBrowserArtifactFile()).toEqual({
			type: 'browser',
			name: 'Live browser',
			title: 'Live browser',
			url: '/browser/vnc.html?autoconnect=1&resize=remote&path=browser/websockify#password=zL6qUhJBCVoqS9w44Goo3qjW'
		});
	});
});
