
document.addEventListener('DOMContentLoaded', async () => {

	// init variables
	let tag;
	let tags;
	let city;
	let country;
	let message;
	let date;

	// hide forms 
	document.forms["city-country-form"].style.display = "none";
	document.forms["message-form"].style.display = "none";
	document.forms["date-form"].style.display = "none";

	//buttons 
	const validMessageButton = document.querySelector('form[name="message-form"] input[name="valid-message"]');
	const readButton = document.querySelector('button[name="clear-text"]');
	const timeNowButton = document.querySelector('input[name="time-now"]');
	const messageDateInput = document.querySelector('input[name="message-date"]');

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
		const lastMessage = await getLastMessage(tag);

		//Show last message 
		await showLastMessage(lastMessage);

	});

	// clear text area
	readButton.addEventListener('click', async (event) => {

		event.preventDefault(); // Prevent the default form submission

		await clearTextArea();

		readButton.style.display = "none";
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

			if (newTag && newTag.trim().length > 0 && newTag.startsWith("#") && !newTag.includes(" ")) {
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
		// send new tag to the db
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
	}

}

// get city and country from form
const getCityCountryForm = async () => {
	const form = document.forms["city-country-form"];
	const cityInput = form.elements["city"];
	const countryInput = form.elements["country"];

	// Retrieve values from the form fields
	const city = cityInput.value.trim();
	const country = countryInput.value.trim();

	// Check if city and country are not empty
	if (!city || !country) {
		alert("City and country fields cannot be empty.");
		return { city: "", country: "" }; // Return empty strings or handle this case as needed
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
		return data.message; // Return just the message
	} catch (error) {
		console.error('Error fetching last message:', error);
		return null; // Or handle the error as needed
	}
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
		location.reload();
	} catch (error) {
		console.error('Error fetching data:', error);
	}

};






