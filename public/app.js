document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements for Sign In/Sign Up
    const container = document.querySelector('.container');
    const signUpBtn = document.querySelector('#sign-up-btn');
    const signInBtn = document.querySelector('#sign-in-btn');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const loginError = document.getElementById('loginError');
    const registerError = document.getElementById('registerError');

    // DOM Elements For Movies Page
    const moviesContainer = document.getElementById('moviesContainer');
    const moviesGrid = document.getElementById('moviesGrid');
    const logoutBtn = document.getElementById('logoutBtn');
    const userNameSpan = document.getElementById('userName');

    // DOM Elements For AI Feature: Recommendations Button and Modal
    const showRecommendationsBtn = document.getElementById('showRecommendationsBtn'); // Added button
    const recommendationsModal = document.getElementById('recommendationsModal'); // Added modal
    const recommendationsModalClose = document.getElementById('recommendationsModalClose'); // Added modal close
    const recommendationsContainer = document.getElementById('recommendationsContainer'); // Added container inside modal
    // Removed noRecommendationsMessage reference from main page, it's now inside the modal


    // DOM Elements for Booking Modal
    // DOM Elements for Booking Modal
    const bookingModal = document.getElementById('bookingModal');
    const modalCloseBtn = bookingModal.querySelector('.close');
    const modalMovieTitle = document.getElementById('modalMovieTitle');
    const modalMovieImage = document.getElementById('modalMovieImage');
    const modalMovieGenre = document.getElementById('modalMovieGenre');
    const modalMovieDuration = document.getElementById('modalMovieDuration');
    const modalMovieRating = document.getElementById('modalMovieRating');
    const modalMovieDescription = document.getElementById('modalMovieDescription');
    const modalMovieTrailer = document.getElementById('modalMovieTrailer'); // Added line for the trailer element
    const dateSelector = document.getElementById('dateSelector');
    const timeSelector = document.getElementById('timeSelector');
    const seatsGrid = document.getElementById('seatsGrid');
    const summaryMovie = document.getElementById('summaryMovie');
    const summaryDate = document.getElementById('summaryDate');
    const summaryTime = document.getElementById('summaryTime');
    const summarySeats = document.getElementById('summarySeats');
    const summaryTotal = document.getElementById('summaryTotal');
    const bookTicketsBtn = document.getElementById('bookTicketsBtn');
    const theaterSelector = document.getElementById('theaterSelector');
    const summaryTheater = document.getElementById('summaryTheater');

    // DOM Elements For My Bookings
    const myBookingsBtn = document.getElementById('myBookingsBtn');
    const bookingsModal = document.getElementById('bookingsModal');
    const bookingsModalClose = document.getElementById('bookingsModalClose');
    const bookingsContainer = document.getElementById('bookingsContainer');
    const noBookingsMessage = document.getElementById('noBookingsMessage'); // This One is for the bookings modal

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
    const confirmTheater = document.getElementById('confirmTheater');
    document.addEventListener('DOMContentLoaded', () => {
        // Function to handle page transitions
        const handlePageTransition = (event) => {
            const anchor = event.currentTarget;
            const href = anchor.getAttribute('href');
    
            // Prevent default navigation for internal links
            // You might want to add checks here to exclude external links or specific anchors
            if (href && href.startsWith('/') && href !== '#') {
                event.preventDefault();
    
                const body = document.body;
                const overlay = document.querySelector('.page-transition-overlay');
    
                if (overlay) {
                    // Add the class to start the exit transition
                    body.classList.add('is-transitioning');
    
                    // Listen for the end of the overlay's fade-in transition
                    // We use the overlay's transitionend as a reliable indicator
                    const transitionEndHandler = () => {
                        // Navigate to the new page
                        window.location.href = href;
    
                        // Clean up the event listener after use
                        overlay.removeEventListener('transitionend', transitionEndHandler);
                    };
    
                    overlay.addEventListener('transitionend', transitionEndHandler);
    
                    // Fallback in case transitionend doesn't fire (e.g., if animation is interrupted)
                    // The duration here should match your CSS transition duration
                    setTimeout(() => {
                         // If the page hasn't navigated by now, force it
                         if (window.location.href !== href) {
                             window.location.href = href;
                         }
                    }, 700); // Match the transition duration (0.6s) + a small buffer
                } else {
                     // If no overlay is found, just navigate normally
                     window.location.href = href;
                }
            }
            // for external links or hash links, allow default behavior
        };
    
        // Add event listeners to all links
        const links = document.querySelectorAll('a');
        links.forEach(link => {
            link.addEventListener('click', handlePageTransition);
        });
    
        // Optional: Handle the entry transition on the new page load
        // This removes the transitioning class after the new page has loaded and faded in
        window.addEventListener('pageshow', (event) => {
            // pageshow fires when a page is shown (including from the browser cache)
            // Use event.persisted to check if it's loaded from cache (back/forward button)
            if (event.persisted) {
                // If from cache, ensure opacity is 1
                 document.body.style.opacity = 1;
            }
    
            const body = document.body;
            const overlay = document.querySelector('.page-transition-overlay');
    
            // Remove the transitioning class after the entry animation is visually complete
            // The duration here should be the total entry animation time (transition-duration + transition-delay)
            setTimeout(() => {
                body.classList.remove('is-transitioning');
                 if (overlay) {
                     overlay.style.opacity = 0;
                     overlay.style.visibility = 'hidden';
                 }
            }, 900); // match entry transition duration (0.6s) + delay (0.3s) + buffer
        });
    
         // Initial fade-in for the first page load (or if not using pageshow)
         // This makes the initial load have a fade-in effect
         // Add a class to your body or main content in HTML initially (e.g., <body class="is-loading">)
         // and remove it here. Or simply set initial opacity to 0 in CSS and transition to 1 here.
         // The CSS rule `body > *:not(.page-transition-overlay)` with a transition handles the fade-in
         // on the new page load automatically as the elements appear in the DOM and their opacity
         // transitions from whatever the browser default is to 1.
         // To ensure a consistent fade-in, you might set initial opacity to 0 for the main content
         // in CSS and remove a "loading" class on DOMContentLoaded to trigger the transition to opacity 1.
    });

    // Sign Up/Sign In Animation
    if (container && signUpBtn) {
        signUpBtn.addEventListener('click', () => {
            container.classList.add('sign-up-mode');
        });
    }

    if (container && signInBtn) {
        signInBtn.addEventListener('click', () => {
            container.classList.remove('sign-up-mode');
        });
    }

    // login Form Handler
    if (loginForm && container && moviesContainer && userNameSpan) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;

            if (loginError) {
               loginError.textContent = '';
            }


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

                // Movies will be loaded by checkAuth() which runs on initial load
                // No need to reload the page here, just ensure the correct view is shown
                checkAuth(); // Call checkAuth directly to update UI and load movies
            })
            .catch(error => {
                if (loginError) {
                   loginError.textContent = 'Invalid email or password';
                }
                console.error('Login error:', error);
            });
        });
    }

    // Register Form Handler
     if (registerForm && container && loginError && registerError) {
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
                    // Attempt to parse error message from server if available
                     return response.json().catch(() => { throw new Error(`Registration failed with status ${response.status}`); });
                }
                return response.json();
            })
            .then(data => {
                // Switch to login form
                container.classList.remove('sign-up-mode');

                // Show success message
                loginError.textContent = data.message || 'Registration successful. Please login.';
                loginError.style.color = 'green';
                // Clear registration form
                registerForm.reset();
            })
            .catch(error => {
                console.error('Registration error:', error);
                 let errorMessage = 'Registration failed.';
                 if (error instanceof Error && error.message.startsWith('Registration failed with status')) {
                     // Use default or check error.response if needed for more detailed status
                     errorMessage = error.message;
                 } else if (error && error.message) {
                      errorMessage = error.message; // Use message from parsed JSON if available
                 }
                registerError.textContent = errorMessage;
                registerError.style.color = 'red';
            });
        });
    }


    // Logout Handler
    if (logoutBtn && moviesContainer && container) {
        logoutBtn.addEventListener('click', function() {
            // Clear session storage
            sessionStorage.removeItem('user');
            sessionStorage.removeItem('token');

            // Show login page
            moviesContainer.style.display = 'none';
            container.style.display = 'block';
            // Optionally clear movies/recommendations grid
            if(moviesGrid) moviesGrid.innerHTML = '';
            if(recommendationsContainer) recommendationsContainer.innerHTML = ''; // Clear recommendations modal content
            // Note: The recommendations modal itself is hidden by display: none, clearing content is good practice.
        });
    }


    // Track if movies have been loaded (main grid)
    let moviesLoaded = false;

    // Check if user is logged in
    const checkAuth = () => {
        console.log("[checkAuth] Running checkAuth...");
        const user = JSON.parse(sessionStorage.getItem('user'));
        const token = sessionStorage.getItem('token');

        if (user && token) {
            console.log("[checkAuth] User is logged in.");
            // User is logged in, show movies page
            if (container) container.style.display = 'none';
            if (moviesContainer) moviesContainer.style.display = 'block';
            if (userNameSpan) userNameSpan.textContent = user.name;

            // Only load main movies grid if they haven't been loaded yet
            console.log(`[checkAuth] moviesLoaded flag is: ${moviesLoaded}`);
            if (!moviesLoaded) {
                console.log("[checkAuth] moviesLoaded is false, setting to true and calling loadMovies().");
                moviesLoaded = true;
                loadMovies();
            } else {
                 console.log("[checkAuth] moviesLoaded is true, skipping loadMovies().");
            }

            // Recommendations are now loaded on button click, not automatically here
            // loadRecommendations(); // Removed automatic call

        } else {
            console.log("[checkAuth] User is NOT logged in.");
            // User is not logged in, show login page
            if (moviesContainer) moviesContainer.style.display = 'none';
            if (container) container.style.display = 'block';
            moviesLoaded = false; // Reset flag when not logged in
             // Clear movie displays if they were somehow visible
             if(moviesGrid) moviesGrid.innerHTML = '';
             if(recommendationsContainer) recommendationsContainer.innerHTML = ''; // Clear recommendations modal content
        }
    };

    // Load all movies for the main grid from API
    const loadMovies = () => {
         if (!moviesGrid) {
            console.error("Error: moviesGrid element not found.");
            return;
        }
        console.log("[loadMovies] Fetching all movies from API...");
        const token = sessionStorage.getItem('token');
         if (!token) {
             console.error("No token found for loading all movies.");
              if (moviesGrid) moviesGrid.innerHTML = '<div>Please log in to see movies.</div>';
             return;
         }


        fetch('/api/movies', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => {
            if (!response.ok) {
                 return response.json().catch(() => { throw new Error(`Failed to load movies with status ${response.status}`); });
            }
            return response.json();
        })
        .then(movies => {
            displayMovies(movies);
        })
        .catch(error => {
            console.error('Error loading all movies:', error);
             if (moviesGrid) {
                 moviesGrid.innerHTML = `<div>Error loading movies: ${error.message || 'Please try again.'}</div>`;
             }
        });
    };

     // AI FEATURE: Load recommendations from API (called when button is clicked)
    const loadRecommendations = () => {
         if (!recommendationsModal || !recommendationsContainer) {
             console.error("Error: Recommendations modal or container element not found.");
             return;
         }

         console.log("[loadRecommendations] Fetching recommendations from API...");
         const token = sessionStorage.getItem('token');
         const user = JSON.parse(sessionStorage.getItem('user'));

         if (!token || !user || !user.id) {
             console.error("No token or user ID found for loading recommendations.");
              if (recommendationsContainer) recommendationsContainer.innerHTML = '<div>Please log in to get recommendations.</div>';
             return;
         }

         recommendationsContainer.innerHTML = '<div>Loading recommendations...</div>'; // Show loading message
         // We no longer need to hide/show a separate noRecommendationsMessage here, just update the container content


         // Fetch from the new simplified endpoint without user ID in path
         fetch('/api/recommendations', {
             headers: {
                 'Authorization': `Bearer ${token}`
             }
         })
         .then(response => {
             if (!response.ok) {
                  // Attempt to parse error message from server if available
                 return response.json().catch(() => { throw new Error(`Failed to load recommendations with status ${response.status}`); });
             }
             return response.json();
         })
         .then(recommendedMovies => {
             console.log(`[loadRecommendations] Fetched ${recommendedMovies.length} recommendations.`);
             displayRecommendations(recommendedMovies); // Display in the modal's container
         })
         .catch(error => {
             console.error('Error loading recommendations:', error);
             if (recommendationsContainer) {
                 recommendationsContainer.innerHTML = `<div>Error loading recommendations: ${error.message || 'Please try again.'}</div>`; // Display error inside modal
             }
         });
     };


    // Display movies in grid (main grid)
    const displayMovies = (movies) => {
         if (!moviesGrid) {
            console.error("Error: moviesGrid element not found for display.");
            return;
        }
        console.log(`[displayMovies] Received ${movies.length} movies to display.`);
        console.log("[displayMovies] Clearing moviesGrid innerHTML.");
        moviesGrid.innerHTML = '';

        if (!movies || movies.length === 0) {
             moviesGrid.innerHTML = '<div>No movies available at the moment.</div>';
             return;
        }


        console.log("[displayMovies] Starting loop to append movie cards.");
        movies.forEach((movie) => {
            const movieCard = document.createElement('div');
            movieCard.className = 'movie-card';
            // Ensure movie properties exist before using them
            const posterUrl = movie.poster_url || '/api/placeholder/250/350';
            const title = movie.title || 'Untitled Movie';
            const duration = movie.duration ? `${movie.duration} min` : 'N/A';
            const rating = movie.rating || 'N/A';
            const movieId = movie.id || null;


            movieCard.innerHTML = `
                <img src="${posterUrl}" alt="${title}" class="movie-poster">
                <div class="movie-info">
                    <h3>${title}</h3>
                    <div class="movie-meta">
                        <span>${duration}</span>
                        <span>${rating}</span>
                    </div>
                    ${movieId ? `<button class="book-now" data-movie-id="${movieId}">Book Now</button>` : '<span>Booking not available</span>'}
                </div>
            `;

            moviesGrid.appendChild(movieCard);

            // Add event listener to book button only if movie has an ID
            if (movieId) {
                const bookButton = movieCard.querySelector('.book-now');
                 if (bookButton) {
                    bookButton.addEventListener('click', () => {
                        // Pass the full movie object to the modal handler
                        openBookingModal(movie);
                    });
                 }
            }
        });
    };


     // AI FEATURE: Display recommended movies (inside the modal)
     const displayRecommendations = (recommendedMovies) => {
         if (!recommendationsContainer) {
             console.error("Error: Recommendations container element not found for display.");
             return;
         }
         console.log(`[displayRecommendations] Received ${recommendedMovies.length} recommendations to display.`);
         recommendationsContainer.innerHTML = ''; // Clear previous content (loading/error/old results)

         if (!recommendedMovies || recommendedMovies.length === 0) {
             // Display a message inside the modal container
             recommendationsContainer.innerHTML = '<p class="no-recommendations-message">Book a movie to get recommendations!</p>';
             return;
         }

         recommendedMovies.forEach((movie) => {
             const movieCard = document.createElement('div');
             movieCard.className = 'movie-card'; // Reuse movie-card styling

             // Ensure movie properties exist before using them
             const posterUrl = movie.poster_url || '/api/placeholder/250/350';
             const title = movie.title || 'Untitled Movie';
             const duration = movie.duration ? `${movie.duration} min` : 'N/A';
             const rating = movie.rating || 'N/A';
             const movieId = movie.id || null;

             movieCard.innerHTML = `
                 <img src="${posterUrl}" alt="${title}" class="movie-poster">
                 <div class="movie-info">
                     <h3>${title}</h3>
                     <div class="movie-meta">
                         <span>${duration}</span>
                         <span>${rating}</span>
                     </div>
                     ${movieId ? `<button class="book-now" data-movie-id="${movieId}">Book Now</button>` : '<span>Booking not available</span>'}
                 </div>
             `;

             recommendationsContainer.appendChild(movieCard);

             // Add event listener to book button for recommendations
             if (movieId) {
                 const bookButton = movieCard.querySelector('.book-now');
                  if (bookButton) {
                     bookButton.addEventListener('click', () => {
                         // Close recommendations modal before opening booking modal
                         if (recommendationsModal) recommendationsModal.style.display = 'none';
                         // Pass the full movie object to the modal handler
                         openBookingModal(movie);
                     });
                  }
             }
         });
     };


   // Open booking modal with movie details
   const openBookingModal = (movie) => {
    // Added checks for modal elements
    if (!bookingModal || !modalMovieTitle || !modalMovieImage || !modalMovieGenre || !modalMovieDuration || !modalMovieRating || !summaryMovie || !dateSelector || !timeSelector || !theaterSelector || !summaryTheater || !seatsGrid || !modalMovieTrailer) { // Added modalMovieTrailer to check
        console.error("Error: Missing one or more booking modal elements.");
        return;
    }

    console.log("Opening booking modal for movie:", movie); // Log the movie object to verify trailer_url

    // Set movie details in modal
    modalMovieTitle.textContent = movie.title || 'N/A';
    modalMovieImage.src = movie.poster_url || '/api/placeholder/300/400';
    modalMovieGenre.textContent = `Genre: ${movie.genre || 'N/A'}`;
    modalMovieDuration.textContent = `Duration: ${movie.duration ? movie.duration + ' minutes' : 'N/A'}`;
    modalMovieRating.textContent = `Rating: ${movie.rating || 'N/A'}`;
    modalMovieDescription.textContent = `Description: ${movie.description || 'N/A'}`;

    // --- ADD THIS LINE TO SET THE TRAILER URL ---
    if (movie.trailer_url) {
         modalMovieTrailer.src = movie.trailer_url;
         modalMovieTrailer.style.display = 'block'; // Make sure the iframe is visible if hidden by default CSS
    } else {
         modalMovieTrailer.src = ''; // Clear src if no trailer URL
         modalMovieTrailer.style.display = 'none'; // Hide the iframe if no trailer
         console.warn(`No trailer URL found for movie: ${movie.title}`);
    }
    // -------------------------------------------


    // Store current movie data for booking (helpful if backend uses movie_id)
    // bookingModal.setAttribute('data-current-movie-id', movie.id); // Store movie ID


    // Generate dates (next 7 days)
    generateDateOptions();

    // Generate showtimes
    generateTimeOptions();

    // Load theaters into dropdown
    loadTheaters();

    // Reset selections (This will also clear seats grid via fetchAndGenerateSeats or reset)
    resetBookingSelections(); // This function will clear summaryTheater and call fetchAndGenerateSeats

    // Show modal
    bookingModal.style.display = 'block';
};

    // Load theaters into dropdown
    const loadTheaters = () => {
         if (!theaterSelector) {
            console.error("Error: theaterSelector element not found.");
            return;
        }
        const token = sessionStorage.getItem('token');
        if (!token) {
             console.error("No token found for loading theaters.");
             theaterSelector.innerHTML = '<option value="" disabled selected>Login to see theaters</option>';
             return;
         }

        fetch('/api/theaters', {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(response => {
            if (!response.ok) {
                 return response.json().catch(() => { throw new Error(`Failed to load theaters with status ${response.status}`); });
            }
            return response.json();
        })
        .then(theaters => {
            theaterSelector.innerHTML = '<option value="" disabled selected>Select a theater...</option>'; // Reset options
            if (!theaters || theaters.length === 0) {
                 const option = document.createElement('option');
                 option.value = "";
                 option.disabled = true;
                 option.selected = true;
                 option.textContent = 'No theaters available';
                 theaterSelector.appendChild(option);
            } else {
                theaters.forEach(theater => {
                    const option = document.createElement('option');
                    option.value = theater.id; // Use ID as value
                    option.textContent = `${theater.name || 'Unknown Theater'} (${theater.city || 'Unknown City'})`; // Display name and city
                    theaterSelector.appendChild(option);
                });
            }
        })
        .catch(error => {
            console.error('Error loading theaters:', error);
            theaterSelector.innerHTML = `<option value="" disabled selected>Error loading theaters: ${error.message || 'Please try again.'}</option>`;
        });
    };

    // Generate date options for next 7 days
    const generateDateOptions = () => {
         if (!dateSelector || !summaryDate) {
             console.error("Error: Missing date selector or summary date element.");
             return;
         }
        dateSelector.innerHTML = '';

        const today = new Date();
        for (let i = 0; i < 7; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);

            const dateOption = document.createElement('div');
            dateOption.className = 'date-option';
            const formattedDate = formatDate(date); // Format for data attribute and summary

            if (i === 0) {
                dateOption.classList.add('selected');
                summaryDate.textContent = formattedDate;
            }

            dateOption.setAttribute('data-date', formattedDate);
            dateOption.textContent = formatDate(date, true); // Format for display

            dateOption.addEventListener('click', function() {
                // Remove selected class from all date options
                document.querySelectorAll('.date-option').forEach(option => {
                    option.classList.remove('selected');
                });

                // Add selected class to clicked date option
                this.classList.add('selected');

                // Update summary
                summaryDate.textContent = this.getAttribute('data-date');
                // Fetch new booked seats and regenerate grid - only if theater and time are also selected
                fetchAndGenerateSeats(); // This will handle the checks
                updateBookingSummary(); // Keep this
            });

            dateSelector.appendChild(dateOption);
        }
    };

    // Generate time options
    const generateTimeOptions = () => {
         if (!timeSelector || !summaryTime) {
             console.error("Error: Missing time selector or summary time element.");
             return;
         }
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
                 // Fetch new booked seats and regenerate grid - only if theater and date are also selected
                fetchAndGenerateSeats(); // This will handle the checks
                updateBookingSummary(); // Keep this
            });

            timeSelector.appendChild(timeOption);
        });
    };

    // Fetch booked seats from API (now requires theater_id)
    const fetchBookedSeats = async (movieTitle, date, time, theater_id) => {
        if (!theater_id || !movieTitle || !date || !time) {
            console.warn("[fetchBookedSeats] Missing required parameters (movie, date, time, or theater ID). Cannot fetch seats.");
            if (seatsGrid) seatsGrid.innerHTML = '<div>Select date, time, and theater to see seats.</div>'; // Reset message
            return []; // Return empty if parameters are missing
        }
         if (!seatsGrid) {
            console.error("Error: seatsGrid element not found.");
            return [];
         }

        seatsGrid.innerHTML = '<div>Loading seats...</div>'; // Show loading message
        const token = sessionStorage.getItem('token');
         if (!token) {
             console.error("No token found for fetching booked seats.");
              seatsGrid.innerHTML = '<div>Login to see seat availability.</div>';
             return [];
         }

        // Add a timestamp query parameter to prevent caching
        const cacheBuster = `_=${new Date().getTime()}`;
        // Use movieTitle from the modal/summary, not necessarily the full movie object here
        const url = `/api/booked-seats?movie=${encodeURIComponent(movieTitle)}&date=${encodeURIComponent(date)}&time=${encodeURIComponent(time)}&theater_id=${theater_id}&${cacheBuster}`; // Added theater_id

        try {
            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) {
                throw new Error(`Failed to fetch booked seats: ${response.status}`);
            }
            const bookedSeats = await response.json();
            console.log(`[fetchBookedSeats] Fetched booked seats for ${movieTitle} at theater ${theater_id} on ${date} at ${time}:`, bookedSeats);
            return bookedSeats;
        } catch (error) {
            console.error(`Error fetching booked seats for theater ${theater_id}:`, error);
            if (seatsGrid) seatsGrid.innerHTML = `<div>Error loading seats: ${error.message || 'Please try again.'}</div>`; // Display error message
            return []; // Return empty array on error
        }
    };

    // Generate seats grid based on booked seats
    const generateSeats = (bookedSeats = []) => {
        if (!seatsGrid) {
            console.error("Error: seatsGrid element not found for generation.");
            return;
        }
        seatsGrid.innerHTML = ''; // Clear previous seats
        const bookedSeatsSet = new Set(bookedSeats); // Use Set for efficient lookup

        // Create 6 rows of 10 seats
        for (let row = 0; row < 6; row++) {
            for (let col = 0; col < 10; col++) {
                const seat = document.createElement('div');
                seat.className = 'seat'; // Start with base class
                const seatId = String.fromCharCode(65 + row) + (col + 1);
                seat.setAttribute('data-seat', seatId);

                // Check if seat is booked
                if (bookedSeatsSet.has(seatId)) {
                    seat.classList.add('occupied');
                    // No listener needed, CSS pointer-events:none handles clicks
                } else {
                    // Add click event listener ONLY for available seats
                    seat.addEventListener('click', function() {
                        this.classList.toggle('selected'); // Toggle selected class
                        updateSelectedSeats(); // Update summary
                    });
                }

                seatsGrid.appendChild(seat);
            }
        }
        // Update summary based on currently selected seats after regeneration
        updateSelectedSeats();
    };

    // Helper function to fetch booked seats and regenerate grid
    const fetchAndGenerateSeats = async () => {
        // Get current selections from the UI elements
        const movieElement = document.getElementById('modalMovieTitle'); // Get title from modal header
        const movieTitle = movieElement ? movieElement.textContent : null;
        const date = summaryDate ? summaryDate.textContent : null;
        const time = summaryTime ? summaryTime.textContent : null;
        const theater_id = theaterSelector ? theaterSelector.value : null; // Get selected theater ID

        // Only fetch if all required parameters are present
        if (movieTitle && date && time && theater_id) {
            const bookedSeats = await fetchBookedSeats(movieTitle, date, time, theater_id);
            generateSeats(bookedSeats);
        } else {
            console.warn("[fetchAndGenerateSeats] Missing selection for movie, date, time, or theater. Cannot fetch seats.");
             if (seatsGrid) {
                 seatsGrid.innerHTML = '<div>Select date, time, and theater to see seats.</div>'; // Inform user
             }
             updateSelectedSeats(); // Clear summary selections
        }
    };

    // Update selected seats in summary
    const updateSelectedSeats = () => {
         if (!seatsGrid || !summarySeats || !summaryTotal) {
             console.error("Error: Missing seats grid or summary elements.");
             return;
         }
        const selectedSeats = Array.from(seatsGrid.querySelectorAll('.seat.selected')).map(seat => {
            return seat.getAttribute('data-seat');
        });

        if (selectedSeats.length > 0) {
            summarySeats.textContent = selectedSeats.join(', ');
            // Update total cost ($10 per seat) - make sure this price is consistent
            const pricePerSeat = 5; // Define price per seat
            const total = selectedSeats.length * pricePerSeat;
            summaryTotal.textContent = `$${total.toFixed(2)}`;
        } else {
            summarySeats.textContent = 'None';
            summaryTotal.textContent = '$0.00';
        }

        updateBookingSummary(); // Update button state regardless
    };

    // Update booking summary and button state
    const updateBookingSummary = () => {
         if (!theaterSelector || !summaryTheater || !summarySeats || !bookTicketsBtn) {
             console.error("Error: Missing summary or button elements.");
             return;
         }

        // Update theater summary text
        const selectedOption = theaterSelector.options[theaterSelector.selectedIndex];
        summaryTheater.textContent = selectedOption && selectedOption.value ? selectedOption.text : 'Select a theater';

        // Enable/disable book button based on seat AND theater selection
        const seatsSelected = summarySeats.textContent !== 'None';
        const theaterSelected = theaterSelector.value !== "";

        if (seatsSelected && theaterSelected) {
            bookTicketsBtn.disabled = false;
            bookTicketsBtn.style.opacity = 1;
            bookTicketsBtn.style.cursor = 'pointer'; // Indicate clickable
        } else {
            bookTicketsBtn.disabled = true;
            bookTicketsBtn.style.opacity = 0.5;
             bookTicketsBtn.style.cursor = 'not-allowed'; // Indicate not clickable
        }
    };

    // Reset booking selections in the modal
    const resetBookingSelections = () => {
        // Reset date and time to first options
         if (dateSelector && summaryDate) {
            const firstDateOption = dateSelector.querySelector('.date-option:first-child');
            if (firstDateOption) {
                document.querySelectorAll('.date-option').forEach(option => option.classList.remove('selected'));
                firstDateOption.classList.add('selected');
                summaryDate.textContent = firstDateOption.getAttribute('data-date');
            }
         }


         if (timeSelector && summaryTime) {
            const firstTimeOption = timeSelector.querySelector('.time-option:first-child');
             if (firstTimeOption) {
                document.querySelectorAll('.time-option').forEach(option => option.classList.remove('selected'));
                firstTimeOption.classList.add('selected');
                summaryTime.textContent = firstTimeOption.getAttribute('data-time');
             }
         }


        // Reset theater dropdown and summary
         if (theaterSelector && summaryTheater) {
            theaterSelector.value = ""; // Reset selection
            summaryTheater.textContent = 'Select a theater'; // Reset summary text
         }


        // Clear the seats grid and summary as no theater is selected initially
         if (seatsGrid) {
             seatsGrid.innerHTML = '<div>Select date, time, and theater to see seats.</div>'; // Initial message
         }
         if (summarySeats) summarySeats.textContent = 'None';
         if (summaryTotal) summaryTotal.textContent = '$0.00';


        // Disable book button (will be updated by updateBookingSummary called after selection change)
         if (bookTicketsBtn) {
            bookTicketsBtn.disabled = true;
            bookTicketsBtn.style.opacity = 0.5;
            bookTicketsBtn.style.cursor = 'not-allowed';
         }
         updateBookingSummary(); // Ensure summary is updated
    };

    // Add event listener for theater selection change
    if (theaterSelector) {
        theaterSelector.addEventListener('change', function() {
            updateBookingSummary(); // Update summary text and button state
            fetchAndGenerateSeats(); // Fetch seats for the newly selected theater based on ALL current selections
        });
    }

     // Add event listeners for date and time option clicks to trigger seat fetch
     // These are already added inside generateDateOptions/generateTimeOptions
     // They correctly call fetchAndGenerateSeats and updateBookingSummary

    // Book tickets button handler
    if (bookTicketsBtn && summarySeats && modalMovieTitle && summaryDate && summaryTime && summaryTotal && theaterSelector) {
        bookTicketsBtn.addEventListener('click', function() {
            if (bookTicketsBtn.disabled) {
                 console.log("Book button is disabled.");
                 return;
            }

            if (summarySeats.textContent === 'None') {
                alert("Please select at least one seat.");
                return;
            }

            if (theaterSelector.value === "") {
                 alert("Please select a theater.");
                 return;
            }

            const token = sessionStorage.getItem('token');
            const user = JSON.parse(sessionStorage.getItem('user'));

             if (!user || !user.id || !token) {
                 console.error("User or token not found for booking.");
                 alert("Please log in to book tickets.");
                 // Maybe redirect to login
                 return;
             }

            const bookingData = {
                movie: modalMovieTitle.textContent, // Sending movie title
                date: summaryDate.textContent,
                time: summaryTime.textContent,
                seats: summarySeats.textContent, // Comma-separated string
                total: summaryTotal.textContent.replace('$', ''), // Remove '$'
                user_id: user.id,
                theater_id: theaterSelector.value
            };


            console.log("Attempting to book with data:", bookingData);

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
                // Check response status before trying to parse JSON
                if (!response.ok) {
                    const error = new Error(`Booking request failed with status ${response.status}`);
                    error.response = response;
                    throw error;
                }
                return response.json();
            })
            .then(data => {
                // Booking was successful on the server
                console.log("[Booking Success] Server confirmed booking:", data.booking);

                // Manually update the UI for just-booked seats (Simpler version)
                const bookedSeatsArray = bookingData.seats.split(',').map(s => s.trim());
                console.log("[Booking Success] Manually updating UI for seats:", bookedSeatsArray);
                bookedSeatsArray.forEach(seatId => {
                    const seatElement = seatsGrid.querySelector(`.seat[data-seat="${seatId}"]`);
                    if (seatElement) {
                        console.log(`[Booking Success] Updating seat element classes: ${seatId}`);
                        seatElement.classList.remove('selected'); // Remove selection style
                        seatElement.classList.add('occupied');    // Add occupied style (CSS handles pointer-events)
                    } else {
                         console.warn(`[Booking Success] Could not find seat element for ${seatId} to update manually.`);
                    }
                });

                // Update summary and button state AFTER manual UI update
                updateSelectedSeats(); // Recalculate selected seats (should be none if only booked seats were selected)
                updateBookingSummary(); // Update button state based on new selection

                // Now show confirmation modal
                showConfirmation(data.booking);

                 // Note: Recommendations are now fetched on button click, not automatically refreshed here
                 // Consider calling loadRecommendations() here if you want the modal to potentially show new recommendations immediately after a booking.
                 // For now, we'll stick to loading only when the recommendations button is clicked.


                // Still refresh seats fully afterwards for consistency - good for ensuring the grid is accurate
                console.log("[Booking Success] Attempting full seat grid refresh...");
                fetchAndGenerateSeats().then(() => {
                     console.log("[Booking Success] Seat grid refresh function completed.");
                }).catch(refreshError => {
                     console.error("[Booking Success] Error during seat grid refresh:", refreshError);
                });
            })
            .catch(async error => {
                // Handle booking errors
                const errorResponse = error instanceof Error && error.response ? error.response : null;
                console.error('Booking error details:', error);
                let errorMessage = 'Booking failed. Please try again.'; // Default message

                if (errorResponse) {
                    try {
                        const errorData = await errorResponse.clone().json();
                        if (errorData && errorData.message) {
                            errorMessage = errorData.message;
                            if (errorResponse.status === 409) {
                                errorMessage += " Seats may have been taken. Please refresh seat selection.";
                            }
                        } else {
                             errorMessage = `Booking failed: ${errorResponse.status} ${errorResponse.statusText}`;
                        }
                    } catch (parseError) {
                        console.error('Could not parse error response JSON:', parseError);
                         errorMessage = `Booking failed: ${errorResponse.status} ${errorResponse.statusText}`;
                    }
                } else if (error instanceof Error) {
                     errorMessage = `Network error or server unresponsive: ${error.message}`;
                }

                alert(errorMessage);

                // Optional: If it was a conflict, refresh seats to show the latest state
                if (errorResponse && errorResponse.status === 409) {
                     console.log("Conflict detected, refreshing seats grid.");
                     fetchAndGenerateSeats(); // Refresh seats on conflict
                }
            });
        });
    }


    // Show booking confirmation
    const showConfirmation = (booking) => {
         // Added checks for confirmation modal elements
         if (!confirmationModal || !bookingId || !confirmMovie || !confirmDate || !confirmTime || !confirmSeats || !confirmTotal || !confirmTheater) {
             console.error("Error: Missing one or more confirmation modal elements.");
             return;
         }

        // Close booking modal (ensure it's open before trying to close)
        if (bookingModal) bookingModal.style.display = 'none';


        // Set confirmation details
        bookingId.textContent = booking.id || 'N/A';
        confirmMovie.textContent = booking.movie || booking.movie_title || 'N/A'; // Use movie title from booking object
        confirmDate.textContent = booking.date || 'N/A';
        confirmTime.textContent = booking.time || 'N/A';
        confirmSeats.textContent = booking.seats || 'None';
        confirmTotal.textContent = `$${parseFloat(booking.total || 0).toFixed(2)}`; // Ensure total is formatted
        confirmTheater.textContent = booking.theater_name || 'N/A'; // Use theater_name from booking object

        // Show confirmation modal
        confirmationModal.style.display = 'block';
    };


    // Close booking modal using the 'x' button
    if (modalCloseBtn && bookingModal) {
        modalCloseBtn.addEventListener('click', function() {
            bookingModal.style.display = 'none';
             resetBookingSelections(); // Reset selections when closing booking modal
        });
    }

    // Close confirmation modal using the 'x' button
    if (confirmationCloseBtn && confirmationModal) {
        confirmationCloseBtn.addEventListener('click', function() {
            confirmationModal.style.display = 'none';
        });
    }

    // Close confirmation modal using the 'Close' button
    if (closeConfirmBtn && confirmationModal) {
        closeConfirmBtn.addEventListener('click', function() {
            confirmationModal.style.display = 'none';
        });
    }

    // Close My Bookings modal using the 'x' button
     if (bookingsModalClose && bookingsModal) {
        bookingsModalClose.addEventListener('click', function() {
            bookingsModal.style.display = 'none';
        });
    }

     // AI FEATURE: Close Recommendations modal using the 'x' button
     if (recommendationsModalClose && recommendationsModal) {
         recommendationsModalClose.addEventListener('click', function() {
             recommendationsModal.style.display = 'none';
         });
     }


    // Close modals when clicking outside
    window.addEventListener('click', function(event) {
        if (bookingModal && event.target === bookingModal) {
             bookingModal.style.display = 'none';
             resetBookingSelections();
        }
        if (confirmationModal && event.target === confirmationModal) {
            confirmationModal.style.display = 'none';
        }
         if (bookingsModal && event.target === bookingsModal) {
            bookingsModal.style.display = 'none';
        }
         if (recommendationsModal && event.target === recommendationsModal) { // Added check for recommendations modal
            recommendationsModal.style.display = 'none';
        }
    });

    // Format date for display
    const formatDate = (date, short = false) => {
        const options = { weekday: short ? 'short' : 'long', month: 'short', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    };

    // My Bookings functionality
    if (myBookingsBtn && bookingsModal && bookingsContainer && noBookingsMessage) {
        myBookingsBtn.addEventListener('click', function() {
            console.log('My Bookings button clicked');
            const token = sessionStorage.getItem('token');
            const user = JSON.parse(sessionStorage.getItem('user'));

            if (!token || !user || !user.id) {
                console.error('No token or user found');
                alert("Please log in to view your bookings.");
                 if (bookingsContainer) bookingsContainer.innerHTML = '<div>Please log in to see your bookings.</div>';
                 if (noBookingsMessage) noBookingsMessage.style.display = 'none';
                 if (bookingsModal) bookingsModal.style.display = 'block';
                return;
            }

            console.log(`Workspaceing bookings for user ${user.id}...`);
            // Clear previous content and show loading message
             if (bookingsContainer) bookingsContainer.innerHTML = '<div>Loading bookings...</div>';
             if (noBookingsMessage) noBookingsMessage.style.display = 'none';


            fetch('/api/bookings/user', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            .then(response => {
                if (!response.ok) {
                    return response.json().catch(() => { throw new Error(`Failed to fetch bookings with status ${response.status}`); });
                }
                return response.json();
            })
            .then(bookings => {
                console.log('Fetched user bookings:', bookings);
                if (bookingsContainer) bookingsContainer.innerHTML = '';

                if (!bookings || bookings.length === 0) {
                    if (noBookingsMessage) noBookingsMessage.style.display = 'block';
                     if (bookingsContainer) bookingsContainer.innerHTML = '';
                } else {
                    if (noBookingsMessage) noBookingsMessage.style.display = 'none';

                    bookings.forEach(booking => {
                        const bookingElement = document.createElement('div');
                        bookingElement.classList.add('booking-item');

                        bookingElement.innerHTML = `
                            <h4>Booking ID: ${booking.id || 'N/A'}</h4>
                            <p><strong>Movie:</strong> ${booking.movie || booking.movie_title || 'N/A'}</p>
                            <p><strong>Theater:</strong> ${booking.theater_name || 'N/A'}</p>
                            <p><strong>Date:</strong> ${booking.date || 'N/A'}</p>
                            <p><strong>Time:</strong> ${booking.time || 'N/A'}</p>
                            <p><strong>Seats:</strong> ${booking.seats || 'None'}</p>
                            <p><strong>Total:</strong> $${parseFloat(booking.total || 0).toFixed(2)}</p>
                            <p><small>Booked On: ${booking.booking_date ? new Date(booking.booking_date).toLocaleString() : 'N/A'}</small></p>
                            <hr>
                        `;
                         if (bookingsContainer) bookingsContainer.appendChild(bookingElement);
                    });
                }

                 if (bookingsModal) bookingsModal.style.display = 'block';
            })
            .catch(error => {
                console.error('Error fetching user bookings:', error);
                 if (bookingsContainer) bookingsContainer.innerHTML = '';
                 if (noBookingsMessage) {
                    noBookingsMessage.style.display = 'block';
                    noBookingsMessage.textContent = `Error loading your bookings: ${error.message || 'Please try again.'}`;
                 }
                 if (bookingsModal) bookingsModal.style.display = 'block';
            });
        });
    }

     // AI FEATURE: Event listener for the Show Recommendations Button
     if (showRecommendationsBtn && recommendationsModal) {
         showRecommendationsBtn.addEventListener('click', function() {
             // Show the recommendations modal
             recommendationsModal.style.display = 'block';
             // Load recommendations when the modal is opened
             loadRecommendations();
         });
     }


    // Initial check when the page loads to determine if the user is logged in
    // and show the appropriate view (login or movies) and load movies if logged in.
    checkAuth();

}); // End of DOMContentLoaded
