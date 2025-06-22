// Used to fetch and display car metadata from the backend API for filter functionality

// (async function fetchAllCarMetadata() {
//   const allTypes = new Set();
//   const allSeats = new Set();
//   const allMakes = new Set();
//   let page = 1;
//   const year = 2020;

//   while (true) {
//     try {
//       const response = await fetch(`http://localhost:5000/api/car-details-full?year=${year}&page=${page}`);
//       if (!response.ok) throw new Error(`HTTP error ${response.status}`);

//       const data = await response.json();
//       if (!data || !data.data || data.data.length === 0) break;

//       for (const car of data.data) {
//         if (car.type) allTypes.add(car.type);
//         if (car.seats) allSeats.add(car.seats);
//         if (car.make) allMakes.add(car.make);
//       }

//       if (!data.collection?.next) break;
//       page++;
//     } catch (error) {
//       console.error(`❌ Failed on page ${page}:`, error.message);
//       break;
//     }
//   }

//   console.log("✅ Unique Makes:", [...allMakes]);
//   console.log("✅ Unique Types:", [...allTypes]);
//   console.log("✅ Unique Seats:", [...allSeats]);
// })();
