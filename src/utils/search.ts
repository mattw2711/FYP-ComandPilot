import * as vscode from 'vscode';
import OpenAI from "openai";

const key = "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";
const cachedResults: { [keyword: string]: string } = {};
const openai = new OpenAI({apiKey: key});

export async function search(keyword: string): Promise<null |  string > {
    if (keyword in cachedResults) {
        return Promise.resolve(cachedResults[keyword]);
    }

    console.log("Keyword: ", keyword);

    // eslint-disable-next-line no-async-promise-executor
    const promise = new Promise<string>(async (resolve, reject) => {

        vscode.window.showInformationMessage(`CommandPilot: Searching for results`);
        let results = "";

        try {
            const completion = await openai.chat.completions.create({
                messages: [{ role: "system", content: keyword }],
                model: "gpt-3.5-turbo",
            });

            console.log(completion.choices[0]);
            results = completion.choices[0].message.content ?? "";
            resolve(results);
        } catch (error) {
            console.error('Error getting results:', error);
            reject(error);
        }

        console.log();

        promise.then((results) => {
            vscode.window.showInformationMessage(`CommandPilot: Finished loading results`);
            const editor = vscode.window.activeTextEditor;
            if (editor) {
                const position = editor.selection.active;
                editor.edit(editBuilder => {
                    editBuilder.insert(position, '\n');
                }).then(() => {
                    vscode.commands.executeCommand('cursorMove', { to: 'down', by: 'line', value: 1});
                });
            }
        });
        // When promise resolved, show finished loading for 5 seconds
        vscode.window.showInformationMessage(`CommandPilot: Finished loading results`);
    });
    return promise;
}

