const fs = require('fs');

fs.mkdir('public', { recursive: true }, (err) => {
    if (err) throw err;
    console.log("done");
});  
