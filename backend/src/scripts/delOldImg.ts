import fs from 'fs';
import path from 'path';

console.log(process.cwd());

function isFileOldEnough(filePath: string, threshold = 10_000) {// 5 * 24 * 60 * 60 * 1000
  const fileStats = fs.statSync(filePath);
  const fileTime = fileStats.mtimeMs;
  const currentTime = Date.now();
  return (currentTime - fileTime) > threshold;
}

function deleteFile(filePath: string) {
  try {
    fs.unlinkSync(filePath);
    console.log(`Deleted file: ${filePath}`);
  } catch (error) {
    console.error(`Error deleting file: ${filePath}`, error);
  }
}

function cleanOldImages(directoryPath: string) {
  fs.readdirSync(directoryPath).forEach((fileName) => {
		console.log(fileName)
    const filePath = path.join(directoryPath, fileName); // Use path.join if needed
    const isImage = (/\.(jpg|jpeg|png)$/i).test(fileName); // Check for common image extensions (case-insensitive)
    if (isImage && isFileOldEnough(filePath)) {
      deleteFile(filePath);
    }
  });
}

const imageDirectory = './public/a'; // Replace with your image directory path

const interval = 1000 * 60// 1000 * 60 * 60; // Run every hour (in milliseconds)

setInterval(() => {
	try {
		cleanOldImages(imageDirectory);
	} catch (e) {
		console.error(e);
	}

}, interval);