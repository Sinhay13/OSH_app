document.addEventListener('DOMContentLoaded', () => {
	newChapterButton();
})


// Control of the button New Chapter
const newChapterButton = () => {
	const button = document.querySelector('button[name="new-chapter"]');
	let url = 'http://127.0.0.1:2323/chapters/year';

	fetch(url)
		.then(response => {
			if (!response.ok) {
				// Disable the button if the response is not OK
				button.disabled = true;
				throw new Error('Network response was not ok.');
			}
			return response.json();
		})
		.then(data => {
			// Process the data as needed
			console.log('Data:', data);
			// Re-enable the button after processing the data
			button.disabled = false;
		})
		.catch(error => {
			console.error('Fetch error:', error);
			// Ensure the button is enabled if there's an error
			if (button) button.disabled = false;
		});
};