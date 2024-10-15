# Slippod
Slippod is a user-friendly, open-source desktop application for taking notes. Designed for distraction-free, full-keyboard typing, it allows you to capture and organize your thoughts with support for Markdown and bidirectional linking.

## Features
- **Privacy:** Your notes are stored locally using SQLite, giving you complete control over your data and ensuring that your information stays private and secure.  
- **Searching Fast:** Full-text search lets you find notes instantly, with results returned in milliseconds.
- **User-friendly Interface:** Inspired by [NOTATIONAL VELOCITY](https://notational.net/), the interface is designed for simplicity, allowing you to perform all operations through intuitive keyboard commands.   
- **Markdown Support:** Easily format your notes using plain text or Markdown, offering flexibility to structure your notes however you prefer.
- **Bidirectional Linking:** Effortlessly connect your ideas and notes using our linking feature—just type `@` to create links between notes. This follows the Zettelkasten method, helping you organize and build a web of interconnected thoughts.
- **Keyword-Driven Tagging and catorgory:** Seamlessly organize your notes with #tag, and categories will be applied automatically, making it easy to link and structure your ideas.

## Installing
If you would like to install the application without modifying the code, simply visit the [releases](https://github.com/leyafo/slippod/releases) page and download the version for your platform.

## Contributing
This project does not use any JavaScript frameworks. All you need is a basic understanding of [vanilla.js](http://vanilla-js.com/), with no `TypeScript` or complicated configurations required.

### Start development Steps:
1. **Install Node.js and npm:**  
   Node.js provides the runtime for Electron, and npm manages dependencies. Download and install the latest stable version of Node.js from the official website.
   
2. **Clone the repository:**  
   Use Git to clone the repository to your local machine.
   
3. **Install dependencies:**  
   Navigate to the project directory in your terminal and run the command:  
```bash
   npm install
```

4. **Running and Debugging:**
On Linux or MacOS, run `./dev.sh` to start the application and begin debugging. On Windows, run the following two commands in separate terminals to start the application and debug synchronously:
```bash
npm run dev_vite
npm run dev_electron
```

## Packing
To package the code and generate an application package for your platform, run the following command:
```bash
make publish
```

## Database Inspecting
Run `sql_debug.sh` to load the simple tokenizer for inspecting the database. If full-text search is not needed, you can simply run `sqlite3 slippod.db`.

## License
The Ptah.sh service suite is a Fair Source software licensed under the [Functional Source License, Version 1.1, Apache 2.0 Future License](https://github.com/leyafo/slippod/blob/master/LICENSE.md).
