
document.addEventListener('DOMContentLoaded', async () => {

	// init variables
	let tag;
	let tags;
	let city;
	let country;
	let message;
	let date;
	let lastMessage;
	let oldDate;
	let oldCountry;
	let oldCity;
	let lastDate;
	let lastCity;
	let lastCountry;
	let oldEntryID;
	let lastEntryID;

	// hide forms 
	document.forms["city-country-form"].style.display = "none";
	document.forms["message-form"].style.display = "none";
	document.forms["date-form"].style.display = "none";

	//buttons and elements 
	const validMessageButton = document.querySelector('form[name="message-form"] input[name="valid-message"]');
	const previousButton = document.querySelector('button[name="previous"]');
	const nextButton = document.querySelector('button[name="next"]');
	const readButton = document.querySelector('button[name="clear-text"]');
	const timeNowButton = document.querySelector('input[name="time-now"]');
	const messageDateInput = document.querySelector('input[name="message-date"]');
	const previousDataElement = document.forms["message-form"].querySelector('p[name="previous-data"]');
	const tagCityCountryElement = document.forms["message-form"].querySelector('p[name="tag-city-country"]');

	//get tags list
	tags = await getTagList();

	//populate select tag
	await populateTagSelect(tags);

	// Add event listener for the "submit" event on the tag form
	document.forms["tag-form"].addEventListener("submit", async function (event) {
		event.preventDefault(); // Prevent the default form submission

		// get tag from form and add it if necessary
		tag = await getTagForm(tags);

		// Show the next form, for example the "city-country-form"
		document.forms["city-country-form"].style.display = "block";

		// Hide the tag form
		document.forms["tag-form"].style.display = "none";

	});

	// Add event listener for the "submit" event on the city / country form 
	document.forms["city-country-form"].addEventListener("submit", async function (event) {
		event.preventDefault(); // Prevent the default form submission

		// get city and country from form
		const formData = await getCityCountryForm();
		city = formData.city;
		country = formData.country;

		// Hide the city-country-form and show the message-form
		document.forms["city-country-form"].style.display = "none";
		document.forms["message-form"].style.display = "block";
		validMessageButton.style.display = "none";

		// get the last message
		const dataMessage = await getLastMessage(tag);
		lastMessage = dataMessage.message;
		oldDate = dataMessage.date;
		oldCity = dataMessage.city;
		oldCountry = dataMessage.country;
		oldEntryID = dataMessage.entryID;

		// save last date, city, country
		lastDate = formatDate(oldDate);
		lastCity = oldCountry;
		lastCountry = oldCountry;
		lastEntryID = oldEntryID;

		//Show last message 
		await showLastMessage(lastMessage);

		// Update the <p> element inside message-form with the selected tag, city, and country
		tagCityCountryElement.innerHTML = `<strong>Tag:</strong> ${tag} <br> <strong>New City:</strong> ${city} <br> <strong>New Country:</strong> ${country}`;

		// Update the <p> element inside message-form with the selected tag, previous date
		let newFormatDate = formatDate(oldDate);
		oldDate = newFormatDate;
		previousDataElement.innerHTML = `<strong>Last ID :</strong> ${lastEntryID} <br><strong>Last Date:</strong> ${lastDate} <br> <strong>Last City :</strong> ${lastCity} <br>  <strong>Last Country :</strong> ${lastCountry}`;
	});

	// previous message : 
	previousButton.addEventListener('click', async (event) => {

		event.preventDefault(); // Prevent the default form submission

		// get the last message
		const dataMessage2 = await getLastMessageWithDate(tag, oldDate, "previous");
		lastMessage = dataMessage2.message;
		if (lastMessage != "No message") {
			oldDate = dataMessage2.date;
			oldCity = dataMessage2.city;
			oldCountry = dataMessage2.country;
			oldEntryID = dataMessage2.entryID;

			//Show last message 
			await showLastMessage(lastMessage);

			let newFormatDate = formatDate(oldDate);
			oldDate = newFormatDate;
			previousDataElement.innerHTML = `<strong> ID :</strong> ${oldEntryID} <br><strong>Date:</strong> ${oldDate} <br> <strong>City :</strong> ${oldCity} <br> <strong>Country :</strong> ${oldCountry}`;
		} else {
			alert('No more previous message');
		}


	});

	// next message : 
	nextButton.addEventListener('click', async (event) => {

		event.preventDefault(); // Prevent the default form submission

		// get the last message
		const dataMessage3 = await getLastMessageWithDate(tag, oldDate, "next");
		lastMessage = dataMessage3.message;
		if (lastMessage != "No message") {
			oldDate = dataMessage3.date;
			oldCity = dataMessage3.city;
			oldCountry = dataMessage3.country;
			oldEntryID = dataMessage3.entryID;

			//Show last message 
			await showLastMessage(lastMessage);

			let newFormatDate = formatDate(oldDate);
			oldDate = newFormatDate;
			previousDataElement.innerHTML = `<strong> ID :</strong> ${oldEntryID} <br><strong>Date:</strong> ${oldDate} <br> <strong>City :</strong> ${oldCity} <br> <strong>Country :</strong> ${oldCountry}`;
		} else {
			alert('No more message');
		}

	});

	// clear text area
	readButton.addEventListener('click', async (event) => {

		previousDataElement.innerHTML = `<strong>Last ID :</strong> ${lastEntryID} <br><strong>Last Date:</strong> ${lastDate} <br> <strong>Last City :</strong> ${lastCity} <br>  <strong>Last Country :</strong> ${lastCountry}`;

		event.preventDefault(); // Prevent the default form submission

		await clearTextArea();

		readButton.style.display = "none";
		previousButton.style.display = "none";
		nextButton.style.display = "none";
		validMessageButton.style.display = "block";
	});

	// Get the message: 
	document.forms["message-form"].addEventListener("submit", async function (event) {
		event.preventDefault(); // Prevent the default form submission

		const formData2 = await getMessageForm();

		const isValid = formData2.isValid;
		message = formData2.message

		if (isValid) {
			// Only proceed if the message is valid
			document.forms["message-form"].style.display = "none";
			document.forms["date-form"].style.display = "block";
		} else {
			// Provide feedback to the user if the message is empty
			console.log("Message is empty, not proceeding to the next step.");
			// You may want to keep the form visible for correction
		}
	});
	// get time now and put it in the for
	timeNowButton.addEventListener('click', async () => {
		messageDateInput.value = await getTimeNow();
	});

	document.forms["date-form"].addEventListener("submit", async function (event) {

		event.preventDefault(); // Prevent the default form submission

		date = await getDateForm(messageDateInput);

		await sendNewMessage(tag, city, country, message, date);

	});

});

// To reset process 
const resetProcess = () => {
	// Reset the variables
	tag = '';
	tags = [];
	city = '';
	country = '';
	message = '';
	date = '';
	lastMessage = '';
	oldDate = '';
	oldCountry = '';
	oldCity = '';
	lastDate = '';
	lastCity = '';
	lastCountry = '';

	// Hide all forms
	document.forms["city-country-form"].style.display = "none";
	document.forms["message-form"].style.display = "none";
	document.forms["date-form"].style.display = "none";

	// Show the tag form
	document.forms["tag-form"].style.display = "block";

	// Clear previous data
	previousDataElement.innerHTML = '';
	tagCityCountryElement.innerHTML = '';

	// Reset button visibility
	readButton.style.display = "none";
	previousButton.style.display = "none";
	nextButton.style.display = "none";
	validMessageButton.style.display = "block";
};

// get tag list 
const getTagList = async () => {

	const url = `http://127.0.0.1:2323/tags/list/active`;

	try {
		const response = await fetch(url);
		if (!response.ok) {
			throw new Error(`HTTP error! Status: ${response.status}`);
		}
		const data = await response.json();
		return data;
	} catch (error) {

	}
};

// Function to populate the select tag
const populateTagSelect = async (tags) => {
	const selectTag = document.forms["tag-form"].elements["tag-list"];

	// Clear any existing options
	selectTag.innerHTML = '';

	if (tags && tags.length > 0) {
		// If tags are available, add each tag as an option
		tags.forEach(tagObj => {
			const option = document.createElement("option");
			option.value = tagObj.tag; // Using the tag name as the value
			option.textContent = tagObj.tag; // Displaying the tag name
			selectTag.appendChild(option);
		});

		// Add an "Other" option at the end
		const otherOption = document.createElement("option");
		otherOption.value = "other";
		otherOption.textContent = "Other";
		selectTag.appendChild(otherOption);

	} else {
		// If no tags are available, just add the "Other" option
		const otherOption = document.createElement("option");
		otherOption.value = "other";
		otherOption.textContent = "Other";
		selectTag.appendChild(otherOption);
	}
};

// get tag from form
const getTagForm = async (tags) => {
	const selectTag = document.forms["tag-form"].elements["tag-list"];
	let selectedTag = selectTag.value;

	if (selectedTag === "other") {
		let newTag;
		let isValid = false;

		while (!isValid) {
			newTag = prompt("Enter a new tag (must start with '#', be a single word without spaces, and not be empty):");

			// Check if the user clicked "Cancel"
			if (newTag === null) {
				// Restart the process
				resetProcess();
				return null; // Exit the function
			}

			if (newTag.trim().length > 0 && newTag.startsWith("#") && !newTag.includes(" ")) {
				// Check if tags array is valid and the new tag is not a duplicate
				const isDuplicate = tags && tags.some(tagObj => tagObj.tag === newTag);

				if (!isDuplicate) {
					isValid = true;
				} else {
					alert("This tag already exists. Please enter a different tag.");
				}
			} else {
				alert("Tag must start with '#', be a single word without spaces, and cannot be empty.");
			}
		}
		// Send the new tag to the database
		await addNewTag(newTag);

		return newTag;
	} else {
		return selectedTag;
	}
};

// add new tag
const addNewTag = async (tag) => {
	const tag_string = encodeURIComponent(tag);

	try {
		const url = `http://127.0.0.1:2323/tags/new?tag=${tag_string}`;
		const response = await fetch(url)

		if (!response.ok) {
			throw new Error(`HTTP error! Status: ${response.status}`);
		}

		const result = await response.json();
		console.log('New tag added:', result);

	} catch (error) {
		console.error('Error adding new tag:', error);
		alert("Error adding new tag. Please check if this tag already exists in the disabled list.");
	}

}

// get city and country from form
const getCityCountryForm = async () => {
	const form = document.forms["city-country-form"];
	const cityInput = form.elements["city"];
	const countryInput = form.elements["country"];

	// Retrieve values from the form fields
	let city = cityInput.value.trim();
	let country = countryInput.value.trim();

	// Check if city and country are not empty
	if (!city || !country) {
		alert("City and country fields cannot be empty.");
		// Focus on the first empty field
		if (!city) {
			cityInput.focus();
		} else {
			countryInput.focus();
		}
		throw new Error("City or country is empty.");
	}

	// Return the values if they are valid
	return { city, country };
};

// get the last message in function of the tag
const getLastMessage = async (tag) => {
	const tag_string = encodeURIComponent(tag);
	const url = `http://127.0.0.1:2323/entries/last?tag=${tag_string}`;

	try {
		const response = await fetch(url);
		if (!response.ok) {
			throw new Error(`HTTP error! Status: ${response.status}`);
		}
		const data = await response.json();
		return data; // Return just the message
	} catch (error) {
		console.error('Error fetching last message:', error);
		return null; // Or handle the error as needed
	}
};

// get the last message in function of the tag and date
const getLastMessageWithDate = async (tag, date, action) => {
	const tag_string = encodeURIComponent(tag);
	const date_string = encodeURIComponent(date);
	const action_string = encodeURIComponent(action);
	const url = `http://127.0.0.1:2323/entries/last?tag=${tag_string}&date=${date_string}&action=${action_string}`;

	try {
		const response = await fetch(url);
		if (!response.ok) {
			throw new Error(`HTTP error! Status: ${response.status}`);
		}
		const data = await response.json();
		return data; // Return just the message
	} catch (error) {
		console.error('Error fetching last message:', error);
		return null; // Or handle the error as needed
	}
};

// To make date more readable 
const formatDate = (dateString) => {
	if (dateString === "?") {
		return dateString;
	}

	const [datePart, timePart] = dateString.split('T');
	const [hours, minutes, seconds] = timePart.replace('Z', '').split(':');

	// Construct the formatted date with or without seconds
	const formattedDate = `${datePart} ${hours}:${minutes}` + (seconds ? `:${seconds}` : '');

	return formattedDate;
};

// Show last message in the form
const showLastMessage = async (lastMessage) => {
	if (window.editor) {
		try {
			if (lastMessage) {
				let dataToRender;
				try {
					// Try to parse the lastMessage as JSON
					dataToRender = JSON.parse(lastMessage);
				} catch (error) {
					// If parsing fails, treat the lastMessage as plain text
					dataToRender = {
						blocks: [
							{
								type: 'paragraph',
								data: {
									text: lastMessage
								}
							}
						]
					};
				}
				// Render the content
				await window.editor.render(dataToRender);
			} else {
				console.log('No message content to display.');
				await window.editor.render({}); // Renders an empty editor
			}
		} catch (error) {
			console.error('Error rendering message in Editor.js:', error);
		}
	} else {
		console.error('Editor.js instance not found.');
	}
};


// clear text area
const clearTextArea = async () => {
	const textarea = document.getElementById('editor-content');
	if (textarea) {
		textarea.value = ''; // Clear the textarea
	} else {
		console.error('Textarea not found');
	}

	if (window.editor) {
		window.editor.clear(); // Clear the Editor.js content
	} else {
		console.error('Editor.js instance not found.');
	}

};

// Get message from the form
const getMessageForm = async () => {
	if (window.editor) {
		try {
			const savedData = await window.editor.save(); // Save the content of Editor.js

			// Check if the editor content is empty
			const isEmpty = savedData.blocks.length === 0 || savedData.blocks.every(block => !block.data.text.trim());

			if (isEmpty) {
				alert("The message content cannot be empty.");
				return { isValid: false, message: null }; // Indicate that the form is not valid
			}

			// Convert the saved data to JSON string
			const message = JSON.stringify(savedData);

			// Update the hidden textarea with the JSON content
			const textarea = document.getElementById('editor-content');
			if (textarea) {
				textarea.value = message;
			}

			return { isValid: true, message }; // Indicate that the form is valid
		} catch (error) {
			console.error('Error getting message from Editor.js:', error);
			return { isValid: false, message: null }; // Indicate that the form is not valid
		}
	} else {
		console.error('Editor.js instance not found.');
		return { isValid: false, message: null }; // Handle this case as needed
	}
};

// get time now 
const getTimeNow = async () => {
	const now = new Date();

	// Format the date as YYYY-MM-DD HH:MM:SS
	const year = now.getFullYear();
	const month = String(now.getMonth() + 1).padStart(2, '0');
	const day = String(now.getDate()).padStart(2, '0');
	const hours = String(now.getHours()).padStart(2, '0');
	const minutes = String(now.getMinutes()).padStart(2, '0');
	const seconds = String(now.getSeconds()).padStart(2, '0');

	return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

// get date from the form with validation
const getDateForm = async (input) => {
	const date = input.value;

	// Define the regular expression for the date format YYYY-MM-DD HH:MM:SS or YYYY-MM-DD HH:MM
	const dateFormatPattern = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}(?::\d{2})?$/;

	// Check if the date matches the pattern
	if (dateFormatPattern.test(date)) {
		return date; // Return the date if it is in the correct format
	} else {
		alert("Invalid date format. Please use the format: YYYY-MM-DD HH:MM or YYYY-MM-DD HH:MM:SS");
		return null; // Return null or handle the invalid format case as needed
	}
};

// send new message to the API 
const sendNewMessage = async (tag, city, country, message, date) => {

	const url = `http://127.0.0.1:2323/entries/new`

	const body = JSON.stringify({
		tag,
		city,
		country,
		message,
		date
	})

	const reqOptions = {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: body,
	};

	try {
		const response = await fetch(url, reqOptions);
		if (!response.ok) {
			throw new Error('Network response was not ok');
		}
		const data = await response.json();
		console.log(data);
		alert("New message sent !");
		resetProcess();
	} catch (error) {
		console.error('Error fetching data:', error);
	}

};






