# Sehra - Indian Wedding Management Application

![Sehra Logo](./generated-icon.png)

## About Sehra

Sehra is a comprehensive Indian wedding management platform leveraging modern web technologies to simplify and enhance the wedding planning experience. The application helps couples plan and manage every aspect of their Indian wedding, from guest lists to vendor coordination, with personalized support.

## Features

- **Multi-User Role System**: Separate interfaces for clients (bride/groom/family), vendors, supervisors, and administrators
- **Task Management**: Create, track, and complete wedding planning tasks
- **Budget Tracking**: Monitor wedding expenses with mood-based budget health indicators
- **Guest Management**: Organize guest lists, track RSVPs, and manage seating arrangements
- **Vendor Coordination**: Find, book, and communicate with vendors
- **Supervisor Assignment**: Connect clients with dedicated wedding supervisors
- **Gamification Elements**: Achievement system to make wedding planning fun
- **Interactive Timeline**: Create and customize wedding event timelines
- **Real-Time Messaging**: Communicate with vendors and supervisors
- **Analytics Dashboard**: For administrators to monitor platform performance

## Tech Stack

### Frontend
- React with TypeScript
- Tailwind CSS for responsive design
- Shadcn UI components
- Framer Motion for animations
- TanStack Query for data fetching
- Socket.IO for real-time communication

### Backend
- Node.js with Express
- PostgreSQL with Drizzle ORM
- JWT-based authentication
- WebSockets for real-time updates

## Getting Started

### Prerequisites
- Node.js (v16+)
- PostgreSQL database

### Installation

1. Clone the repository
```bash
git clone https://github.com/Suku242000/sehra-wedding-app.git
cd sehra-wedding-app
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
Create a `.env` file in the root directory with:
```
DATABASE_URL=your_postgres_connection_string
JWT_SECRET=your_jwt_secret
SENDGRID_API_KEY=your_sendgrid_api_key (optional for email notifications)
```

4. Run database migrations
```bash
npm run db:push
```

5. Start the development server
```bash
npm run dev
```

## Deployment

The application can be deployed on any platform that supports Node.js applications, such as:
- Vercel
- Render
- Heroku
- AWS
- DigitalOcean

## User Types and Access

- **Admin**: Complete access to all features, user management, analytics
- **Supervisor**: Manages assigned clients, assigns vendors, tracks progress
- **Vendor**: Manages bookings, portfolio, and client communications
- **Client (Bride/Groom/Family)**: Plans wedding, manages budget, tasks, and guest lists

## Screenshots

[Include screenshots once the project is deployed]

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Author

- **Suku242000** - [GitHub Profile](https://github.com/Suku242000)