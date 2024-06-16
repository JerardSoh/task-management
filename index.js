const express = require('express');
const bodyParser = require('body-parser');
const routes = require('./routes.js');

const app = express();
app.use(bodyParser.json());

app.use('/', routes);


app.listen(3001, () => {
    console.log('Server is running on port 3000');
});