const vscode = require('vscode');
let fs = require("fs");
var HTMLParser = require('fast-html-parser');


/**
 * @param {vscode.ExtensionContext} context
 */

var count = 0;
let outputChannel;
var listOfUrls = [];
function activate(context) {

	outputChannel = vscode.window.createOutputChannel("LightningADA");

	//vscode.window.showInformationMessage('Congratulations, your extension "logan-test" is now active!');

	let disposable = vscode.commands.registerCommand('onAnalyzeLogan', function (uri) {

		count = 0;
		listOfUrls = [];
		let glob = uri.path+'/**.html'

	//	console.log(glob);
	//	console.log(vscode.workspace.workspaceFolders[0].uri.fsPath);
	//	vscode.workspace.findFiles('**/*.js', null, 100).then((uris) => {         
	//		uris.forEach((uri) => {              
	//			  console.log(uri.path);
	//		});
	//	 }); 
	


		//var url = vscode.Uri.file(uri.path);
		
		outputChannel.show();
		
		vscode.window.showInformationMessage('Analyzing your file(s). Please wait...');
		
		var url = uri.path;
		url = url.replace("/", "");
		url = url.replace(/\//g, "\\");
		
		fs.stat(url, (err, stats) => {
			if(err) {
				console.log(err);
			} else if(stats.isDirectory()) {
				findAllFiles(url);
			} else {
				analyzeADA(url);
			}
		});
		
		var name = "Loganathan";
		//readDirectories(vscode.workspace.workspaceFolders[0].uri.fsPath);
		
		setTimeout(function() {
			vscode.window.showInformationMessage('Your project has been analyzed successfully. Please check output terminal.');
			outputChannel.appendLine("Total Compliance: " + count);
			}, 5000);
		
		
	});

	context.subscriptions.push(disposable);
}

async function findAllFiles(url) {
	return await readDirectories(url);
}

async function readDirectories(dir) {

	fs.readdir(dir, (err, files) => {

		files.forEach((file) => {
			
			var url = vscode.Uri.file(file);
			var urlPath = url.path.replace("/","\\");
			url = dir + urlPath;

			//console.clear();
			fs.stat(url, (err, stats) => {
				if(err) {
					console.log(err);
				} else {
					if(stats.isDirectory()) {
						readDirectories(url);
					} else {
						//console.log(count + " : "+ url);
						//count++;
						if((url.toString().indexOf(".html") != -1) || (url.toString().indexOf(".cmp") != -1)) {
							analyzeADA(url)
							//listOfUrls.push(url);
							//console.log(url);
						}
						
					}
				 }
				
			  });
		});
	});

	return listOfUrls;
}

function analyzeADA(url) {
	
	var data = fs.readFileSync(url,
            {encoding:'utf8', flag:'r'});
 
	data = data.replace(/\n/g, "");
	var root = HTMLParser.parse(data);
	var firstNode = root.childNodes;
	analyzeRootTag(firstNode, url);
	
}

function analyzeRootTag(root, url) {
	for(var i=0; i<root.length; i++) {

		if(root[i].childNodes && root[i].childNodes.length) {
			var node = root[i].childNodes;
			var hasHtmlElement = false;
			for(var j=0; j<node.length; j++) {
				if(node[j].tagName) {
					hasHtmlElement = true;
					break;
				}
			}
			
			if(hasHtmlElement) {
				if(getTagName(root[i]) == "select") {
					analyzeChidTag(root[i], url);
				}
				analyzeRootTag(root[i].childNodes, url);			
			} else if(root[i].tagName) {
				analyzeChidTag(root[i], url);	
			}
			
		} else if(root[i].tagName) {
			analyzeChidTag(root[i], url);
		}
	}

}

function getTagName(childNode) {
	var tagName = childNode.tagName;
	if(childNode.rawAttrs && childNode.rawAttrs != '') {
		tagName = childNode.rawAttrs;
		if(tagName.indexOf(" ") != -1) {
			tagName = tagName.substring(0, tagName.indexOf(" "));
		}
		tagName = tagName.replace(":", "");
	}
	
	
	return tagName;

}

function analyzeChidTag(childNode, url) {
	//console.log(childNode.tagName + childNode.rawAttrs);
	var tagName = getTagName(childNode);
	validateAuraTag(childNode, url, tagName);
	
}

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}

function validateAuraTag(childNode, url, tagName) {
	
	var exclude = vscode.workspace.getConfiguration('LightningADAAnalyzer').get("tag-exclude"); 
	exclude = exclude.split(",");
	
	var filteredArr = exclude.filter(item => item.trim().toLowerCase() == tagName.trim().toLowerCase());

	if(filteredArr.length) {
		return false;
	}

	var rule = vscode.workspace.getConfiguration('LightningADAAnalyzer').get("rule-"+tagName);
	if(rule == undefined) {
		//console.debug("Rules Missing for the Tag: " + tagName);
		return false;
	}
	
	var err = [];
	rule.forEach(item => {
		var attribute = item.attribute;	
		
		if(item.required && (childNode.attributes[attribute] == undefined || childNode.attributes[attribute] == '""' || childNode.attributes[attribute] == '\'\'')) {
			var message = item.message ? item.message : "Attribute " + attribute + " should be presented";
			err.push("ERR>> " + message);
		} else if(!item.required && (childNode.attributes[attribute] || childNode.attributes[attribute] != '')) {
			var message = item.message ? item.message : "Attribute " + attribute + " should not presented";
			err.push("ERR>> " + message);
		}
	});

	if(err.length) {
		outputChannel.appendLine(url);
		outputChannel.appendLine(childNode.tagName+childNode.rawAttrs);
		err.forEach((item,index) => {
			outputChannel.appendLine(index+1 + " - " + item);
		})
		outputChannel.appendLine("-----------------------------------------------------------------------------------------");
		count = count + err.length;		
	}
}