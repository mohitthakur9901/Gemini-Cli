"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DectectLanguage = exports.ReadFileData = void 0;
const fs = __importStar(require("fs"));
const Languages_1 = require("./Languages");
const ReadFileData = (path) => {
    try {
        // Read the file synchronously
        const data = fs.readFileSync(path, "utf8");
        return data;
    }
    catch (error) {
        // Check if error is an instance of Error
        if (error instanceof Error) {
            throw new Error(`Error reading file: ${error.message}`);
        }
        else {
            throw new Error("Unknown error occurred while reading the file.");
        }
    }
};
exports.ReadFileData = ReadFileData;
const DectectLanguage = (filePath) => {
    var _a;
    try {
        const parts = filePath.split(".");
        const fileExtension = parts.length > 1 ? (_a = parts.pop()) === null || _a === void 0 ? void 0 : _a.toLowerCase() : undefined;
        if (!fileExtension) {
            throw new Error("File extension is missing.");
        }
        const language = Languages_1.languagesSupport[fileExtension];
        if (!language) {
            throw new Error("Unsupported file extension.");
        }
        return language;
    }
    catch (error) {
        if (error instanceof Error) {
            throw new Error(`Does Not Support Language: ${error.message}`);
        }
        else {
            throw new Error("Unknown error occurred while reading the file.");
        }
    }
};
exports.DectectLanguage = DectectLanguage;
