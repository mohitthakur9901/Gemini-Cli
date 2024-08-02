import * as fs from "fs";
import { languagesSupport } from "./Languages";

export const ReadFileData = (path: string): string => {
  try {
    // Read the file synchronously
    const data = fs.readFileSync(path, "utf8");
    return data;
  } catch (error) {
    // Check if error is an instance of Error
    if (error instanceof Error) {
      throw new Error(`Error reading file: ${error.message}`);
    } else {
      throw new Error("Unknown error occurred while reading the file.");
    }
  }
};

export const DectectLanguage = (filePath: string) : string =>  {
  try {
    const parts = filePath.split(".");
    const fileExtension =
      parts.length > 1 ? parts.pop()?.toLowerCase() : undefined;

    if (!fileExtension) {
      throw new Error("File extension is missing.");
    }


    const language = languagesSupport[fileExtension as keyof typeof languagesSupport];

    if (!language) {
      throw new Error("Unsupported file extension.");
    }

    return language;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Does Not Support Language: ${error.message}`);
    } else {
      throw new Error("Unknown error occurred while reading the file.");
    }
  }
};
