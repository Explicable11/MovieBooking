document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements for Sign In/Sign Up
    const container = document.querySelector('.container');
    const signUpBtn = document.querySelector('#sign-up-btn');
    const signInBtn = document.querySelector('#sign-in-btn');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const loginError = document.getElementById('loginError');
    const registerError = document.getElementById('registerError');
    
    // DOM Elements for Movies Page
    const moviesContainer = document.getElementById('moviesContainer');
    const moviesGrid = document.getElementById('moviesGrid');
    const logoutBtn = document.getElementById('logoutBtn');
    const userNameSpan = document.getElementById('userName');
    
    // DOM Elements for Booking Modal
    const bookingModal = document.getElementById('bookingModal');
    const modalCloseBtn = bookingModal.querySelector('.close');
    const modalMovieTitle = document.getElementById('modalMovieTitle');
    const modalMovieImage = document.getElementById('modalMovieImage');
    const modalMovieGenre = document.getElementById('modalMovieGenre');
    const modalMovieDuration = document.getElementById('modalMovieDuration');
    const modalMovieRating = document.getElementById('modalMovieRating');
    const dateSelector = document.getElementById('dateSelector');
    const timeSelector = document.getElementById('timeSelector');
    const seatsGrid = document.getElementById('seatsGrid');
    const summaryMovie = document.getElementById('summaryMovie');
    const summaryDate = document.getElementById('summaryDate');
    const summaryTime = document.getElementById('summaryTime');
    const summarySeats = document.getElementById('summarySeats');
    const summaryTotal = document.getElementById('summaryTotal');
    const bookTicketsBtn = document.getElementById('bookTicketsBtn');
    
    // DOM Elements for Confirmation Modal
    const confirmationModal = document.getElementById('confirmationModal');
    const confirmationCloseBtn = confirmationModal.querySelector('.close');
    const closeConfirmBtn = document.getElementById('closeConfirmBtn');
    const bookingId = document.getElementById('bookingId');
    const confirmMovie = document.getElementById('confirmMovie');
    const confirmDate = document.getElementById('confirmDate');
    const confirmTime = document.getElementById('confirmTime');
    const confirmSeats = document.getElementById('confirmSeats');
    const confirmTotal = document.getElementById('confirmTotal');

    // Sign Up/Sign In Animation
    if (signUpBtn) {
        signUpBtn.addEventListener('click', () => {
            container.classList.add('sign-up-mode');
        });
    }
    
    if (signInBtn) {
        signInBtn.addEventListener('click', () => {
            container.classList.remove('sign-up-mode');
        });
    }
    
    // Login Form Handler
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            
            loginError.textContent = '';
            
            // Make API request to login
            fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Login failed');
                }
                return response.json();
            })
            .then(data => {
                // Store user info in session
                sessionStorage.setItem('user', JSON.stringify(data.user));
                sessionStorage.setItem('token', data.token);
                
                // Show movies page
                container.style.display = 'none';
                moviesContainer.style.display = 'block';
                userNameSpan.textContent = data.user.name;
                
                // Load movies
                loadMovies();
            })
            .catch(error => {
                loginError.textContent = 'Invalid email or password';
                console.error('Login error:', error);
            });
        });
    }
    
    // Register Form Handler
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const name = document.getElementById('registerName').value;
            const email = document.getElementById('registerEmail').value;
            const password = document.getElementById('registerPassword').value;
            const phone = document.getElementById('registerPhone').value;
            
            registerError.textContent = '';
            
            // Make API request to register
            fetch('/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, email, password, phone })
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Registration failed');
                }
                return response.json();
            })
            .then(data => {
                // Switch to login form
                container.classList.remove('sign-up-mode');
                
                // Show success message
                loginError.textContent = 'Registration successful. Please login.';
                loginError.style.color = 'green';
            })
            .catch(error => {
                registerError.textContent = 'Registration failed. Email may already be in use.';
                console.error('Registration error:', error);
            });
        });
    }
    
    // Logout Handler
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            // Clear session storage
            sessionStorage.removeItem('user');
            sessionStorage.removeItem('token');
            
            // Show login page
            moviesContainer.style.display = 'none';
            container.style.display = 'block';
        });
    }
    
    // Check if user is logged in
    const checkAuth = () => {
        const user = JSON.parse(sessionStorage.getItem('user'));
        const token = sessionStorage.getItem('token');
        
        if (user && token) {
            // User is logged in, show movies page
            container.style.display = 'none';
            moviesContainer.style.display = 'block';
            userNameSpan.textContent = user.name;
            
            // Load movies
            loadMovies();
        } else {
            // User is not logged in, show login page
            moviesContainer.style.display = 'none';
            container.style.display = 'block';
        }
    };
    
    // Load movies from API
    const loadMovies = () => {
        const token = sessionStorage.getItem('token');
        
        fetch('/api/movies', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load movies');
            }
            return response.json();
        })
        .then(movies => {
            displayMovies(movies);
        })
        .catch(error => {
            console.error('Error loading movies:', error);
        });
    };
    
    // Display movies in grid
    const displayMovies = (movies) => {
        moviesGrid.innerHTML = '';
        
        movies.forEach(movie => {
            const movieCard = document.createElement('div');
            movieCard.className = 'movie-card';
            movieCard.innerHTML = `
                <img src="${movie.poster_url || '/api/placeholder/250/350'}" alt="${movie.title}" class="movie-poster">
                <div class="movie-info">
                    <h3>${movie.title}</h3>
                    <div class="movie-meta">
                        <span>${movie.duration} min</span>
                        <span>${movie.rating}</span>
                    </div>
                    <button class="book-now" data-movie-id="${movie.id}">Book Now</button>
                </div>
            `;
            
            moviesGrid.appendChild(movieCard);
            
            // Add event listener to book button
            const bookButton = movieCard.querySelector('.book-now');
            bookButton.addEventListener('click', () => {
                openBookingModal(movie);
            });
        });
    };
    
    // Open booking modal with movie details
    const openBookingModal = (movie) => {
        // Set movie details in modal
        modalMovieTitle.textContent = movie.title;
        modalMovieImage.src = movie.poster_url || '/api/placeholder/300/400';
        modalMovieGenre.textContent = `Genre: ${movie.genre}`;
        modalMovieDuration.textContent = `Duration: ${movie.duration} minutes`;
        modalMovieRating.textContent = `Rating: ${movie.rating}`;
        
        // Set summary movie title
        summaryMovie.textContent = movie.title;
        
        // Generate dates (next 7 days)
        generateDateOptions();
        
        // Generate showtimes
        generateTimeOptions();
        
        // Generate seats
        generateSeats();
        
        // Reset selections
        resetBookingSelections();
        
        // Show modal
        bookingModal.style.display = 'block';
    };
    
    // Generate date options for next 7 days
    const generateDateOptions = () => {
        dateSelector.innerHTML = '';
        
        const today = new Date();
        for (let i = 0; i < 7; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            
            const dateOption = document.createElement('div');
            dateOption.className = 'date-option';
            if (i === 0) {
                dateOption.classList.add('selected');
                summaryDate.textContent = formatDate(date);
            }
            
            dateOption.setAttribute('data-date', formatDate(date));
            dateOption.textContent = formatDate(date, true);
            
            dateOption.addEventListener('click', function() {
                // Remove selected class from all date options
                document.querySelectorAll('.date-option').forEach(option => {
                    option.classList.remove('selected');
                });
                
                // Add selected class to clicked date option
                this.classList.add('selected');
                
                // Update summary
                summaryDate.textContent = this.getAttribute('data-date');
                updateBookingSummary();
            });
            
            dateSelector.appendChild(dateOption);
        }
    };
    
    // Generate time options
    const generateTimeOptions = () => {
        timeSelector.innerHTML = '';
        
        const times = ['10:00 AM', '12:30 PM', '3:15 PM', '6:00 PM', '8:45 PM'];
        
        times.forEach((time, index) => {
            const timeOption = document.createElement('div');
            timeOption.className = 'time-option';
            if (index === 0) {
                timeOption.classList.add('selected');
                summaryTime.textContent = time;
            }
            
            timeOption.setAttribute('data-time', time);
            timeOption.textContent = time;
            
            timeOption.addEventListener('click', function() {
                // Remove selected class from all time options
                document.querySelectorAll('.time-option').forEach(option => {
                    option.classList.remove('selected');
                });
                
                // Add selected class to clicked time option
                this.classList.add('selected');
                
                // Update summary
                summaryTime.textContent = this.getAttribute('data-time');
                updateBookingSummary();
            });
            
            timeSelector.appendChild(timeOption);
        });
    };
    
    // Generate seats grid
    const generateSeats = () => {
        seatsGrid.innerHTML = '';
        
        // Create 6 rows of 10 seats
        for (let row = 0; row < 6; row++) {
            for (let col = 0; col < 10; col++) {
                const seat = document.createElement('div');
                seat.className = 'seat';
                
                // Mark some seats as occupied randomly
                if (Math.random() < 0.2) {
                    seat.classList.add('occupied');
                } else {
                    // Add seat identifier
                    const seatId = String.fromCharCode(65 + row) + (col + 1);
                    seat.setAttribute('data-seat', seatId);
                    
                    // Add click event to select/deselect seat
                    seat.addEventListener('click', function() {
                        if (!this.classList.contains('occupied')) {
                            this.classList.toggle('selected');
                            updateSelectedSeats();
                        }
                    });
                }
                
                seatsGrid.appendChild(seat);
            }
        }
    };
    
    // Update selected seats in summary
    const updateSelectedSeats = () => {
        const selectedSeats = Array.from(document.querySelectorAll('.seat.selected')).map(seat => {
            return seat.getAttribute('data-seat');
        });
        
        if (selectedSeats.length > 0) {
            summarySeats.textContent = selectedSeats.join(', ');
            // Update total cost ($10 per seat)
            const total = selectedSeats.length * 10;
            summaryTotal.textContent = `$${total.toFixed(2)}`;
        } else {
            summarySeats.textContent = 'None';
            summaryTotal.textContent = '$0.00';
        }
        
        updateBookingSummary();
    };
    
    // Update booking summary
    const updateBookingSummary = () => {
        // Enable/disable book button based on seat selection
        if (summarySeats.textContent !== 'None') {
            bookTicketsBtn.disabled = false;
            bookTicketsBtn.style.opacity = 1;
        } else {
            bookTicketsBtn.disabled = true;
            bookTicketsBtn.style.opacity = 0.5;
        }
    };
    
    // Reset booking selections
    const resetBookingSelections = () => {
        // Reset date and time to first options
        if (document.querySelector('.date-option')) {
            document.querySelectorAll('.date-option').forEach((option, index) => {
                if (index === 0) option.classList.add('selected');
                else option.classList.remove('selected');
            });
        }
        
        if (document.querySelector('.time-option')) {
            document.querySelectorAll('.time-option').forEach((option, index) => {
                if (index === 0) option.classList.add('selected');
                else option.classList.remove('selected');
            });
        }
        
        // Reset seats
        summarySeats.textContent = 'None';
        summaryTotal.textContent = '$0.00';
        
        // Disable book button
        bookTicketsBtn.disabled = true;
        bookTicketsBtn.style.opacity = 0.5;
    };
    
    // Book tickets button handler
    if (bookTicketsBtn) {
        bookTicketsBtn.addEventListener('click', function() {
            if (summarySeats.textContent === 'None') return;
            
            const token = sessionStorage.getItem('token');
            const user = JSON.parse(sessionStorage.getItem('user'));
            
            const bookingData = {
                movie: modalMovieTitle.textContent,
                date: summaryDate.textContent,
                time: summaryTime.textContent,
                seats: summarySeats.textContent,
                total: summaryTotal.textContent.replace('$', ''),
                user_id: user.id
            };
            
            // Make API request to book tickets
            fetch('/api/bookings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(bookingData)
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Booking failed');
                }
                return response.json();
            })
            .then(data => {
                // Show confirmation modal
                showConfirmation(data.booking);
            })
            .catch(error => {
                console.error('Booking error:', error);
                alert('Booking failed. Please try again.');
            });
        });
    }
    
    // Show booking confirmation
    const showConfirmation = (booking) => {
        // Close booking modal
        bookingModal.style.display = 'none';
        
        // Set confirmation details
        bookingId.textContent = booking.id;
        confirmMovie.textContent = booking.movie;
        confirmDate.textContent = booking.date;
        confirmTime.textContent = booking.time;
        confirmSeats.textContent = booking.seats;
        confirmTotal.textContent = `$${booking.total}`;
        
        // Show confirmation modal
        confirmationModal.style.display = 'block';
    };
    
    // Close booking modal
    if (modalCloseBtn) {
        modalCloseBtn.addEventListener('click', function() {
            bookingModal.style.display = 'none';
        });
    }
    
    // Close confirmation modal
    if (confirmationCloseBtn) {
        confirmationCloseBtn.addEventListener('click', function() {
            confirmationModal.style.display = 'none';
        });
    }
    
    if (closeConfirmBtn) {
        closeConfirmBtn.addEventListener('click', function() {
            confirmationModal.style.display = 'none';
        });
    }
    
    // Close modals when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === bookingModal) {
            bookingModal.style.display = 'none';
        }
        if (event.target === confirmationModal) {
            confirmationModal.style.display = 'none';
        }
    });
    
    // Format date for display
    const formatDate = (date, short = false) => {
        const options = { weekday: short ? 'short' : 'long', month: 'short', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    };
    
    // Check authentication on page load
    checkAuth();
});