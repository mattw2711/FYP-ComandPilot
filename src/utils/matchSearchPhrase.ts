import CSConfig from "../config";
import { window } from "vscode";

/**
 * Match the giving string with search pattern
 * @param {string} input
 * @returns {SearchMatchResult} if found, return the search phrase, comment's opening and closing syntax
 */
export function matchSearchPhrase(input: string): string {
    const match = CSConfig.SEARCH_PATTERN.exec(input);

    //console.log("Match:", match);

    if (match && match.length > 2) {
        const [_, commentSyntax, searchPhrase, commentSyntaxEnd] = match;        
        return `${searchPhrase}`;
    }

    return "";
}