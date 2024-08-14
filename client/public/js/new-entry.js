document.addEventListener('DOMContentLoaded', () => {
	const messageForm = document.forms['message-form'];

	messageForm.addEventListener('submit', (event) => {
		event.preventDefault(); // Prevent the form from submitting
		const textarea = document.getElementById('editor-content');
		const data = textarea.value;
		console.log(data);
	});
});




