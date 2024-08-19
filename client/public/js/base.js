document.addEventListener('DOMContentLoaded', () => {


	// Function to handle navigation
	function navigateTo(path) {
		window.location.href = path;
	}

	// Attach event listeners to buttons
	document.querySelector('button[name="chapters"]').addEventListener('click', () => navigateTo('/chapters'));
	document.querySelector('button[name="entries"]').addEventListener('click', () => navigateTo('/entries'));
	document.querySelector('button[name="tags"]').addEventListener('click', () => navigateTo('/tags'));
	document.querySelector('button[name="reminds"]').addEventListener('click', () => navigateTo('/reminds'));
	document.querySelector('button[name="system"]').addEventListener('click', () => navigateTo('/system'));
});