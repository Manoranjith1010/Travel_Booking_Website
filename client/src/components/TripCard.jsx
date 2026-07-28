export default function TripCard({ trip, onBook }) {
  return (
    <article className="trip-card">
      <img src={trip.image} alt={trip.destination} />
      <div className="trip-card__body">
        <div className="trip-card__meta">
          <span>{trip.type}</span>
          <span>{trip.rating.toFixed(1)} rating</span>
        </div>
        <h3>{trip.destination}</h3>
        <p>{trip.description}</p>
        <div className="trip-card__footer">
          <strong>Rs {trip.price.toLocaleString()}</strong>
          <button type="button" className="ghost-button" onClick={() => onBook(trip)}>
            Book now
          </button>
        </div>
      </div>
    </article>
  );
}
