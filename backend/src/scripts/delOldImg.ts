import fs from 'fs';
import path from 'path';

function isFileOldEnough(filePath: string, threshold = 5 * 24 * 60 * 60 * 1000) { //every 5 days
  const fileStats = fs.statSync(filePath);
  const fileTime = fileStats.mtimeMs;
  const currentTime = Date.now();
  return (currentTime - fileTime) > threshold;
}

function deleteFile(filePath: string) {
  try {
    fs.unlinkSync(filePath);
  } catch (error) {
    console.error(`Error deleting file: ${filePath}`, error);
  }
}

function cleanOldImages(directoryPath: string) {
  fs.readdirSync(directoryPath).forEach((fileName) => {
    const filePath = path.join(directoryPath, fileName);
    const isImage = (/\.(jpg|jpeg|png)$/i).test(fileName);
    if (isImage && isFileOldEnough(filePath)) {
      deleteFile(filePath);
    }
  });
}

const imageDirectory = './public/a';
const interval = 1 * 24 * 60 * 60 * 1000 //everyday

setInterval(() => {
	try {
		cleanOldImages(imageDirectory);
	} catch (e) {
		console.error(e);
	}

}, interval);