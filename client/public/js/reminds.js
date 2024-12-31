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
const saveUpdateButton = document.getElementsByName("save-edit")[0];

// Form to edit
const editForm = document.getElementsByName("edit")[0];

// Form to read 
const readForm = document.getElementsByName("read")[0];
const showDataMessage = document.getElementsByName("data")[0];
const signMessageButton = document.getElementsByName("valid-message")[0];

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

	currentRemindsButton.addEventListener('click', async (event) => {
		event.preventDefault();
		hideAllForms();
		currentAndPinForm.style.display = "block";
		const currentReminds = await getCurrentReminds();
		await feedTableCurrentAndPin(currentReminds);

	});

	pinnedRemindsButton.addEventListener('click', async (event) => {
		event.preventDefault();
		hideAllForms();
		currentAndPinForm.style.display = "block";
		const pinnedReminds = await getPinnedReminds();
		await feedTableCurrentAndPin(pinnedReminds);
	});

	allRemindsButton.addEventListener('click', async (event) => {
		event.preventDefault();
		hideAllForms();
		allForm.style.display = "block";
		const allReminds = await getAllReminds();
		await feedTableAll(allReminds);
	});

	signMessageButton.addEventListener('click', async (event) => {
		// Prevent default action of the button
		event.preventDefault();

		// Confirmation dialog
		const userConfirmed = window.confirm("Are you sure you want to proceed?");
		if (!userConfirmed) {
			// Stop further execution if the user cancels
			return;
		}

		// Proceed with the operation based on currentRepeat
		if (currentRepeat === 'pin') {
			hideAllForms();
			currentAndPinForm.style.display = "block";
		} else if (currentRepeat === 'unique') {
			await deleteRemind();
			const currentReminds = await getCurrentReminds();
			await feedTableCurrentAndPin(currentReminds);
			hideAllForms();
			currentAndPinForm.style.display = "block";
		} else {
			await updateDateRemind();
			const currentReminds = await getCurrentReminds();
			await feedTableCurrentAndPin(currentReminds);
			hideAllForms();
			currentAndPinForm.style.display = "block";
		}
	});

	saveUpdateButton.addEventListener('click', async (event) => {
		// Prevent default action of the button
		event.preventDefault();

		const fullData = await getDataToUpdate()
		const valid = fullData.valid;
		const updateData = fullData.body
		if (valid != false) {
			await sendDataToUpdate(updateData)
			const allReminds = await getAllReminds();
			await feedTableAll(allReminds);
			hideAllForms();
			allForm.style.display = "block";

		}
	})

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

// Delete remind 
const deleteRemind = async () => {
	let id = currentID

	try {
		const url = `http://127.0.0.1:2323/reminds/delete?id=${id}`;
		const response = await fetch(url)

		if (!response.ok) {
			throw new Error(`HTTP error! Status: ${response.status}`);
		}

		const result = await response.json();
		alert("Remind deleted !")
	} catch (error) {
		console.error('Error getting message with ID:', error);
		alert("Error message with ID");
	}
};

// update date remind
const updateDateRemind = async () => {
	const repeat = currentRepeat;
	const date = currentDate; // in the form 'yyyy-mm-dd'

	// Parse the date
	const parsedDate = new Date(date);
	let newDate = '';

	if (repeat === 'daily') {
		parsedDate.setDate(parsedDate.getDate() + 1); // Add 1 day
		newDate = parsedDate.toISOString().split('T')[0]; // Format back to 'yyyy-mm-dd'
	} else if (repeat === 'weekly') {
		parsedDate.setDate(parsedDate.getDate() + 7); // Add 7 days
		newDate = parsedDate.toISOString().split('T')[0];
	} else if (repeat === 'monthly') {
		parsedDate.setMonth(parsedDate.getMonth() + 1); // Add 1 month
		newDate = parsedDate.toISOString().split('T')[0];
	} else if (repeat === 'yearly') {
		parsedDate.setFullYear(parsedDate.getFullYear() + 1); // Add 1 year
		newDate = parsedDate.toISOString().split('T')[0];
	} else {
		throw new Error('Invalid repeat value');
	};

	try {
		const url = `http://127.0.0.1:2323/reminds/update/date?date=${newDate}&id=${currentID}`;
		const response = await fetch(url)

		if (!response.ok) {
			throw new Error(`HTTP error! Status: ${response.status}`);
		}

		const result = await response.json();
		alert(`Good job Samurai ! Remind updated ! New Date : ${newDate}`);
	} catch (error) {
		console.error('Error getting message with ID:', error);
		alert("Error message with ID");
	}


};

// Function to get pinned reminds
const getPinnedReminds = async () => {

	const url = `http://127.0.0.1:2323/reminds/pinned`;
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

// Function to get all reminds
const getAllReminds = async () => {

	const url = `http://127.0.0.1:2323/reminds/all`;
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

// Function to feed table for all reminds
const feedTableAll = async (data) => {
	const tableBody = document.querySelector('form[name="all"] tbody');
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
	const buttons = firstRow.querySelectorAll('button');
	buttons.forEach(button => button.disabled = true); // Disable the buttons

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
		const tag = await getTagFromID(entry_id); // Get the tag using entry_id

		inputs[0].value = tag; // Set tag
		inputs[1].value = entry_id; // Set Message ID
		inputs[2].value = remind_title; // Set title
		inputs[3].value = formattedDate; // Set date-remind
		inputs[4].value = repeat; // Set repeat

		// Disable all inputs in the row
		inputs.forEach(input => input.disabled = true);

		// Enable the buttons and add event listeners
		const updateButton = row.querySelector('button[name="edit-remind"]');
		const deleteButton = row.querySelector('button[name="delete-remind"]');

		updateButton.disabled = false;
		deleteButton.disabled = false;

		// Event listener for update button
		updateButton.addEventListener('click', async (event) => {
			event.preventDefault();
			const updatedData = {
				entry_id: inputs[1].value, // Message ID
				tag: inputs[0].value, // Tag
				title: inputs[2].value, // Title
				date_remind: inputs[3].value, // Date Remind
				repeat: inputs[4].value, // Repeat
			};
			hideAllForms();
			editForm.style.display = "block";
			await feedUpdateForm(updatedData)

		});

		// Event listener for delete button
		deleteButton.addEventListener('click', async (event) => {
			event.preventDefault();
			const entryId = inputs[1].value; // Message ID
			currentID = entryId;
			await deleteRemind();
			const allReminds = await getAllReminds();
			await feedTableAll(allReminds);


		});

		// Append the row if it's a new one
		if (i > 0) {
			tableBody.appendChild(row);
		}
	}

	// Ensure the first row is visible
	firstRow.style.display = '';
};

// Feed update form
const feedUpdateForm = async (data) => {
	const editForm = document.querySelector('form[name="edit"]');

	// Populate the form fields with the data
	const titleInput = editForm.querySelector('input[name="title"]');
	const messageIdInput = editForm.querySelector('input[name="message-id"]');
	const dateRemindInput = editForm.querySelector('input[name="date-remind"]');
	const repeatSelect = editForm.querySelector('select[name="repeat"]');

	titleInput.value = data.title; // Set the title
	messageIdInput.value = data.entry_id; // Set the message-id
	dateRemindInput.value = data.date_remind; // Set the date-remind

	// Set the selected option for repeat
	repeatSelect.value = data.repeat;

	// Disable the message-id input
	messageIdInput.disabled = true;

	// Show the edit form (if hidden)
	editForm.style.display = "block";
};

// Function to get data to update
const getDataToUpdate = async () => {
	let valid = true;

	const form = document.forms['edit']; // Get the form by name
	const title = form['title'].value.trim(); // Get the title input
	const messageId = form['message-id'].value.trim(); // Get the message-id input
	const dateRemind = form['date-remind'].value.trim(); // Get the date-remind input
	const repeat = form['repeat'].value; // Get the selected repeat value

	// Check for empty inputs and invalid date
	const errors = [];
	if (!title) errors.push('Title cannot be empty.');
	if (!messageId) errors.push('Message ID cannot be empty.');
	if (!dateRemind) {
		errors.push('Date-remind cannot be empty.');
	} else {
		const today = new Date();
		const selectedDate = new Date(dateRemind);

		// Format today's date to compare properly (YYYY-MM-DD)
		const todayFormatted = today.toISOString().split('T')[0];

		// Check if the selected date is in the past
		if (selectedDate < today.setHours(0, 0, 0, 0)) {
			errors.push('Date-remind cannot be in the past.');
		}

		// Check if repeat is "pin" and dateRemind is not today's date
		if (repeat === 'pin' && dateRemind !== todayFormatted) {
			errors.push('Date-remind must be today\'s date when repeat is set to "pin".');
		}
	}

	// Display alerts for errors
	if (errors.length > 0) {
		alert(errors.join('\n'));
		valid = false;
	}

	// Prepare data for JSON POST request
	const data = {
		title,
		message_id: messageId, // Use snake_case for JSON formatting if needed
		date_remind: dateRemind,
		repeat
	};

	const body = JSON.stringify(data); // Return JSON-formatted string

	return { valid, body };
};



// Function to send data to update
const sendDataToUpdate = async (data) => {

	const url = `http://127.0.0.1:2323/reminds/update`


	const reqOptions = {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: data,
	};

	try {
		const response = await fetch(url, reqOptions);
		if (!response.ok) {
			throw new Error('Network response was not ok');
		}
		const data = await response.json();
		alert("Remind updated !");
	} catch (error) {
		console.error('Error fetching data:', error);
	}


}