let currentDate = 'None';
let nowDate = new Date();
let year = nowDate.getFullYear();
let month = String(nowDate.getMonth() + 1).padStart(2, '0'); // Months are zero-based
let day = String(nowDate.getDate()).padStart(2, '0');
nowDate = `${year}-${month}-${day}`;
let currentPrinciple = 'None';
let currentTag = 'None';
let currentMonth = 'None';
let listPrinciples = [];
let currentListSystemTag = [];


const datePicker = document.querySelector('input[name="datePicker"]');
const selectedDate = document.querySelector('span[name="selectedDate"]');
const goToPrinciplesList = document.querySelector('button[name="start-system"]');
const resetButton = document.querySelector('button[name="reset"]');
const workingDate = document.getElementsByName('working-date')[0];
const divDate = document.getElementsByName("date-picker")[0];
const divButtonPrinciples = document.getElementsByName("buttons-principles")[0];
const divProcessTag = document.getElementsByName("process-tag")[0];
const showCurrentTag = document.getElementsByName("current-tag")[0];
const formNewResult = document.getElementsByName("new-result")[0];
const sendResult = document.getElementsByName("send-new-result")[0];
const workingPrinciple = document.getElementsByName("current-principle")[0];
const inputObservation = document.getElementsByName("observation")[0];
const selectResult = document.getElementsByName("select-result")[0];
const lastDate = document.getElementsByName("last-date")[0];

document.addEventListener('DOMContentLoaded', async () => {

	const markdownElement = document.getElementById('markdown');
	if (markdownElement) {
		window.easyMDE = new EasyMDE({
			element: markdownElement,
		});
		// Start in preview mode for the first editor
		window.easyMDE.togglePreview();
	};

	// get last date
	await getLastDate()

	// hide elements: 
	divButtonPrinciples.style.display = "none";
	divProcessTag.style.display = "none";


	// reset button
	resetButton.addEventListener('click', async (event) => {
		event.preventDefault();
		location.reload();
	});


	// Selector Date : 
	datePicker.addEventListener('change', function () {
		if (datePicker.value < nowDate) {
			selectedDate.textContent = this.value; // The value is already in yyyy-mm-dd format
			currentDate = this.value;
		} else {
			selectedDate.textContent = "None";
			alert("You can't select Today or a future date");
		}
	});

	// Get principles list and go to the next step.
	goToPrinciplesList.addEventListener('click', async (event) => {
		event.preventDefault();
		if (currentDate != 'None') {
			datePicker.disabled = true;
			// Call the principles function
			const principlesList = await principles();
			listPrinciples = principlesList;
			// Hide div date and show working date
			divDate.style.display = "none";
			workingDate.textContent = `Current Date : ${currentDate}`
			//Create buttons
			await feedButtons(principlesList);
			divButtonPrinciples.style.display = 'block';

		} else {
			alert('Select compatible date first');
		}
	});

	// Check new result and insert data
	sendResult.addEventListener('click', async (event) => {
		event.preventDefault();

		// Prepare and validate data
		const dataAndCheck = await prepareResults();
		const data = dataAndCheck.data;
		const valid = dataAndCheck.valid;

		if (valid) {
			// Check previous results based on system type
			const dataToSend = await checkPreviousData(data);

			// Send result to the database and move to the next tag
			await sendToDb(dataToSend);
		} else {
			alert('Please correct the errors before submitting.');
		}
	});
});

// Get list of principles
const principles = async () => {

	const url = `http://127.0.0.1:2323/tags/principles`;

	try {
		const response = await fetch(url);
		if (!response.ok) {
			throw new Error(`HTTP error ! Status: ${response.status}`);
		}
		const data = await response.json();
		const principlesList = data.map(item => item.tag);
		const listFinal = principlesList.filter(item => item !== "侍Samurai" && item !== "none")
		return listFinal;
	} catch (error) {

	}
};

// Create buttons + add event listener on it : 
const feedButtons = async (list) => {

	for (let i = 0; i < list.length; i++) {
		const button = document.createElement('button');
		button.textContent = list[i];
		button.className = 'system-principle-buttons';
		button.name = list[i];
		button.addEventListener('click', async (event) => {
			currentPrinciple = list[i]
			workingPrinciple.textContent = `Current principle : ${currentPrinciple}`;
			event.preventDefault();
			const listSystemTag = await systemTagsList(list[i])
			if (listSystemTag != "") {
				divButtonPrinciples.style.display = 'none';
				divProcessTag.style.display = "block";
				await insertResult(listSystemTag)


			} else {
				alert(`No system tag available in ${list[i]} for this date`)
				await closePrinciple();

			}
		});
		divButtonPrinciples.appendChild(button);
	}
};

// get tag listSystem in function of principle
const systemTagsList = async (principle) => {

	const url = `http://127.0.0.1:2323/tags/system/list?principle=${principle}`;
	try {
		const response = await fetch(url);
		if (!response.ok) {
			throw new Error(`HTTP error ! Status: ${response.status} `)
		}
		const data = await response.json();
		const list = data.map(item => item.tag);
		const listFinal = await checkDate(list, currentDate);
		return listFinal;
	} catch (error) {
		console.error('Error fetching tag list:', error);
		return null;
	}
};

const checkDate = async (list, date) => {
	const filteredTags = [];

	// Map over the list and handle fetch requests concurrently
	const promises = list.map(async (tag) => {
		const url = `http://127.0.0.1:2323/system/list/check?tag=${tag}&date=${date}`;
		try {
			const response = await fetch(url);
			if (!response.ok) {
				throw new Error(`HTTP error! Status: ${response.status} for tag: ${tag}`);
			}
			const data = await response.json();
			if (data.count === 0) {
				return tag;
			}
		} catch (error) {
			console.error(`Error fetching for tag ${tag}:`, error);
		}
		return null;
	});

	// Resolve all promises
	const results = await Promise.all(promises);

	// Filter out null values
	results.forEach((result) => {
		if (result !== null) {
			filteredTags.push(result);
		}
	});

	return filteredTags;
};

const insertResult = async (list) => {

	currentListSystemTag = list;
	currentTag = list[0];
	showCurrentTag.textContent = `Current Tag: ${currentTag}`
	await updateCommentAndPastResults();
}

// Prepare results from the form
const prepareResults = async () => {
	let valid = true;

	const date = currentDate;
	const tag = currentTag;

	const form = document.forms['new-result'];
	const result = parseInt(form['select-result'].value, 10);
	let observation = form['observation'].value.trim(); // Trim whitespace

	// Validation: Ensure observation is mandatory when result === 0
	if (result === 0 && observation === "") {
		alert('In this case, observation is mandatory!');
		valid = false;
	}

	const data = [
		{ date },
		{ tag },
		{ result },
		{ observation },
	];

	return { valid, data };
};


// delete principle of the current principle when complete 
const closePrinciple = async () => {
	const principle = currentPrinciple;
	listPrinciples = listPrinciples.filter(item => item !== principle); // Directly reassign listPrinciples
	divButtonPrinciples.textContent = ""; // Clear the div content
	if (listPrinciples.length > 0) {
		await feedButtons(listPrinciples); // Feed updated listPrinciples
	} else {
		alert('Update of the system complete !')
		location.reload();
	}

};

// Check previous results
const checkPreviousData = async (data) => {

	if (data[2].result === 0) {
		alert('Ok for this time !');
		data[2].result = 'blue';
	} else if (data[2].result === 1) {
		alert('Good Job Samurai !')
		data[2].result = 'green';
	} else {
		const type = await getTypeSystem(data[1].tag);
		if (type === 'S') {
			alert(' It is a special tag, you have no excuses Samurai... Take action !')
			data[2].result = 'red';
			await sendMessageToReminds();
		} else if (type === 'A') {
			data[2].result = await checkActiveTag(data)
			if (data[2].result === 'red') {
				alert(' You failed samurai take actions !')
				await sendMessageToReminds();
			} else {
				alert('You have a second chance Samurai, you can do it !')
			}
		} else if (type === 'P') {
			data[2].result = await checkPassiveTag(data)
			if (data[2].result === 'red') {
				alert(' You failed samurai take actions !')
				await sendMessageToReminds();
			} else {
				alert(' You failed this time, but do better next time ! ')
			}
		}
	}
	return data;
}

// Function to get the system type of the tag. 
const getTypeSystem = async (tag) => {

	const url = `http://127.0.0.1:2323/tags/system?tag=${tag}`;
	try {

		const response = await fetch(url);
		if (!response.ok) {
			throw new Error(`HTTP error ! status: ${response.status}`);
		}
		const data = await response.json();
		const type = data.type;
		return type;
	} catch (error) {
		console.error(`Error fetching type system for tag "${tag}":`, error);
		return null;

	}
}

// Check Active tag
const checkActiveTag = async (data) => {

	const tag = data[1].tag;

	const url = `http://127.0.0.1:2323/system/check/active?tag=${tag}`;

	try {

		const response = await fetch(url);
		if (!response.ok) {
			throw new Error(`HTTP error ! status: ${response.status}`);
		}
		const data = await response.json();

		if (data.result === 'green') {
			return 'yellow';
		} else {
			return 'red';
		}

	} catch (error) {
		console.error(`Error fetching check active tag for tag: "${tag}":`, error);
		return null;

	}
}

// Check Active tag
const checkPassiveTag = async (data) => {

	const tag = data[1].tag;

	const url = `http://127.0.0.1:2323/system/check/passive?tag=${tag}`;

	try {

		const response = await fetch(url);
		if (!response.ok) {
			throw new Error(`HTTP error ! status: ${response.status}`);
		}
		const data = await response.json();

		if (data.count <= 2) {
			return 'yellow';
		} else {
			return 'red';
		}

	} catch (error) {
		console.error(`Error fetching check passive tag for tag: "${tag}":`, error);
		return null;

	}
}

// Send data 
const sendToDb = async (dataArray) => {

	const url = `http://127.0.0.1:2323/system/insert`;

	const data = dataArray.reduce((acc, curr) => {
		return { ...acc, ...curr };
	}, {});

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
		alert("system updated !");
		await goToNextTag();
	} catch (error) {
		console.error('Error fetching data:', error);
	}
}

// Go to the next tag
const goToNextTag = async () => {
	// Prepare results and validate before transitioning
	const { valid } = await prepareResults();
	if (!valid) {
		alert('Complete the current tag before proceeding.');
		return;
	}

	// Reset elements
	inputObservation.value = " ";
	selectResult.value = "1";

	const list = currentListSystemTag;
	list.shift();
	currentListSystemTag = list;
	if (list.length > 0) {
		currentTag = list[0];
		showCurrentTag.textContent = `Current Tag: ${currentTag}`;
		await updateCommentAndPastResults();
	} else {
		// Hide elements
		divProcessTag.style.display = "none";
		divButtonPrinciples.style.display = 'block';
		await closePrinciple();
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

// Function to show comment 
const showComment = async (message) => {
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
};


// get the 30 last results : 
const getPreviousResults = async () => {
	const tag = currentTag;

	try {
		const url = `http://127.0.0.1:2323/system/select?tag=${tag}`;
		const response = await fetch(url)

		if (!response.ok) {
			throw new Error(`HTTP error! Status: ${response.status}`);
		}

		const results = await response.json();
		return results

	} catch (error) {
		console.error('Error getting comment:', error);
		alert("Error getting comment");
	}

}

// Feed table with previous result :
const showPreviousResults = async (results) => {

	// Get the table
	const tbody = document.querySelector('form[name="previous-result"] tbody');

	// delete all the lines except the first one.
	while (tbody.rows.length > 1) {
		tbody.deleteRow(1);
	}

	// Reset the date of the first line
	const firstRowInputs = tbody.rows[0].querySelectorAll('input');
	firstRowInputs.forEach(input => {
		input.value = '';
		input.style.backgroundColor = '';
	});

	// If no data disabled input of the first line
	if (!results || results.length === 0) {
		firstRowInputs.forEach(input => {
			input.disabled = true;
		});
		return;
	}

	// add lines
	results.forEach((result, index) => {
		let row;
		if (index === 0) {
			row = tbody.rows[0];
		} else {
			row = tbody.insertRow();
			row.innerHTML = `
                <td><input type="text" name="result-tag"></td>
                <td><input type="text" name="result-date"></td>
                <td><input type="text" name="result-observation"></td>
            `;
		}

		// feed table
		const inputs = row.querySelectorAll('input');
		inputs[0].value = result.tag;
		inputs[1].value = result.date;
		inputs[2].value = result.observation;

		// Put colors to observation in function of result
		const observationInput = inputs[2];
		if (result.result === 'green') {
			observationInput.style.backgroundColor = '#90EE90';
		} else if (result.result === 'red') {
			observationInput.style.backgroundColor = '#FFB6C1';
		} else if (result.result === 'blue') {
			observationInput.style.backgroundColor = '#87CEEB';
		}
		else {
			observationInput.style.backgroundColor = '#FFFF00';
		}

		// disabled all result ! 
		inputs.forEach(input => {
			input.disabled = true;
		});
	});
};

// update comment + message in function of the current tag: 
const updateCommentAndPastResults = async () => {

	const message = await readComment(currentTag)
	await showComment(message);

	const results = await getPreviousResults();
	await showPreviousResults(results);
}

// Send message to reminds (take actions)
const sendMessageToReminds = async () => {

	const tag = currentTag;

	try {
		const url = `http://127.0.0.1:2323/reminds/action?tag=${tag}`;
		const response = await fetch(url)

		if (!response.ok) {
			throw new Error(`HTTP error! Status: ${response.status}`);
		}

		const data = await response.json();
		console.log("Message sent to Reminds ! ");

	} catch (error) {
		console.error('Error getting comment:', error);
		alert("Error getting comment");
	}

}

// get last date
const getLastDate = async () => {

	try {
		const url = `http://127.0.0.1:2323/system/last`;
		const response = await fetch(url)

		if (!response.ok) {
			throw new Error(`HTTP error! Status: ${response.status}`);
		}

		const data = await response.json();
		// Safely update its content
		if (lastDate && data.last) {
			lastDate.innerHTML = `<strong>Last date in the system is: ${data.last}</strong>`;
		} else {
			console.error("Element or data is missing.");
		}

	} catch (error) {
		console.error('Error getting comment:', error);
		alert("Error getting comment");
	}
}