
// Init variables:
let principlesList;
let params;
let currentTag;
let currentPage;
let currentDate;
let currentID;
let currentCity;
let currentCountry;

// Buttons and elements :
const saveCommentInput = document.querySelector('input[name="comment-save"]')
const closeMessageInput = document.querySelector('input[name="message-close"]')
const nextMessageButton = document.querySelector('button[name="message-next"]');
const previousMessageButton = document.querySelector('button[name="message-previous"]');
const paragraphCommentMessage = document.querySelector('p[name="paragraph-message-comment"]');
const headerCommentMessage = document.querySelector('h3[name="header-message-comment"]');

const enabledTagsButton = document.querySelector('button[name="enabled-tags-button"]');
const disabledTagsButton = document.querySelector('button[name="disabled-tags-button"]');
const allTagsButton = document.querySelector('button[name="all-tags-button"]');
const returnButtons = document.querySelectorAll('button[name="return"]');
const applyFiltersButton = document.querySelector('button[name="apply-filters-tags"]');
const countElement = document.querySelector('p[name="count-tags"]');
const isPrincipleFilter = document.querySelector('select[name="is-principle-filter"]');
const principleFilter = document.querySelector('select[name="principle-filter"]');
const currentEnabledFilter = document.querySelector('p[name="current-enabled-filter"]');;
const filtersTagsButton = document.querySelector('button[name="back-to-filter"]');
const firstPageButton = document.querySelector('input[name="message-list-first"]');
const previousPageButton = document.querySelector('input[name="message-list-back"]');
const nextPageButton = document.querySelector('input[name="message-list-next"]');

document.addEventListener('DOMContentLoaded', async () => {

	// hide form : 
	document.forms["disabled-tags"].style.display = "none";
	document.forms["enabled-tags-filters"].style.display = "none";
	document.forms["enabled-tags"].style.display = "none";
	document.forms["full-tags"].style.display = "none";
	document.forms["message-list"].style.display = "none";
	document.forms["message-comment-form"].style.display = "none";

	// Count Tags //
	await countAndShowTags(countElement);

	// Form "status-tag" //

	// for enabled tags
	enabledTagsButton.addEventListener('click', async (event) => {
		event.preventDefault();

		// get principle List
		principlesList = await principles();
		await feedPrinciple(principlesList);

		document.forms["enabled-tags-filters"].style.display = "block";
		document.forms["status-tags"].style.display = "none";
	});

	// Handle is-principle-filter change
	isPrincipleFilter.addEventListener('change', () => {
		if (isPrincipleFilter.value === 'yes') {
			principleFilter.value = 'all';
			principleFilter.disabled = true;
		} else {
			principleFilter.disabled = false;
		}
	});

	disabledTagsButton.addEventListener('click', async (event) => {
		event.preventDefault();
		document.forms["disabled-tags"].style.display = "block";
		document.forms["status-tags"].style.display = "none";
	});

	allTagsButton.addEventListener('click', async (event) => {
		event.preventDefault();
		document.forms["full-tags"].style.display = "block";
		document.forms["status-tags"].style.display = "none";
	});

	// Return button //
	returnButtons.forEach(button => {
		button.addEventListener('click', async (event) => {
			location.reload();
		});
	});

	// go back filters enabled 
	filtersTagsButton.addEventListener('click', async (event) => {
		event.preventDefault();
		document.forms["enabled-tags-filters"].style.display = "block";
		document.forms["enabled-tags"].style.display = "none";
	});


	// Form "enabled-tags-filters" //
	applyFiltersButton.addEventListener('click', async (event) => {
		event.preventDefault();

		params = await getParamsForFilteringTagsEnabled();
		const dataTagsEnabled = await getListTagsEnabledFiltered(params);
		await feedTableEnabledTags(dataTagsEnabled, principlesList, params, countElement);

		document.forms["enabled-tags-filters"].style.display = "none";
		document.forms["enabled-tags"].style.display = "block";

		await showFilterEnabled(params, currentEnabledFilter);
	});

	// Save comment 
	saveCommentInput.addEventListener('click', async (event) => {
		event.preventDefault();

		const formData = await getMessageOrCommentForm();
		const valid = formData.isValid;
		if (valid) {
			const newComment = formData.message;
			await saveComment(currentTag, newComment);

			const newDataTagsEnabled = await getListTagsEnabledFiltered(params);
			await feedTableEnabledTags(newDataTagsEnabled, principlesList, params, countElement);

			document.forms["enabled-tags"].style.display = "block";
			document.forms["message-comment-form"].style.display = "none";

			//Reset for for message / comment
			closeMessageInput.style.display = "block";
			nextMessageButton.style.display = "block";
			PreviousMessageButton.style.display = "block";

		} else {
			return
		};
	});

	// First page  (table-message-list)
	firstPageButton.addEventListener('click', async (event) => {
		event.preventDefault();

		currentPage = 1;

		const data = await getMessageList(currentTag, currentPage)
		await feedTableMessageList(data);
	});

	// Previous Page (table-message-list)
	previousPageButton.addEventListener('click', async (event) => {
		event.preventDefault();

		const page = currentPage - 1;

		if (page > 1) {
			currentPage = page;

			const data = await getMessageList(currentTag, currentPage)
			await feedTableMessageList(data);
		}
	});

	// Next Page (table-message-list)
	nextPageButton.addEventListener('click', async (event) => {
		event.preventDefault();

		let page = currentPage + 1;

		const data = await getMessageList(currentTag, page)
		if (data) {
			await feedTableMessageList(data);
			currentPage = page;
		} else {
			alert(" No more data available.")
		}
	});

	// Close message form
	closeMessageInput.addEventListener('click', async (event) => {
		event.preventDefault();

		document.forms["message-comment-form"].style.display = "none";
		document.forms["message-list"].style.display = "block";
		saveCommentInput.style.display = "block";
	});

	// Get Previous message 
	previousMessageButton.addEventListener('click', async (event) => {
		event.preventDefault();

		data = await getLastMessageWithDate(currentTag, currentDate, "previous");
		const message = data.message;

		if (message != "No message") {
			currentID = data.entryID;
			currentDate = data.date;
			currentCity = data.city;
			currentCountry = data.country;
			paragraphCommentMessage.innerHTML = `<strong>Tag:</strong> ${currentTag} <br> <strong>Date :</strong> ${formatDate(currentDate)} <br> <strong>City:</strong> ${currentCity} <br> <strong>Country:</strong> ${currentCountry}`;
			await showCommentOrMessage(message);
		} else {
			alert('No more previous message');
		}
	});

	// Get next message 
	nextMessageButton.addEventListener('click', async (event) => {
		event.preventDefault();

		data = await getLastMessageWithDate(currentTag, currentDate, "next");
		const message = data.message;

		if (message != "No message") {
			currentID = data.entryID;
			currentDate = data.date;
			currentCity = data.city;
			currentCountry = data.country;
			paragraphCommentMessage.innerHTML = `<strong>Tag:</strong> ${currentTag} <br> <strong>Date :</strong> ${formatDate(currentDate)} <br> <strong>City:</strong> ${currentCity} <br> <strong>Country:</strong> ${currentCountry}`;
			await showCommentOrMessage(message);
		} else {
			alert('No more message');
		}


	});
});

// Count Tags functions //

//Count and show : 
const countAndShowTags = async (countElement) => {
	const dataCountTags = await countTags();
	const active = dataCountTags.active;
	const inactive = dataCountTags.inactive;
	const allTags = active + inactive;

	countElement.innerHTML = `<strong> Enabled Tags :</strong> ${active} <br><strong>Disabled Tags :</strong> ${inactive} <br> <strong> Total Tags :</strong> ${allTags}`;
}

// Call API
const countTags = async () => {

	const url = `http://127.0.0.1:2323/tags/count`;

	try {
		const response = await fetch(url);
		if (!response.ok) {
			throw new Error(`HTTP error! Status: ${response.status}`);
		}
		const data = await response.json();
		return data; // Return just the message
	} catch (error) {
		console.error('Error fetching count tags:', error);
		return null; // Or handle the error as needed
	}
};

// Function form "status-tag" //

// get principles list
const principles = async () => {

	const url = `http://127.0.0.1:2323/tags/principles`;

	try {
		const response = await fetch(url);
		if (!response.ok) {
			throw new Error(`HTTP error! Status: ${response.status}`);
		}
		const data = await response.json();
		return data; // Return just the message
	} catch (error) {
		console.error('Error fetching principles:', error);
		return null; // Or handle the error as needed
	}
};

// feed principle
const feedPrinciple = async (principlesList) => {
	const principleFilterSelect = document.querySelector('select[name="principle-filter"]');

	// Clear existing options, but keep the "all" option
	principleFilterSelect.innerHTML = '<option value="all">all</option>,<option value="none">none</option> ';

	// Check if the principlesList contains anything other than { tag: 'none' }
	if (principlesList.length === 1 && principlesList[0].tag === 'none') {
		return; // Do nothing if the only tag is 'none'
	}

	// Add options to the select element
	principlesList.forEach(principle => {
		if (principle.tag !== 'none') {
			const option = document.createElement('option');
			option.value = principle.tag;
			option.textContent = principle.tag;
			principleFilterSelect.appendChild(option);
		}
	});
};

// Function form "enabled-tags-filters" //

const getParamsForFilteringTagsEnabled = async () => {
	// Get the form elements
	const form = document.forms["enabled-tags-filters"];

	// Retrieve values from the form fields
	let isSystem = form.querySelector('select[name="is-system-filter"]').value;
	if (isSystem === 'yes') {
		isSystem = 1;
	} else if (isSystem === 'no') {
		isSystem = 0; // 10 == null filter disabled
	} else {
		isSystem = 10;
	}

	let isPrinciple = form.querySelector('select[name="is-principle-filter"]').value;
	if (isPrinciple === 'yes') {
		isPrinciple = 1;
	} else if (isPrinciple === 'no') {
		isPrinciple = 0;
	} else {
		isPrinciple = 10; // 10 == null filter disabled
	}

	let principle = form.querySelector('select[name="principle-filter"]').value; // if = all ==> null 

	// Return the parameters as an object
	return {
		isSystem,
		isPrinciple,
		principle
	};
};

const getListTagsEnabledFiltered = async (params) => {

	const url = `http://127.0.0.1:2323/tags/list/filtered`;

	const body = JSON.stringify({
		isSystem: params.isSystem,
		isPrinciple: params.isPrinciple,
		principle: params.principle
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
		return data;
	} catch (error) {
		console.error('Error fetching data:', error);
	}

};

// show current enabled filter
const showFilterEnabled = async (params, currentEnabledFilter) => {

	let isSystem;
	let isPrinciple;
	let principleTag;

	if (params.isSystem === 0) {
		isSystem = 'No'
	} else if (params.isSystem === 1) {
		isSystem = 'Yes'
	} else {
		isSystem = 'All'
	};

	if (params.isPrinciple === 0) {
		isPrinciple = 'No'
	} else if (params.isPrinciple === 1) {
		isPrinciple = 'Yes'
	} else {
		isPrinciple = 'All'
	};

	if (params.principle === 'all') {
		principleTag = "All";
	} else {
		principleTag = params.principle
	}
	currentEnabledFilter.innerHTML = `Current Filters : <br> <strong> Is System :</strong> ${isSystem} <br><strong> Is Principle :</strong> ${isPrinciple} <br> <strong> Principle Tag :</strong> ${principleTag}`;
}

// feed table for filtered enabled tags 
const feedTableEnabledTags = async (data, principlesList, params, countElement) => {
	const form = document.forms["enabled-tags"];
	const tbody = form.querySelector('tbody');

	// Clear existing rows
	tbody.innerHTML = '';

	// Check for empty data
	if (!data || data.length === 0) {
		form.style.display = "none";
		alert("No data available.");
		location.reload();
	}

	// Iterate over the data to create rows
	data.forEach(tag => {
		const row = document.createElement('tr');

		// Tag name
		const nameCell = document.createElement('td');
		const nameInput = document.createElement('input');
		nameInput.type = "text";
		nameInput.name = "name-enabled-tag";
		nameInput.value = tag.tag;
		nameInput.disabled = true;
		nameCell.appendChild(nameInput);
		row.appendChild(nameCell);

		// Is-system
		const isSystemCell = document.createElement('td');
		const isSystemSelect = document.createElement('select');
		isSystemSelect.name = "is-system";
		const optionNoSystem = new Option('no', 'no', tag.is_system === 0);
		const optionYesSystem = new Option('yes', 'yes', tag.is_system === 1);
		isSystemSelect.add(optionNoSystem);
		isSystemSelect.add(optionYesSystem);
		isSystemSelect.value = tag.is_system === 1 ? 'yes' : 'no';
		isSystemCell.appendChild(isSystemSelect);
		row.appendChild(isSystemCell);

		// Is-principle
		const isPrincipleCell = document.createElement('td');
		const isPrincipleSelect = document.createElement('select');
		isPrincipleSelect.name = "is-principle";
		const optionNoPrinciple = new Option('no', 'no', tag.is_principle === 0);
		const optionYesPrinciple = new Option('yes', 'yes', tag.is_principle === 1);
		isPrincipleSelect.add(optionNoPrinciple);
		isPrincipleSelect.add(optionYesPrinciple);
		isPrincipleSelect.value = tag.is_principle === 1 ? 'yes' : 'no';
		isPrincipleCell.appendChild(isPrincipleSelect);
		row.appendChild(isPrincipleCell);

		// Principle tag
		const principleCell = document.createElement('td');
		const principleSelect = document.createElement('select');
		principleSelect.name = "principle";

		// Add "none" option
		const optionNone = new Option('none', 'none', tag.principle_tag === 'none');
		principleSelect.add(optionNone);

		// Add the principles from the list
		principlesList.forEach(principle => {
			if (principle.tag !== 'none') {
				const option = new Option(principle.tag, principle.tag, tag.principle_tag === principle.tag);
				principleSelect.add(option);
			}
		});

		principleSelect.value = tag.principle_tag || 'none';
		principleCell.appendChild(principleSelect);
		row.appendChild(principleCell);

		// Created time
		const createdCell = document.createElement('td');
		const createdInput = document.createElement('input');
		createdInput.type = "text";
		createdInput.name = "created-enabled-tag";
		createdInput.value = tag.created_time;
		createdInput.disabled = true;
		createdCell.appendChild(createdInput);
		row.appendChild(createdCell);

		// Updated time
		const updatedCell = document.createElement('td');
		const updatedInput = document.createElement('input');
		updatedInput.type = "text";
		updatedInput.name = "updated-enabled-tag";
		updatedInput.value = tag.updated_time;
		updatedInput.disabled = true;
		updatedCell.appendChild(updatedInput);
		row.appendChild(updatedCell);

		// Messages button
		const messagesCell = document.createElement('td');
		const messagesButton = document.createElement('button');
		messagesButton.type = "button";
		messagesButton.name = "see-messages-list-enabled-tag";
		messagesButton.textContent = "Messages";
		messagesButton.addEventListener('click', async (event) => {
			event.preventDefault();
			await messagesTagButton(tag.tag);
		});
		messagesCell.appendChild(messagesButton);
		row.appendChild(messagesCell);

		// Comments button
		const commentsCell = document.createElement('td');
		const commentsButton = document.createElement('button');
		commentsButton.type = "button";
		commentsButton.name = "see-comments-enabled-tag";
		commentsButton.textContent = "Comment";
		commentsButton.addEventListener('click', async (event) => {
			event.preventDefault();
			await commentTagButton(tag.tag);
		});
		commentsCell.appendChild(commentsButton);
		row.appendChild(commentsCell);

		// Actions buttons
		const actionsCell = document.createElement('td');
		const updateButton = document.createElement('button');
		updateButton.type = "button";
		updateButton.name = "enabled-tag-update";
		updateButton.textContent = "Update";
		updateButton.addEventListener('click', async (event) => {
			event.preventDefault();
			const row = updateButton.closest('tr'); // Get the current row
			const isPrinciple = row.querySelector('select[name="is-principle"]').value === 'yes' ? 1 : 0;
			const isSystem = row.querySelector('select[name="is-system"]').value === 'yes' ? 1 : 0;
			const principleTag = row.querySelector('select[name="principle"]').value;

			await updateTagButton(tag.tag, isPrinciple, isSystem, principleTag, principlesList, params, countElement);
		});
		actionsCell.appendChild(updateButton);

		const disableButton = document.createElement('button');
		disableButton.type = "button";
		disableButton.name = "disable-tag";
		disableButton.textContent = "Disable";
		disableButton.addEventListener('click', async (event) => {
			event.preventDefault();
			await disableTagButton(tag.tag, principlesList, params, countElement);
		});
		actionsCell.appendChild(disableButton);

		row.appendChild(actionsCell);

		// Append the row to the table body
		tbody.appendChild(row);
	});

	// Display the form now that it's populated
	form.style.display = "block";
};

// check if it is principle and is using. 
const checkPrincipleTags = async (tag) => {

	const tag_string = encodeURIComponent(tag);

	const url = `http://127.0.0.1:2323/tags/principles/check?tag=${tag_string}`;

	try {
		const response = await fetch(url);
		if (!response.ok) {
			throw new Error(`HTTP error! Status: ${response.status}`);
		}
		const data = await response.json();
		return data.result; // Return just result
	} catch (error) {
		console.error('Error fetching principles:', error);
		return null; // Or handle the error as needed
	}
}

// listener for disable button
const disableTagButton = async (tag, principlesList, params, countElement) => {

	const userConfirmed = confirm(`Are you sure to disable ${tag}`);

	if (userConfirmed) {

		const result = await checkPrincipleTags(tag);

		if (result > 0) {
			alert("It is not allowed to disable a tag if another tag uses it as a principle.");
			return;
		} else {

			await disableTag(tag);
			await countAndShowTags(countElement);
			const newDataTagsEnabled = await getListTagsEnabledFiltered(params);
			await feedTableEnabledTags(newDataTagsEnabled, principlesList, params, countElement);
		}
	} else {
		return;
	}
};

// Disable a tag 
const disableTag = async (tag) => {

	const tag_string = encodeURIComponent(tag);

	try {
		const url = `http://127.0.0.1:2323/tags/disable?tag=${tag_string}`;
		const response = await fetch(url)

		if (!response.ok) {
			throw new Error(`HTTP error! Status: ${response.status}`);
		}

		const result = await response.json();
		alert("Tags Disabled!");

	} catch (error) {
		console.error('Error adding new tag:', error);
		alert("Error to disable tag");
	}

};

// deal with update button 
const updateTagButton = async (tag, is_principle, is_system, principle_tag, principlesList, params, countElement) => {

	let count = 0;

	if (is_principle === 0) {
		count = await checkPrincipleTags(tag);
	};

	if (principle_tag === null) {
		principle_tag = "none";
	}

	if (count > 0) {
		alert("It is not allowed to update is_principle to no a tag if another tag uses it as a principle.");
		return;
	} else {
		await updateTag(tag, is_principle, is_system, principle_tag);
		const newDataTagsEnabled = await getListTagsEnabledFiltered(params);
		principlesList = await principles();
		await feedTableEnabledTags(newDataTagsEnabled, principlesList, params, countElement);
	}
};

// Function to update tag : 
const updateTag = async (tag, is_principle, is_system, principle_tag) => {

	const url = `http://127.0.0.1:2323/tags/update`

	const body = JSON.stringify({
		tag,
		is_principle,
		is_system,
		principle_tag
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
		alert("Tags Updated!");
	} catch (error) {
		console.error('Error fetching data:', error);
	}
};

// function for comment button: 
const commentTagButton = async (tag) => {

	// set current tag
	currentTag = tag;

	// organize current form
	document.forms["enabled-tags"].style.display = "none";
	document.forms["message-comment-form"].style.display = "block";

	//Prepare  form for comment
	closeMessageInput.style.display = "none";
	nextMessageButton.style.display = "none";
	previousMessageButton.style.display = "none";
	paragraphCommentMessage.innerHTML = `<strong> Tag :</strong> ${tag}`;
	headerCommentMessage.innerHTML = `Comment :`;

	// get and show comment
	const comment = await readComment(tag);
	await showCommentOrMessage(comment);
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

// Show last message in the form
const showCommentOrMessage = async (message) => {
	if (window.editor) {
		try {
			if (message) {
				let dataToRender;
				try {
					// Try to parse the message as JSON
					dataToRender = JSON.parse(message);
				} catch (error) {
					// If parsing fails, treat the message as plain text
					dataToRender = {
						blocks: [
							{
								type: 'paragraph',
								data: {
									text: message
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
// Get message from the form
const getMessageOrCommentForm = async () => {
	if (window.editor) {
		try {
			const savedData = await window.editor.save(); // Save the content of Editor.js

			// Check if the editor content is empty
			const isEmpty = savedData.blocks.length === 0 || savedData.blocks.every(block => !block.data.text.trim());

			if (isEmpty) {
				alert("The message or comment content cannot be empty.");
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

// Function to get message list
const messagesTagButton = async (tag) => {

	currentTag = tag;
	currentPage = 1;

	const messageTagName = document.querySelector('p[name="tag-name-message-list"]');
	messageTagName.innerHTML = `<strong> Tag :</strong> ${tag}`;

	const data = await getMessageList(currentTag, currentPage)
	await feedTableMessageList(data);

	document.forms["enabled-tags"].style.display = "none";
};

// Function to get list of message : 
const getMessageList = async (tag, page) => {


	const tag_string = encodeURIComponent(tag);
	const page_string = encodeURIComponent(page);

	try {
		const url = `http://127.0.0.1:2323/entries/messages/list?tag=${tag_string}&page=${page_string}`;
		const response = await fetch(url)

		if (!response.ok) {
			throw new Error(`HTTP error! Status: ${response.status}`);
		}

		const result = await response.json();
		return result

	} catch (error) {
		console.error('Error getting list of messages:', error);
		alert("Error list of messages");
	}
}

// Function to get message in function of a entry_id
const getMessageFromID = async (entryID) => {

	const id_string = encodeURIComponent(entryID);

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

// Function to feed table for message list: 
const feedTableMessageList = async (data) => {

	const form = document.forms["message-list"];
	const tbody = form.querySelector('tbody');

	// Clear existing rows
	tbody.innerHTML = '';

	// Check for empty data
	if (!data || data.length === 0) {
		form.style.display = "none";
		alert("No data available.");
		location.reload();
	};

	// Iterate over the data to create rows
	data.forEach(tag => {
		const row = document.createElement('tr');

		// entry_id
		const entryIdCell = document.createElement('td');
		const entryIdInput = document.createElement('input');
		entryIdInput.type = "text";
		entryIdInput.name = "message-id";
		entryIdInput.value = tag.entry_id;
		entryIdInput.disabled = true;
		entryIdCell.appendChild(entryIdInput);
		row.appendChild(entryIdCell);

		// chapter name 
		const chapterCell = document.createElement('td');
		const chapterInput = document.createElement('input');
		chapterInput.type = "text";
		chapterInput.name = "message-chapter";
		chapterInput.value = tag.chapter_name;
		chapterInput.disabled = true;
		chapterCell.appendChild(chapterInput);
		row.appendChild(chapterCell);

		// city
		const cityCell = document.createElement('td');
		const cityInput = document.createElement('input');
		cityInput.type = "text";
		cityInput.name = "message-city";
		cityInput.value = tag.city;
		cityInput.disabled = true;
		cityCell.appendChild(cityInput);
		row.appendChild(cityCell);

		// country
		const countryCell = document.createElement('td');
		const countryInput = document.createElement('input');
		countryInput.type = "text";
		countryInput.name = "message-country";
		countryInput.value = tag.country;
		countryInput.disabled = true;
		countryCell.appendChild(countryInput);
		row.appendChild(countryCell);

		// date
		const dateCell = document.createElement('td');
		const dateInput = document.createElement('input');
		dateInput.type = "text";
		dateInput.name = "message-date";
		dateInput.value = formatDate(tag.date);
		dateInput.disabled = true;
		dateCell.appendChild(dateInput);
		row.appendChild(dateCell);

		// Action button
		const actionCell = document.createElement('td');
		const actionButton = document.createElement('button');
		actionButton.type = "button";
		actionButton.name = "message-read";
		actionButton.textContent = "Read";
		actionButton.addEventListener('click', async (event) => {
			event.preventDefault();
			await readMessageButton(tag.entry_id);
		});
		actionCell.appendChild(actionButton);
		row.appendChild(actionCell);

		// Append the row to the table body
		tbody.appendChild(row);
	})
	// Display the form now that it's populated
	form.style.display = "block";
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

// Function to read message : 
const readMessageButton = async (entryID) => {

	document.forms["message-comment-form"].style.display = "block";
	document.forms["message-list"].style.display = "none";

	const data = await getMessageFromID(entryID)
	const message = data.message;
	currentID = data.entryID;
	currentDate = data.date;
	currentCity = data.city;
	currentCountry = data.country;

	// Prepare form to read message
	saveCommentInput.style.display = "none";
	paragraphCommentMessage.innerHTML = `<strong>Tag:</strong> ${currentTag} <br> <strong>Date :</strong> ${formatDate(currentDate)} <br> <strong>City:</strong> ${currentCity} <br> <strong>Country:</strong> ${currentCountry}`;
	headerCommentMessage.innerHTML = `Message :`;
	await showCommentOrMessage(message);

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
