import readline from "readline";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { config } from "dotenv";

config({
  path: ".env",
});

const genAIKey = new GoogleGenerativeAI(process.env.GEMINI_KEY as string);

// Function to read user input using readline
function getUserInput(prompt: string): Promise<string> {
  const rl = readline.createInterface({
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
        console.log(
          `Rate limit exceeded. Retrying in ${delay / 1000} seconds...`
        );
        await new Promise((res) => setTimeout(res, delay));
      } else {
        throw error;
      }
    }
  }

  if (success) {
    console.log(resultText);
  } else {
    console.error("Failed to complete request after several retries.");
  }
}

(async () => {
  while (true) {
    try {
      const userInput = await getUserInput("Ask Me Anything : ");

      // Exit condition for the loop
      if (userInput.toLowerCase() === "exit") {
        console.log("Exiting...");
        break;
      }

      await main(genAIKey, userInput);
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Something Went Wrong: ${error.message}`);
      } else {
        console.error("Unknown error occurred while processing the request.");
      }
    }
  }
})();
