use tauri::Manager;

// This function will be called from our JavaScript code
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! Welcome to Tauri.", name)
}

fn main() {
    tauri::Builder::default()
        // Here we add the `greet` function to be callable from JavaScript
        .setup(|app| {
            // This will print to the terminal
            println!("Application is starting up!");
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![greet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}