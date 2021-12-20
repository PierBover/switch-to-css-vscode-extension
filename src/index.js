const vscode = require("vscode");
const path = require('path');
const fs = require('fs/promises');

const componentsExtensions = ['svelte', 'jsx', 'js', 'vue'];
const stylesExtensions = ['css', 'scss', 'less', 'sass'];

module.exports = {
	activate,
	deactivate,
};

function activate(context) {
	const commandID = "switch-to-related.switchTo";
	let disposable = vscode.commands.registerCommand(commandID, switchTo);
	context.subscriptions.push(disposable);
}

async function switchTo () {
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
}

async function exists (uri) {
	try {
		await vscode.workspace.fs.stat(uri);
		return true;
	} catch (error) {
		// console.log(error);
		// vscode.window.showInformationMessage(`${uri} file does not exist`);
		return false;
	}
}

async function openDocument (uri) {
	try {
		const document = await vscode.workspace.openTextDocument(uri);
		await vscode.window.showTextDocument(document, {preview: false});
	} catch (error) {
		console.log(error);
	}
}

async function getRelatedPath (currentDocumentPath) {
	const folderPath = path.dirname(currentDocumentPath);
	const currentFilename = path.basename(currentDocumentPath);
	const currentExtension = path.extname(currentDocumentPath);
	const currentNoExtension = currentFilename.replace(currentExtension, '');

	const folderFiles = await fs.readdir(folderPath);

	for (const filename of folderFiles) {
		if (filename !== currentFilename && filename.includes(currentNoExtension)) {
			return folderPath + '/' + filename;
		}
	}

	return null;
}

function deactivate() {}