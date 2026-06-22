import "../index.css";
import "../assets/css/test.css";
import heroImage from "../assets/hero.png";
import heroImage2 from "../assets/images/img2.jpg";
import { useState } from "react";

function Landing() {
  const [active, setActive] = useState("Flights");
  const [departureDate, setDepartureDate] = useState("2026-06-17");
  const [returnDate, setReturnDate] = useState("2026-06-24");

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };
  return (
    <>
    <main className="mmt-home">
      <section
        className="mmt-hero"
        style={{ backgroundImage: `url(${heroImage2})` }}
      >
      </section>
      
      <section className="mmt-search-shell">
        <div className="mmt-service-tabs position-relative">
          <button className={active === "Flights" ? "active" : ""} onClick={() => setActive("Flights")}>
            <div className="flight-path">
              <i className="bi bi-airplane-fill plane-icon"></i>
            </div>
            <span className="ms-4 fs-5 fw-medium">Flights</span>
          </button>
 
          <button className={active === "Hotels" ? "active" : "d-flex"} onClick={() => setActive("Hotels")}>
            <i className="bi bi-building"></i>
            <span className="fs-5 fw-medium">Hotels</span>
          </button>

          <button className={active === "Trains" ? "active" : "d-flex"} onClick={() => setActive("Trains")}>
            <i className="bi bi-train-front"></i>
            <span className="fs-5 fw-medium">Trains</span>
          </button>

          <button className={active === "Buses" ? "active" : "d-flex"} onClick={() => setActive("Buses")}>
            <i className="bi bi-bus-front"></i>
            <span className="fs-5 fw-medium">Buses</span>
          </button>

          <button className={active === "Packages" ? "active" : "d-flex"} onClick={() => setActive("Packages")}>
            <i className="bi bi-suitcase-lg"></i>
            <span className="fs-5 fw-medium">Packages</span>
          </button>

          <button className={active === "Cabs" ? "active" : "d-flex"} onClick={() => setActive("Cabs")}>
            <i className="bi bi-taxi-front"></i>
            <span className="fs-5 fw-medium">Cabs</span>
          </button>
        </div>

        <div className="mmt-search-card">
          <div className="mmt-trip-types">
            <label>
              <input type="radio" checked readOnly />
              <span>One Way</span>
            </label>

            <label>
              <input type="radio" readOnly />
              <span>Round Trip</span>
            </label>

            <label>
              <input type="radio" readOnly />
              <span>Multi City</span>
            </label>
          </div>

          <div className="mmt-search-grid">
            <div className="mmt-search-field">
              <span>From</span>
              <strong>
                <select>
                  <option>Delhi</option>
                  <option>Delhi</option>
                  <option>Mumbai</option>
                  <option>Chennai</option>
                  <option>Kolkata</option>
                </select>
              </strong>
              <small>DEL, Delhi Airport India</small>
            </div>

            <div className="mmt-search-field">
              <span>To</span>
              <strong>
                <select>
                  <option>Mumbai</option>
                  <option>Delhi</option>
                  <option>Chennai</option>
                  <option>Kolkata</option>
                </select>
              </strong>
              <small>BOM, Chhatrapati Shivaji International</small>
            </div>

            <div className="mmt-search-field">
              <span>Departure</span>
              <strong>{formatDate(departureDate)}</strong>
              <input
                type="date"
                className="b-none"
                value={departureDate}
                onChange={(e) => setDepartureDate(e.target.value)}
              />
              <small>Choose your departure date</small>
            </div>

            <div className="mmt-search-field">
              <span>Return</span>
              <strong>{formatDate(returnDate)}</strong>
              <input
                type="date"
                className="b-none"
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
              />
              <small>Choose your return date</small>
            </div>

            <div className="mmt-search-field">
              <span>Travellers & Class</span>

              <select className="b-none">
                <option>1 Traveller, Economy</option>
                <option>2 Travellers, Economy</option>
                <option>3 Travellers, Economy</option>
                <option>1 Traveller, Business</option>
              </select>

              <small>Regular Fare</small>
            </div>
          </div>

          <div className="mmt-fare-row">
            <span>Select a fare type</span>

            <label>
              <input type="radio" checked readOnly />
              Regular
            </label>

            <label>
              <input type="radio" readOnly />
              Student
            </label>

            <label>
              <input type="radio" readOnly />
              Senior Citizen
            </label>

            <label>
              <input type="radio" readOnly />
              Armed Forces
            </label>
          </div>

          <button className="mmt-search-btn">Search</button>
        </div>
      </section>

      <section className="mmt-offers">
        <div className="mmt-section-heading">
          <h2>Offers for your next booking</h2>
          <button>View All</button>
        </div>

        <div className="mmt-offer-grid">
          <article>
            <span>Flights</span>
            <h3>Flat 12% off on domestic routes</h3>
            <p>Save more on Delhi, Mumbai, Bengaluru, Goa and more.</p>
            <button>Book Now</button>
          </article>

          <article>
            <span>Hotels</span>
            <h3>Weekend stays from ₹1499</h3>
            <p>Book verified stays with breakfast and flexible check-in.</p>
            <button>Book Now</button>
          </article>

          <article>
            <span>Holiday</span>
            <h3>Curated beach escapes</h3>
            <p>Bundle flights and hotels for Goa, Kerala and Andaman.</p>
            <button>Book Now</button>
          </article>
        </div>
      </section>
    </main>
    </>
  );
}

export default Landing;
