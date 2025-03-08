const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');

// Create express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Create MySQL connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',          // Replace with your MySQL username
    password: 'rootroot',  // Replace with your MySQL password
    database: 'movie_booking_system'
});

// Connect to MySQL
db.connect(err => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL database');
    
    // Create tables if they don't exist
    createTables();
});

// JWT Secret Key
const JWT_SECRET = 'your_jwt_secret_key'; // Replace with a strong secret key in production

// Create database tables
function createTables() {
    // Users table
    const createUsersTable = `
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            email VARCHAR(100) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL,
            phone VARCHAR(20),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `;
    
    // Movies table
    const createMoviesTable = `
        CREATE TABLE IF NOT EXISTS movies (
            id INT AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            genre VARCHAR(100) NOT NULL,
            duration INT NOT NULL,
            rating VARCHAR(10) NOT NULL,
            poster_url VARCHAR(255),
            description TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `;
    
    // Bookings table
    const createBookingsTable = `
        CREATE TABLE IF NOT EXISTS bookings (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            movie VARCHAR(255) NOT NULL,
            date VARCHAR(50) NOT NULL,
            time VARCHAR(20) NOT NULL,
            seats VARCHAR(255) NOT NULL,
            total DECIMAL(10, 2) NOT NULL,
            booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    `;
    
    // Execute queries
    db.query(createUsersTable, (err) => {
        if (err) console.error('Error creating users table:', err);
        else console.log('Users table checked/created');
    });
    
    db.query(createMoviesTable, (err) => {
        if (err) console.error('Error creating movies table:', err);
        else {
            console.log('Movies table checked/created');
            // Insert sample movies if table is empty
            insertSampleMovies();
        }
    });
    
    db.query(createBookingsTable, (err) => {
        if (err) console.error('Error creating bookings table:', err);
        else console.log('Bookings table checked/created');
    });
}

// Insert sample movies if none exist
function insertSampleMovies() {
    db.query('SELECT COUNT(*) as count FROM movies', (err, result) => {
        if (err) {
            console.error('Error checking movies count:', err);
            return;
        }
        
        if (result[0].count === 0) {
            const sampleMovies = [
                {
                    title: 'The Dark Knight',
                    genre: 'Action, Crime, Drama',
                    duration: 152,
                    rating: 'PG-13',
                    poster_url: '/api/placeholder/250/350',
                    description: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.'
                },
                {
                    title: 'Inception',
                    genre: 'Action, Adventure, Sci-Fi',
                    duration: 148,
                    rating: 'PG-13',
                    poster_url: '/api/placeholder/250/350',
                    description: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.'
                },
                {
                    title: 'The Shawshank Redemption',
                    genre: 'Drama',
                    duration: 142,
                    rating: 'R',
                    poster_url: '/api/placeholder/250/350',
                    description: 'Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.'
                },
                {
                    title: 'Pulp Fiction',
                    genre: 'Crime, Drama',
                    duration: 154,
                    rating: 'R',
                    poster_url: '/api/placeholder/250/350',
                    description: 'The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption.'
                },
                {
                    title: 'The Matrix',
                    genre: 'Action, Sci-Fi',
                    duration: 136,
                    rating: 'R',
                    poster_url: '/api/placeholder/250/350',
                    description: 'A computer hacker learns from mysterious rebels about the true nature of his reality and his role in the war against its controllers.'
                },
                {
                    title: 'Interstellar',
                    genre: 'Adventure, Drama, Sci-Fi',
                    duration: 169,
                    rating: 'PG-13',
                    poster_url: '/api/placeholder/250/350',
                    description: 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity\'s survival.'
                }
            ];
            
            // Insert sample movies
            sampleMovies.forEach(movie => {
                db.query('INSERT INTO movies SET ?', movie, (err) => {
                    if (err) console.error('Error inserting sample movie:', err);
                });
            });
            
            console.log('Sample movies inserted');
        }
    });
}

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ message: 'Authentication required' });
    }
    
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid or expired token' });
        }
        
        req.user = user;
        next();
    });
};

// API Routes

// Register a new user
app.post('/api/register', async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;
        
        // Check if email already exists
        db.query('SELECT id FROM users WHERE email = ?', [email], async (err, results) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ message: 'Server error' });
            }
            
            if (results.length > 0) {
                return res.status(400).json({ message: 'Email already in use' });
            }
            
            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);
            
            // Insert new user
            db.query(
                'INSERT INTO users (name, email, password, phone) VALUES (?, ?, ?, ?)',
                [name, email, hashedPassword, phone],
                (err, result) => {
                    if (err) {
                        console.error('Registration error:', err);
                        return res.status(500).json({ message: 'Registration failed' });
                    }
                    
                    res.status(201).json({ message: 'User registered successfully' });
                }
            );
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Login user
app.post('/api/login', (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Find user by email
        db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
            if (err) {
                console.error('Login error:', err);
                return res.status(500).json({ message: 'Server error' });
            }
            
            if (results.length === 0) {
                return res.status(401).json({ message: 'Invalid email or password' });
            }
            
            const user = results[0];
            
            // Compare passwords
            const passwordMatch = await bcrypt.compare(password, user.password);
            
            if (!passwordMatch) {
                return res.status(401).json({ message: 'Invalid email or password' });
            }
            
            // Create JWT token
            const token = jwt.sign(
                { id: user.id, email: user.email },
                JWT_SECRET,
                { expiresIn: '24h' }
            );
            
            // Remove password from user object
            const { password: userPassword, ...userWithoutPassword } = user;
            
            res.json({
                message: 'Login successful',
                token,
                user: userWithoutPassword
            });
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get all movies
app.get('/api/movies', authenticateToken, (req, res) => {
    db.query('SELECT * FROM movies', (err, results) => {
        if (err) {
            console.error('Error fetching movies:', err);
            return res.status(500).json({ message: 'Server error' });
        }
        
        res.json(results);
    });
});

// Get movie by ID
app.get('/api/movies/:id', authenticateToken, (req, res) => {
    const { id } = req.params;
    
    db.query('SELECT * FROM movies WHERE id = ?', [id], (err, results) => {
        if (err) {
            console.error('Error fetching movie:', err);
            return res.status(500).json({ message: 'Server error' });
        }
        
        if (results.length === 0) {
            return res.status(404).json({ message: 'Movie not found' });
        }
        
        res.json(results[0]);
    });
});

// Create a new booking
app.post('/api/bookings', authenticateToken, (req, res) => {
    try {
        const { movie, date, time, seats, total, user_id } = req.body;
        
        // Insert booking
        db.query(
            'INSERT INTO bookings (user_id, movie, date, time, seats, total) VALUES (?, ?, ?, ?, ?, ?)',
            [user_id, movie, date, time, seats, total],
            (err, result) => {
                if (err) {
                    console.error('Booking error:', err);
                    return res.status(500).json({ message: 'Booking failed' });
                }
                
                // Get the inserted booking
                db.query('SELECT * FROM bookings WHERE id = ?', [result.insertId], (err, results) => {
                    if (err) {
                        console.error('Error fetching booking:', err);
                        return res.status(500).json({ message: 'Server error' });
                    }
                    
                    res.status(201).json({
                        message: 'Booking created successfully',
                        booking: results[0]
                    });
                });
            }
        );
    } catch (error) {
        console.error('Booking error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get user bookings
app.get('/api/bookings/user', authenticateToken, (req, res) => {
    const userId = req.user.id;
    
    db.query('SELECT * FROM bookings WHERE user_id = ? ORDER BY booking_date DESC', [userId], (err, results) => {
        if (err) {
            console.error('Error fetching bookings:', err);
            return res.status(500).json({ message: 'Server error' });
        }
        
        res.json(results);
    });
});

// Serve index.html for all other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});