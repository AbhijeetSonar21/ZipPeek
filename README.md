# ZipPeek

ZipPeek is a cross-platform desktop application for exploring ZIP files. It allows users to select, view, and extract contents of ZIP files. The application supports encrypted ZIP files and provides metadata about the ZIP archives.

## Features

- Select and open ZIP files.
- View contents of ZIP files in a tree structure.
- Handle encrypted ZIP files with password prompts.
- Display metadata of ZIP files, including name, size, compressed size, and the number of files.
- Maintain a list of recently opened ZIP files.
- Display the platform the application is running on (Windows, macOS, or Linux).

## Prerequisites

- [Rust](https://www.rust-lang.org/tools/install)
- [Tauri CLI](https://tauri.app/v1/guides/getting-started/prerequisites)

Ensure you have Rust and Tauri CLI installed before proceeding.

## Installation

1. **Clone the repository:**

   ```sh
   git clone [https://github.com/AbhijeetSonar21/ZipPeek.git]
   cd ZipPeek
   ```

2. **Install dependencies:**

   ```sh
   npm install
   ```

## Running the Application

To run the application in development mode, use the following command:

```sh
tauri dev
```

This will start the Tauri application with hot-reloading enabled. You can make changes to the source code, and the application will automatically reload.

## Usage

1. **Select a ZIP file:**
   - Click the "Select File" button to open a file dialog.
   - Choose a ZIP file from your system.

2. **View ZIP file contents:**
   - The contents of the ZIP file will be displayed in a tree structure.
   - If the ZIP file is encrypted, a password prompt will appear. Enter the password to decrypt and view the contents.

3. **View ZIP file metadata:**
   - Metadata about the selected ZIP file, including its name, size, compressed size, and the number of files, will be displayed.

4. **Recent files:**
   - A list of recently opened ZIP files is maintained and displayed. Click on any recent file to quickly open it again.

## Platform Information

The application displays the platform it is running on at the bottom of the main screen. This information can help identify any platform-specific issues or behaviors.

## Contributing

Contributions are welcome! Please fork the repository and submit a pull request with your changes.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Contact

For any questions or feedback, please open an issue on the GitHub repository or contact the maintainer.
