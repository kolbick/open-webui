export const getAgentWebUiUrl = () => {
	if (typeof window === 'undefined') {
		return 'http://localhost:7788';
	}

	const { protocol, hostname, port } = window.location;

	if (hostname === 'localhost' || hostname === '127.0.0.1') {
		return port === '3000' ? 'http://localhost:7789' : 'http://localhost:7788';
	}

	const rootHost = hostname.replace(/^www\./, '');
	return `${protocol}//agent.${rootHost}`;
};

export const openAgentWebUi = () => {
	const url = getAgentWebUiUrl();
	window.open(url, '_blank', 'noopener,noreferrer');
};
