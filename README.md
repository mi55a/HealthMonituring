# 🚀 AstroHealth

### NASA Space Apps Challenge | Chicago
**AstroHealth** is a web-based astronaut health monitoring application developed by **Team Health Monituring/Saturing** for the NASA Space Apps Challenge in Chicago.

Our mission is to help astronauts monitor their physical and mental well-being during long-duration space missions through health tracking, data visualization, and AI-powered insights.
## 👩‍🚀 Meet the Team

**Team Health Monituring/Saturing**

Developed for the NASA Space Apps Challenge in Chicago.

- Milagros Mendez: [LinkedIn](https://www.linkedin.com/in/mmendez624)
- Riya Patel: [LinkedIn](https://www.linkedin.com/in/riyaa-patel)
- Ryan Puska: [LinkedIn](https://www.linkedin.com/in/ryan-puska-687aa0238/)
- Nour Belkadi:[LinkedIn](https://www.linkedin.com/in/nourelhouda-b-745b5b276/)
- Alexis Valdivia: (LinkedIn)
- Vinuthna Depala: [LinkedIn](https://www.linkedin.com/in/vinuthna-depala-654a21287/)


---

## 🌌 About the Project

Long-duration space missions expose astronauts to several health challenges, including:

- **Space Radiation:** Increased exposure to radiation can affect astronaut health.
- **Isolation and Confinement:** Extended periods in confined environments can affect mental well-being.
- **Altered Gravity:** Microgravity can contribute to muscle and bone loss.
- **Distance from Earth:** Communication delays can limit immediate access to medical professionals.
- **Hostile Environments:** Spacecraft environments require continuous monitoring of astronaut health and safety.

**AstroHealth** aims to address these challenges by providing a centralized platform where astronauts can record health measurements, monitor trends, and receive AI-assisted insights.

---

## ✨ Key Features

### 📊 Health Dashboard

The Dashboard provides a centralized overview of astronaut health.

Users can record and monitor:

- Heart rate
- Blood pressure
- Sleep duration
- Stress levels
- Mood
- Blood oxygen levels
- Body temperature
- Blood sugar
- Water intake
- Exercise
- Additional health symptoms and measurements

Health measurements are saved to a SQLite database and can be accessed across the application.

### ❤️ Physical Health Monitoring

The Physical Health Stats page allows users to:

- View their latest recorded measurements
- Monitor heart rate, oxygen levels, blood sugar, and body temperature
- Compare measurements against general reference ranges
- View historical trends through interactive graphs

### 🧠 Mental Health Monitoring

The Mental Health Stats page focuses on psychological well-being.

Features include:

- Mood tracking
- Stress monitoring
- Historical trend visualization
- Mental health measurement summaries

### 🧍 Interactive Body Map

The Body Map provides a visual representation of the human body, allowing users to explore health-related information through an interactive interface.

### 🤖 AI Health Assistant

AstroHealth integrates the **Google Gemini API** to provide AI-assisted health insights.

The AI Assistant can:

- Answer questions about saved health measurements
- Review recent Dashboard records
- Compare current measurements with previous readings
- Explain potential health trends
- Provide general health-related information

The AI Assistant retrieves user-entered measurements from the application's SQLite database.

**Disclaimer:** AI-generated responses are informational and should not replace professional medical advice.

### 📈 Health Pattern Detection

AstroHealth compares recent health measurements with previous readings to identify potential changes in:

- Heart rate
- Sleep duration
- Stress levels
- Oxygen levels

These comparisons help users recognize changes in their recorded health data.

### 🛰️ NASA Data Integration

AstroHealth explores the use of NASA datasets related to astronaut health, sleep, and space environments.

NASA research data helps provide context for understanding health challenges associated with long-duration space missions.

### ⚙️ User Settings

Users can update their personal information through the Settings page.

The user's name is synchronized with the Dashboard, while birth date information is currently stored locally in the browser.

---

## 🛠️ Technologies Used

| Category | Technologies |
|----------|--------------|
| Frontend | React, JavaScript, Vite |
| Styling | CSS, Chakra Petch, Lucide React |
| Backend | Node.js, Express.js |
| Database | SQLite |
| AI Integration | Google Gemini API |
| Data Integration | NASA APIs and research datasets |
| Version Control | Git, GitHub |

---

## 🏗️ System Architecture

AstroHealth uses a frontend-backend architecture to manage health information.

```text
                  AstroHealth
                       |
                React Frontend
                       |
          ---------------------------
          |            |            |
       Dashboard    Health Stats  AI Assistant
          |            |            |
          ---------------------------
                       |
                Express Backend
                       |
                REST API Endpoints
                       |
                SQLite Database
                       |
                 Saved Health Data
                       |
                Google Gemini API
```

### Data Flow

1. Users enter health measurements through the Dashboard.
2. The frontend sends the measurements to the Express backend.
3. The backend stores the information in SQLite.
4. The Physical and Mental Health Stats pages retrieve saved measurements.
5. Historical readings are displayed through trend graphs.
6. The AI Assistant receives saved health records as context for answering user questions.

---

## 💻 Getting Started

### Prerequisites

Make sure the following are installed:

- [Node.js](https://nodejs.org/)
- npm
- [Git](https://git-scm.com/)

A Google Gemini API key is required for AI Assistant functionality.

### 1. Clone the Repository

```bash
git clone https://github.com/mi55a/HealthMonituring.git
cd HealthMonituring
```

### 2. Install Backend Dependencies

Navigate to the backend directory:

```bash
cd server
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the backend directory.

Add your Gemini API key:

```env
GEMINI_API_KEY=your_api_key_here
```

**Important:** Never commit API keys or `.env` files containing secrets to GitHub.

### 4. Start the Backend

```bash
npm start
```

The backend runs at:

```text
http://localhost:3001
```

### 5. Install Frontend Dependencies

Open a second terminal and navigate to the frontend directory:

```bash
cd HealthMonituringWebsite
npm install
```

### 6. Start the Frontend

```bash
npm run dev
```

Open the local URL displayed in your terminal.

---

## 🧪 How to Use AstroHealth

### Step 1: Open the Dashboard

Navigate to the Dashboard and enter your health measurements.

### Step 2: Save Health Data

Save your measurements to the database.

### Step 3: View Health Statistics

Navigate to the Physical or Mental Health Stats pages to review your measurements.

### Step 4: Explore Trends

Select **See Trends** to view historical changes in your recorded measurements.

### Step 5: Ask the AI Assistant

Navigate to **AI Health Insights** and ask questions such as:

> What was my latest recorded heart rate?

> How has my sleep duration changed over the past week?

> Can you compare my current stress level with my previous measurements?

### Step 6: Update User Settings

Open Settings through the profile dropdown to update your name and personal information.

---

## 📸 Application Screenshots

### Welcome Page

<img width="1365" height="681" alt="image" src="https://github.com/user-attachments/assets/05fe5c7e-6425-4a20-a914-a76fdae3edf4" />


### Health Dashboard

<img width="1360" height="684" alt="image" src="https://github.com/user-attachments/assets/66a27502-3fb2-4f08-a2aa-305d31eaabea" />

### Physical and Mental Health Stats

<img width="1351" height="677" alt="image" src="https://github.com/user-attachments/assets/b6e7dfb6-b701-4ef6-990a-aa235fc98790" />


### Interactive Body Map

<img width="1346" height="678" alt="image" src="https://github.com/user-attachments/assets/41e3f528-92f2-48e5-9614-48556ab5cd8e" />


### AI Health Assistant

<img width="1349" height="675" alt="image" src="https://github.com/user-attachments/assets/31133229-f90b-4fcd-8564-8eca96ddcd45" />

---

## 🚀 Future Improvements

Potential future improvements include:

- Integration with wearable health monitoring devices
- Real-time sensor data collection
- Personalized health baselines
- Automated health alerts
- Secure astronaut authentication
- Direct communication with medical professionals
- Improved AI-powered trend analysis
- Additional NASA research data integration
- Expanded health reporting and visualization

---

## ⚠️ Project Limitations

AstroHealth is a hackathon prototype designed to demonstrate the potential of digital health monitoring for space exploration.

- Health measurements are currently entered manually.
- The AI Assistant provides informational responses, not medical diagnoses.
- The application currently supports a single demo astronaut.
- Medical officer communication and report sharing are demonstration features.
- The application is not a certified medical device.
  
---

## 🤖 AI Usage & Responsible AI Practices

Our team used artificial intelligence as a supporting tool during the development of AstroHealth. We believe AI should enhance human creativity, problem-solving, and decision-making rather than replace them.

### How We Used AI

Throughout the development process, AI tools assisted us with:

- **Development Support:** Helping troubleshoot errors, debug code, and explore possible implementations.
- **Code Assistance:** Suggesting improvements to React components, backend APIs, and database integration.
- **Research Assistance:** Helping us understand technical concepts related to astronaut health monitoring and space exploration.
- **AI Health Assistant:** Integrating Google's Gemini API to provide users with explanations and insights based on their recorded health measurements.

### Responsible AI Practices

We aimed to use AI responsibly by following these principles:

1. **Human Oversight:** Our team remained responsible for development decisions, reviewing AI-generated suggestions before incorporating them into the project using individual branches & PR's.

2. **Transparency:** We acknowledge the use of AI tools during development and clearly identify AI-powered functionality within AstroHealth.

3. **Data Privacy:** Gemini API credentials are stored in backend environment variables rather than exposed in frontend code. The application currently uses fictional demonstration health data.

4. **Health and Safety:** Our AI Assistant is intended to provide informational insights, not medical diagnoses or treatment recommendations. It does not replace qualified healthcare professionals.

5. **Data Accuracy:** The AI Assistant uses saved Dashboard measurements as context and is instructed to recognize missing information rather than invent health readings.

6. **Human-Centered Design:** AI-generated insights are intended to help users understand their health data while leaving important medical decisions to qualified professionals.

### AI Limitations

We recognize that AI-generated responses may contain inaccuracies or incomplete interpretations. AstroHealth is a hackathon prototype and has not been clinically validated.

Our goal is to demonstrate how AI could support astronaut health monitoring while emphasizing transparency, safety, and responsible technology development.

**AI was used as an assistive tool, while our team retained responsibility for the project's design, implementation, testing, and final decisions.**

