# Mighty Moves Backend API

A Node.js/Express backend for the Mighty Moves multi-service platform, providing APIs for user authentication, bookings, and service management.

## 🚀 Features

- **User Authentication**: Registration and login with password hashing
- **Database Integration**: PostgreSQL with Neon database
- **CORS Support**: Configured for frontend integration
- **Environment Configuration**: Secure environment variable management

## 📋 Prerequisites

- Node.js (v14 or higher)
- PostgreSQL database (Neon recommended)
- npm or yarn

## 🛠️ Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-username/mighty-moves-backend.git
   cd mighty-moves-backend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:

   ```env
   PORT=5000
   DATABASE_URL=your_neon_postgres_connection_string
   ```

4. **Set up the database**
   Run the following SQL commands in your PostgreSQL database:

   ```sql
   CREATE TABLE IF NOT EXISTS users (
       id SERIAL PRIMARY KEY,
       name TEXT NOT NULL,
       email TEXT NOT NULL UNIQUE,
       password TEXT NOT NULL
   );
   ```

5. **Start the server**
   ```bash
   npm start
   ```
   or
   ```bash
   node bin/www
   ```

## 🌐 API Endpoints

### Authentication

- `POST /users/register` - Register a new user
- `POST /users/login` - Login user

### Health Check

- `GET /` - Health check endpoint

## 📝 Environment Variables

| Variable       | Description                  | Required           |
| -------------- | ---------------------------- | ------------------ |
| `PORT`         | Server port                  | No (default: 5000) |
| `DATABASE_URL` | PostgreSQL connection string | Yes                |

## 🗄️ Database Schema

### Users Table

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL
);
```

## 🔧 Development

### Running in Development Mode

```bash
npm start
```

### Running with Nodemon (for development)

```bash
npx nodemon bin/www
```

## 🚀 Deployment

### Deploy to Heroku

1. Create a Heroku app
2. Add PostgreSQL addon
3. Set environment variables
4. Deploy:
   ```bash
   git push heroku main
   ```

### Deploy to Railway

1. Connect your GitHub repository
2. Add PostgreSQL service
3. Set environment variables
4. Deploy automatically

## 📦 Dependencies

- **express**: Web framework
- **pg**: PostgreSQL client
- **bcryptjs**: Password hashing
- **cors**: Cross-origin resource sharing
- **dotenv**: Environment variable management
- **jsonwebtoken**: JWT authentication (for future use)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

For support, email support@mightymoves.co.uk or create an issue in this repository.
