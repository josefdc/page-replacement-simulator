
# Page Replacement Simulator

An interactive web application that visualizes page replacement algorithms in operating systems, specifically Optimal, LRU, FIFO, and FIFOM. The application provides proactive, natural language feedback using the OpenAI API to enhance user understanding.

## Features

- **Interactive Visualization**: Step-by-step simulation of page replacement algorithms with a dynamic table display.
- **Algorithms Implemented**:
  - Optimal
  - Least Recently Used (LRU)
  - First-In, First-Out (FIFO)
  - (Optionally) First-In, First-Out Modified (FIFOM)
- **Natural Language Feedback**: Proactive insights and explanations using the OpenAI API.
- **User-Friendly Interface**: Clean design with dark mode support, responsive layout, and intuitive controls.
- **Simulation Controls**: Ability to play, pause, and navigate through simulation steps.
- **Input Validation**: Real-time validation of user inputs with helpful error messages.
- **Contextual Help**: Tooltips and a tutorial guide for new users.

## Technologies Used

- **Frontend**:
  - HTML5
  - CSS3 (Tailwind CSS)
  - JavaScript (ES6)
- **Backend**:
  - Node.js
  - Express.js
  - Axios
- **API Integration**:
  - OpenAI API (GPT-3.5 or GPT-4)
- **Tools**:
  - Tailwind CSS CLI
  - dotenv

## Prerequisites

- Node.js (v12 or higher)
- npm (v6 or higher)
- OpenAI API Key

## Installation

Follow these steps to set up the project on your local machine.

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/page-replacement-simulator.git
cd page-replacement-simulator
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env` file in the root directory and add your OpenAI API key:

```bash
OPENAI_API_KEY=your_openai_api_key_here
```

> Note: Replace `your_openai_api_key_here` with your actual OpenAI API key.

### 4. Build Tailwind CSS

Generate the final CSS file using Tailwind CSS CLI:

```bash
npx tailwindcss -i ./style.css -o ./output.css
```

Alternatively, you can watch for changes:

```bash
npx tailwindcss -i ./style.css -o ./output.css --watch
```

### 5. Start the Server

```bash
node server.js
```

The server will start on `http://localhost:3000`.

## Usage

1. Open your web browser and navigate to `http://localhost:3000`.

2. **Input Area**:
   - **Page References**: Enter a sequence of page numbers (e.g., `7 0 1 2 0 3 0 4 2 3 0 3 2`).
   - **Number of Frames**: Specify the number of memory frames (e.g., `3`).
   - **Algorithm**: Select the page replacement algorithm to simulate.
   - Click on `Start Simulation`.

3. **Simulation Controls**:
   - Use `Next` and `Previous` buttons to step through the simulation.
   - Click `Play` to automatically progress through the simulation.
   - The visualization table updates accordingly, highlighting page faults.

4. **AI Feedback**:
   - Scroll to the **Simulation Summary** section to view AI-generated insights.
   - The application provides explanations and suggestions based on the simulation results.

5. **Dark Mode**:
   - Toggle dark mode using the button in the header for a different theme.

## Folder Structure

```plaintext
page-replacement-simulator/
├── node_modules/           # Node.js dependencies
├── .env                    # Environment variables (OpenAI API key)
├── .gitignore              # Files and directories to ignore in Git
├── app.js                  # Main JavaScript file for frontend logic
├── index.html              # Main HTML file
├── output.css              # Compiled Tailwind CSS file
├── package.json            # NPM package configuration
├── server.js               # Node.js server for backend logic
├── style.css               # Tailwind CSS input file
├── tailwind.config.js      # Tailwind CSS configuration
└── README.md               # Project documentation
```

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/YourFeature`).
3. Commit your changes (`git commit -am 'Add a new feature'`).
4. Push to the branch (`git push origin feature/YourFeature`).
5. Create a new Pull Request.

## License

This project is licensed under the MIT License.

---

**Disclaimer**: This application uses the OpenAI API to generate natural language feedback. Ensure compliance with OpenAI's Usage Policies when deploying and using the application.
me
