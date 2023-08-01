const app = require('express')();
const express = require('express');
const { v4 } = require('uuid');
const path = require('path');
const exp = require('constants');

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

app.get('/', (req, res) => {
    const path = `api/item/${v4()}`;
    res.setHeader("Content-type", "text/html");
    res.setHeader("Cache-Control", "s-max-age=1, stale-while-revalidate");
    res.end(`Hello, Go to item: <a href="${path}>${path}</a>`);
});

app.post('/submit', (req, res) => {
    const data = req.body;
    res.send(data);
})



app.get('/api/item/:slug', (req, res) => {
    const { slug } = req.params;
    res.end(`item: ${slug}`);
});

app.listen(5000, () => {
    console.log("Server started at port 5000 using Vercel");
})

module.exports = app;