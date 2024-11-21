const fs = require('fs');
const path = require('path');

fs.mkdir('public', { recursive: true }, (err) => {
    if (err) throw err;
    fs.copyFile(path.join(__dirname, 'index.js'), path.join(__dirname, 'public', 'index.js'), (err) => {
        if (err) throw err;
        console.log("done");
    });
});  
