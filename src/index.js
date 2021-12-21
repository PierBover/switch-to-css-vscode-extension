const vscode = require("vscode");
const path = require('path');
const fs = require('fs/promises');

module.exports = {
	activate,
	deactivate,
};

function activate (context) {
	const commandID = "switch-to-related.switchTo";
	let disposable = vscode.commands.registerCommand(commandID, switchTo);
	context.subscriptions.push(disposable);		
}

async function switchTo () {

	try {
		const activeEditor = vscode.window.activeTextEditor;

		if (!activeEditor) return;
	
		const currentDocumentPath = vscode.window.activeTextEditor.document.fileName;
	
		const relatedPath = await getRelatedPath(currentDocumentPath);
	
		if (!relatedPath) {
			vscode.window.showInformationMessage('Related file does not exist');
			return;
		}
	
		const relatedUri = vscode.Uri.file(relatedPath);
		await openDocument(relatedUri);	

	} catch (error) {
		console.log(error);
		throw error;
	}
}

async function openDocument (uri) {
	try {
		const document = await vscode.workspace.openTextDocument(uri);
		await vscode.window.showTextDocument(document, {preview: false});
	} catch (error) {
		console.log(error);
		throw error;
	}
}

async function getRelatedPath (currentDocumentPath) {
	const folderPath = path.dirname(currentDocumentPath);
	const currentFilename = path.basename(currentDocumentPath);
	const currentExtension = path.extname(currentDocumentPath);
	const currentNoExtension = currentFilename.replace(currentExtension, '');

	const folderFiles = await fs.readdir(folderPath);

	for (const filename of folderFiles) {
		if (filename !== currentFilename &&	filename.includes(currentNoExtension)) {
			const extension = path.extname(filename);
			const noExtension = filename.replace(extension, '');
			if (noExtension === currentNoExtension) return folderPath + '/' + filename;
		}
	}

	return null;
}

function deactivate() {}