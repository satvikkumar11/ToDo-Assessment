# API Documentation for Todo Application

This document provides details for frontend developers on how to interact with the Todo API endpoints.

## Base URL

The API is running on `http://localhost:3000` (or the configured port).

## CORS Configuration

The API is configured to accept requests from `http://localhost:5173`.

## Authentication

All API endpoints (except the root `/` test route) require authentication. The client must send a Firebase ID token in the `Authorization` header with the `Bearer` scheme.

**Example Header:**
```
Authorization: Bearer <YOUR_FIREBASE_ID_TOKEN>
```

---

## Endpoints

### 1. Add a new Todo

*   **Method:** `POST`
*   **Path:** `/todos`
*   **Description:** Creates a new todo item for the authenticated user.
*   **Authentication:** Required.
*   **Request Body:** JSON object
    ```json
    {
      "title": "string (required)",
      "description": "string (required)"
    }
    ```
*   **Success Response (201):** JSON object representing the created todo.
    ```json
    {
      "id": "string (Todo ID)",
      "userId": "string (User ID)",
      "title": "string",
      "description": "string",
      "state": "pending",
      "createdAt": "timestamp",
      "updatedAt": "timestamp"
    }
    ```
*   **Error Responses:**
    *   `400 Bad Request`: If `title` or `description` is missing.
        ```json
        {
          "error": "Title and description are required."
        }
        ```
    *   `401 Unauthorized`: If the token is missing or invalid.
    *   `500 Internal Server Error`: If there's an issue on the server.
        ```json
        {
          "error": "Failed to add todo."
        }
        ```

### 2. Fetch all Todos

*   **Method:** `GET`
*   **Path:** `/todos`
*   **Description:** Retrieves all todo items for the authenticated user, ordered by creation date (descending).
*   **Authentication:** Required.
*   **Request Body:** None.
*   **Success Response (200):** JSON array of todo objects. If no todos are found, an empty array `[]` is returned.
    ```json
    [
      {
        "id": "string (Todo ID)",
        "userId": "string (User ID)",
        "title": "string",
        "description": "string",
        "state": "string (e.g., 'pending', 'completed')",
        "createdAt": "timestamp",
        "updatedAt": "timestamp"
      }
      // ... more todo items
    ]
    ```
*   **Error Responses:**
    *   `401 Unauthorized`: If the token is missing or invalid.
    *   `500 Internal Server Error`: If there's an issue on the server.
        ```json
        {
          "error": "Failed to fetch todos."
        }
        ```

### 3. Delete a Todo

*   **Method:** `DELETE`
*   **Path:** `/todos/:id`
*   **Description:** Deletes a specific todo item owned by the authenticated user.
*   **Authentication:** Required.
*   **Path Parameters:**
    *   `id`: The ID of the todo item to delete.
*   **Request Body:** None.
*   **Success Response (200):**
    ```json
    {
      "message": "Todo deleted successfully."
    }
    ```
*   **Error Responses:**
    *   `401 Unauthorized`: If the token is missing or invalid.
    *   `403 Forbidden`: If the authenticated user does not own the todo.
        ```json
        {
          "error": "Forbidden: You do not own this todo."
        }
        ```
    *   `404 Not Found`: If the todo with the specified ID does not exist.
        ```json
        {
          "error": "Todo not found."
        }
        ```
    *   `500 Internal Server Error`: If there's an issue on the server.
        ```json
        {
          "error": "Failed to delete todo."
        }
        ```

### 4. Update a Todo

*   **Method:** `PUT`
*   **Path:** `/todos/:id`
*   **Description:** Updates an existing todo item (title, description, or state) for the authenticated user.
*   **Authentication:** Required.
*   **Path Parameters:**
    *   `id`: The ID of the todo item to update.
*   **Request Body:** JSON object. At least one of `title`, `description`, or `state` must be provided.
    ```json
    {
      "title": "string (optional)",
      "description": "string (optional)",
      "state": "string (optional, 'pending' or 'completed')"
    }
    ```
*   **Success Response (200):** JSON object representing the updated todo.
    ```json
    {
      "id": "string (Todo ID)",
      "userId": "string (User ID)",
      "title": "string",
      "description": "string",
      "state": "string",
      "createdAt": "timestamp",
      "updatedAt": "timestamp"
    }
    ```
*   **Error Responses:**
    *   `400 Bad Request`: If no fields to update are provided, or if `state` is invalid.
        ```json
        {
          "error": "No fields to update provided." 
        }
        // or
        {
          "error": "Invalid state. Must be 'pending' or 'completed'."
        }
        ```
    *   `401 Unauthorized`: If the token is missing or invalid.
    *   `403 Forbidden`: If the authenticated user does not own the todo.
        ```json
        {
          "error": "Forbidden: You do not own this todo."
        }
        ```
    *   `404 Not Found`: If the todo with the specified ID does not exist.
        ```json
        {
          "error": "Todo not found."
        }
        ```
    *   `500 Internal Server Error`: If there's an issue on the server.
        ```json
        {
          "error": "Failed to update todo."
        }
        ```

### 5. Summarize Todos and Send to Slack

*   **Method:** `POST`
*   **Path:** `/summarize`
*   **Description:** Fetches all 'pending' todos for the authenticated user, generates a summary using Gemini AI, and sends this summary to a configured Slack channel.
*   **Authentication:** Required.
*   **Request Body:** None.
*   **Success Response (200):**
    ```json
    {
      "message": "Summary sent to Slack successfully.",
      "summary": "string (The AI-generated summary)"
    }
    ```
*   **Error Responses:**
    *   `401 Unauthorized`: If the token is missing or invalid.
    *   `404 Not Found`: If the user has no pending todos to summarize.
        ```json
        {
          "message": "No pending todos to summarize."
        }
        ```
    *   `500 Internal Server Error`: If there's an issue with fetching todos, generating the summary with AI, or sending the summary to Slack.
        ```json
        {
          "error": "Failed to process summarize request." 
        }
        // or
        {
          "error": "Failed to generate summary with AI."
        }
        // or
        {
          "error": "Failed to send summary to Slack."
        }
        ```

---

### Test Route (No Authentication)

*   **Method:** `GET`
*   **Path:** `/`
*   **Description:** A basic route to check if the API is running.
*   **Authentication:** Not required.
*   **Response:**
    ```
    Todo API is running!
