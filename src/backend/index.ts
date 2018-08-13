import express from "express";
import path from "path";

// import fs from "fs";
// let files = fs.readdirSync('.');
// /Users/hlowso/Projects/precomp/precomp-frontend/

const server = express();

server.use(express.static('build'));

server.get(['/', '/login', '/signup'], (req, res) => res.sendFile(path.join(__dirname, "/build/index.html")));

server.listen(3000, () => console.log('Example app listening on port 3000!'));
