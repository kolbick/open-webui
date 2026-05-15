import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
	createBrowserArtifactFile,
	getBrowserArtifacts,
	getDefaultBrowserArtifactUrl,
	isBrowserArtifact
} from './browserArtifacts.ts';

describe('browser artifact files', () => {
	it('detects explicit browser file entries', () => {
		assert.equal(isBrowserArtifact({ type: 'browser', url: '/browser/vnc.html' }), true);
	});

	it('detects artifact file entries marked as browser artifacts', () => {
		assert.equal(isBrowserArtifact({ type: 'artifact', artifact_type: 'browser' }), true);
	});

	it('filters non-browser files out of mixed message files', () => {
		const artifacts = getBrowserArtifacts([
			{ type: 'image', url: '/image.png' },
			{ type: 'browser', url: '/browser/vnc.html' }
		]);

		assert.deepEqual(artifacts, [{ type: 'browser', url: '/browser/vnc.html' }]);
	});

	it('uses the routed noVNC viewer by default', () => {
		assert.equal(
			getDefaultBrowserArtifactUrl(),
			'/browser/vnc.html?autoconnect=1&resize=scale&reconnect=1&reconnect_delay=1000&path=browser/websockify#password=zL6qUhJBCVoqS9w44Goo3qjW'
		);
	});

	it('creates the browser artifact file used by the chat button', () => {
		assert.deepEqual(createBrowserArtifactFile(), {
			type: 'browser',
			name: 'Live browser',
			title: 'Live browser',
			url: '/browser/vnc.html?autoconnect=1&resize=scale&reconnect=1&reconnect_delay=1000&path=browser/websockify#password=zL6qUhJBCVoqS9w44Goo3qjW'
		});
	});
});
