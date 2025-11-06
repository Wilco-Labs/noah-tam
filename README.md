# ICAO NOTAM Builder

This is a web-based, generate-only tool designed to help aviation professionals create properly formatted ICAO (International Civil Aviation Organization) NOTAMs (Notice to Air Missions). It provides a step-by-step wizard to guide users through the process, ensuring all required fields are considered and formatted correctly.

The application automatically assembles the final NOTAM text based on user inputs, including the critical Q-line and E-line, without needing to submit data to any external systems. The final output can be previewed, copied to the clipboard, or downloaded.

## Key Features

- **Step-by-Step Wizard**: A guided, multi-step interface to simplify the NOTAM creation process.
- **Message Types**: Supports `NOTAMN` (New), `NOTAMR` (Replacement), and `NOTAMC` (Cancellation).
- **Categorization**: Easily select the NOTAM category (Aerodrome, En-route, Obstacle, etc.), subject, and condition.
- **Quick-Fill Templates**: Includes pre-built templates for common scenarios like runway closures (`RWY CLSD`), taxiway work-in-progress (`TWY WIP`), and NAVAID unserviceability (`VOR U/S`).
- **Dynamic Form**: The user interface adapts to show only the fields relevant to the selected NOTAM type and subject.
- **Automatic Composition**:
    - **Item E (Details)**: Automatically generated based on the inputs, using standard ICAO abbreviations. The text remains editable for customization.
    - **Item Q (Q-Line)**: The NOTAM code and other fields are automatically composed based on the selections made.
- **Live Preview**: See the fully formatted NOTAM update in real-time as you fill out the form.
- **Export Options**:
    - Copy the final NOTAM text to the clipboard with one click.
    - Download the output as a `.txt` file.
- **Multi-Language Support**: The UI is available in English, French, Portuguese, and Swahili.

## Tech Stack

This application is built with a modern, maintainable frontend architecture:

- **Framework**: Angular (v20+)
- **Language**: TypeScript
- **State Management**: Angular Signals for reactive, fine-grained state management.
- **Styling**: Tailwind CSS for a utility-first, responsive design.
- **Architecture**:
    - **Zoneless**: Uses Angular's modern zoneless change detection for improved performance.
    - **Service-Oriented**: Business logic, state management, and data are decoupled into separate, injectable services (`NotamService`, `IcaoDataService`, `TranslationService`).
- **Module System**: Leverages native browser ES Modules with an import map for dependency management, requiring no build step for development.

## Getting Started / Running Locally

This project is designed to run directly in the browser without a complicated build process.

### Prerequisites

You need a simple local web server to serve the files. If you have Node.js installed, you can use the `serve` package.

### Instructions

1.  **Clone the repository:**
    ```bash
    git clone git@github.com:Wilco-Labs/Noah-Tam.git
    cd <repository-directory>
    ```

2.  **Serve the application:**
    From the root directory of the project, run one of the following commands to start a local server.

    **Using `npx` (no installation required):**
    ```bash
    npx serve
    ```

    **Using Python 3:**
    ```bash
    python -m http.server
    ```

3.  **Open in browser:**
    Open your web browser and navigate to the local address provided by the server (e.g., `http://localhost:3000` or `http://localhost:8000`). The application will load and be ready to use.

## Project Structure

The codebase is organized to separate concerns, making it easier to maintain and scale.

```
.
├── index.html              # Main HTML entry point, loads Tailwind CSS and the app.
├── index.tsx               # Angular application bootstrap file.
├── metadata.json           # Application metadata.
├── README.md               # This file.
└── src/
    ├── app.component.html  # Main component template (the UI).
    ├── app.component.ts    # Main component logic (the "view controller").
    └── services/
        ├── icao-data.service.ts      # Provides static data (airports, ICAO codes, templates).
        ├── notam.service.ts          # Manages all NOTAM form state and business logic.
        └── translation.service.ts    # Handles multi-language support and UI strings.
```
