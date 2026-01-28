# CloudStack API Monitor - Backend

The core backend service for the CloudStack API Monitor. This repository houses the REST API for managing user data and monitors, as well as the autonomous background workers responsible for real-time health checks and anomaly detection.

## Tech Stack & Architecture

- **Runtime:** Node.js & Express.js
- **Language:** TypeScript
- **Database:** MongoDB (Mongoose) with Connection Caching
- **Authentication:** JWT (JSON Web Tokens) & Bcrypt
- **Email Service:** Nodemailer (SMTP)
- **Task Scheduling:** `node-cron`

## Key Features Implemented

### 1. Authentication System

- **Secure Registration:** Users sign up with Email/Password.
- **OTP Verification:** Integration with Nodemailer to send 6-digit verification codes via email.
- **JWT Authorization:** Stateless authentication using Access and Refresh tokens.
- **Profile Management:** Secure endpoints for updating names and changing passwords (with current password verification).

### 2. Monitor Management API

- **CRUD Operations:** Create, Read, Update, and Delete API monitors.
- **Toggle Status:** Pause/Resume monitoring without deleting configurations.
- **Data Aggregation:** Endpoints to fetch recent pings, uptime percentages, and latency graphs.

### 3. Background Monitoring Engine (`worker/monitorEngine.ts`)

- **High-Frequency Checks:** Runs every 10 seconds.
- **Mechanism:** Iterates through active monitors and pings target URLs.
- **Data Logging:** Records response time (latency), status code, and "UP/DOWN" status into `PingLog` collection.
- **Error Handling:** Automatically detects timeouts or connection failures.

### 4. Analytics & Insights Engine (`worker/analyticsEngine.ts`)

- **Automated Analysis:** Runs every minute to analyze system health.
- **Dynamic Baseline Calculation:** Compares current performance (Last 1m) vs. historical baseline (Last 10m).
- **Anomaly Detection:**
  - **Degraded Performance:** Flags if current latency > 1.5x baseline.
  - **Reliability Issues:** Flags if failure rate > 10%.
- **Self-Healing:** Automatically marks incidents as "Resolved" when performance stabilizes.

## Setup & Installation

### 1. Clone Project

Clone project

` git clone https://github.com/Afsalkp7/api-health-monitor-be.git`

`cd api-health-monitor-be`

### 2. Environment Variables

Create a `.env` file in the root directory:
Added a sample.env file there for reference

### 3. Install Dependencies

`npm install`

### 4. Run Application

This command starts both the Express API and the Background Workers simultaneously using concurrently.

`npm start`
