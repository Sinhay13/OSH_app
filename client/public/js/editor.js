// editor.js
window.editor = null; // Initialize global editor variable

document.addEventListener('DOMContentLoaded', () => {
	const editorHolder = document.getElementById('editorjs');

	if (editorHolder) {
		window.editor = new EditorJS({
			holder: 'editorjs',
			tools: {
				header: {
					class: window.Header,
					inlineToolbar: ['link'],
				},
				checklist: {
					class: Checklist,
					inlineToolbar: true,
				},
				list: {
					class: window.List,
					inlineToolbar: true,
				},
				quote: {
					class: window.Quote,
					inlineToolbar: true,
				},
				code: {
					class: window.CodeTool,
				},
				delimiter: window.Delimiter,
				embed: {
					class: window.Embed,
					config: {
						services: {
							youtube: true,
							coub: true,
						},
					},
				},
			},
			data: {},
			onReady: () => {
				console.log('Editor.js is ready to work!');
			},
			onChange: () => {
				window.editor.save().then((outputData) => {
					const textarea = document.getElementById('editor-content');
					if (textarea) {
						textarea.value = JSON.stringify(outputData);
					} else {
						console.error('Textarea not found');
					}
				}).catch((error) => {
					console.log('Saving failed: ', error);
				});
			},
		});

		// Load initial content if available
		const textarea = document.getElementById('editor-content');
		if (textarea && textarea.value) {
			window.editor.render(JSON.parse(textarea.value));
		}
	} else {
		console.log('Editor.js holder element not found. Editor.js was not initialized.');
	}
});