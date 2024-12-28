let currentDate = 'None';
let nowDate = new Date().toISOString().split('T')[0];
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
const formPreviousResult = document.getElementsByName("previous-result")[0];
const formCommentTag = document.getElementsByName("comment-tag")[0];
const sendResult = document.getElementsByName("send-new-result")[0];
const workingPrinciple = document.getElementsByName("current-principle")[0];

document.addEventListener('DOMContentLoaded', async () => {

	const markdownElement = document.getElementById('markdown');
	if (markdownElement) {
		window.easyMDE = new EasyMDE({
			element: markdownElement,
		});
		// Start in preview mode for the first editor
		window.easyMDE.togglePreview();
	};

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

		// prepare and check data
		const dataAndCHeck = await prepareResults();
		const data = dataAndCHeck.data;
		const valid = dataAndCHeck.valid;
		if (valid != false) {
			// Check previous results in function of System type
			const dataToSend = await checkPreviousData(data);
			console.log(dataToSend);
			// Send result in the database and go to the next step 
			//await sendToDb(dataToSend);
		}
	})
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
		console.error('Error fetching principles:', error);
		return null;
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
				formCommentTag.style.display = "none";
				formPreviousResult.style.display = "none";
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
	const response = await fetch(url);
	const data = await response.json();
	const list = data.map(item => item.tag);
	const listFinal = checkDate(list, currentDate);
	return listFinal;
};

const checkDate = async (list, date) => {
	const listFinal = [];

	for (let i = 0; i < list.length; i++) {
		const tag = list[i];
		const url = `http://127.0.0.1:2323/system/list/check?tag=${tag}&date=${date}`;
		const response = await fetch(url);
		const data = await response.json();
		if (data.count === 0) {
			listFinal.push(tag);
		}
	}
	return listFinal;
}

const insertResult = async (list) => {

	currentListSystemTag = list;
	currentTag = list[0];
	showCurrentTag.textContent = `Current Tag: ${currentTag}`
}

// Prepare results from the form
const prepareResults = async () => {

	let valid = true;

	const date = currentDate;
	const tag = currentTag;

	const form = document.forms['new-result'];
	const result = parseInt(form['select-result'].value, 10);
	let observations = form['Observations'].value;

	if (result === 0) {
		if (observations === "") {
			alert('In this case observations are mandatory !')
			valid = false;
		}
	}

	if (observations === "") {
		observations = "none";
	}

	const data = [
		{ date },
		{ tag },
		{ result },
		{ observations }
	];

	return { valid, data };
}


// delete principle of the current principle when complete 
const closePrinciple = async () => {

	const principle = currentPrinciple;
	const list = listPrinciples
	list = list.filter(item => item !== principle);
	currentPrinciple = list;
	divButtonPrinciples.textContent = " "
	await feedButtons(list);
}

// Check previous results
const checkPreviousData = async (data) => {

	if (data.result === 0) {
		alert('Ok for this time !');
	} else if (data.result === 1) {
		alert('Good Job Samurai !')
	} else {
		const type = await getTypeSystem(data.tag);
		if (type === 'S') {
			alert(' It is a special tag, you no excuses Samurai... Take action !')
			data.result = 'red';
		} else if (type === 'A') {
			data.result = await checkActiveTag(data)
			if (data.result === 'red') {
				alert(' You failed samurai take actions !')
			} else {
				alert('You have a second chance Samurai, you can do it !')
			}
		} else if (type === 'P') {
			data.result = await checkPassiveTag(data)
			if (data.result === 'red') {
				alert(' You failed samurai take actions !')
			} else {
				alert(' You failed this time, but do better next time ! ')
			}
		}
	}
	return data;
}