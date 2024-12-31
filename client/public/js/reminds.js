// Init variables
let currentTag;
let currentID;
let currentDate
let currentRepeat

// Main buttons
const currentRemindsButton = document.getElementsByName("current-reminds")[0];
const pinnedRemindsButton = document.getElementsByName("pinned-reminds")[0];
const allRemindsButton = document.getElementsByName("all-reminds")[0];

// Form for current and pinned
const currentAndPinForm = document.getElementsByName("current-pinned")[0];

// Form for all
const allForm = document.getElementsByName("all")[0];

// Form to edit
const editForm = document.getElementsByName("edit")[0];

// Form to read 
const readForm = document.getElementsByName("read")[0];
const showDataMessage = document.getElementsByName("data")[0];

document.addEventListener('DOMContentLoaded', async () => {

	const markdownElement = document.getElementById('markdown');
	if (markdownElement) {
		window.easyMDE = new EasyMDE({
			element: markdownElement,
		});
		// Start in preview mode for the first editor
		window.easyMDE.togglePreview();
	};

	// hide all forms initially
	hideAllForms();

	// Add click event listeners for buttons
	currentRemindsButton.addEventListener('click', async (event) => {
		event.preventDefault();
		hideAllForms();
		currentAndPinForm.style.display = "block";
		const currentReminds = await getCurrentReminds();
		await feedTableCurrentAndPin(currentReminds);


	});

	pinnedRemindsButton.addEventListener('click', (event) => {
		event.preventDefault();
		hideAllForms();
		currentAndPinForm.style.display = "block";
	});

	allRemindsButton.addEventListener('click', (event) => {
		event.preventDefault();
		hideAllForms();
		allForm.style.display = "block";
	});


});

// Helper function to hide all forms
const hideAllForms = () => {
	currentAndPinForm.style.display = "none";
	allForm.style.display = "none";
	editForm.style.display = "none";
	readForm.style.display = "none";
}

// Function to get list of current remind
const getCurrentReminds = async () => {

	const url = `http://127.0.0.1:2323/reminds/current`;
	try {
		const response = await fetch(url);
		if (!response.ok) {
			throw new Error(`HTTP error ! Status: ${response.status} `)
		}
		const data = await response.json();
		return data
	} catch (error) {
		console.error('Error fetching tag list:', error);
		return null;
	}
}


// Function to get tag with message Id
const getTagFromID = async (ID) => {

	const url = `http://127.0.0.1:2323/entries/tag?id=${ID}`;
	try {
		const response = await fetch(url);
		if (!response.ok) {
			throw new Error(`HTTP error ! Status: ${response.status} `)
		}
		const data = await response.json();
		return data.tag;
	} catch (error) {
		console.error('Error fetching tag list:', error);
		return null;
	}


}

// Function to feed table for current tag
const feedTableCurrentAndPin = async (data) => {
	const tableBody = document.querySelector('form[name="current-pinned"] tbody');
	const firstRow = tableBody.querySelector('tr'); // Keep the first row as template

	// Reset table: Remove all rows except the first one
	while (tableBody.children.length > 1) {
		tableBody.removeChild(tableBody.lastChild);
	}

	// Reset the first row inputs
	const inputs = firstRow.querySelectorAll('input');
	inputs.forEach(input => {
		input.value = '';
		input.disabled = true; // Disable the input fields
	});
	const button = firstRow.querySelector('button');
	button.disabled = true; // Disable the button

	// If data is empty, stop here
	if (!data || data.length === 0) {
		firstRow.style.display = ''; // Ensure the first row is visible
		return;
	}

	// Populate table with data
	for (let i = 0; i < data.length; i++) {
		const { entry_id, remind_date, remind_title, repeat } = data[i];

		// Clone the first row if not the first iteration
		const row = i === 0 ? firstRow : firstRow.cloneNode(true);
		const inputs = row.querySelectorAll('input');

		// Populate row with data
		const formattedDate = remind_date.split('T')[0]; // Format date to yyyy-mm-dd
		const tag = await getTagFromID(entry_id);
		inputs[0].value = tag; // Get and set tag
		inputs[1].value = entry_id; // Message ID
		inputs[2].value = remind_title; // Title
		inputs[3].value = formattedDate; // Date
		inputs[4].value = repeat; // Repeat

		// Disable all inputs in the row
		inputs.forEach(input => input.disabled = true);

		// Enable the button and add event listener
		const button = row.querySelector('button');
		button.disabled = false;
		button.addEventListener('click', async (event) => {
			event.preventDefault();
			currentID = entry_id;
			currentTag = tag;
			currentDate = formattedDate;
			currentRepeat = repeat;
			const fullDataMessage = await getMessageFromID();
			hideAllForms();
			readForm.style.display = "block";
			await dataMessage(fullDataMessage);
		});

		// Append the row if it's a new one
		if (i > 0) {
			tableBody.appendChild(row);
		}
	}

	// Ensure the first row is visible
	firstRow.style.display = '';
};

// get message from ID
const getMessageFromID = async () => {

	const id_string = encodeURIComponent(currentID);

	try {
		const url = `http://127.0.0.1:2323/entries/messages/message?id=${id_string}`;
		const response = await fetch(url)

		if (!response.ok) {
			throw new Error(`HTTP error! Status: ${response.status}`);
		}

		const result = await response.json();
		return result

	} catch (error) {
		console.error('Error getting message with ID:', error);
		alert("Error message with ID");
	}


}

// Function to show data message ;
const dataMessage = async (data) => {

	const city = data.city;
	const country = data.country;
	const date = getDateTime(data.date);
	const id = data.entryID
	const message = data.message

	await showMessage(message);

	showDataMessage.innerHTML = `<strong> Entry_ID: </strong> ${id} <br><strong>Tag:</strong> ${currentTag} <br> <strong>City:</strong> ${city} <br> <strong>Country:</strong> ${country}<br> <strong>Date:</strong> ${date}`;
}

// Function to show message
const showMessage = async (message) => {

	if (window.easyMDE) {
		try {
			if (message) {
				let markdownContent;
				try {
					// Try to parse the message as JSON
					const parsedData = JSON.parse(message);
					// Convert parsed JSON to Markdown (assuming 'text' is the key for Markdown content)
					markdownContent = parsedData.text || message;
				} catch (error) {
					// If parsing fails, treat the message as plain text (assuming it's already Markdown)
					markdownContent = message;
				}
				// Set the Markdown content in EasyMDE
				window.easyMDE.value(markdownContent);
			} else {
				console.log('No message content to display.');
				window.easyMDE.clearAutosavedValue(); // Clears any autosaved value
				window.easyMDE.value(''); // Clears the editor
			}
		} catch (error) {
			console.error('Error rendering message in EasyMDE:', error);
		}
	} else {
		console.error('EasyMDE instance not found.');
	}

}

// Get date time in the good format 
const getDateTime = (isoString) => {
	const dateObject = new Date(isoString);
	const date = dateObject.toISOString().split('T')[0];
	const time = dateObject.toTimeString().split(' ')[0];
	return `${date} ${time}`;
}
