> SQL TO API - NESTJS

## 🚩 Table of Contents

1. [About the Project](#about-project)
2. [Installation](#installation)
3. [How to Create API from SQL?](#how-create-api-from-sql)
4. [Request / Response Syntax](#request-syntax)
5. [Integrate with Your Existing System](#integrate-with-your-existing-system)
6. [Use as a Backend for SPA (Single Page Application)](#use-as-a-backend-for-spa-single-page-application)
7. [Use as Core System - Adding Additional Modules](#use-as-core-system---adding-additional-modules)
8. [Contributing](#-contributing)

# About the Project:

# Installation:

## Prerequisites

Before you begin, please make sure you have Node.js version 18.16.1 installed on your system. You can download it from the official [Node.js website](https://nodejs.org/).

To verify if you have the correct version installed, open a terminal or command prompt and run the following command:

```bash
node -v
```

This should display the version of Node.js you have installed. If it does not show **v18.16.1**, please download and install the correct version.

If you need to manage multiple versions of Node.js, consider using a version manager like nvm (Node Version Manager) or n.

Once you have Node.js v18.16.1 installed, you're ready to proceed with the installation of this project.

## Getting Started

### Clone the Repository

To get started with the project, you'll need to clone this repository to your local machine. Open a terminal or command prompt and run the following command:

```bash
  git clone https://github.com/khaphan-github/api-gen-no-code
```

Then remember checkout branch **feature/sql-to-api** if you want to use feature **sql-to-api**:

```bash
  git checkout feature/sql-to-api
```

### Install necessary package:

```
  npm install
```

# How to Create API from SQL:

# Request / Response Syntax:

## Request:

In this project I use RESTFull APIs, RESTful (Representational State Transfer) APIs are a type of web service that adhere to a set of architectural principles. They are designed to enable communication between different software systems over the internet.

Basic Operations in RESTful APIs

- GET: Retrieves data from the server. It should not have any side effects on the server.
- POST: Creates new data on the server. It may change the server's state.
- PUT: Updates existing data on the server. It should be idempotent, meaning multiple identical requests have the same effect as a single request.
- DELETE: Removes data from the server.

Follow this format I create API to query your table:

### Request format:

This is an example for an api create product, we have an sql script to create product table:

```sql
-- This is script create table products in postgresql
CREATE TABLE products (
    product_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    description TEXT,
    category VARCHAR(50),
    stock_quantity INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

We have format endpoint **domain/app/THIS_IS_APP_ID/schema/THIS_IS_SCHEMA_NAME**, follow this example we have an endpoint:

```
http://localhost:3000/app/9999/schema/products'
```

- **domain**: This represents the base domain or address of the API server (e.g., http://localhost:3000).

- **app**: This is a placeholder for the application segment.

- **THIS_IS_APP_ID**: This is a variable segment for the application ID. In this case, 9999 is given as an example. It suggests that 9999 is the default application ID, and it may not require modification.

- **schema**: This is a placeholder for the schema segment.

- **THIS_IS_SCHEMA_NAME**: This is a variable segment for the schema name. In the provided example, it's products, indicating that the endpoint is related to the products table.

### POST - Create one or more record:

Follow this example we need to prepare some things to create a http request to create a new record:
All request to create a new record follow this syntax:

1. Endpoint:

```
http://localhost:3000/app/9999/schema/REPLACE_WITH_YOUR_TABLE'

EX: http://localhost:3000/app/9999/schema/products
```

2. Method: [POST]
3. Request body:
   **NOTE:**
   - Attribute in body need to match with attribute in table you created.
   - You can create many record

```
[
  {
    "product_id": 1,
    "name": "Sample Product",
    "price": 19.99,
    "description": "This is a sample product description.",
    "category": "Sample Category",
    "stock_quantity": 100,
    "created_at": "2023-10-25T15:59:05.220Z",
    "updated_at": "2023-10-25T15:59:05.220Z"
  }
]
```

4. Example request using `axios`(https://axios-http.com/vi/docs/intro):

```javascript
const axios = require('axios');
const apiUrl = 'http://localhost:3000/app/9999/schema/products';

const requestBody = [
  {
    product_id: 1,
    name: 'Sample Product',
    price: 19.99,
    description: 'This is a sample product description.',
    category: 'Sample Category',
    stock_quantity: 100,
    created_at: '2023-10-25T15:59:05.220Z',
    updated_at: '2023-10-25T15:59:05.220Z',
  },
];

axios
  .post(apiUrl, requestBody)
  .then((response) => {
    console.log('Product created successfully:', response.data);
  })
  .catch((error) => {
    console.error('Error creating product:', error);
  });
```

5. Example response:

```json
{
  "id": "5519ba5d-ebf1-4271-9071-cec729c0e403",
  "timestamp": "2023-10-25T16:52:22.884Z",
  "apiVersion": "2.0",
  "status": 201,
  "message": "Insert success",
  "data": [
    {
      "product_id": 1,
      "name": "Sample Product",
      "price": "19.99",
      "description": "This is a sample product description.",
      "category": "Sample Category",
      "stock_quantity": 100,
      "created_at": "2023-10-25T15:59:05.220Z",
      "updated_at": "2023-10-25T15:59:05.220Z"
    }
  ]
}
```

### POST - Execute complex query:

### PUT - Update a record:

### DELETE - Remove a record:

### GET - Get api document:

### How query with relationship;

## Response:

### API Response Format:

Every API in this project follows a standardized response format. The response is in JSON format and consists of the following fields:

- `id` (string): A unique identifier for the response.
- `timestamp` (string, ISO 8601 format): The timestamp when the response was generated.
- `apiVersion` (string): The version of the API that generated the response.
- `status` (number): The HTTP status code indicating the result of the API call.
- `message` (string): A message from the server providing additional information about the response.
- `data` (any): The main payload of the response, which can be of any type.

Here is an example of a response in this format:

```json
{
  "id": "de50a802-4ba5-4594-a5bd-3c5cb3df0e27",
  "timestamp": "2023-10-25T15:59:05.220Z",
  "apiVersion": "2.0",
  "status": 200,
  "message": "Message from server",
  "data": {
    // ... (any data relevant to the specific API)
  }
}
```

To ensure seamless integration with the standardized API response format, it's recommended to create an interface in your codebase. This interface will represent the structure of the API response.

If you're using TypeScript, you can create an interface like this:

```typescript
interface ApiResponse<T> {
  id: string;
  timestamp: string;
  apiVersion: string;
  status: number;
  message: string;
  data: T;
}
```

### Error code:

You can use error code to handle ui if error when call api:
| Index | Error Status Code | Description |
| ----- | ----------------- | ----------------------------------------------------------------------------------------------------------------------- |
| 1 | 400 | Bad Request - The request cannot be fulfilled due to bad syntax or missing parameters. |
| 2 | 401 | Unauthorized - Authentication failed or user lacks necessary permissions. |
| 3 | 404 | Not Found - The requested resource could not be found on the server. |
| 4 | 500 | Internal Server Error - A generic error message returned when an unexpected condition was encountered. |
| 5 | 503 | Service Unavailable - The server is currently unable to handle the request due to temporary overloading or maintenance. |

### Success code:

You can use error code to handle ui if user do some things success:
| Index | Success Status Code | Description |
| ----- | ------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| 1 | 201 | Success status response code indicates that the request has succeeded and has led to the creation of a resource |
| 2 | 401 | Unauthorized - Authentication failed or user lacks necessary permissions. |
| 3 | 404 | Not Found - The requested resource could not be found on the server. |
| 4 | 500 | Internal Server Error - A generic error message returned when an unexpected condition was encountered. |
| 5 | 503 | Service Unavailable - The server is currently unable to handle the request due to temporary overloading or maintenance. |

# Integrate with Your Existing System

# Use as a Backend for SPA (Single Page Application):

# Use as Core System - Adding Additional Modules:

# Contributing
