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

	//get tags list
	tags = await getTagList();

	//populate select tag
	await populateTagSelect(tags);

	// Add event listener for the "submit" event on the tag form
	document.forms["tag-form"].addEventListener("submit", async function (event) {
		event.preventDefault(); // Prevent the default form submission

		// get tag from form and add it if necessary
		tag = await getTagForm(tags);
		console.log(tag);

		// Show the next form, for example the "city-country-form"
		document.forms["city-country-form"].style.display = "block";

		// Hide the tag form
		document.forms["tag-form"].style.display = "none";

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
	const city = '';
	const country = '';
	return { city, country };
};

// get the last message in function of the tag
const showLastMessage = async () => {

};

// clear text area
const clearTextArea = async () => {

};

// get message from the form
const getMessageForm = async () => {
	const message = '';
	return message;

};

// get time now 
const getTimeNow = async () => {
	const timeNow = '';
	return timeNow;
};

// get date from the form
const getDateForm = async () => {
	const date = '';
	return date;
};

// send new message to the API 
const sendNewMessage = async (tag, city, country, message, date) => {

};






