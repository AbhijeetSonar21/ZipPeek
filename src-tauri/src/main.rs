// Import necessary modules from Tauri
use tauri::Manager;
use tauri::api::dialog::FileDialogBuilder;
use zip::read::ZipArchive;
use std::fs::File;
use std::io::BufReader;
use std::path::Path;

#[derive(serde::Serialize)]
struct ZipContents {
    files: Vec<String>,
    is_encrypted: bool,
    metadata: ZipMetadata,
}

#[derive(serde::Serialize)]
struct ZipMetadata {
    name: String,
    size: u64,
    compressed_size: u64,
    number_of_files: usize,
}

/// Function to handle ZIP file selection
/// This function is called from the frontend to open a file dialog
/// and allow the user to select a ZIP file.
#[tauri::command]
async fn select_zip_file(window: tauri::Window) -> Result<(), String> {
    // Create a new file dialog builder
    FileDialogBuilder::new()
        // Add a filter to show only ZIP files
        .add_filter("ZIP files", &["zip"])
        // Open the file picker dialog
        .pick_file(move |file_path| {
            match file_path {
                Some(path) => {
                    // If a file was selected, convert the path to a string
                    let file_path_str = path.display().to_string();
                    // Emit a custom event to the frontend with the selected file path
                    window.emit("file-selected", file_path_str).unwrap();
                },
                None => {
                    // If no file was selected (user cancelled), emit a cancellation event
                    window.emit("file-selection-cancelled", ()).unwrap();
                }
            }
        });

    // Return Ok to indicate the function completed successfully
    Ok(())
}

// Function to parse the ZIP file and return its contents
#[tauri::command]
fn parse_zip_file(file_path: String, password: Option<String>) -> Result<ZipContents, String> {
    let file = File::open(&file_path).map_err(|e| format!("Failed to open ZIP file: {}", e))?;
    let reader = BufReader::new(file);

    let mut zip = ZipArchive::new(reader).map_err(|e| format!("Error reading ZIP archive: {}", e))?;

    let mut file_paths = Vec::new();
    let mut is_encrypted = false;
    let mut total_compressed_size = 0;
    let mut total_uncompressed_size = 0;

    for i in 0..zip.len() {
        let result = if let Some(pwd) = &password {
            zip.by_index_decrypt(i, pwd.as_bytes())
        } else {
            zip.by_index(i)
        };

        match result {
            Ok(file) => {
                file_paths.push(file.name().to_string());
                total_compressed_size += file.compressed_size();
                total_uncompressed_size += file.size();
            },
            Err(zip::result::ZipError::UnsupportedArchive(_)) => {
                is_encrypted = true;
                continue;
            }
            Err(e) => {
                // Log the error but continue processing
                println!("Error reading file at index {}: {}", i, e);
                continue;
            }
        }
    }

    let path = Path::new(&file_path);
    let metadata = ZipMetadata {
        name: path.file_name().unwrap().to_str().unwrap().to_string(),
        size: total_uncompressed_size,
        compressed_size: total_compressed_size,
        number_of_files: file_paths.len(),
    };

    Ok(ZipContents {
        files: file_paths,
        is_encrypted,
        metadata,
    })
}

fn main() {
    // Create and configure the Tauri application
    tauri::Builder::default()
        // Set up any initialization logic
        .setup(|app| {
            // Print a startup message to the console
            println!("ZIP Explorer Pro is starting up!");
            Ok(())
        })
        // Register the select_zip_file function to be callable from JavaScript
        .invoke_handler(tauri::generate_handler![select_zip_file, parse_zip_file])
        // Run the Tauri application
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}