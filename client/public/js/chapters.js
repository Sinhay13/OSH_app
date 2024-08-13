document.addEventListener('DOMContentLoaded', async () => {

	try {
		// Get elements:
		const currentChapterInputs = document.querySelectorAll('form[name="current-chapter"] input');
		const previousChaptersInputs = document.querySelectorAll('form[name="previous-chapters"] input');
		const newChapterForm = document.querySelector('form[name="new-chapter"]');

		// Check if it is the first chapter
		const isFirst = await isFirstChapter();
		if (isFirst) {
			const currentChapterForm = document.querySelector('form[name="current-chapter"]');
			currentChapterForm.addEventListener('submit', async (event) => {
				event.preventDefault();
				try {
					await firstChapter(); // Wait for the function to complete
					currentChapterInputs.forEach(input => input.disabled = true); // Disable all inputs after submission
				} catch (error) {
					console.log('Error creating first chapter:', error);
				}
			});
		}

		// Apply changes based on the `isFirst` value
		currentChapterInputs.forEach(input => {
			if (input.type === 'submit') {
				input.disabled = !isFirst;
			} else if (input.type === 'text') {
				input.disabled = true;
			}
		});

	} catch (error) {
		console.error('Error in DOMContentLoaded handler:', error);
	}
});


// Check if it is the first chapter
const isFirstChapter = async () => {
	try {
		const url = `http://127.0.0.1:2323/chapters/first`;
		const response = await fetch(url);

		if (!response.ok) {
			throw new Error(`HTTP error! Status: ${response.status}`);
		}

		const data = await response.json();
		return data.message === 'is first chapter';

	} catch (error) {
		console.error('Fetch error:', error);
		return false;  // Consider returning false in case of error
	}
};

// Handle the first chapter submission
const firstChapter = async () => {
	try {
		const url = `http://127.0.0.1:2323/chapters/new`;
		const response = await fetch(url)

		if (!response.ok) {
			throw new Error(`HTTP error! Status: ${response.status}`);
		}

		const result = await response.json();
		console.log('First chapter created:', result);

	} catch (error) {
		console.error('Error creating first chapter:', error);
	}
};

const isOneYearAgo = () => {
	pass;
};

const NewChapter = (title) => {
	pass;
};

const getData = () => {
	pass;
};

const currentChapter = (data) => {
	pass;
};

const listChapter = (data) => {
	pass;
};









