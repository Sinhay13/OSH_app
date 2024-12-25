let currentDate = 'None';
let nowDate = new Date().toISOString().split('T')[0];

const datePicker = document.querySelector('input[name="datePicker"]');
const selectedDate = document.querySelector('span[name="selectedDate"]');
const goToPrinciplesList = document.querySelector('button[name="start-system"]');
const resetButton = document.querySelector('button[name="reset"]');
const workingDate = document.getElementsByName('working-date')[0];
const divDate = document.getElementsByName("date-picker")[0];
const divButtonPrinciples = document.getElementsByName("buttons-principles")[0];

document.addEventListener('DOMContentLoaded', async () => {

	// hide elements: 
	divButtonPrinciples.style.display = "none";

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
	goToPrinciplesList.addEventListener('click', async () => {

		if (currentDate != 'None') {
			datePicker.disabled = true;
			// Call the principles function
			const principlesList = await principles();
			// Hide div date and show working date
			divDate.style.display = "none";
			workingDate.textContent = currentDate
			//Create buttons
			await feedButtons(principlesList);
			divButtonPrinciples.style.display = 'block';

		} else {
			alert('Select compatible data first');
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
		console.error('Error fetching principles:', error);
		return null;
	}
};

// Create buttons : 
const feedButtons = async (list) => {

	for (let i = 0; i < list.length; i++) {
		const button = document.createElement('button');
		button.textContent = list[i];
		button.className = 'system-principle-buttons';
		button.name = list[i];
		button.addEventListener('click', async () => {
			const listSystemTag = await systemTagsList(list[i])
			if (listSystemTag != "") {
				divButtonPrinciples.style.display = 'none';
				// start checking 
			} else {
				alert(`No system tag available in ${list[i]} for this date`)
				// desactive the principle button
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
	const listFinal = checkDate(list);
	return listFinal;
};

const checkDate = (list) => {

	// to continue 
	return list;
}