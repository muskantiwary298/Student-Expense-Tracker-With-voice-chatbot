# 💸 SpendSmart — Student Expense Tracker with Voice Chatbot

A modern, student-friendly expense tracking web application that helps students manage their income, track daily expenses, monitor savings, and control their monthly budget. It also includes a voice-enabled chatbot for quick financial entries using speech or text commands.

## ✨ Features

- 📊 **Smart Dashboard** — View total income, total expenses, available balance, and net savings.
- 💰 **Income Management** — Record pocket money, salary, or other income.
- 🧾 **Expense Tracking** — Add and delete transactions with descriptions, categories, amounts, and dates.
- 🎙️ **Voice Chatbot** — Add expenses and income using supported voice commands.
- 💬 **Text Chatbot** — Type commands to check your balance, spending, income, and savings.
- 🎯 **Monthly Budget** — Set a spending limit and monitor your budget usage.
- 📈 **Category-wise Analytics** — View spending breakdowns by category.
- 💾 **Local Data Storage** — Save transactions in the browser using LocalStorage.
- 📱 **Responsive Design** — A dark-themed interface designed for desktop and mobile screens.

## 🛠️ Tech Stack

- **HTML5** — Web page structure
- **CSS3** — Styling, responsive layout, and dashboard design
- **JavaScript** — Expense calculations, chatbot commands, and application logic
- **Web Speech API** — Browser-based speech recognition
- **LocalStorage** — Persistent storage in the browser

## 📂 Project Structure

```text
Student-Expense-Tracker/
│
├── index.html    # Main application structure
├── style.css     # Styling and responsive design
├── script.js     # Application logic and voice chatbot
└── README.md     # Project documentation
```

## 🚀 Getting Started

### Prerequisites

- [Visual Studio Code](https://code.visualstudio.com/)
- Google Chrome or another compatible browser
- Live Server extension for VS Code

### Installation

**1. Clone the repository**

```bash
git clone https://github.com/YOUR-USERNAME/Student-Expense-Tracker.git
```

**2. Open the project folder**

```bash
cd Student-Expense-Tracker
```

**3. Open the folder in VS Code**

```bash
code .
```

**4. Run the application**

- Install the Live Server extension in VS Code.
- Open `index.html`.
- Right-click and select **Open with Live Server**.
- The application will open in your browser.

No additional package installation or backend server is required for this version.

## 🎙️ Voice Chatbot Commands

Try these example commands in the chatbot:

| Command | Action |
|---|---|
| `Add expense 100 rupees for food` | Records a ₹100 food expense |
| `Add income 5000 rupees` | Records ₹5,000 income |
| `What is my balance?` | Displays your current net balance |
| `How much did I spend?` | Shows total and current-month expenses |
| `Show my savings` | Displays net savings |

**Note:** Voice recognition depends on browser support and microphone permissions. The current chatbot primarily supports English commands. Text-based commands are also available.

## 📊 How It Works

1. Add your income and daily expenses.
2. Select the relevant expense category.
3. View your updated balance and savings.
4. Set a monthly budget to monitor spending.
5. Use the chatbot to record transactions or ask financial questions.
6. Refresh the page to see previously saved transactions.

## 🔒 Data Storage and Privacy

This application stores transaction data in the browser's LocalStorage.

- No backend database is configured in the current version.
- Data is stored locally in the browser on the device being used.
- Data is not automatically synchronized across devices.
- Clearing browser storage may permanently remove saved transactions.

Avoid entering sensitive financial or personal information.

## 🌱 Future Enhancements

- [ ] User authentication and secure login
- [ ] Cloud database integration
- [ ] Monthly spending charts and visual reports
- [ ] Hindi and multilingual voice commands
- [ ] CSV and PDF report export
- [ ] Recurring expense tracking
- [ ] Savings goals and notifications
- [ ] AI-powered budgeting recommendations
- [ ] Progressive Web App (PWA) support

## 🎯 Project Objective

The objective of SpendSmart is to help students develop better financial habits by providing a simple, accessible, and interactive platform for managing their personal finances.

## 👩‍💻 Author

**Muskan Kumari**

B.Tech CSE (AI & ML) Student

Interested in web development, programming, and building practical software projects.

## 🤝 Contributing

Contributions, suggestions, and feature requests are welcome. Fork the repository, make your changes, and submit a pull request.

## 📄 License

This project is available for educational and learning purposes. You can add an MIT License if you want to publish it under the MIT open-source license.
