
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
let newID;

//buttons and elements 
const validMessageButton = document.querySelector('form[name="message-form"] input[name="valid-message"]');
const previousButton = document.querySelector('button[name="previous"]');
const resetButton = document.querySelector('button[name="reset-button"]');
const seeMessageButton = document.querySelector('button[name="see-message"]');
const nextButton = document.querySelector('button[name="next"]');
const readButton = document.querySelector('button[name="clear-text"]');
const timeNowButton = document.querySelector('input[name="time-now"]');
const messageDateInput = document.querySelector('input[name="message-date"]');
const previousDataElement = document.forms["message-form"].querySelector('p[name="previous-data"]');
const tagCityCountryElement = document.forms["message-form"].querySelector('p[name="tag-city-country"]');
const currentTagElement = document.forms["city-country-form"].querySelector('p[name="current-tag"]');
const infosMessageElement = document.forms["date-form"].querySelector('p[name="infos-message"]');
const saveCommentButton = document.querySelector('button[name="save-comment"]');
const selectPrinciple = document.forms["tag-form"].elements["principle-list"];
const selectTag = document.forms["tag-form"].elements["tag-list"];
const remindButton = document.querySelector('button[name="reminds-entries"]');
const sendRemindButton = document.querySelector('button[name="send-remind"]');

document.addEventListener('DOMContentLoaded', async () => {
	//EasyMDE instance
	const markdownElement1 = document.getElementById('markdown');
	const markdownElement2 = document.getElementById('markdown-comment');
	if (markdownElement1) {
		window.easyMDE1 = new EasyMDE({
			element: markdownElement1,
		});
		window.easyMDE1.togglePreview(); //preview mode
	};
	if (markdownElement2) {
		window.easyMDE2 = new EasyMDE({
			element: markdownElement2,
		});
		window.easyMDE2.togglePreview(); // preview mode
	}
	// hide forms 
	document.forms["city-country-form"].style.display = "none";
	document.forms["message-form"].style.display = "none";
	document.forms["date-form"].style.display = "none";
	document.forms["remind-form"].style.display = "none";

	// Check if chapter opened
	await checkChapterOpened();

	// reset button :
	resetButton.addEventListener('click', async (event) => {
		event.preventDefault();
		location.reload();
	});
	// return to see message button :
	seeMessageButton.addEventListener('click', async (event) => {
		event.preventDefault();

		document.forms["message-form"].style.display = "block";
		document.forms["date-form"].style.display = "none";
	});

	//get principle list
	const principles = await getPrincipleList();

	//populate select principle
	await populatePrincipleSelect(principles);

	//get first list tags
	tags = await getTagList('all');

	//populate select tag
	await populateTagSelect(tags);

	selectPrinciple.addEventListener('change', async function () {
		const selectedPrinciple = selectPrinciple.value;

		selectTag.innerHTML = '';

		//get tags list
		tags = await getTagList(selectedPrinciple);

		//populate select tag
		await populateTagSelect(tags);
	});
	// Add event listener for the "submit" event on the tag form
	document.forms["tag-form"].addEventListener("submit", async function (event) {
		event.preventDefault(); // Prevent the default form submission

		// get tag from form and add it if necessary
		tag = await getTagForm(tags);

		// Show the next form
		document.forms["city-country-form"].style.display = "block";

		// Hide the tag form
		document.forms["tag-form"].style.display = "none";

		// Show current tag
		currentTagElement.innerHTML = `<strong>Tag:</strong> ${tag}`;
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
		lastCity = oldCity;
		lastCountry = oldCountry;
		lastEntryID = oldEntryID;

		//Show comment 
		const comment = await readComment(tag)
		await showLastMessageOrComment(window.easyMDE2, comment);

		//Show last message 
		await showLastMessageOrComment(window.easyMDE1, lastMessage);

		// Update the <p> element inside message-form with the selected tag, city, and country
		tagCityCountryElement.innerHTML = `<strong>Tag:</strong> ${tag} <br> <strong>New City:</strong> ${city} <br> <strong>New Country:</strong> ${country}`;

		// Update the <p> element inside message-form with the selected tag, previous date
		let newFormatDate = formatDate(oldDate); // Change date format 
		oldDate = newFormatDate;

		// Show last ID + date + city + country
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
			await showLastMessageOrComment(window.easyMDE1, lastMessage);

			let newFormatDate = formatDate(oldDate);// change date format
			oldDate = newFormatDate;
			// Show infos 
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
			await showLastMessageOrComment(window.easyMDE1, lastMessage);

			let newFormatDate = formatDate(oldDate); // New format date
			oldDate = newFormatDate;
			// Show infos 
			previousDataElement.innerHTML = `<strong> ID :</strong> ${oldEntryID} <br><strong>Date:</strong> ${oldDate} <br> <strong>City :</strong> ${oldCity} <br> <strong>Country :</strong> ${oldCountry}`;
		} else {
			alert('No more message');
		}
	});
	// clear text area
	readButton.addEventListener('click', async (event) => {
		event.preventDefault(); // Prevent the default form submission

		// Show infos of the last message
		previousDataElement.innerHTML = `<strong>Last ID :</strong> ${lastEntryID} <br><strong>Last Date:</strong> ${lastDate} <br> <strong>Last City :</strong> ${lastCity} <br>  <strong>Last Country :</strong> ${lastCountry}`;

		// Clear text area
		await clearTextArea();

		// Hide buttons and show only validate button
		readButton.style.display = "none";
		previousButton.style.display = "none";
		nextButton.style.display = "none";
		validMessageButton.style.display = "block";
	});
	// Get the message: 
	document.forms["message-form"].addEventListener("submit", async function (event) {
		event.preventDefault(); // Prevent the default form submission

		//Get message from the form
		const formData2 = await getMessageForm(window.easyMDE1);

		// Separate results
		const isValid = formData2.isValid;
		message = formData2.message

		// is valid 
		if (isValid) {
			// Only proceed if the message is valid
			document.forms["message-form"].style.display = "none"; // Hide message form 
			document.forms["date-form"].style.display = "block"; // show date-form

			// Show final data
			infosMessageElement.innerHTML = `<strong>Tag:</strong> ${tag} <br> <strong>City:</strong> ${city} <br> <strong>Country:</strong> ${country}`;
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
	// Save new message 
	document.forms["date-form"].addEventListener("submit", async function (event) {
		event.preventDefault(); // Prevent the default form submission

		// Get date
		const dataDate = await getDateForm(messageDateInput);
		date = dataDate.date;
		validDate = dataDate.valid;
		if (validDate != false) {
			// send data to the API 
			await sendNewMessage(tag, city, country, message, date);
			location.reload();
		};
	});
	// Save comment : 
	saveCommentButton.addEventListener('click', async (event) => {
		event.preventDefault(); // Prevent the default form submission

		// Get comment
		const formData = await getMessageForm(window.easyMDE2);

		//Separate result
		newComment = formData.message
		valid = formData.isValid

		//If valid
		if (valid) {
			await saveComment(tag, newComment)
		} else {
			console.log("Comment is empty, not proceeding to the next step.");
		}
	});

	// remind button :
	remindButton.addEventListener('click', async (event) => {
		event.preventDefault();

		// Get date
		const data = await getDateForm(messageDateInput);
		date = data.date;
		valid = data.valid;
		if (valid != false) {
			// send data to the API 
			await sendNewMessage(tag, city, country, message, date);
			document.forms["date-form"].style.display = "none";
			document.forms["remind-form"].style.display = "block";
			newID = await getNewId();
		};
	});

	// send remind
	sendRemindButton.addEventListener('click', async (event) => {
		event.preventDefault();

		const fullData = await prepareDataRemind();
		const check = fullData.valid;
		const dataRemind = fullData.postData;
		if (check != false) {
			await sendDataToRemind(dataRemind)
			location.reload();
		}
	});
});

//  Functions // 

// get principle list 
const getPrincipleList = async () => {
	const url = `http://127.0.0.1:2323/tags/principles`;
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

// Function to populate the select principle 
const populatePrincipleSelect = async (principles) => {
	// Clear any existing options
	selectPrinciple.innerHTML = '';

	// Add an "All" option at the first
	const allOption = document.createElement("option");
	allOption.value = "all";
	allOption.textContent = "all";
	selectPrinciple.appendChild(allOption);

	principles.forEach(principleObj => {
		const option = document.createElement("option");
		option.value = principleObj.tag; // Using the principle name as the value
		option.textContent = principleObj.tag; // Displaying the principle name
		selectPrinciple.appendChild(option);
	});
};

// get tag list 
const getTagList = async (principle) => {
	const principle_string = encodeURIComponent(principle);

	const url = `http://127.0.0.1:2323/tags/list/active?principle=${principle_string}`;
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

// Get tag from the for or create a new one. 
const getTagForm = async (tags) => {
	let selectedTag = selectTag.value;
	let selectedPrinciple = selectPrinciple.value

	if (selectedTag === "other") {
		let newTag;
		let isValid = false;

		while (!isValid) {
			newTag = prompt("Enter a new tag (the '侍' prefix will be added automatically). The tag must be followed by a digit or an uppercase letter, be a single word without spaces, and cannot be empty:");


			if (newTag === null) {
				location.reload();
				return;
			}
			let newTagSamurai;

			if (newTag[0] != "侍") {
				newTagSamurai = "侍" + newTag;
			} else {
				newTagSamurai = newTag;
			}

			newTagSamurai = newTagSamurai.trim();
			if (newTagSamurai.length > 0 && newTagSamurai.startsWith("侍") && /^[侍][A-Z0-9][^\s]*$/.test(newTagSamurai)) {
				const isDuplicate = tags && tags.some(tagObj => tagObj.tag === newTagSamurai);

				if (!isDuplicate) {
					const count = await checkIfTagDisabled(newTagSamurai);
					if (count > 0) {
						alert(`${newTagSamurai} already exists but is disabled. Please enable it to use.`);
						location.reload();
					} else {
						await addNewTag(selectedPrinciple, newTagSamurai);
						isValid = true;
					}
				} else {
					alert(`${newTagSamurai} tag already exists. Please enter a different tag.`);
					location.reload();
				}
			} else {
				alert("Enter a new tag (the '侍' prefix will be added automatically). The tag must be followed by a digit or an uppercase letter, be a single word without spaces, and cannot be empty:");
				location.reload();
			}
			return newTagSamurai;
		}
	} else {
		return selectedTag;
	}
};

// Check if tag inactive
const checkIfTagDisabled = async (tag) => {
	const tag_string = encodeURIComponent(tag);

	try {
		const url = `http://127.0.0.1:2323/tags/checks/inactive?name=${tag_string}`;
		const response = await fetch(url)

		if (!response.ok) {
			throw new Error(`HTTP error! Status: ${response.status}`);
		}

		const result = await response.json();
		return result.result

	} catch (error) {
		console.error('Error to check if tag is disabled:', error);
	}
}

// add new tag
const addNewTag = async (principle, tag) => {
	const principle_string = encodeURIComponent(principle);
	const tag_string = encodeURIComponent(tag);

	try {
		const url = `http://127.0.0.1:2323/tags/new?principle=${principle_string}&tag=${tag_string}`;
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
};

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

	// Check if city and country start with an uppercase letter
	const isUppercase = (str) => /^[A-Z]/.test(str);

	if (!isUppercase(city)) {
		alert("City must start with an uppercase letter.");
		cityInput.focus();
		throw new Error("City does not start with an uppercase letter.");
	}

	if (!isUppercase(country)) {
		alert("Country must start with an uppercase letter.");
		countryInput.focus();
		throw new Error("Country does not start with an uppercase letter.");
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
const showLastMessageOrComment = async (mark, lastMessage) => {
	if (mark) {
		try {
			if (lastMessage) {
				let markdownContent;
				try {

					// Try to parse the lastMessage as JSON
					const parsedData = JSON.parse(lastMessage);

					// Convert parsed JSON to Markdown (assuming 'text' is the key for Markdown content)
					markdownContent = parsedData.text || lastMessage;

				} catch (error) {
					// If parsing fails, treat the lastMessage as plain text (assuming it's already Markdown)
					markdownContent = lastMessage;
				};
				// Set the Markdown content in EasyMDE
				mark.value(markdownContent);

			} else {
				console.log('No message content to display.');
				mark.clearAutosavedValue(); // Clears any autosaved value
				mark.value(''); // Clears the editor
			}
		} catch (error) {
			console.error('Error rendering message in EasyMDE:', error);
		}
	} else {
		console.error('EasyMDE instance not found.');
	}
};

// clear text area
const clearTextArea = async () => {
	if (window.easyMDE1) {
		try {
			window.easyMDE1.value(''); // Clear the EasyMDE content
		} catch (error) {
			console.error('Error clearing EasyMDE content:', error);
		}
	} else {
		console.error('EasyMDE instance not found.');
	}
};

// Get message from the form
const getMessageForm = async (mark) => {
	if (mark) {
		try {
			// Get the content from EasyMDE
			const markdownContent = mark.value();

			// Check if the content is empty
			const isEmpty = !markdownContent.trim();

			if (isEmpty) {
				alert("The message content cannot be empty.");
				return { isValid: false, message: null }; // Indicate that the form is not valid
			}

			// Update the hidden textarea with the Markdown content
			const textarea = document.getElementById('editor-content');
			if (textarea) {
				textarea.value = markdownContent;
			}

			return { isValid: true, message: markdownContent }; // Indicate that the form is valid
		} catch (error) {
			console.error('Error getting message from EasyMDE:', error);
			return { isValid: false, message: null }; // Indicate that the form is not valid
		}
	} else {
		console.error('EasyMDE instance not found.');
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
	let valid = true;
	const date = input.value;

	// Define the regular expression for the date format YYYY-MM-DD HH:MM:SS or YYYY-MM-DD HH:MM
	const dateFormatPattern = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}(?::\d{2})?$/;

	// Check if the date matches the pattern
	if (dateFormatPattern.test(date)) {
		return { date, valid }; // Return the date if it is in the correct format
	} else {
		alert("Invalid date format. Please use the format: YYYY-MM-DD HH:MM or YYYY-MM-DD HH:MM:SS");
		valid = false;
		return { date, valid }; // Return null or handle the invalid format case as needed
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
		alert("New message sent !");
	} catch (error) {
		console.error('Error fetching data:', error);
	}
};

// Function to get comment 
const readComment = async (tag) => {
	const tag_string = encodeURIComponent(tag);

	try {
		const url = `http://127.0.0.1:2323/tags/comments/read?tag=${tag_string}`;
		const response = await fetch(url)

		if (!response.ok) {
			throw new Error(`HTTP error! Status: ${response.status}`);
		}

		const result = await response.json();
		return result.comment

	} catch (error) {
		console.error('Error getting comment:', error);
		alert("Error getting comment");
	}
};

// Function to save comment 
const saveComment = async (tag, comment) => {
	const url = `http://127.0.0.1:2323/tags/comments/save`

	const body = JSON.stringify({
		tag,
		comment,
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
		alert("Comment saved !");
	} catch (error) {
		console.error('Error fetching data:', error);
	}
};


// Check if chapter opened
const checkChapterOpened = async () => {
	const url = 'http://127.0.0.1:2323/chapters/check';
	try {
		const response = await fetch(url);
		if (!response.ok) {
			throw new Error(`HTTP error! Status: ${response.status}`);
		}
		const data = await response.json();
		if (data.status === "closed") {
			alert("No chapter open yet. Please open a chapter first.");
			// go to chapters page 
			window.location.href = "/chapters";
		}
	} catch (error) {
		console.error('Error fetching data:', error);
	}
}

// Functions for remind //

// Get id after sent
const getNewId = async () => {
	const chapterName = "";

	const chapterNameString = encodeURIComponent(chapterName);

	const url = `http://127.0.0.1:2323/entries/count?name=${chapterNameString}`;

	try {
		const response = await fetch(url);
		if (!response.ok) {
			throw new Error(`HTTP error! Status: ${response.status}`);
		}
		const data = await response.json();
		return data.count;

	} catch (error) {
		console.error('Error fetching last message:', error);
		return null; // Or handle the error as needed
	}

};

const prepareDataRemind = async () => {
	let valid = true;

	const form = document.forms['remind-form'];

	const remindDate = form['remind-date'].value.trim();
	const repeat = form['repeat'].value.trim();
	const remindTitle = form['remind-title'].value.trim();

	if (!remindDate) {
		alert('Please enter the reminder date.');
		valid = false;
	} else {
		// Check if the remindDate is in the past
		const currentDate = new Date();
		const selectedDate = new Date(remindDate);

		// Normalize dates to only compare year, month, and day
		currentDate.setHours(0, 0, 0, 0); // Reset to midnight
		selectedDate.setHours(0, 0, 0, 0); // Reset to midnight

		if (selectedDate < currentDate) {
			alert('The reminder date cannot be in the past.');
			valid = false;
		}

		// Check if repeat is "pin" and remindDate is not today
		if (repeat === "pin" && selectedDate.getTime() !== currentDate.getTime()) {
			alert('When "pin" is selected, the reminder date must be today.');
			valid = false;
		}
	}

	if (!repeat) {
		alert('Please select a repeat option.');
		valid = false;
	}

	if (!remindTitle) {
		alert('Please enter a title for the reminder.');
		valid = false;
	}

	// Prepare the POST body
	const postData = {
		remind_date: remindDate,
		repeat: repeat,
		remind_title: remindTitle,
		entry_id: parseInt(newID, 10), // Transform newID into an integer
	};

	const data = { postData, valid };

	return data;
};

// send data to remind
const sendDataToRemind = async (data) => {

	const url = `http://127.0.0.1:2323/reminds/insert`

	const body = JSON.stringify(data);

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
		alert("Remind added !");
	} catch (error) {
		console.error('Error fetching data:', error);
	}
}