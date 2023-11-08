const fs = require('fs');
const path = require('path');

const directoryPath = 'input';
const maxFileSize = 50 * 1024 * 1024;

function readFilesRecursively(dir, filelist = []) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filepath = path.join(dir, file);
    if (fs.statSync(filepath).isDirectory()) {
      filelist = readFilesRecursively(filepath, filelist);
    } else {
      filelist.push(filepath);
    }
  });

  return filelist;
}

function combineFilesByType(files) {
  const fileContents = {};

  files.forEach(file => {
    const ext = path.extname(file);
    if (!fileContents[ext]) {
      fileContents[ext] = {
        content: '',
        count: 1
      };
    }
  });

  files.forEach(file => {
    const ext = path.extname(file);
    const content = fs.readFileSync(file, 'utf8');
    const currentContent = fileContents[ext].content;

    if (Buffer.byteLength(currentContent + content) > maxFileSize) {
      fs.writeFileSync(`combined-${ext.slice(1)}-${fileContents[ext].count}${ext}`, currentContent);
      fileContents[ext].content = '';
      fileContents[ext].count++;
    }

    fileContents[ext].content += content + '\n\n';
  });

  Object.keys(fileContents).forEach(ext => {
    if (fileContents[ext].content) {
      fs.writeFileSync(`combined-${ext.slice(1)}-${fileContents[ext].count}${ext}`, fileContents[ext].content);
    }
  });
}

const allFiles = readFilesRecursively(directoryPath);
combineFilesByType(allFiles);
