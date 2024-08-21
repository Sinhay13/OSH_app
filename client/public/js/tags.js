
document.addEventListener('DOMContentLoaded', async () => {

	// Init variables:
	let dataTagsEnabled;

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
	const applyFiltersButton = document.querySelector('button[name="apply-filters-tags"]');
	const countElement = document.querySelector('p[name="count-tags"]');
	const isPrincipleFilter = document.querySelector('select[name="is-principle-filter"]');
	const principleFilter = document.querySelector('select[name="principle-filter"]');


	// Count Tags //
	await countAndShowTags(countElement);

	// Form "status-tag" //

	// for enabled tags
	enabledTagsButton.addEventListener('click', async (event) => {
		event.preventDefault();

		// get principle List
		const principlesList = await principles();
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

	// Form "enabled-tags-filters" //

	applyFiltersButton.addEventListener('click', async (event) => {
		event.preventDefault();

		const params = await getParamsForFilteringTagsEnabled();
		dataTagsEnabled = await getListTagsEnabledFiltered(params);
		console.log(dataTagsEnabled)


		document.forms["enabled-tags-filters"].style.display = "none";
		document.forms["enabled-tags"].style.display = "block";

		// feed table with the function
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
	principleFilterSelect.innerHTML = '<option value="all">All</option>,<option value="none">none</option> ';

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
		isSystem = 0;
	} else {
		isSystem = null;
	}

	let isPrinciple = form.querySelector('select[name="is-principle-filter"]').value;
	if (isPrinciple === 'yes') {
		isPrinciple = 1;
	} else if (isPrinciple === 'no') {
		isPrinciple = 0;
	} else {
		isPrinciple = null;
	}

	let principle = form.querySelector('select[name="principle-filter"]').value;
	if (principle === 'all') {
		principle = null
	}

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
		console.log(data);
		alert("New message sent !");
		resetProcess();
	} catch (error) {
		console.error('Error fetching data:', error);
	}

}


