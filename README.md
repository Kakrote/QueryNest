# QueryNest

QueryNest is a full-stack Q&A web application built with Next.js, Prisma, and Tailwind CSS. It allows users to ask questions, provide answers, comment, vote, and manage authentication. The project is structured for scalability and maintainability, following modern best practices.

## Features
- User authentication (login, signup)
- Ask, answer, and comment on questions
- Voting system for questions and answers
- Tagging and search functionality
- RESTful API routes
- Modern UI with Tailwind CSS

## Tech Stack
- **Frontend:** Next.js, React, Tailwind CSS
- **Backend:** Next.js API routes, Prisma ORM
- **Database:** (Configured via Prisma, e.g., PostgreSQL or SQLite)
- **State Management:** Redux

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm or yarn

### Installation
```bash
npm install
# or
yarn install
```

### Database Setup
1. Configure your database in `prisma/schema.prisma`.
2. Run migrations:
```bash
npx prisma migrate dev
```

### Running the Development Server
```bash
npm run dev
# or
yarn dev
```

Visit [http://localhost:3000](http://localhost:3000) to view the app.

## Folder Structure
```
app/            # Next.js app directory (pages, API routes)
components/     # React components
controllers/    # Business logic for API routes
lib/            # Library files (e.g., Prisma client)
middleware/     # Custom middleware (e.g., auth)
prisma/         # Prisma schema and migrations
public/         # Static assets
redux/          # Redux store and slices
store/          # Custom hooks
utils/          # Utility functions
```

## API Routes Overview
- `/api/auth/login` - User login
- `/api/auth/register` - User registration
- `/api/questions` - CRUD for questions
- `/api/answers` - CRUD for answers
- `/api/comment` - Add comments
- `/api/vote` - Voting system
- `/api/tag` - Tag management
- `/api/spellCheck` - Spell checking
- `/api/questions/search` - Search questions
- `/api/questions/by-tag` - Filter by tag
- `/api/users/[userId]/questions` - User's questions

## Contribution
Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

## License
[MIT](LICENSE)







