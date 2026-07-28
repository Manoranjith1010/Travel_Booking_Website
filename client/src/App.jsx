import { useEffect, useMemo, useState } from 'react';
import SectionHeading from './components/SectionHeading';
import TripCard from './components/TripCard';
import { api } from './services/api';
import { demoBookings, demoHighlights, demoPackages, defaultSearch } from './data/demo';

const emptyForm = {
  name: '',
  email: '',
  password: '',
};

function money(value) {
  return `Rs ${Number(value || 0).toLocaleString()}`;
}

export default function App() {
  const [search, setSearch] = useState(defaultSearch);
  const [packages, setPackages] = useState(demoPackages);
  const [bookings, setBookings] = useState(demoBookings);
  const [summary, setSummary] = useState({ bookings: 18, users: 9, revenue: 248000 });
  const [selectedTrip, setSelectedTrip] = useState(demoPackages[0]);
  const [authMode, setAuthMode] = useState('login');
  const [authForm, setAuthForm] = useState(emptyForm);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const payload = await api.bootstrap();
        if (!mounted) {
          return;
        }
        if (payload.packages?.length) {
          setPackages(payload.packages);
          setSelectedTrip(payload.packages[0]);
        }
        if (payload.bookings?.length) {
          setBookings(payload.bookings);
        }
        if (payload.summary) {
          setSummary(payload.summary);
        }
      } catch {
        if (mounted) {
          setMessage('Running with local demo data until the API is available.');
        }
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  const filteredPackages = useMemo(() => {
    const query = search.destination.trim().toLowerCase();
    const budget = Number(search.budget || 0);
    return packages.filter((trip) => {
      const matchesDestination = !query || trip.destination.toLowerCase().includes(query);
      const matchesBudget = !budget || trip.price <= budget;
      return matchesDestination && matchesBudget;
    });
  }, [packages, search.destination, search.budget]);

  async function handleSearch(event) {
    event.preventDefault();
    setIsLoading(true);
    try {
      const payload = await api.searchTrips(search);
      setPackages(payload.packages?.length ? payload.packages : demoPackages);
      setMessage(`Showing ${payload.packages?.length || demoPackages.length} curated trips for ${search.destination || 'all destinations'}.`);
    } catch {
      setMessage('Search used the local catalog because the API was unavailable.');
      setPackages(demoPackages);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleAuthSubmit(event) {
    event.preventDefault();
    try {
      const payload = authMode === 'login' ? await api.login(authForm) : await api.register(authForm);
      setMessage(payload.message || `Welcome, ${authForm.name || authForm.email}.`);
      setAuthForm(emptyForm);
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function handleBookTrip(trip) {
    setSelectedTrip(trip);
    try {
      const booking = await api.createBooking({
        packageId: trip._id,
        destination: trip.destination,
        travelDates: `${search.checkIn} to ${search.checkOut}`,
        travelers: Number(search.travelers || 1),
        amount: trip.price,
      });
      setBookings((current) => [booking.booking, ...current]);
      setMessage(`Booking created for ${trip.destination}.`);
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function handlePayment() {
    try {
      const result = await api.createPaymentIntent({
        bookingId: bookings[0]?._id,
        amount: selectedTrip.price,
      });
      setMessage(result.message || 'Payment session created.');
    } catch (error) {
      setMessage(error.message);
    }
  }

  return (
    <div className="app-shell">
      <header className="hero">
        <nav className="topbar">
          <div>
            <p className="brand">Travel Loop</p>
            <p className="brand-subtitle">Search, book, pay, and manage every trip in one place.</p>
          </div>
          <div className="nav-links">
            <a href="#search">Search</a>
            <a href="#packages">Packages</a>
            <a href="#history">Bookings</a>
            <a href="#admin">Admin</a>
          </div>
        </nav>

        <div className="hero-grid">
          <section className="hero-copy">
            <p className="eyebrow">Modern travel platform</p>
            <h1>Build memorable trips without juggling tools.</h1>
            <p className="lead">
              Travel Loop combines destination search, booking management, payments, and insights into a responsive full-stack experience.
            </p>
            <div className="hero-actions">
              <a className="primary-button" href="#search">Plan a trip</a>
              <button type="button" className="secondary-button" onClick={() => setMessage('Explore the demo itinerary below.')}>See how it works</button>
            </div>
            <div className="hero-stats">
              {demoHighlights.map((item) => (
                <div key={item.label} className="stat-card">
                  <strong>{item.value}</strong>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </section>

          <aside className="auth-panel">
            <div className="auth-tabs">
              <button type="button" className={authMode === 'login' ? 'tab active' : 'tab'} onClick={() => setAuthMode('login')}>Login</button>
              <button type="button" className={authMode === 'register' ? 'tab active' : 'tab'} onClick={() => setAuthMode('register')}>Register</button>
            </div>
            <form className="auth-form" onSubmit={handleAuthSubmit}>
              {authMode === 'register' && (
                <label>
                  Full name
                  <input value={authForm.name} onChange={(event) => setAuthForm((current) => ({ ...current, name: event.target.value }))} placeholder="Aarav Sharma" />
                </label>
              )}
              <label>
                Email
                <input type="email" value={authForm.email} onChange={(event) => setAuthForm((current) => ({ ...current, email: event.target.value }))} placeholder="you@example.com" />
              </label>
              <label>
                Password
                <input type="password" value={authForm.password} onChange={(event) => setAuthForm((current) => ({ ...current, password: event.target.value }))} placeholder="••••••••" />
              </label>
              <button type="submit" className="primary-button wide">{authMode === 'login' ? 'Login' : 'Create account'}</button>
            </form>
          </aside>
        </div>
      </header>

      <main>
        <section id="search" className="panel">
          <SectionHeading
            eyebrow="Smart search"
            title="Find flights, hotels, and packages with a single search form."
            description="Filter by destination and budget, then hand off into booking and payment without losing context."
          />
          <form className="search-form" onSubmit={handleSearch}>
            <input value={search.origin} onChange={(event) => setSearch((current) => ({ ...current, origin: event.target.value }))} placeholder="Departure city" />
            <input value={search.destination} onChange={(event) => setSearch((current) => ({ ...current, destination: event.target.value }))} placeholder="Destination" />
            <input type="date" value={search.checkIn} onChange={(event) => setSearch((current) => ({ ...current, checkIn: event.target.value }))} />
            <input type="date" value={search.checkOut} onChange={(event) => setSearch((current) => ({ ...current, checkOut: event.target.value }))} />
            <input type="number" min="1" value={search.travelers} onChange={(event) => setSearch((current) => ({ ...current, travelers: event.target.value }))} placeholder="Travelers" />
            <input type="number" min="0" value={search.budget} onChange={(event) => setSearch((current) => ({ ...current, budget: event.target.value }))} placeholder="Budget" />
            <button type="submit" className="primary-button" disabled={isLoading}>{isLoading ? 'Searching...' : 'Search trips'}</button>
          </form>
        </section>

        <section id="packages" className="panel">
          <SectionHeading
            eyebrow="Featured packages"
            title="Curated trips for quick booking."
            description="The package grid supports hotel and holiday-package style browsing, with a simple booking handoff."
          />
          <div className="card-grid">
            {filteredPackages.map((trip) => (
              <TripCard key={trip._id} trip={trip} onBook={handleBookTrip} />
            ))}
          </div>
        </section>

        <section className="dashboard-grid">
          <section id="history" className="panel">
            <SectionHeading
              eyebrow="Booking history"
              title="Track trip status, payment state, and upcoming travel."
              description="This history feed is designed for users who need to review confirmations and cancellations at a glance."
            />
            <div className="table-shell">
              <table>
                <thead>
                  <tr>
                    <th>Booking ID</th>
                    <th>Destination</th>
                    <th>Travel dates</th>
                    <th>Payment</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking) => (
                    <tr key={booking._id}>
                      <td>{booking._id}</td>
                      <td>{booking.destination}</td>
                      <td>{booking.travelDates}</td>
                      <td>{booking.paymentStatus}</td>
                      <td>{booking.bookingStatus}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section id="admin" className="panel admin-panel">
            <SectionHeading
              eyebrow="Admin dashboard"
              title="Operations at a glance."
              description="Useful for package management, booking oversight, and revenue reporting."
            />
            <div className="summary-grid">
              <div className="summary-card">
                <span>Total bookings</span>
                <strong>{summary.bookings}</strong>
              </div>
              <div className="summary-card">
                <span>Registered users</span>
                <strong>{summary.users}</strong>
              </div>
              <div className="summary-card">
                <span>Revenue</span>
                <strong>{money(summary.revenue)}</strong>
              </div>
            </div>
            <button type="button" className="secondary-button wide" onClick={handlePayment}>Create payment session</button>
          </section>
        </section>

        <section className="panel">
          <SectionHeading
            eyebrow="Platform status"
            title="The booking workflow is wired from search to confirmation."
            description="Use the API endpoints to plug in MongoDB, Stripe, Google Maps, and richer dashboards later."
          />
          <div className="message-banner">{message || `Selected trip: ${selectedTrip.destination} for ${money(selectedTrip.price)}`}</div>
        </section>
      </main>
    </div>
  );
}
