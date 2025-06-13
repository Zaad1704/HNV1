HNV Property Management Solutions - SaaS Platform
This repository contains the full-stack code for the HNV SaaS Platform, a modern, multi-tenant application designed for professional property management. It includes a Node.js/TypeScript backend, a React/TypeScript frontend, and is configured for a professional, containerized deployment workflow using Docker.

Table of Contents
Project Vision

Core Features

Technology Stack

Getting Started

Prerequisites

Installation

Running the Application

Project Structure

Deployment

Project Vision
The HNV SaaS Platform is designed to be a secure, scalable, and globally-ready application that provides a seamless management experience for Super Admins, Landlords, and Agents, while offering a premium portal for Tenants. Its core differentiator is a powerful Super Admin CMS combined with built-in internationalization to attract a global customer base.

Core Features
Multi-Tenant Architecture: Each organization's data is completely isolated and secure using an organizationId on all relevant database records.

Role-Based Access Control (RBAC): Distinct permissions for Super Admins, Landlords, and Agents, enforced by secure backend middleware.

Super Admin CMS: A dedicated dashboard for the Super Admin to edit public website content (text, images, colors, etc.) directly, without needing to code.

Dynamic Properties & Tenants Management: Authenticated users can create, view, update, and delete their properties and tenants through an interactive UI that includes list and map views.

Advanced User & Admin Features:

Manual subscription management by Super Admins.

Secure one-time Super Admin account creation via a protected API endpoint.

Framework for user data export and account deletion requests.

Secure Authentication: JWT-based authentication with password hashing (bcrypt) and protected routes.

Audit Logging: A comprehensive system that tracks critical user actions for security and compliance.

PWA Ready: Configured to be an installable Progressive Web App with a manifest and service worker setup for a native-like mobile experience.

Internationalization (i18n): The frontend is set up to support multiple languages and currencies, with a framework for IP-based locale detection.

Technology Stack
Backend: Node.js, Express.js, TypeScript, Mongoose

Frontend: React (with Vite), TypeScript, Zustand, Tailwind CSS

Database: MongoDB

Deployment: Docker

Getting Started
Follow these instructions to get the project up and running on your local machine for development and testing purposes.

Prerequisites

Node.js (v18 or later)

npm (v9 or later)

Docker and Docker Compose

Installation

Clone the repository:

git clone <your-repository-url>
cd hnv-saas

Install all dependencies:
This command will install dependencies for the root, backend, and frontend workspaces.

npm install

Set up Environment Variables:

In the backend/ directory, create a copy of .env.example and name it .env.

Open the new .env file and add your MongoDB Connection String and a secret for JWT_SECRET.

# Example backend/.env file
PORT=5001
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=this_is_a_very_long_and_random_secret_string
SETUP_SECRET_KEY=another_very_long_and_random_secret_string

Running the Application

The recommended method for local development is to use Docker Compose.

Start the application with Docker Compose:
From the root directory of the project, run:

docker-compose up --build

This command will build the Docker images for the frontend and backend and start the services.

Access the application:

Frontend: Open your web browser and navigate to http://localhost:3000

Backend API: The API will be running on http://localhost:5001

Project Structure
The project is organized into two main workspaces: backend and frontend.

/hnv-saas/
|-- backend/        # Contains the Node.js/TypeScript API
|-- frontend/       # Contains the React/TypeScript client
|-- .github/        # For CI/CD workflows
|-- docker-compose.yml
|-- Dockerfile.backend
|-- Dockerfile.frontend
`-- README.md

Deployment
This application is configured for containerized deployment. To deploy to a service like Render.com, you would:

Push your code to a GitHub repository.

On Render, create two "Web Services" (one for backend, one for frontend) and connect them to your GitHub repository.

Configure each service to build and deploy using the appropriate Dockerfile.

Set the necessary environment variables in the Render dashboard for each service.

