
document.addEventListener('DOMContentLoaded', async () => {

	// Init variables:

	// hide form : 
	document.forms["disabled-tags"].style.display = "none";
	document.forms["enabled-tags-filters"].style.display = "none";
	document.forms["enabled-tags"].style.display = "none";
	document.forms["full-tags"].style.display = "none";
	document.forms["chapters-filter"].style.display = "none";
	document.forms["message-list"].style.display = "none";

	// Buttons and elements :
	const enabledTagsButton = document.querySelector('button[name="enabled-tags-button"]');
	const disabledTagsButton = document.querySelector('button[name="disabled-tags-button"]');
	const allTagsButton = document.querySelector('button[name="all-tags-button"]');
	const returnButtons = document.querySelectorAll('button[name="return"]');
	const applyFiltersButtons = document.querySelectorAll('button[name="apply-filters-tags"]');



	// Form "status-tag" //

	enabledTagsButton.addEventListener('click', async (event) => {
		event.preventDefault();

		const principlesList = await principles();
		await feedPrinciple(principlesList);

		document.forms["enabled-tags-filters"].style.display = "block";
		document.forms["status-tags"].style.display = "none";
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

	// Form "enabled-tags-filters" //

	applyFiltersButtons.addEventListener('click', async (event) => {
		event.preventDefault();

		document.forms["enabled-tags-filters"].style.display = "none";
		document.forms["enabled-tags"].style.display = "block";
	});


});

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
	principleFilterSelect.innerHTML = '<option value="all">All</option>';

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



