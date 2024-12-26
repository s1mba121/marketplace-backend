# Test Assignment

This repository contains the implementation of a backend system that mimics a radio application with a host based on ChatGPT. This test task was created for an interview and showcases a basic set of functionality involving user authentication, product management, shopping cart, and Stripe integration for payments.

## Project Overview

The backend is implemented using **Node.js** with the **Express** framework. The main features include:

- **Authentication**: Registration, login, and logout functionality with JWT token-based authentication.
- **Product Management**: Users can create products, add them to the cart, and purchase them.
- **Cart System**: Allows users to manage their cart by adding or removing items.
- **Stripe Integration**: Handles payments through Stripe, including creating payment sessions and managing webhooks.
- **Image Upload**: Images are uploaded to either a local directory or an external storage (e.g., Tebi S3).

## Features

1. **User Authentication**:  
   Users can register, log in, and log out. JWT tokens are used for session management.

2. **Product Management**:  
   - Create products with images (uploaded to local or external storage).
   - Retrieve products based on various filters such as price and name.
   - Handle user-specific data such as products created and purchased.

3. **Cart System**:  
   Users can:
   - Add products to their cart.
   - Remove items from the cart.
   - View their current cart.

4. **Stripe Payment**:  
   - Users can proceed to checkout by creating a Stripe payment session.
   - Stripe webhooks handle successful payment processing and updating of product statuses.

5. **Purchase History**:  
   After a successful purchase, the user's purchase history is updated.

6. **Image Uploading**:  
   Images can be uploaded using **multer** middleware, either to a local directory or to **Tebi S3** storage.

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/radio-project.git
   cd radio-project
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file based on the `.env.example` file:
   ```bash
   cp .env.example .env
   ```

4. Update `.env` file with your environment variables, such as:
   - MongoDB URI (`MONGO_URI`)
   - JWT Secret (`JWT_SECRET`)
   - Stripe API keys
   - Tebi S3 credentials

5. Start the server:
   ```bash
   npm start
   ```

   The server will be running on the port defined in the `.env` file (`PORT=4000` by default).

## API Endpoints

### Authentication

- `POST /api/auth/register`: Registers a new user.
- `POST /api/auth/login`: Logs in a user.
- `POST /api/auth/logout`: Logs out a user.

### Products

- `POST /api/products/create`: Creates a new product (requires authentication).
- `GET /api/products`: Retrieves the user's products (requires authentication).
- `GET /api/products/all`: Retrieves all available products (requires authentication).
- `POST /api/products/cart/add`: Adds a product to the user's cart (requires authentication).
- `DELETE /api/products/cart/remove`: Removes a product from the user's cart (requires authentication).
- `GET /api/products/cart`: Gets the user's cart (requires authentication).
- `POST /api/products/purchase`: Finalizes the user's purchase (requires authentication).
- `GET /api/products/history`: Retrieves the user's purchase history (requires authentication).
- `POST /api/products/create-checkout-session`: Creates a Stripe checkout session (requires authentication).
- `POST /api/products/webhook`: Stripe webhook for payment processing.

### Middleware

- **Auth Middleware**: Ensures routes are only accessible by authenticated users with a valid JWT token.

### Error Handling

The project includes basic error handling for all routes and logs the errors to the console.

## Dependencies

- **Express**: Web framework for Node.js.
- **Mongoose**: MongoDB ODM for handling database operations.
- **bcryptjs**: For hashing and comparing passwords.
- **jsonwebtoken**: For generating and verifying JWT tokens.
- **multer**: Middleware for handling image uploads.
- **stripe**: Stripe library for handling payments.
- **aws-sdk**: AWS SDK for interacting with Tebi S3 (used for image storage).
- **cors**: Middleware for enabling CORS.
- **dotenv**: For managing environment variables.

## Structure

- **src/controllers**: Contains the business logic for handling API requests.
- **src/routes**: Contains route definitions for handling user requests.
- **src/middleware**: Includes middleware like `authMiddleware` for token verification.
- **src/models**: Contains Mongoose models for `User`, `Product`, `Cart`, and `PurchaseHistory`.
- **src/config**: Configuration files such as constants and environment settings.

## Testing

For testing purposes, you can use tools like **Postman** or **Insomnia** to test the API endpoints. Make sure to include the JWT token in the `Authorization` header for protected routes.

## Conclusion

This project serves as a demonstration of various backend features such as user authentication, product management, cart handling, and Stripe payment integration. It was implemented as part of a test assignment for an interview. The solution is designed to be scalable and modular, making it easy to extend or modify based on additional requirements.