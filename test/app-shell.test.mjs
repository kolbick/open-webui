import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import test from 'node:test';

test('app shell loads the ElevenLabs conversation widget globally', () => {
	const appHtml = readFileSync(resolve(process.cwd(), 'src/app.html'), 'utf8');

	assert.match(
		appHtml,
		/<elevenlabs-convai agent-id="agent_8101kqz68d97f2zb3tde4w45g4qx"><\/elevenlabs-convai>/
	);
	assert.match(
		appHtml,
		/<script src="https:\/\/unpkg\.com\/@elevenlabs\/convai-widget-embed" async type="text\/javascript"><\/script>/
	);
});
