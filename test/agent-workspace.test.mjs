import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import test from 'node:test';

const workspacePath = resolve(process.cwd(), 'src/lib/components/chat/AgentWorkspace.svelte');
const chatPath = resolve(process.cwd(), 'src/lib/components/chat/Chat.svelte');
const artifactPath = resolve(process.cwd(), 'src/lib/components/chat/Messages/BrowserArtifact.svelte');

test('agent workspace component exposes browser, steps, and terminal tabs', () => {
	assert.equal(existsSync(workspacePath), true, 'AgentWorkspace.svelte should exist');

	const source = readFileSync(workspacePath, 'utf8');

	assert.match(source, /type WorkspaceTab = 'browser' \| 'steps' \| 'terminal'/);
	assert.match(source, /label: 'Browser'/);
	assert.match(source, /label: 'Steps'/);
	assert.match(source, /label: 'Terminal'/);
	assert.match(source, /requestFullscreen/);
	assert.match(source, /reloadBrowser/);
});

test('agent workspace mounts the real interactive terminal', () => {
	const source = readFileSync(workspacePath, 'utf8');

	assert.match(source, /import XTerminal from '\.\/XTerminal\.svelte';/);
	assert.match(source, /export let chatId: string \| null = null;/);
	assert.match(source, /let terminalConnected = false;/);
	assert.match(source, /let terminalConnecting = false;/);
	assert.match(source, /<XTerminal/);
	assert.match(source, /bind:connected={terminalConnected}/);
	assert.match(source, /bind:connecting={terminalConnecting}/);
	assert.match(source, /{chatId}/);
});

test('agent workspace uses smoother animated panel treatments', () => {
	const source = readFileSync(workspacePath, 'utf8');

	assert.match(source, /transition-all/);
	assert.match(source, /duration-200/);
	assert.match(source, /backdrop-blur/);
	assert.match(source, /animate-pulse/);
	assert.match(source, /shadow-\[0_18px_60px/);
});

test('chat mounts the dockable agent workspace and uses the shared browser URL helper', () => {
	const source = readFileSync(chatPath, 'utf8');

	assert.match(source, /import AgentWorkspace from '\.\/AgentWorkspace\.svelte';/);
	assert.match(source, /getDefaultBrowserArtifactUrl/);
	assert.match(source, /agentWorkspaceOpen/);
	assert.match(source, /<AgentWorkspace/);
	assert.match(source, /chatId={\$chatId}/);
});

test('inline browser artifact keeps fullscreen and external-open fallback controls', () => {
	const source = readFileSync(artifactPath, 'utf8');

	assert.match(source, /requestFullscreen/);
	assert.match(source, /target="_blank"/);
	assert.match(source, /getBrowserArtifactUrl/);
});
