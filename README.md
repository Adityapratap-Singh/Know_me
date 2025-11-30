# Portfolio Website

This is a dynamic and interactive portfolio website built with Node.js, Express.js, and MongoDB. It features a clean user interface to showcase projects, skills, experience, and testimonials, along with a secure administrative panel for content management.

## Table of Contents

- [Features](#features)
- [Technologies Used](#technologies-used)
- [Architecture](#architecture)
- [Setup and Installation](#setup-and-installation)
- [Running the Application](#running-the-application)
- [Usage](#usage)
- [Folder Structure](#folder-structure)
- [Future Enhancements](#future-enhancements)

## Features

### User-Facing
- **Dynamic Profile Display**: Showcase your "What I Do" services, client logos, and testimonials.
- **Interactive Portfolio**: Display your projects with categories and filtering options.
- **Detailed Resume**: Present your education, experience, and skills.
- **Blog Section**: A dedicated space for articles or updates.
- **Contact Form**: Allow visitors to send messages, with optional file attachments.

### Administrative Panel
- **Secure Authentication**: Protect content management with a secret key.
- **CRUD Operations**: Easily Create, Read, Update, and Delete entries for:
    - "What I Do" items
    - Testimonials
    - Education details
    - Experience entries
    - Skills
    - Projects
    - Clients
    - Contact messages
- **Image & File Uploads**: Seamlessly upload images (for projects, testimonials, client logos, service icons) to Cloudinary and contact attachments to Supabase.
- **Image Validation**: Ensure uploaded images meet minimum size requirements for quality control.

## Technologies Used

- **Backend**:
    - Node.js
    - Express.js (Web Framework)
    - Mongoose (MongoDB ODM)
    - MongoDB Atlas (Cloud Database)
- **Frontend**:
    - EJS (Embedded JavaScript templates)
    - HTML5, CSS3, JavaScript
    - Ion-icons (for icons)
- **Authentication & Security**:
    - `express-session` (for session management)
    - `dotenv` (for environment variables)
- **File Storage**:
    - Cloudinary (Cloud-based image and video management)
    - Supabase (for contact form attachments)
- **Utilities**:
    - `multer` (for handling `multipart/form-data` for file uploads)
    - `multer-storage-cloudinary` (Multer storage engine for Cloudinary)
    - `jimp` (for image processing and validation)
    - `method-override` (for using PUT and DELETE HTTP methods in forms)
    - `ejs-mate` (for EJS layouts)

## Architecture

The application follows the **Model-View-Controller (MVC)** architectural pattern to ensure a clear separation of concerns, making the codebase organized, maintainable, and scalable.

-   **Models (`models/`)**: Define the data structures and interact directly with the MongoDB database. Examples: `client.js`, `project.js`, `contact.js`.
-   **Views (`views/`)**: EJS templates responsible for rendering the user interface. They display data prepared by the controllers. Examples: `profile.ejs`, `portfolio.ejs`, `updatingClient.ejs`.
-   **Controllers (`controllers/`)**: Contain the business logic. They handle incoming requests, interact with models to fetch or manipulate data, and then pass the processed data to the appropriate views for rendering. Examples: `profile.js`, `updating.js`, `contact.js`.
-   **Routes (`routes/`)**: Define the URL endpoints and map them to specific controller functions. They act as the entry points for different parts of the application.

## Setup and Installation

To get this project up and running on your local machine, follow these steps:

### Prerequisites

-   [Node.js](https://nodejs.org/en/) (LTS version recommended)
-   [npm](https://www.npmjs.com/) (comes with Node.js) or [Yarn](https://yarnpkg.com/)
-   [MongoDB Atlas Account](https://www.mongodb.com/cloud/atlas/register) (for your cloud database)
-   [Cloudinary Account](https://cloudinary.com/users/register/with_email) (for image storage)
-   [Supabase Account](https://supabase.com/dashboard/sign-up) (for contact form attachment storage)

### Installation Steps

1.  **Clone the repository:**
    ```bash
    git clone <repository_url>
    cd portfolio
    ```

2.  **Install dependencies:**
    ```bash
    npm install --legacy-peer-deps
    ```
    (The `--legacy-peer-deps` flag is used to resolve potential peer dependency conflicts.)

3.  **Create a `.env` file:**
    In the root directory of the project, create a file named `.env` and populate it with your environment variables. This file is crucial for connecting to your services and securing your application.

    ```
    # MongoDB Atlas Connection
    MONGODB_URI=mongodb+srv://<db_username>:<db_password>@your-cluster-name.mongodb.net/?appName=portfolio
    db_username=YOUR_MONGODB_ATLAS_USERNAME
    db_password=YOUR_MONGODB_ATLAS_PASSWORD

    # Server Port
    PORT=8080

    # Google Maps Embed URL (Optional, replace with your own if needed)
    maps=YOUR_GOOGLE_MAPS_EMBED_URL

    # Cloudinary Configuration
    CLOUDINARY_CLOUD_NAME=YOUR_CLOUDINARY_CLOUD_NAME
    CLOUDINARY_API_KEY=YOUR_CLOUDINARY_API_KEY
    CLOUDINARY_API_SECRET=YOUR_CLOUDINARY_API_SECRET

    # Supabase Configuration (for contact form attachments)
    SUPABASE_URL=YOUR_SUPABASE_URL
    SUPABASE_KEY=YOUR_SUPABASE_ANON_KEY
    SUPABASE_BUCKET=YOUR_SUPABASE_BUCKET_NAME

    # Secret Keys for Application Security
    secretkey=YOUR_SESSION_SECRET_KEY_FOR_ADMIN_PANEL
    CONTACT_SECRET_KEY=YOUR_SECRET_KEY_FOR_VIEWING_CONTACTS
    ```

    **Important Notes for `.env`:**
    -   **MongoDB Atlas**:
        -   Replace `YOUR_MONGODB_ATLAS_USERNAME` and `YOUR_MONGODB_ATLAS_PASSWORD` with the credentials of a database user you create in MongoDB Atlas.
        -   Ensure this user has appropriate permissions (e.g., read/write access to any database).
        -   In MongoDB Atlas, configure 'Network Access' to allow connections from your application's IP address (or `0.0.0.0/0` for development, but restrict for production).
        -   The `MONGODB_URI` should be copied directly from your Atlas cluster's "Connect your application" section, ensuring it includes your cluster name and any necessary parameters. The `app.js` will dynamically insert the `db_username` and `db_password` into this template.
    -   **Cloudinary**: Obtain these credentials from your Cloudinary dashboard.
    -   **Supabase**: Get your project URL and `anon` key from your Supabase project settings. Create a storage bucket (e.g., `contact-attachments`) and use its name.
    -   **`secretkey` & `CONTACT_SECRET_KEY`**: These should be strong, random strings for session security and access control.

### Update EJS Script Tag

For the modular frontend JavaScript to work correctly, you **must** update the `<script>` tag for `public/js/script.js` in your main EJS layout file (e.g., `views/layouts/boilerPlate.ejs`) to include `type="module"`:

```html
<script src="/js/script.js" type="module"></script>
```

## Running the Application

To start the development server:

```bash
npm start
```
or if you have `nodemon` installed globally for development:
```bash
npm run dev
```

The server will typically run on `http://localhost:8080` (or the port specified in your `.env` file).

## Usage

### Public Website
-   Open your web browser and navigate to `http://localhost:8080`.
-   Explore the profile, portfolio, resume, and blog sections.
-   Use the contact form to send messages.

### Administrative Panel
-   Navigate to `http://localhost:8080/updating`.
-   Enter your `secretkey` (from `.env`) to access the update options.
-   From the update options page, you can choose to add, edit, or delete various content types.
-   To view contact messages, navigate to `http://localhost:8080/verify-contacts` and enter your `CONTACT_SECRET_KEY`.

## Folder Structure

```
.
├── app.js                  # Main application entry point
├── middleware.js           # Custom Express middleware
├── package.json            # Project dependencies and scripts
├── .env                    # Environment variables (sensitive info)
├── cloudinary/             # Cloudinary configuration
│   └── index.js
├── controllers/            # MVC Controllers (business logic)
│   ├── contact.js
│   ├── profile.js
│   └── updating.js
├── models/                 # Mongoose Models (database schemas)
│   ├── collection.js
│   ├── contact.js
│   ├── education.js
│   ├── experience.js
│   ├── project.js
│   ├── skill.js
│   ├── testimonials.js
│   ├── whatDoIDo.js
│   └── client.js
├── public/                 # Static assets (CSS, JS, images)
│   ├── css/
│   │   └── included/       # Specific CSS files
│   │       └── ...
│   ├── js/
│   │   ├── script.js       # Main frontend JavaScript (ES module entry)
│   │   └── used/           # Separated JavaScript modules
│   │       └── ...
│   └── assets/             # Other static assets
│       └── ...
├── routes/                 # Express Routes (maps URLs to controllers)
│   ├── contact.js
│   ├── profile.js
│   └── updating.js
├── supabase/               # Supabase configuration
│   └── index.js
└── views/                  # EJS Templates (UI rendering)
    ├── includes/
    │   └── ...
    ├── inputs/             # Forms for updating content
    │   └── ...
    ├── layouts/
    │   └── boilerPlate.ejs # Main EJS layout
    └── profile/            # Public-facing profile pages
        └── ...
```

## Future Enhancements

-   **User Authentication**: Implement a more robust user authentication system for the admin panel (e.g., username/password, OAuth).
-   **Error Handling**: Implement more sophisticated global error handling and display user-friendly error pages.
-   **Input Validation**: Enhance server-side input validation for all forms.
-   **Frontend Framework**: Consider integrating a frontend framework (e.g., React, Vue) for a more dynamic and component-based UI.
-   **SEO Optimization**: Add meta tags, sitemaps, and other SEO best practices.
-   **Testing**: Implement unit and integration tests for both backend and frontend.
-   **Deployment Automation**: Set up CI/CD pipelines for automated testing and deployment.
-   **Rich Text Editor**: Integrate a rich text editor for blog posts and descriptions in the admin panel.
-   **Pagination/Lazy Loading**: For large lists of projects, testimonials, or contacts.
-   **Accessibility**: Improve accessibility features for all users.
