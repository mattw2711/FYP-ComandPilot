import { getApiKey } from './apiKey';
import * as vscode from 'vscode';
import OpenAI from "openai";

const key = getApiKey();
const openai = new OpenAI({apiKey: key});
let assistant: OpenAI.Beta.Assistants.Assistant | null = null;

export async function createBot() {
    assistant = await openai.beta.assistants.create({
        name: "Code generator",
        instructions: `You are a helpful assistant to be used by novice programmers.
        Only provide code, no explanation. 
        All code should be in the form of a single text function in Java with no comments or explanation`,
        tools: [{ type: "code_interpreter" }],
        model: "gpt-4-turbo-preview"
    });
}

export async function search(keyword: string): Promise<string > {
    console.log("Search Phrase:", keyword);

    // eslint-disable-next-line no-async-promise-executor
    const promise = new Promise<string>(async (resolve, reject) => {
        vscode.window.showInformationMessage(`CommandPilot: Searching for results`);
        let results = "";

        if(assistant){
            try {
                const thread = await openai.beta.threads.create();
                await openai.beta.threads.messages.create(
                    thread.id,
                    {
                    role: "user",
                    content: keyword
                    }
                );

                let run = await openai.beta.threads.runs.create(
                    thread.id,
                    { 
                    assistant_id: assistant.id,
                    }
                );

                run = await openai.beta.threads.runs.retrieve(
                    thread.id,
                    run.id
                  );

                while(run.status !== "completed"){
                    run = await openai.beta.threads.runs.retrieve(
                        thread.id,
                        run.id
                    );
                }

                const messages = await openai.beta.threads.messages.list(
                    thread.id
                );

                console.log("Messages:", messages);
                if (messages.data[0].content[0].type === 'text') {
                    results = messages.data[0].content[0].text.value;
                }

                await openai.beta.threads.del(thread.id);

                //console.log("Results:", results);
                resolve(results);
            } catch (error) {
                console.error('Error getting results:', error);
                reject(error);
            }
        }


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

        vscode.window.showInformationMessage(`CommandPilot: Finished loading results`);
    });
    return promise;
}

