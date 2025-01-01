
let lastDate;


document.addEventListener('DOMContentLoaded', async () => {

	// Get elements:
	const currentChapterForm = document.forms["current-chapter"];
	const previousChaptersForm = document.forms["previous-chapters"];
	const newChapterForm = document.forms["new-chapter"];

	// disabled input 
	currentChapterForm.elements['chapter-name'].disabled = true;
	currentChapterForm.elements['opened'].disabled = true;
	currentChapterForm.elements['entries'].disabled = true;
	for (let i = 0; i < previousChaptersForm.elements.length; i++) {
		previousChaptersForm.elements[i].disabled = true;
	};

	// get and display data
	await getAndDisplayData();


	// Check if it is the first chapter an allow create a the first chapter or the next one year after 
	const isFirst = await isFirstChapter();
	if (isFirst) {
		newChapterForm.elements['new-title'].disabled = true;
		newChapterForm.addEventListener('submit', async (event) => {
			event.preventDefault();
			try {
				await firstChapter(); // Wait for the function to complete
				alert(' Your first chapter is created !')
				await getAndDisplayData();
				newChapterForm.elements['new'].disabled = true;
			} catch (error) {
				console.log('Error creating first chapter:', error);
			}
		});
	} else {
		newChapterForm.addEventListener('submit', async (event) => {
			event.preventDefault();
			const title = newChapterForm.elements['new-title'].value
			if (title === "") {
				alert('Title for the previous chapter is needed !')
			} else {
				await newChapter(title);
			}

		});
	}

	// show all number entries:
	const countEntriesElement = document.querySelector('section[name="count-all-section"] p[name="count-all"]');
	const entriesNb = await getEntriesNB();
	countEntriesElement.innerHTML = `<strong>Total Entries: </strong> ${entriesNb}`;
});

// create a new chapter 
const newChapter = async (title) => {

	const check = isNewChapterAllow(lastDate);
	if (check === true) {


		const title_string = encodeURIComponent(title);

		try {
			const url = `http://127.0.0.1:2323/chapters/new?title=${title_string}`;
			const response = await fetch(url)

			if (!response.ok) {
				throw new Error(`HTTP error! Status: ${response.status}`);
			}

			const result = await response.json();
			console.log('New chapter created:', result);

			alert('New chapter created !')
			location.reload();

		} catch (error) {
			console.error('Error creating new chapter:', error);
		}
	} else {
		alert('Only one chapter can be opened each year.');
	}
};

// Check if it is the first chapter
const isFirstChapter = async () => {
	try {
		const url = `http://127.0.0.1:2323/chapters/first`;
		const response = await fetch(url);

		if (!response.ok) {
		}

		const data = await response.json();
		return data.message === 'is first chapter';

	} catch (error) {
		return false;  // Consider returning false in case of error
	}
};

// Handle the first chapter submission
const firstChapter = async () => {
	try {
		const url = `http://127.0.0.1:2323/chapters/new`;
		const response = await fetch(url)

		if (!response.ok) {

		}

		const result = await response.json();
		console.log('First chapter created:', result);

	} catch (error) {
		console.error('Error creating first chapter:', error);
	}
};


// get data from server : 
const getData = async () => {
	const url = `http://127.0.0.1:2323/chapters/list`;

	try {
		const response = await fetch(url);
		if (!response.ok) {
			throw new Error(`HTTP error! Status: ${response.status}`);
		}
		const data = await response.json();
		return data; // Optional: if you want to return data from this function
	} catch (error) {
	}
};


// Helper function to format date (YYYY-MM-DD)
const formatDate = (dateString) => {
	const date = new Date(dateString);
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
	const day = String(date.getDate()).padStart(2, '0');
	return `${year}-${month}-${day}`;
};

// Display current chapter
const currentChapter = async (data) => {
	if (!data || !Array.isArray(data)) {
		return;
	}

	const currentChapterData = data.find(item => item.title === null);

	if (currentChapterData) {

		const chapterNameInput = document.querySelector('form[name="current-chapter"] input[name="chapter-name"]');
		const openedInput = document.querySelector('form[name="current-chapter"] input[name="opened"]');
		const entriesInput = document.querySelector('form[name="current-chapter"] input[name="entries"]');

		const entriesValue = await getEntriesNB(currentChapterData.chapter_name);

		lastDate = formatDate(currentChapterData.opened);

		chapterNameInput.value = currentChapterData.chapter_name;
		openedInput.value = lastDate
		entriesInput.value = entriesValue;

	} else {
		return
	}
};

// Display list of previous chapters
const listChapter = async (data) => {
	if (!data || !Array.isArray(data)) {
		return;
	}
	const tbody = document.querySelector('form[name="previous-chapters"] tbody');
	tbody.innerHTML = '';
	for (let item of data) {
		if (item.title !== null) {
			const row = document.createElement('tr');
			const entries = await getEntriesNB(item.chapter_name);
			row.innerHTML = `
                <td><input type="text" name="chapter-name-list" value="${item.chapter_name}" disabled></td>
                <td><input type="text" name="title-list" value="${item.title}" disabled></td>
                <td><input type="text" name="entries-list" value="${entries}" disabled></td>
                <td><input type="text" name="opened-list" value="${formatDate(item.opened)}" disabled></td>
            `;
			tbody.appendChild(row);
		}
	}
};

const getAndDisplayData = async () => {
	const data = await getData();
	await currentChapter(data);
	await listChapter(data);
};

// get entires number :

const getEntriesNB = async (chapterName = "") => {

	const chapterNameString = encodeURIComponent(chapterName);

	const url = `http://127.0.0.1:2323/entries/count?name=${chapterNameString}`;

	try {
		const response = await fetch(url);
		if (!response.ok) {
			throw new Error(`HTTP error! Status: ${response.status}`);
		}
		const data = await response.json();
		return data.count; // Return just the message
	} catch (error) {
		console.error('Error fetching last message:', error);
		return null; // Or handle the error as needed
	}
}

// check if new chapter all :

const isNewChapterAllow = (dateString) => {


	// Extract the year from the input date
	const inputYear = parseInt(dateString.split("-")[0], 10);

	// Get the current year
	const currentYear = new Date().getFullYear();

	// Compare the years
	return inputYear !== currentYear;
}