# Portfolio Website

A dynamic, interactive, and fully responsive portfolio website built with **Node.js**, **Express.js**, and **MongoDB**. This application is designed to showcase projects, skills, education, and experience while providing a robust admin panel for content management.

## 🚀 Features

### Frontend & User Experience
*   **Dynamic Profile Pages**:
    *   **About Me**: Personal introduction, services ("What I Do"), testimonials, and client logos.
    *   **Resume**: Interactive timeline of education and work experience, plus a skills section with progress bars.
    *   **Portfolio**: Project showcase with dynamic category filtering.
    *   **Blog**: A dedicated section for sharing thoughts and articles.
    *   **Contact**: A fully functional contact form with file attachments.
*   **Responsive Design**: Optimized for all devices with a mobile-first approach, featuring a custom sidebar/navbar navigation system.
*   **Resume Download Tracking**:
    *   Captures user geolocation (Latitude/Longitude) upon resume download.
    *   Sends instant notifications to Telegram with a Google Maps link to the user's location.
    *   Uses a triple-redundancy geolocation strategy (IP Geolocation API -> IP-API -> IPAPI.co) for reliability.

### Backend & Security
*   **Admin Panel (CMS)**:
    *   Manage all content: Projects, Skills, Experience, Education, Testimonials, Clients, and Services.
    *   View and manage contact form submissions.
    *   Secure **Two-Factor Authentication (2FA)** using Telegram.
*   **Security**:
    *   `helmet` for HTTP headers security.
    *   `express-rate-limit` to prevent abuse.
    *   `express-mongo-sanitize` to prevent NoSQL injection.
    *   `express-session` with `connect-mongo` for secure session management.
*   **Media Management**:
    *   **Cloudinary**: Optimization and storage for profile-related images.
    *   **Supabase**: Secure storage for contact form attachments.
    *   **Jimp**: Server-side image dimension validation.

## 🛠 Tech Stack

*   **Backend**: Node.js, Express.js
*   **Database**: MongoDB (Mongoose ODM)
*   **Templating**: EJS (Embedded JavaScript) with `ejs-mate`
*   **Styling**: CSS3 (Custom + Bootstrap Grid), Responsive Design
*   **Storage**: Cloudinary, Supabase Storage
*   **APIs & Services**: Telegram Bot API, IP Geolocation APIs

## 📂 Project Structure

```
portfolio/
├── config/             # Database and Site configurations
├── controllers/        # Route logic (MVC pattern)
├── models/             # Mongoose schemas
├── public/             # Static assets (CSS, JS, Images)
├── routes/             # Express routes definitions
├── utils/              # Helper functions (Geolocation, Error handling)
├── views/              # EJS Templates
├── app.js              # Application entry point
└── middleware.js       # Custom middleware (Auth, Validation)
```

## ⚙️ Installation & Setup

### Prerequisites
*   Node.js (v18+)
*   MongoDB (Local or Atlas)
*   Cloudinary Account
*   Supabase Account
*   Telegram Account (for Bot setup)

### 1. Clone the Repository
```bash
git clone https://github.com/Adityapratap-Singh/Know_me.git
cd portfolio
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the root directory and add the following variables:

```env
# Server Configuration
PORT=8080
NODE_ENV=development
SESSION_SECRET=your_super_secret_session_key

# Database Configuration
# Use <db_username> and <db_password> placeholders in the URI
MONGODB_URI=mongodb+srv://<db_username>:<db_password>@cluster0.example.mongodb.net/portfolio
db_username=your_mongodb_username
db_password=your_mongodb_password
SKIP_DB=false  # Set to 'true' to disable DB buffering during tests

# Cloudinary (Image Storage)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Supabase (File Storage)
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
SUPABASE_BUCKET=your_bucket_name

# Telegram (Notifications & 2FA)
TELEGRAM_BOT_TOKEN=your_contact_bot_token
TELEGRAM_CHAT_ID=your_personal_chat_id
VERIFICATION_BOT_TOKEN=your_2fa_bot_token
```

### 4. Run the Application
*   **Development Mode** (with hot-reload):
    ```bash
    npm run dev
    ```
*   **Production Mode**:
    ```bash
    npm start
    ```

## 🧪 Testing

The project uses **Jest** and **Supertest** for integration testing.

```bash
npm test
```

## 📝 License

This project is licensed under the ISC License.
