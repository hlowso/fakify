import express from "express";
import path from "path";

// import fs from "fs";
// let files = fs.readdirSync('.');
// /Users/hlowso/Projects/precomp/precomp-frontend/

const port = process.env.PORT || 5000;
const server = express();

server.use(express.static('build'));

server.get(['/', '/login', '/signup'], (req, res) => res.sendFile(path.join(__dirname, "/build/index.html")));

server.listen(port, () => console.log(`Precomp listening on port ${port}`));
