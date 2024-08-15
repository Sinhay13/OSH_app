document.addEventListener('DOMContentLoaded', () => {

	// init variables
	let tag;
	let city;
	let country;
	let message;
	let date;

	// hide forms 
	document.forms["city-country-form"].style.display = "none";
	document.forms["message-form"].style.display = "none";
	document.forms["date-form"].style.display = "none";

	// Add event listener for the "submit" event on the tag form
	document.forms["tag-form"].addEventListener("submit", function (event) {
		event.preventDefault(); // Prevent the default form submission



		// Show the next form, for example the "city-country-form"
		document.forms["city-country-form"].style.display = "block";

		// Hide the tag form
		document.forms["tag-form"].style.display = "none";

	});

});



// get tag list 
const getTagList = async () => {

};

// get tag from form
const getTagForm = async () => {
	const tag = ''
	return tag
};

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






