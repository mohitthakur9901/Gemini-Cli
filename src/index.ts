import fs from "fs";
import readline from "readline";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { config } from "dotenv";
import { DectectLanguage , ReadFileData } from "./hooks";

config({
  path: ".env",
});

const genAIKey = new GoogleGenerativeAI(process.env.GEMINI_KEY as string);

// Function to read user input using readline
function getUserInput(prompt: string): Promise<string> {
  const rl = readline.createInterface({
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
async function readFile(filePath: string): Promise<string> {
  try {
    const data = await fs.readFileSync(filePath, "utf8");
    return data;
  } catch (error) {
    throw new Error(`Error reading file at path ${filePath}: ${error}`);
  }
}

// Function to generate content
async function main(genAI: GoogleGenerativeAI, prompt: string) {
  const maxRetries = 2;
  let attempts = 0;
  let success = false;
  let resultText: string | undefined;

  while (attempts < maxRetries && !success) {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(prompt);
      resultText = result.response.text();
      success = true;
    } catch (error) {
      if (error instanceof Error) {
        attempts++;
        const delay = Math.pow(2, attempts) * 1000; // Exponential backoff
        console.log(`Rate limit exceeded. Retrying in ${delay / 1000} seconds...`);
        await new Promise(res => setTimeout(res, delay));
      } else {
        throw error;
      }
    }
  }

  if (success) {
    console.log(resultText);
  } else {
    console.error('Failed to complete request after several retries.');
  }
}

// Command-line loop
(async () => {
  while (true) {
    const userInput = await getUserInput(
      "Enter a prompt (or type 'exit' to quit, 'help' for commands): "
    );

    if (userInput.toLowerCase() === "exit") {
      break;
    } else if (userInput.toLowerCase() === "help") {
      console.log("Available commands:");
      console.log("  - 'exit': Quit the application");
      console.log("  - 'help': Display this help message");
      console.log("  - '<file_path>': Process the file at the specified path");
    } else {
      try {
        const parts = userInput.split(" ");
        const command = parts[0].toLowerCase();

        if (command === "") {
          if (parts.length < 2) {
            console.log("Please provide a file path after 'explain'.");
            continue;
          }
          const filePath = parts[1];
          const language = DectectLanguage(filePath);
          const fileContent = await readFile(filePath);

          // Construct the prompt for explanation
          const prompt = `Explain the following ${language} code snippet:\n${fileContent}`;
          await main(genAIKey, prompt);
        } else {
          const filePath = userInput;
          const language = DectectLanguage(filePath);
          const fileContent = await readFile(filePath);

          // Construct the prompt based on the file content
          const prompt = `${language} ${fileContent}`;
          await main(genAIKey, prompt);
        }
      } catch (error) {
        if (error instanceof Error) {
          console.error(`Something Went Wrong: ${error.message}`);
        } else {
          console.error("Unknown error occurred while processing the request.");
        }
      }
    }
  }
})();
