/* eslint-disable @typescript-eslint/naming-convention */
import * as vscode from 'vscode';

import fetch from 'node-fetch';
let addContext: string | undefined;
let connSett: string | undefined;
export async function addAdditionalContext() {

  addContext = await vscode.window.showInputBox({
    placeHolder: "Descirbe a brief overview of what you are programming, Follow this 'This website utilizes a whiteish theme with a modern design and is a shop website'",
    prompt: "This Program/Website is ...",
    value: ""
  });



}
export async function grabTextAndSendToApi() {
  // Get the active text editor.
  const editor = vscode.window.activeTextEditor;

  // If there is no active text editor, return.
  if (!editor) {
    return;
  }

  // Get the current line number.
  const lineNumber = editor.selection.start.line;

  // Get the text on the current line.
  let text = editor.document.lineAt(lineNumber).text;
  let texts: string[] = [];
  let i = lineNumber;
  while (i > lineNumber - 5 && i != 1) {
    texts.push(editor.document.lineAt(i).text);
    i = i - 1;
  }
  text = texts.join("/n")
  // Create body of POST request

  const prompt = "\n### Instruction:  Additional context is the following " + addContext + " Continue the following line of code to complete it Do not include any explanations or descriptions of the code "+ text +"\n### Response:\n";
  const temperature = 0.5;
  const  top_p = 0.9;
  const max_length = 30;

   // Send the text to the API.
  const response = await fetch(connSett + '/api/v1/generate', {
    method: 'POST',
    headers: {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({prompt, temperature, top_p, max_length})
  });

  // Get the response from the API.
  const responseData = await response.json();
  // truncate response
  const str = responseData.results[0].text;
  let trimmedStr = str;
  // Add the new text to the line that was selected.
  editor.insertSnippet(new vscode.SnippetString(trimmedStr), new vscode.Position(lineNumber, editor.document.lineAt(lineNumber).text.length));
}
export async function customPromptSnippetfn() {
    // Get the active text editor.
    const editor = vscode.window.activeTextEditor;
      // If there is no active text editor, return.
  if (!editor) {
    return;
  }

    // Get the current line number.
    const lineNumber = editor.selection.start.line;

    // Get the text on the current line.
    const text = editor.document.lineAt(lineNumber).text;




  // Create body of POST request

  let snippetPrompt = await vscode.window.showInputBox({
    placeHolder: "Enter what you wish this snippet to contain or do",
    prompt: "This snippet should perform the following tasks ...",
    value: ""
  });
  const prompt = "\n### Instruction: Follow these instructions to create a snippet of code for the request and after finishing the code please stop generating new tokens." + snippetPrompt + " \n### Response:\n";
  const temperature = 0.5;
  const  top_p = 0.9;
  const max_length = 300;

   // Send the text to the API.
  const response = await fetch(connSett + '/api/v1/generate', {
    method: 'POST',
    headers: {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({prompt, temperature, top_p, max_length})
  });

  // Get the response from the API.
  const responseData = await response.json();
  // truncate response
  const str = responseData.results[0].text;
  // Add the new text to the line that was selected.
  editor.insertSnippet(new vscode.SnippetString(str), new vscode.Position(lineNumber, editor.document.lineAt(lineNumber).text.length));
}
export async function testConnection() {
  let corrconn = false;
  let lloop = false;
  while (!corrconn && !lloop) {
  let tempconnSett = await vscode.window.showInputBox({
    placeHolder: "write in your koboldai API link, usually it will be localhost:5001, it can also be your ipv4:5001",
    prompt: "Kobold API link",
    value: ""
  });
  if (tempconnSett == undefined) {
    lloop = true;
  } else {
    tempconnSett = 'http://'+tempconnSett;
  }
  let response: any;
  let status: number; 
  fetch(tempconnSett + '/api/v1/info/version')
  .then((res) => { 
    status = res.status; 
    return res.json();
  })
  .then((jsonResponse) => {
    corrconn = true;
    connSett = tempconnSett;
  })
  .catch((err) => {
    corrconn = false;
  });
  
}
}

export function activate(context: vscode.ExtensionContext) {
  const command = 'koboldconnect.grabTextAndSendToApi';
  
  const commandHandler = () => {
    grabTextAndSendToApi();
  };
  const addAdditionalContextCommand = 'koboldconnect.AddContext';
  const addAdditionalContextCommandHandler = () => {
    addAdditionalContext();
  };

  const customPromptSnippet = 'koboldconnect.CustomPrompt';
  const customPromptSnippetCommandHandler = () => {
    customPromptSnippetfn();
  };

  const startConnectionKobold = 'koboldconnect.ConnectApi';
  const startConnHandler = () => {
    testConnection();
  };

  context.subscriptions.push(vscode.commands.registerCommand(command, commandHandler));
  context.subscriptions.push(vscode.commands.registerCommand(addAdditionalContextCommand, addAdditionalContextCommandHandler));
  context.subscriptions.push(vscode.commands.registerCommand(customPromptSnippet, customPromptSnippetCommandHandler));
  context.subscriptions.push(vscode.commands.registerCommand(startConnectionKobold, startConnHandler));
  }