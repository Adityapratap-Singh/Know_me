# Portfolio Website

A dynamic and interactive portfolio website built with Node.js, Express.js, and MongoDB. This application allows you to showcase your projects, skills, education, experience, testimonials, and services ("What I Do"). It also includes a contact form with file upload capabilities and an administrative panel for managing content.

## Features

*   **Dynamic Profile Pages:**
    *   **About Me:** Displays personal introduction, "What I Do" services, client testimonials, and client logos.
    *   **Resume:** Showcases education, work experience, and skills with progress indicators.
    *   **Portfolio:** Presents projects with dynamic category filtering.
    *   **Blog:** A dedicated page for blog content.
*   **Mobile Responsiveness Improvements:**
    *   Optimized navbar for mobile view: Icons-only navigation to save space, reduced height, and ensured fixed width to prevent overflow.
    *   Social media icons integrated into the mobile navbar for easy access.
    *   Enhanced blog section responsiveness: Ensured content (images, tables, text) adapts to screen size, preventing horizontal overflow and "zoom out" issues.
*   **Contact Form:**
    *   Allows visitors to send messages with optional file attachments.
    *   Includes phone number validation and auto-formatting.
    *   **Telegram Notifications:** Receive instant notifications on your Telegram app for new contact messages, including details and attachment links.
*   **Admin Panel (Content Management System):**
    *   Secure login for content administrators.
    *   Add, edit, and delete various data types:
        *   "What I Do" items (with icon uploads)
        *   Testimonials (with image uploads)
        *   Education entries
        *   Experience entries
        *   Skills
        *   Projects (with image uploads and dynamic categories)
        *   Clients (with logo uploads)
        *   Contact messages (view and delete)
    *   Image upload handling with Cloudinary for profile-related content and Supabase for contact form attachments.
    *   Image dimension validation for uploaded assets.
*   **Technologies:** Built with a modern Node.js stack, leveraging EJS for templating and MongoDB for data storage.

## Technologies Used

*   **Backend:**
    *   Node.js
    *   Express.js
    *   MongoDB (via Mongoose ODM)
    *   Cloudinary (Image storage for profile content)
    *   Supabase (File storage for contact attachments)
    *   `node-telegram-bot-api` (for contact notifications)
    *   `dotenv` (Environment variable management)
    *   `express-session` (Session management)
    *   `multer` (Multipart form data handling for file uploads)
    *   `jimp` (Image processing for dimension validation)
    *   `method-override` (For PUT/DELETE requests in HTML forms)
*   **Frontend:**
    *   EJS (Embedded JavaScript templating)
    *   HTML5, CSS3, JavaScript
*   **Development Tools:**
    *   Nodemon (for automatic server restarts during development)

## Setup and Installation

### Prerequisites

*   Node.js (v18.0.0 or higher)
*   MongoDB instance (local or cloud-hosted like MongoDB Atlas)
*   Cloudinary account (for image uploads in admin panel)
*   Supabase project (for file uploads in contact form)
*   Telegram Bot and your Chat ID (for contact notifications)

### 1. Clone the repository

```bash
git clone https://github.com/Adityapratap-Singh/Know_me.git
cd portfolio
```

### 2. Install dependencies

```bash
npm install
```

### 3. Environment Variables

Create a `.env` file in the root directory of the project and add the following environment variables:

```
MONGODB_URI=your_mongodb_connection_string
PORT=8080 # Or any port you prefer

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_key
SUPABASE_BUCKET=your_supabase_bucket_name # e.g., contact-attachments

db_username=your_mongodb_username # if included in MONGODB_URI, might not be needed separately
db_password=your_mongodb_password # if included in MONGODB_URI, might not be needed separately

secretkey=a_strong_secret_for_admin_panel # Used for admin panel login
CONTACT_SECRET_KEY=a_strong_secret_for_contact_view # Used for viewing contacts

TELEGRAM_BOT_TOKEN=your_telegram_bot_token
TELEGRAM_CHAT_ID=your_telegram_chat_id

# Optional: Set to 'true' to skip MongoDB connection during development/testing
# SKIP_DB=true
```

**Important:** Replace placeholder values with your actual credentials and keys. Keep your `.env` file secure and never commit it to version control.

### 4. Start the application

#### Development (with Nodemon)

```bash
npm run dev
```

#### Production

```bash
npm start
```

The application will be accessible at `http://localhost:8080` (or your specified PORT).

## Usage

### Public Pages

*   Navigate to `/profile`, `/resume`, `/portfolio`, `/blog` to view the respective sections.
*   Use the `/contact` page to send messages and attachments.

### Admin Panel

1.  Go to `/updating`.
2.  Enter the `secretkey` defined in your `.env` file to access the admin options.
3.  From the `/updating/updatings` page, you can choose to add, edit, or delete various data types.
4.  To view contact messages, go to `/verify-contacts` and enter the `CONTACT_SECRET_KEY`.

## API Endpoints

### Public Routes

*   `GET /`: Redirects to `/profile`
*   `GET /profile`: Renders the main profile page.
*   `GET /resume`: Renders the resume page.
*   `GET /portfolio`: Renders the portfolio page with dynamic project categories.
*   `GET /blog`: Renders the blog page.
*   `GET /contact`: Renders the contact form.
*   `POST /contact`: Submits a new contact message, handles file uploads, saves to DB, and sends Telegram notification.
*   `GET /error`: Renders a generic error page.

### Admin/Protected Routes (require `secretkey` or `CONTACT_SECRET_KEY` for access)

*   **Admin Login:**
    *   `GET /updating`: Render admin login.
    *   `POST /updating`: Authenticate admin.
    *   `GET /updating/updatings`: Admin options dashboard.
    *   `POST /updating/updatings`: Handle add/delete actions.
    *   `POST /updating/logout`: Logout from admin.
*   **Contact Management:**
    *   `GET /verify-contacts`: Render contact view verification.
    *   `POST /verify-contacts`: Verify access to contacts.
    *   `GET /view-contacts`: View all contacts.
    *   `GET /contacts/:id`: View single contact.
    *   `DELETE /contacts/:id`: Delete a contact.
*   **CRUD Operations (Add/Edit/Delete) for various data models:**
    *   `/updating/whatDoIDo`, `/updating/testimonial`, `/updating/education`, `/updating/experience`, `/updating/skill`, `/updating/project`, `/updating/client`
    *   Each model typically has `GET /add`, `POST /add`, `GET /edit/:id`, `PUT /edit/:id`, `GET /delete`, `DELETE /delete/:id` routes.

## Contributing

Contributions are welcome! Please feel free to fork the repository, create a new branch, and submit a pull request.

## License

This project is licensed under the ISC License. See the [LICENSE](LICENSE) file for details.

## Important Note on Personal Content

Please be advised that the resume content, project descriptions, testimonials, and any other personal information displayed on this portfolio website are the intellectual property of Adityapratap Singh. This content is for viewing purposes only and is not to be copied, reproduced, or reused without explicit written permission. The open-source license for this project applies to the code base, not to the personal content displayed within the portfolio.