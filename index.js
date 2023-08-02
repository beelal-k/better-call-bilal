const app = require('express')();
const express = require('express');
const { v4 } = require('uuid');
const path = require('path');
const fs = require('fs');
const exp = require('constants');
const multer = require("multer");
const { Storage } = require("@google-cloud/storage");
const nodemailer = require("nodemailer");

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({
    extended: true,
}));

// GC Storage

const storage = new Storage({
    projectId: "eloquent-region-394707",
    keyFilename: "./service-key.json"
});

const bucketName = 'commission-storage';

// Multer
// memoryStorage() temporarily stores the file in memory before processing
const upload = multer();

// Nodemailer

// const transporter = nodemailer.createTransport({
//     service: "Gmail",
//     auth: {
//         user: "bilalk.dev@gmail.com",
//         pass: "Incorret902"
//     },
// });


app.get('/', (req, res) => {
    const path = `api/item/${v4()}`;
    res.setHeader("Content-type", "text/html");
    res.setHeader("Cache-Control", "s-max-age=1, stale-while-revalidate");
    res.end(`Hello, Go to item: <a href="${path}>${path}</a>`);
});

// upload.single(<file name in form>)
app.post('/submit', upload.single('user_file'), async (req, res) => {

    try {
        const { user_email, user_message } = req.body;
        const file = req.file;
        const fileName = Date.now() + path.extname(file.originalname);
        console.log(fileName);
        const fileUpload = storage.bucket(bucketName).file(fileName);

        if(fileUpload){
            console.log("sent");
        }
        else{
            console.log("not sent");
        }

        const stream = fileUpload.createWriteStream({
            metadata: {
                contentType: file.mimetype,
            },
        });

        stream.on('error', (err) => {

            console.error("Error uploading to GCS: ", err);
            res.status(500).json({ error: "Failed to upload file" });
        })

        stream.on('finish', async () => {
            const publicURL = `https://storage.googleapis.com/${bucketName}/${fileName}`;
            res.redirect('back');
            console.log(publicURL);

        });
        stream.end(file.buffer);

    } catch (error) {
        console.log("Error: ", error);
        res.status(500).json({error: "Server Error"});
    }

    // const data = req.body;
    // res.send("this is the body");
    // res.json(data);  
    // res.json({ requestBody: req.body });
})



app.get('/api/item/:slug', (req, res) => {
    const { slug } = req.params;
    res.end(`item: ${slug}`);
});

app.listen(5000, () => {
    console.log("Server started at port 5000 using Vercel");
})

module.exports = app;