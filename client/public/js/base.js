document.addEventListener('DOMContentLoaded', () => {
	// Function to handle navigation
	function navigateTo(path) {
		window.location.href = path;
	}

	// Attach event listeners to buttons
	document.querySelector('button[name="chapters"]').addEventListener('click', () => navigateTo('/'));
	document.querySelector('button[name="new-entry"]').addEventListener('click', () => navigateTo('/new-entry'));
	document.querySelector('button[name="search"]').addEventListener('click', () => navigateTo('/search'));
	document.querySelector('button[name="tags"]').addEventListener('click', () => navigateTo('/tags'));
	document.querySelector('button[name="reminds"]').addEventListener('click', () => navigateTo('/reminds'));
	document.querySelector('button[name="system"]').addEventListener('click', () => navigateTo('/system'));
});