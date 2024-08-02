"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const readline_1 = __importDefault(require("readline"));
const generative_ai_1 = require("@google/generative-ai");
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)({
    path: ".env",
});
const genAIKey = new generative_ai_1.GoogleGenerativeAI(process.env.GEMINI_KEY);
// Function to read user input using readline
function getUserInput(prompt) {
    const rl = readline_1.default.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    return new Promise((resolve) => {
        rl.question(prompt, (answer) => {
            rl.close();
            resolve(answer);
        });
    });
}
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
                await new Promise((res) => setTimeout(res, delay));
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
        console.error("Failed to complete request after several retries.");
    }
}
(async () => {
    while (true) {
        try {
            const userInput = await getUserInput("Enter your prompt: ");
            // Exit condition for the loop
            if (userInput.toLowerCase() === "exit") {
                console.log("Exiting...");
                break;
            }
            await main(genAIKey, userInput);
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
})();
