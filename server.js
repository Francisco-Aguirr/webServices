const express = require('express');
const app = express();

const port = process.env.PORT || 3000;
app.listen(port, ()=>{
    console.log(`App Running on port ${port}`);
})

// Routes
app.use('/', require('./routes'));