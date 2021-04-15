export function getApiURL() {
	if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" || window.location.hostname === "") {
		return "http://127.0.0.1:5000/";
	}
	if (window.location.hostname.includes("test")) {
		return "https://api.test-db.cy.lu/";
	}
	return "https://api.db.cy.lu/";
}

export function getCookieOptions() {
	if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" || window.location.hostname === "") {
		// return { domain: ".localhost" };
		return { domain: "localhost" };
	}
	if (window.location.hostname.includes("test")) {
		// return { secure: true, domain: ".cy.lu", httpOnly: true };
		return { secure: true, domain: ".cy.lu" };
	}
	// return { secure: true, domain: ".cy.lu", httpOnly: true };
	return { secure: true, domain: ".cybersecurity-luxembourg.com" };
}

export function isInternetExplorer() {
	const ua = window.navigator.userAgent;
	const msie = ua.indexOf("MSIE ");

	return msie > 0 || !!navigator.userAgent.match(/Trident.*rv:11\./);
}
