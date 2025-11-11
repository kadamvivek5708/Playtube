# PlayTube - A Video Sharing Platform

PlayTube is a robust, production-grade backend service for a video sharing platform, similar to YouTube. It allows users to create accounts, upload videos, subscribe to channels, like and comment on videos, and much more. This project is built with a modern JavaScript stack, focusing on scalability and performance.

-----

## **Key Features** ✨

  * **User Authentication**: Secure user registration and login using JWT (JSON Web Tokens) and bcrypt for password hashing.
  * **Video Management**: Upload, delete, and update video content, including thumbnails. Videos are stored on Cloudinary for efficient delivery.
  * **Social Interactions**:
      * **Likes**: Toggle likes on videos, comments, and tweets.
      * **Comments**: Add, update, and delete comments on videos.
      * **Subscriptions**: Subscribe and unsubscribe from channels.
  * **Playlists**: Create, update, and delete playlists. Add or remove videos from playlists.
  * **Tweets**: A micro-blogging feature allowing users to post, update, and delete short text-based "tweets."
  * **Dashboard**: View channel statistics, including total video views, subscribers, and likes.
  * **Health Check**: An endpoint to monitor the application's status.

-----

## **Technology Stack** 💻

  * **Backend**: Node.js, Express.js
  * **Database**: MongoDB with Mongoose
  * **File Storage**: Cloudinary for video and image uploads
  * **Authentication**: JWT (JSON Web Tokens), bcrypt
  * **Middleware**: CORS, Cookie-Parser, Multer
  * **Developer Tools**: Prettier for code formatting, Nodemon for automatic server restarts, and Dotenv for environment variable management

-----

## **Getting Started** 🚀

### **Prerequisites**

  * Node.js (v18 or higher recommended)
  * npm (Node Package Manager)
  * MongoDB instance (local or cloud-based)
  * Cloudinary account

### **Installation**

1.  **Clone the repository**:

    ```bash
    git clone https://github.com/kadamvivek5708/playtube.git
    cd playtube
    ```

2.  **Install dependencies**:

    ```bash
    npm install
    ```

3.  **Set up environment variables**:

    Create a `.env` file in the root of the project and add the following variables, replacing the placeholder values with your actual credentials:

    ```env
    PORT=3000
    MONGODB_URI="your_mongodb_connection_string"
    CORS_ORIGIN="*"
    ACCESS_TOKEN_SECRET="your_access_token_secret"
    ACCESS_TOKEN_EXPIRY="1d"
    REFRESH_TOKEN_SECRET="your_refresh_token_secret"
    REFRESH_TOKEN_EXPIRY="10d"
    CLOUDINARY_CLOUD_NAME="your_cloudinary_cloud_name"
    CLOUDINARY_API_KEY="your_cloudinary_api_key"
    CLOUDINARY_API_SECRET="your_cloudinary_api_secret"
    ```

### **Running the Application**

To start the development server, run the following command:

```bash
npm run dev
```

The server will start on the port specified in your `.env` file (default is `3000`).

-----

## **Project Structure** 📁

The project follows a modular structure to keep the codebase organized and maintainable.

```
/src
├── /controllers       # Handles request and response logic
├── /db                # Database connection setup
├── /middlewares       # Express middleware functions
├── /models            # Mongoose data models
├── /routes            # API endpoint definitions
└── /utils             # Utility functions and helper classes
```

-----

## **Data Models** 📊

For a visual representation of the data models and their relationships, please refer to the Eraser diagram:

[**View Data Models on Eraser**](https://app.eraser.io/workspace/3rfRXykWZi2RW166kh0g?origin=share&elements=UMBxkEiBrYRm5yHj3yTkcA)

-----

## **Author** ✍️

  * **Vivek Kadam** - [GitHub](https://www.google.com/search?q=https://github.com/kadamvivek5708)
