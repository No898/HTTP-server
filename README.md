# HTTP-server

I created my own HTTP server using a Codecrafters tasks in javascript.

# Server Overview

This is a simple Node.js server that serves HTTP requests and supports file uploads, compression, and various HTTP methods. The server is designed to be lightweight and easy to use.

## Features

- Supports file uploads via POST requests
- Supports compression (gzip) for certain responses
- Supports various HTTP methods (GET, POST, etc.)
- Can serve files from a specified directory

## Usage

To run the server, simply execute the following command:

node server.js

You can also specify a directory to serve files from by passing the `--directory` option:

node server.js --directory /path/to/directory

## Configuration

The server listens on port 4221 by default. You can change this by modifying the `server.listen` call in the code.

## Troubleshooting

If you encounter any issues with the server, please check the console output for errors. If you need further assistance, feel free to reach out.

## License

This server is licensed under the MIT License.
I hope this helps! Let me know if you have any questions or need further assistance.
