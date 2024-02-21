import { getApiKey } from './apiKey';
import * as vscode from 'vscode';
import OpenAI from "openai";

const key = getApiKey();
const openai = new OpenAI({apiKey: key});
let assistant: OpenAI.Beta.Assistants.Assistant | null = null;

export async function createBot() {
    assistant = await openai.beta.assistants.retrieve(
        "asst_M8LhgFGO45Nx5UOp3brLbBzh"
    );
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
                results = results.replace("```java", "");
                results = results.replace("```", "");
                resolve(results.trim());
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

