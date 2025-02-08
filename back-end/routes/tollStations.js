const express = require("express");
const router = express.Router();
const pool = require("../utils/db.config");

// GET /tollStations - Fetch all toll stations
router.get("/tollStations", async (req, res) => {
  try {
    const [results] = await pool.query(
      `SELECT station_id AS stationID, latitude AS lat, longitude AS lng 
       FROM tollstations`
    );

    // Format the response
    const formattedResults = results.map((station) => ({
      stationID: station.stationID,
      location: {
        lat: station.lat,
        lng: station.lng,
      },
    }));

    res.status(200).json(formattedResults);
  } catch (err) {
    console.error("DB Error:", err);
    res.status(500).json({ error: "Failed to fetch toll stations. Please try again." });
  }
});

// GET /tollStations?operatorID={operatorID} - Filter toll stations by operator
router.get("/tollStations/:operatorID?", async (req, res) => {
  const { operatorID } = req.query;

  if (!operatorID) {
    return res.status(400).json({ error: "Operator ID is required." });
  }

  try {
    const [results] = await pool.query(
      `SELECT station_id AS stationID, latitude AS lat, longitude AS lng 
       FROM tollstations 
       WHERE company_id = ?`,
      [operatorID]
    );

    // Format the response
    const formattedResults = results.map((station) => ({
      stationID: station.stationID,
      location: {
        lat: station.lat,
        lng: station.lng,
      },
    }));

    res.status(200).json(formattedResults);
  } catch (err) {
    console.error("DB Error:", err);
    res.status(500).json({ error: "Failed to filter toll stations. Please try again." });
  }
});

// GET /tollStations/:stationID - Fetch details of a specific toll station
/*router.get("/tollStations/:stationID?", async (req, res) => {
  const { stationID } = req.params;

  if (!stationID) {
    return res.status(400).json({ error: "Station ID is required." });
  }

  try {
    const [results] = await pool.query(
      `SELECT station_id AS stationID, station_name AS name, company_id AS operator, 
              address AS location, toll_cost_car AS tollCostCar, toll_cost_bike AS tollCostBike, 
              toll_cost_truck AS tollCostTruck, toll_cost_bus AS tollCostBus 
       FROM tollstations 
       WHERE station_id = ?`,
      [stationID]
    );

    if (results.length === 0) {
      return res.status(404).json({ error: "Toll station not found." });
    }

    const stationDetails = results[0];
    res.status(200).json(stationDetails);
  } catch (err) {
    console.error("DB Error:", err);
    res.status(500).json({ error: "Failed to fetch toll station details. Please try again." });
  }
});*/

module.exports = router;