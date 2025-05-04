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
    user: 'root', // Replace with your MySQL username
    password: 'rootroot', // Replace with your MySQL password
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

    // --- Add theater_id column and constraint to existing bookings table if they don't exist ---
    const checkColumnExists = `
        SELECT COUNT(*) AS count
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = 'movie_booking_system'
        AND TABLE_NAME = 'bookings'
        AND COLUMN_NAME = 'theater_id';
    `;
    db.query(checkColumnExists, (err, results) => {
        if (err) {
            console.error("Error checking if 'theater_id' column exists:", err);
            return;
        }
        if (results && results[0] && results[0].count === 0) {
            console.log("'theater_id' column not found in bookings table. Adding it...");
            db.query('ALTER TABLE bookings ADD COLUMN theater_id INT', (err) => {
                if (err) {
                    console.error("Error adding 'theater_id' column:", err);
                } else {
                    console.log("'theater_id' column added successfully.");
                    const addForeignKeySql = `
                        ALTER TABLE bookings
                        ADD CONSTRAINT fk_bookings_theater
                        FOREIGN KEY (theater_id) REFERENCES theaters(id) ON DELETE CASCADE;
                    `;
                    db.query(addForeignKeySql, (err) => {
                        if (err) {
                             if (err.code === 'ER_DUP_KEYNAME' || err.code === 'ER_FK_DUP_NAME') {
                                console.warn("Foreign key constraint 'fk_bookings_theater' might already exist.");
                             } else {
                                console.error("Error adding foreign key constraint for 'theater_id':", err);
                             }
                        } else {
                            console.log("Foreign key constraint 'fk_bookings_theater' added successfully.");
                        }
                    });
                }
            });
        } else if (results && results[0] && results[0].count > 0) {
             console.log("'theater_id' column already exists in bookings table.");
             const checkForeignKeyExists = `
                 SELECT COUNT(*) AS count
                 FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
                 WHERE TABLE_SCHEMA = 'movie_booking_system'
                 AND TABLE_NAME = 'bookings'
                 AND CONSTRAINT_NAME = 'fk_bookings_theater';
             `;
             db.query(checkForeignKeyExists, (err, fkResults) => {
                 if (err) {
                      console.error("Error checking if 'fk_bookings_theater' constraint exists:", err);
                      return;
                 }
                 if (fkResults && fkResults[0] && fkResults[0].count === 0) {
                     console.log("Foreign key constraint 'fk_bookings_theater' not found. Attempting to add it...");
                      const addForeignKeySql = `
                         ALTER TABLE bookings
                         ADD CONSTRAINT fk_bookings_theater
                         FOREIGN KEY (theater_id) REFERENCES theaters(id) ON DELETE CASCADE;
                     `;
                     db.query(addForeignKeySql, (err) => {
                         if (err) {
                             if (err.code === 'ER_DUP_KEYNAME' || err.code === 'ER_FK_DUP_NAME') {
                                console.warn("Foreign key constraint 'fk_bookings_theater' might already exist after all.");
                             } else {
                                console.error("Error adding foreign key constraint for 'theater_id':", err);
                             }
                         } else {
                             console.log("Foreign key constraint 'fk_bookings_theater' added successfully.");
                         }
                     });
                 } else {
                      console.log("Foreign key constraint 'fk_bookings_theater' already exists or check failed.");
                 }
             });
        }
    });
    // --- End of ALTER TABLE logic ---
});

// JWT Secret Key
const JWT_SECRET = 'your_jwt_secret_key'; // Make sure this is the same as in your frontend, but change this in production

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
            title VARCHAR(255) NOT NULL UNIQUE,
            genre VARCHAR(100) NOT NULL,
            duration INT NOT NULL,
            rating VARCHAR(10) NOT NULL,
            poster_url VARCHAR(255),
            description TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `;

    // Theaters table - MUST exist before bookings table if using foreign key
    const createTheatersTable = `
        CREATE TABLE IF NOT EXISTS theaters (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            city VARCHAR(100) NOT NULL,
            state VARCHAR(100) NOT NULL,
            address TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `;

     // Bookings table - Added theater_id column and foreign key
    const createBookingsTable = `
        CREATE TABLE IF NOT EXISTS bookings (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            movie VARCHAR(255) NOT NULL, -- Could store movie_id INT NOT NULL FOREIGN KEY REFERENCES movies(id) for robustness
            date VARCHAR(50) NOT NULL,
            time VARCHAR(20) NOT NULL,
            theater_id INT NOT NULL,
            seats VARCHAR(255) NOT NULL,
            total DECIMAL(10, 2) NOT NULL,
            booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (theater_id) REFERENCES theaters(id) ON DELETE CASCADE
        )
    `;


    // Execute queries in order of dependency (Theaters before Bookings)
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

    db.query(createTheatersTable, (err) => {
        if (err) console.error('Error creating theaters table:', err);
        else {
            console.log('Theaters table checked/created');
            // Insert sample theaters if table is empty
            insertSampleTheaters();
             // Create bookings table after theaters is confirmed to exist
            db.query(createBookingsTable, (err) => {
                 if (err) console.error('Error creating bookings table:', err);
                 else console.log('Bookings table checked/created');
             });
        }
    });

}

// Insert sample theaters if none exist
function insertSampleTheaters() {
    db.query('SELECT COUNT(*) as count FROM theaters', (err, result) => {
        if (err) {
            console.error('Error checking theaters count:', err);
            return;
        }

        if (result && result[0] && result[0].count === 0) {
            const sampleTheaters = [
                { name: 'Cineplex Central', city: 'Metropolis', state: 'StateA', address: '123 Movie Lane' },
                { name: 'Grand Cinema', city: 'Metropolis', state: 'StateA', address: '456 Film Street' },
                { name: 'Downtown Movies', city: 'Gotham', state: 'StateB', address: '789 Reel Road' },
                { name: 'Star Theater', city: 'Star City', state: 'StateC', address: '101 Action Ave' }
            ];

            sampleTheaters.forEach(theater => {
                db.query('INSERT INTO theaters SET ?', theater, (err) => {
                    if (err) console.error('Error inserting sample theater:', err);
                });
            });

            console.log('Sample theaters inserted');
        }
    });
}

// Insert sample movies if none exist
function insertSampleMovies() {
    db.query('SELECT COUNT(*) as count FROM movies', (err, result) => {
        if (err) {
            console.error('Error checking movies count:', err);
            return;
        }

        if (result && result[0] && result[0].count === 0) {
            // Added more diverse movies
            const sampleMovies = [
                {
                    title: 'The Dark Knight',
                    genre: 'Action, Crime, Drama',
                    duration: 152,
                    rating: 'PG-13',
                    poster_url: '/The Dark Knight.jpg',
                    description: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.',
                    trailer_url: 'https://www.youtube.com/embed/EXeTwQWrcwY?si=xE4wDhv0k7PHHTRE'
                },
                {
                    title: 'Inception',
                    genre: 'Action, Adventure, Sci-Fi',
                    duration: 148,
                    rating: 'PG-13',
                    poster_url: '/Inception.jpg',
                    description: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.',
                    trailer_url: 'https://www.youtube.com/embed/YoHD9XEInc0?si=n2cmewzhOGdJPzHp'
                },
                {
                    title: 'The Shawshank Redemption',
                    genre: 'Drama',
                    duration: 142,
                    rating: 'R',
                    poster_url: '/The Shawshank Redemption.jpg',
                    description: 'Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.',
                    trailer_url: 'https://www.youtube.com/embed/PLl99DlL6b4?si=CB18gbe09V2OLVfQ'
                },
                {
                    title: 'Pulp Fiction',
                    genre: 'Crime, Drama',
                    duration: 154,
                    rating: 'R',
                    poster_url: '/Pulp Fiction.jpg',
                    description: 'The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption.',
                    trailer_url: 'https://www.youtube.com/embed/s7EdQ4FqbhY?si=bA3XCT3bhzbFKoc-'
                },
                {
                    title: 'The Matrix',
                    genre: 'Action, Sci-Fi',
                    duration: 136,
                    rating: 'R',
                    poster_url: '/The Matrix.jpg',
                    description: 'A computer hacker learns from mysterious rebels about the true nature of his reality and his role in the war against its controllers.',
                    trailer_url: 'https://www.youtube.com/embed/vKQi3bBA1y8?si=Cv5z0cHwV5msXurK'
                },
                {
                    title: 'Interstellar',
                    genre: 'Adventure, Drama, Sci-Fi',
                    duration: 169,
                    rating: 'PG-13',
                    poster_url: '/Interstellar.jpg', 
                    description: 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity\'s survival.',
                    trailer_url: 'https://www.youtube.com/embed/HYVxnPmb15E?si=aPSlRiWgXphOYEeL'
                },
                 
                {
                    title: 'Animal',
                    genre: 'Action, Crime, Drama',
                    duration: 201,
                    rating: 'A',
                    poster_url: '/Animal.jpg',
                    description: 'A father-son relationship gets complicated when the son undergoes a remarkable transformation as a result of his father\'s actions.',
                    trailer_url: 'https://www.youtube.com/embed/Dydmpfo68DA?si=iiX-zVcWgP4D_mzp'
                },
                {
                    title: 'Dabangg 2',
                    genre: 'Action, Comedy, Crime',
                    duration: 123,
                    rating: 'A',
                    poster_url: '/dabangg2.jpg',
                    description: 'Chulbul Pandey returns to his hometown where he must confront a corrupt politician and his gang while protecting his family.',
                    trailer_url: 'https://www.youtube.com/embed/7nPN1M9zVcI?si=Sq4xkBzsV11wHkT9'
                },
                {
                    title: '3 Idiots',
                    genre: 'Comedy, Drama',
                    duration: 170,
                    rating: 'PG-13',
                    poster_url: '/3idiots.jpg',
                    description: 'Two friends search for their long lost companion who inspired them to think differently, even as the rest of the world called them "idiots".',
                    trailer_url: 'https://www.youtube.com/embed/K0eDlFX9GMc?si=BZaeXFVyEM1lwLyX'
                },
                {
                    title: 'Lagaan',
                    genre: 'Drama, Musical, Sport',
                    duration: 224,
                    rating: 'PG',
                    poster_url: '/lagaan.jpg',
                    description: 'The people of a small village in Victorian India stake their future on a game of cricket against their ruthless British rulers.',
                    trailer_url: 'https://www.youtube.com/embed/Nhi4Azs2nEw?si=0JCDWJS_M25i3B8n'
                }
            ];

            // Insert sample movies
            sampleMovies.forEach(movie => {
                db.query('INSERT IGNORE INTO movies SET ?', movie, (err) => {
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
        return res.status(401).json({ message: 'Authentication token required' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid or expired token' });
        }

        req.user = user; // Attach user payload to request
        next();
    });
};

// API Routes

// Register a new user
app.post('/api/register', async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;

        if (!name || !email || !password || !phone) {
             return res.status(400).json({ message: 'All fields are required' });
        }

        db.query('SELECT id FROM users WHERE email = ?', [email], async (err, results) => {
            if (err) {
                console.error('Database error (register check):', err);
                return res.status(500).json({ message: 'Server error' });
            }

            if (results && results.length > 0) {
                return res.status(409).json({ message: 'Email already in use' });
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            db.query(
                'INSERT INTO users (name, email, password, phone) VALUES (?, ?, ?, ?)',
                [name, email, hashedPassword, phone],
                (err, result) => {
                    if (err) {
                        console.error('Registration error (insert):', err);
                         if (err.code === 'ER_DUP_ENTRY') {
                             return res.status(409).json({ message: 'Email already exists.' });
                         }
                        return res.status(500).json({ message: 'Registration failed' });
                    }

                    res.status(201).json({ message: 'User registered successfully' });
                }
            );
        });
    } catch (error) {
        console.error('Registration endpoint error:', error);
        res.status(500).json({ message: 'Server error during registration' });
    }
});

// Login user
app.post('/api/login', (req, res) => {
    try {
        const { email, password } = req.body;

         if (!email || !password) {
             return res.status(400).json({ message: 'Email and password are required' });
         }

        db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
            if (err) {
                console.error('Login error (db query):', err);
                return res.status(500).json({ message: 'Server error' });
            }

            if (!results || results.length === 0) {
                return res.status(401).json({ message: 'Invalid email or password' });
            }

            const user = results[0];

            const passwordMatch = await bcrypt.compare(password, user.password);

            if (!passwordMatch) {
                return res.status(401).json({ message: 'Invalid email or password' });
            }

            const token = jwt.sign(
                { id: user.id, email: user.email },
                JWT_SECRET,
                { expiresIn: '24h' }
            );

            const { password: userPassword, ...userWithoutPassword } = user;

            res.json({
                message: 'Login successful',
                token,
                user: userWithoutPassword
            });
        });
    } catch (error) {
        console.error('Login endpoint error:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
});

// Get all movies (requires authentication)
app.get('/api/movies', authenticateToken, (req, res) => {
    db.query('SELECT * FROM movies', (err, results) => {
        if (err) {
            console.error('Error fetching movies:', err);
            return res.status(500).json({ message: 'Server error fetching movies' });
        }

        console.log(`[API /api/movies] Fetched ${results ? results.length : 0} movies from DB.`);

        res.json(results || []);
    });
});

// Get all theaters (requires authentication)
app.get('/api/theaters', authenticateToken, (req, res) => {
    db.query('SELECT id, name, city FROM theaters ORDER BY city, name', (err, results) => {
        if (err) {
            console.error('Error fetching theaters:', err);
            return res.status(500).json({ message: 'Server error fetching theaters' });
        }
        console.log(`[API /api/theaters] Fetched ${results ? results.length : 0} theaters from DB.`);
        res.json(results || []);
    });
});

// Get movie by ID (requires authentication)
app.get('/api/movies/:id', authenticateToken, (req, res) => {
    const { id } = req.params;

     if (!id) {
         return res.status(400).json({ message: 'Movie ID is required' });
     }

    db.query('SELECT * FROM movies WHERE id = ?', [id], (err, results) => {
        if (err) {
            console.error('Error fetching movie by ID:', err);
            return res.status(500).json({ message: 'Server error fetching movie' });
        }

        if (!results || results.length === 0) {
            return res.status(404).json({ message: 'Movie not found' });
        }

        res.json(results[0]);
    });
});

// AI FEATURE: Get recommendations based on user's last booked movie genre
// Endpoint: /api/recommendations (User ID is taken from the JWT)
app.get('/api/recommendations', authenticateToken, (req, res) => {
    const userId = req.user.id;
    console.log(`[API /api/recommendations] Request for authenticated user ID: ${userId}`);

    // 1. Find the user's most recent booking
    db.query(
        'SELECT movie FROM bookings WHERE user_id = ? ORDER BY booking_date DESC LIMIT 1',
        [userId],
        (err, bookingResults) => {
            if (err) {
                console.error('Error fetching last booking for recommendations:', err);
                return res.status(500).json({ message: 'Server error fetching recommendations' });
            }

            if (!bookingResults || bookingResults.length === 0) {
                console.log(`[API /api/recommendations] No bookings found for user ${userId}. Returning empty recommendations.`);
                // If no bookings, return empty array. Can modify to return popular/random movies instead.
                return res.json([]);
            }

            const lastBookedMovieTitle = bookingResults[0].movie;
             console.log(`[API /api/recommendations] Last booked movie title for user ${userId}: "${lastBookedMovieTitle}"`);

            // 2. Find the genre(s) and ID of the last booked movie using its title
            db.query(
                'SELECT id, genre FROM movies WHERE title = ? LIMIT 1',
                [lastBookedMovieTitle],
                (err, movieResults) => {
                     if (err) {
                         console.error(`Error fetching genre for movie "${lastBookedMovieTitle}" (for recommendations):`, err);
                         return res.status(500).json({ message: 'Server error fetching recommendations' });
                     }

                     if (!movieResults || movieResults.length === 0) {
                          console.warn(`[API /api/recommendations] Movie "${lastBookedMovieTitle}" not found in movies table. Cannot recommend by genre.`);
                          return res.json([]); // Movie not found in DB, cannot recommend by genre
                     }

                    const bookedMovie = movieResults[0];
                    const bookedMovieGenres = bookedMovie.genre ?
                                            bookedMovie.genre.split(',').map(g => g.trim()).filter(g => g !== '')
                                            : []; // Split, trim, and filter empty strings
                    const bookedMovieId = bookedMovie.id; // Get the ID of the booked movie

                    if (bookedMovieGenres.length === 0) {
                         console.log(`[API /api/recommendations] No valid genres found for movie "${lastBookedMovieTitle}". Returning empty recommendations.`);
                         return res.json([]); // No genres associated, cannot recommend
                    }

                     console.log(`[API /api/recommendations] Genres for "${lastBookedMovieTitle}": ${bookedMovieGenres.join(', ')}`);

                    // 3. Find other movies with matching genres
                    // Build a query to find movies where the genre string contains any of the booked movie's genres
                    const genreConditions = bookedMovieGenres
                                             .map(genre => `genre LIKE '%${db.escape(genre)}%'`) // Escape genre for SQL LIKE
                                             .join(' OR ');

                    const recommendedMoviesSql = `
                        SELECT id, title, genre, duration, rating, poster_url
                        FROM movies
                        WHERE (${genreConditions})
                        AND id != ? -- Exclude the movie the user just booked
                        LIMIT 5 -- Limit the number of recommendations
                    `;
                    // console.log(`[API /api/recommendations] Recommendation SQL: ${recommendedMoviesSql}`); // Log the full query if needed for debugging

                    db.query(recommendedMoviesSql, [bookedMovieId], (err, recommendations) => {
                        if (err) {
                            console.error('Error fetching recommended movies:', err);
                            return res.status(500).json({ message: 'Server error fetching recommendations' });
                        }

                        console.log(`[API /api/recommendations] Found ${recommendations ? recommendations.length : 0} recommendations for user ${userId}.`);
                        res.json(recommendations || []); // Return the list of recommended movies
                    });
                }
            );
        }
    );
});


// Create a new booking with double-booking check (requires authentication)
app.post('/api/bookings', authenticateToken, (req, res) => {
    try {
        const user_id = req.user.id;
        const { movie, date, time, seats, total, theater_id } = req.body;

        if (!movie || !date || !time || !seats || !total || !theater_id) {
             console.warn("Received incomplete booking data:", req.body);
             return res.status(400).json({ message: 'Booking failed. Missing required booking details.' });
        }
         if (seats.trim() === '') {
             return res.status(400).json({ message: 'Booking failed. No seats selected.' });
         }

        const theaterIdInt = parseInt(theater_id, 10);
        if (isNaN(theaterIdInt)) {
            console.error(`Invalid theater_id received: ${theater_id}`);
            return res.status(400).json({ message: 'Booking failed. Invalid theater selected.' });
        }

         const totalDecimal = parseFloat(total);
         if (isNaN(totalDecimal) || totalDecimal < 0) {
             console.error(`Invalid total received: ${total}`);
             return res.status(400).json({ message: 'Booking failed. Invalid total amount.' });
         }


        const requestedSeats = seats.split(',').map(s => s.trim());

        db.query(
            'SELECT seats FROM bookings WHERE movie = ? AND date = ? AND time = ? AND theater_id = ?',
            [movie, date, time, theaterIdInt],
            (err, existingBookings) => {
                if (err) {
                    console.error('Error checking existing bookings:', err);
                    return res.status(500).json({ message: 'Server error during booking check' });
                }

                const alreadyBookedSeats = new Set();
                if (existingBookings) {
                     existingBookings.forEach(booking => {
                        if (booking.seats) {
                             booking.seats.split(',').map(s => s.trim()).filter(seat => seat !== '').forEach(seat => alreadyBookedSeats.add(seat));
                        }
                     });
                }

                const conflictSeats = requestedSeats.filter(seat => alreadyBookedSeats.has(seat));

                if (conflictSeats.length > 0) {
                    console.warn(`Booking conflict for user ${user_id}: Seats ${conflictSeats.join(', ')} already taken.`);
                    return res.status(409).json({
                        message: `Booking failed. The following seats are already taken: ${conflictSeats.join(', ')}`,
                        conflictedSeats: conflictSeats
                    });
                }

                db.query(
                    'INSERT INTO bookings (user_id, movie, date, time, theater_id, seats, total) VALUES (?, ?, ?, ?, ?, ?, ?)',
                    [user_id, movie, date, time, theaterIdInt, seats, totalDecimal],
                    (insertErr, result) => {
                        if (insertErr) {
                            console.error('Booking insertion error:', insertErr);
                             if (insertErr.code === 'ER_NO_REFERENCED_ROW_2') {
                                 return res.status(400).json({ message: 'Invalid theater selected.' });
                             }
                            return res.status(500).json({ message: 'Booking failed during database insertion' });
                        }

                        const fetchBookingSql = `
                            SELECT b.id, b.movie, b.date, b.time, b.seats, b.total, t.name as theater_name
                            FROM bookings b
                            JOIN theaters t ON b.theater_id = t.id
                            WHERE b.id = ?
                        `;
                        db.query(fetchBookingSql, [result.insertId], (fetchErr, results) => {
                            if (fetchErr || !results || results.length === 0) {
                                console.error('Error fetching newly created booking details:', fetchErr);
                                return res.status(201).json({
                                    message: 'Booking created successfully, but failed to retrieve full details.',
                                    bookingId: result.insertId
                                });
                            }

                            res.status(201).json({
                                message: 'Booking created successfully',
                                booking: results[0]
                            });
                        });
                    }
                );
            }
        );
    } catch (error) {
        console.error('Booking processing error (catch):', error);
        res.status(500).json({ message: 'Server error processing booking request' });
    }
});

// Get user bookings (requires authentication) - Includes theater name via JOIN
app.get('/api/bookings/user', authenticateToken, (req, res) => {
    const userId = req.user.id;

    const sql = `
        SELECT b.id, b.movie, b.date, b.time, b.seats, b.total, t.name as theater_name, b.booking_date
        FROM bookings b
        JOIN theaters t ON b.theater_id = t.id
        WHERE b.user_id = ?
        ORDER BY b.booking_date DESC
    `;

    db.query(sql, [userId], (err, results) => {
        if (err) {
            console.error('Error fetching user bookings with theater name:', err);
            return res.status(500).json({ message: 'Server error fetching user bookings' });
        }

        console.log(`[API /api/bookings/user] Fetched ${results ? results.length : 0} bookings for user ${userId}.`);
        res.json(results || []);
    });
});

// Get booked seats for a specific movie, date, time, AND theater (requires authentication)
app.get('/api/booked-seats', authenticateToken, (req, res) => {
    const { movie, date, time, theater_id } = req.query;

    if (!movie || !date || !time || !theater_id) {
        console.warn("[API /api/booked-seats] Missing required query parameters.");
        return res.status(400).json({ message: 'Missing required query parameters: movie, date, time, theater_id' });
    }

     const theaterIdInt = parseInt(theater_id, 10);
     if (isNaN(theaterIdInt)) {
         console.error(`[API /api/booked-seats] Invalid theater_id query parameter: ${theater_id}`);
         return res.status(400).json({ message: 'Invalid theater ID provided.' });
     }


    db.query(
        'SELECT seats FROM bookings WHERE movie = ? AND date = ? AND time = ? AND theater_id = ?',
        [movie, date, time, theaterIdInt],
        (err, results) => {
            if (err) {
                console.error('Error fetching booked seats:', err);
                return res.status(500).json({ message: 'Server error' });
            }

            let allBookedSeats = [];
            if (results) {
                 results.forEach(booking => {
                    if (booking.seats) {
                         const bookedSeatsForThisBooking = booking.seats.split(',').map(s => s.trim()).filter(seat => seat !== '');
                         allBookedSeats = allBookedSeats.concat(bookedSeatsForThisBooking);
                    }
                 });
            }

            const uniqueBookedSeats = [...new Set(allBookedSeats)];
            console.log(`[API /api/booked-seats] Found ${uniqueBookedSeats.length} booked seats for movie "${movie}", date "${date}", time "${time}", theater ${theater_id}.`);
            res.json(uniqueBookedSeats);
        }
    );
});


// Serve index.html for all other routes - Make sure this is the LAST route
app.get('*', (req, res) => {
     console.log(`Serving index.html for route: ${req.path}`);
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
