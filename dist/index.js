"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const readline_1 = __importDefault(require("readline"));
const generative_ai_1 = require("@google/generative-ai");
const dotenv_1 = require("dotenv");
const hooks_1 = require("./hooks");
(0, dotenv_1.config)({
    path: ".env",
});
const genAIKey = new generative_ai_1.GoogleGenerativeAI(process.env.GEMINI_KEY);
// Function to read user input using readline
function getUserInput(prompt) {
    const rl = readline_1.default.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    return new Promise((resolve) => {
        rl.question(prompt, (answer) => {
            rl.close();
            resolve(answer);
        });
    });
}
// Function to read file content
async function readFile(filePath) {
    try {
        const data = await fs_1.default.readFileSync(filePath, "utf8");
        return data;
    }
    catch (error) {
        throw new Error(`Error reading file at path ${filePath}: ${error}`);
    }
}
// Function to generate content
async function main(genAI, prompt) {
    const maxRetries = 2;
    let attempts = 0;
    let success = false;
    let resultText;
    while (attempts < maxRetries && !success) {
        try {
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const result = await model.generateContent(prompt);
            resultText = result.response.text();
            success = true;
        }
        catch (error) {
            if (error instanceof Error) {
                attempts++;
                const delay = Math.pow(2, attempts) * 1000; // Exponential backoff
                console.log(`Rate limit exceeded. Retrying in ${delay / 1000} seconds...`);
                await new Promise(res => setTimeout(res, delay));
            }
            else {
                throw error;
            }
        }
    }
    if (success) {
        console.log(resultText);
    }
    else {
        console.error('Failed to complete request after several retries.');
    }
}
// Command-line loop
(async () => {
    while (true) {
        const userInput = await getUserInput("Enter a prompt (or type 'exit' to quit, 'help' for commands): ");
        if (userInput.toLowerCase() === "exit") {
            break;
        }
        else if (userInput.toLowerCase() === "help") {
            console.log("Available commands:");
            console.log("  - 'exit': Quit the application");
            console.log("  - 'help': Display this help message");
            console.log("  - 'explain <file_path>': Explain the code in the specified file");
            console.log("  - '<file_path>': Process the file at the specified path");
        }
        else {
            try {
                const parts = userInput.split(" ");
                const command = parts[0].toLowerCase();
                if (command === "explain") {
                    if (parts.length < 2) {
                        console.log("Please provide a file path after 'explain'.");
                        continue;
                    }
                    const filePath = parts[1];
                    const language = (0, hooks_1.DectectLanguage)(filePath);
                    const fileContent = await readFile(filePath);
                    // Construct the prompt for explanation
                    const prompt = `Explain the following ${language} code snippet:\n${fileContent}`;
                    await main(genAIKey, prompt);
                }
                else {
                    const filePath = userInput;
                    const language = (0, hooks_1.DectectLanguage)(filePath);
                    const fileContent = await readFile(filePath);
                    // Construct the prompt based on the file content
                    const prompt = `${language} ${fileContent}`;
                    await main(genAIKey, prompt);
                }
            }
            catch (error) {
                if (error instanceof Error) {
                    console.error(`Something Went Wrong: ${error.message}`);
                }
                else {
                    console.error("Unknown error occurred while processing the request.");
                }
            }
        }
    }
})();
