### Context 

- This project is my passion, something I’ve nurtured for over ten years through journaling as a tool for self-development. I began by simply writing about my daily life, and soon, I moved on to setting goals. Now, I use a structured system to track my progress. I’m not perfect, but I strive to improve every day. This journey has brought me to Japan, a goal that once seemed impossible before I started journaling.

- OSH stands for Oltar Samurai History, inspired by Oltar, an imaginary world I created as a child. It emerged from my mind naturally, though I can’t recall exactly how. In this world, you are the samurai—the ideal version of yourself, a warrior with your own principles, ready to fight for what truly matters to you.

- This app contains all the tools I’ve developed over the past ten years of working on myself. While neither I nor my tools are perfect, I’ve designed the app to be adaptable for each individual because everyone is different. I truly believe this app can help you grow and achieve your own personal goals.

### Tech Overview

- The app consists of two parts: **Client** and **Server**.

- **Client**: The front end is built using JavaScript, CSS, and HTML, providing a simple yet functional UI. Through the UI, you can manage all tasks seamlessly. I used EasyMDE for input, as Markdown is the ideal format for journaling. Since a journal is something you’ll keep for life, Markdown ensures simplicity, readability, and longevity.

- **Server**: The back end is developed using Go with SQLite for data storage. All your data is securely stored in a local file called **“oltar.db”**, ensuring that your information remains private and easily accessible.

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

   #### 1. Chapters

Chapters serve as the starting point for your journey. They are essential to begin your first adventure as a Samurai.

**Example:** 

![image](https://github.com/user-attachments/assets/6ee30174-124c-48da-90df-ced641bbd4c9)


**Important Rules:**

- A new chapter can only be created at least one year after the last chapter was opened.

- When creating a new chapter (except for the first one), you must choose a title for the previous chapter. This title should be a single sentence summarizing its content.

#### 2. Entries

- This section is where you’ll primarily write your messages.

- For your first entry, you won’t be able to select principles. I will explain the concept of principles in the “Tags” section.

**Example** : First message 

1. <img width="666" alt="Screenshot 2024-10-16 at 15 45 03" src="https://github.com/user-attachments/assets/8d88f9d1-bdf1-4cbb-a824-b0ce1342dcd7">

- **For the first message, your only choice is to select the tag ‘Other’.**

2. <img width="434" alt="Screenshot 2024-10-16 at 15 45 14" src="https://github.com/user-attachments/assets/1bfe5b5a-10aa-435a-8eae-df8f55135928">

- At this stage, it’s time to create your first Samurai tag! In the beginning, you might create many tags for different subjects, maybe even too many. But remember, just like life, everything you input into your OSH is final—there’s no going back! For your first tag, you can choose what’s most important to you at the moment, or use the standard 侍DailyJournal to reflect on your daily life. This is the one I use the most.

- **There are three Samurai tags that are not allowed: 侍Samurai, 侍System, and 侍Reminds**.

3. <img width="706" alt="Screenshot 2024-10-16 at 15 45 41" src="https://github.com/user-attachments/assets/5cc26446-d43d-4e4e-9f93-6ec567abefd2">

- For the example, I chose 侍Test. The next step is to enter the city and country where you are. This information will be valuable in the future, as it will be interesting to know where you were 10 or 20 years ago.

4. <img width="247" alt="Screenshot 2024-10-16 at 15 46 00" src="https://github.com/user-attachments/assets/3fbf22d8-58af-43f2-9c5b-904ea395591e">

 - This is a helper feature: you have a button to reset the process you started. You can see the data you have already entered, as well as the data about the last entry or the current entry you are viewing.

 5. <img width="1649" alt="Screenshot 2024-10-16 at 15 46 08" src="https://github.com/user-attachments/assets/4868fc1e-38a3-484d-ac18-7b517d93ae59">

 - This is the input entry. Each time, you will see the last message of the tag. Since this is the first entry, no message will appear. You have “Previous” and “Next” buttons to navigate through all the entries of the tag. However, you’ll notice this is not the most practical way to review your previous messages. You’ll have better tools for that in the following section.

- Now it’s time to click on **New**!

<img width="53" alt="Screenshot 2024-10-16 at 15 46 55" src="https://github.com/user-attachments/assets/d000073e-a9a0-4601-9ee9-5f040706188f">
- OSH uses a markdown system. This icon will allow you to write or view the result of what you wrote in markdown.

- **Writing Mod**

<img width="434" alt="Screenshot 2024-10-16 at 15 47 28" src="https://github.com/user-attachments/assets/86d2309b-a798-4a75-b9f9-99c0bf7df99d">

- **Reading Mod**

<img width="461" alt="Screenshot 2024-10-16 at 15 47 42" src="https://github.com/user-attachments/assets/fba172b0-8dc9-4eb3-a2aa-9419894e95c3">

**Comment**

- The second text area is designated for comments. Each tag should include a comment message that summarizes its purpose and provides a brief overview. This comment section is mainly used to provide a concise explanation of the tag’s function.

 <img width="1671" alt="Screenshot 2024-10-20 at 12 37 31" src="https://github.com/user-attachments/assets/deede429-6b76-432b-89c2-54fdcf4185f4">

 - Now is time to go to the next step. so click on **Next**

6. <img width="580" alt="Screenshot 2024-10-20 at 12 43 51" src="https://github.com/user-attachments/assets/6980044b-d551-4f62-969c-8875adc6a131">

- You can review the message again before validating.

- Please enter the chosen time in the following format: **YYYY-MM-DD HH:MM** or **YYYY-MM-DD HH:MM:SS**.

- Alternatively, you can click on **time-now** to auto-fill the current time.

- Lastly, click on **sign** to save your entry permanently!















