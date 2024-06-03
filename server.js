// server.js

const net = require("net");
const fs = require("fs");
const path = require("path");
const zlib = require("zlib");


const args = process.argv.slice(2);
let directory = null;

args.forEach((arg, index) => {
    if (arg === "--directory" && args[index + 1]) {
        directory = args[index + 1];
    }
});

if (!directory) {
    console.log("No directory. Running without file serving.");
}

const server = net.createServer((socket) => {
    let requestData = '';

    socket.on('data', (data) => {
        requestData += data.toString();

        if (requestData.includes('\r\n\r\n')) {
            const lines = requestData.split("\r\n");
            const requestLine = lines[0].split(" ");
            const method = requestLine[0];
            const reqPath = requestLine[1];

            let acceptEncoding = ''
            for (let line of lines) {
                if (line.toLowerCase().startsWith('accept-encoding:')) {
                    acceptEncoding = line.slice('Accept-Encoding: '.length).trim()
                    break
                }
            }
            let responseHeaders = "HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\n";
            let responseBody = "";

            const encodings = acceptEncoding.split(',').map(e => e.trim());
            const supportsGzip = encodings.includes('gzip');

            if (method === "POST" && reqPath.startsWith("/files/")) {
                if (!directory) {
                    const response = "HTTP/1.1 500 Internal Server Error\r\n\r\n";
                    socket.write(response);
                    socket.end();
                    return;
                }

                const fileName = reqPath.slice(7);
                const filePath = path.join(directory, fileName);
                const bodyIndex = requestData.indexOf('\r\n\r\n') + 4;
                const fileContent = requestData.slice(bodyIndex);

                fs.writeFile(filePath, fileContent, (err) => {
                    let response;

                    if (err) {
                        response = "HTTP/1.1 500 Internal Server Error\r\n\r\n";
                    } else {
                        response = "HTTP/1.1 201 Created\r\n\r\n";
                    }
                    socket.write(response);
                    socket.end();
                });
            } else if (method === "GET" && reqPath === "/user-agent") {
                let userAgent = '';

                for (let line of lines) {
                    if (line.toLowerCase().startsWith('user-agent:')) {
                        userAgent = line.slice('User-Agent: '.length);
                        break;
                    }
                }

                const contentLength = userAgent.length;
                const response = `HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${contentLength}\r\n\r\n${userAgent}`;
                socket.write(response);
                socket.end();
            } else if (method === "GET" && reqPath.startsWith("/files/")) {
                if (!directory) {
                    const response = "HTTP/1.1 500 Internal Server Error\r\n\r\n";
                    socket.write(response);
                    socket.end();
                    return;
                }

                const fileName = reqPath.slice(7);
                const filePath = path.join(directory, fileName);

                fs.readFile(filePath, (err, fileContent) => {
                    let response;
                    if (err) {
                        response = "HTTP/1.1 404 Not Found\r\n\r\n";
                    } else {
                        response = `HTTP/1.1 200 OK\r\nContent-Type: application/octet-stream\r\nContent-Length: ${fileContent.length}\r\n\r\n`;
                        socket.write(response);
                        socket.write(fileContent);
                        socket.end();
                        return;
                    }

                    socket.write(response);
                    socket.end();
                });
            } else if (method === "GET" && reqPath === "/") {
                const response = "HTTP/1.1 200 OK\r\n\r\n";
                socket.write(response);
                socket.end();
            } else if (method === "GET" && reqPath.startsWith("/echo/")) {
                const echoString = reqPath.slice(6);

                if (supportsGzip) {

                    zlib.gzip(echoString, (err, gzipBuffer) => {
                        if (err) {
                            const response = "HTTP/1.1 500 Internal Server Error\r\n\r\n";
                            socket.write(response);
                            socket.end();
                            return;
                        }

                        responseHeaders += `Content-Encoding: gzip\r\nContent-Length: ${gzipBuffer.length}\r\n\r\n`;
                        socket.write(responseHeaders);
                        socket.write(gzipBuffer);
                        socket.end();
                    });
                } else {
                    responseHeaders += `Content-Length: ${echoString.length}\r\n\r\n`;
                    responseBody = echoString;
                    socket.write(responseHeaders);
                    socket.write(responseBody);
                    socket.end();
                }
            } else {
                const response = "HTTP/1.1 404 Not Found\r\n\r\n";
                socket.write(response);
                socket.end();
            }
        }
    });
});

server.listen(4221, "localhost", () => {
    console.log('Server is up on http://localhost:4221/');
});
