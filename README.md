### Context 

- This project is my passion, something I’ve nurtured for over ten years through journaling as a tool for self-development. I began by simply writing about my daily life, and soon, I moved on to setting goals. Now, I use a structured system to track my progress. I’m not perfect, but I strive to improve every day. This journey has brought me to Japan, a goal that once seemed impossible before I started journaling.

- OSH stands for Oltar Samurai History, inspired by Oltar, an imaginary world I created as a child. It emerged from my mind naturally, though I can’t recall exactly how. In this world, you are the samurai—the ideal version of yourself, a warrior with your own principles, ready to fight for what truly matters to you.

- This app contains all the tools I’ve developed over the past ten years of working on myself. While neither I nor my tools are perfect, I’ve designed the app to be adaptable for each individual because everyone is different. I truly believe this app can help you grow and achieve your own personal goals.

### Tech Overview

• The app consists of two parts: **Client** and **Server**.

• **Client**: The front end is built using JavaScript, CSS, and HTML, providing a simple yet functional UI. Through the UI, you can manage all tasks seamlessly. I used EasyMDE for input, as Markdown is the ideal format for journaling. Since a journal is something you’ll keep for life, Markdown ensures simplicity, readability, and longevity.

• **Server**: The back end is developed using Go with SQLite for data storage. All your data is securely stored in a local file called **“oltar.db”**, ensuring that your information remains private and easily accessible.

### Get Started

1. **Clone the repository** to your local machine.

2. Navigate to the server directory:
   ```bash
   cd osh_app/server/
   ```

3. **Run or build the server**:
   - To run the server:
     ```bash
     go run main.go
     ```
   - To build and execute the server:
     ```bash
     go build
     ./server
     ```

4. Navigate to the client directory:
   ```bash
   cd osh_app/client/
   ```

5. **Install dependencies**:
   ```bash
   npm install
   ```

6. **Run the client**:
   ```bash
   npm start
   ```

7. Open your browser and navigate to:
   ```
   http://127.0.0.1:3232/chapters
   ```
