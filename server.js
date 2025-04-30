const express = require("express");
const { Client } = require("pg");
const { Pool } = require("pg");
const client = new Client({
  user: "",
  host: "localhost",
  database: "postgres",
  password: "",
  port: 5432,
});

const app = express();
app.use(express.json());
const port = 3000;

app.get("/api/customers", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM customers ORDER BY id");

    res.json({
      success: true,
      count: rows.length,
      data: rows,
    });
  } catch (error) {
    console.error("Error fetching customers:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching customers",
    });
  }
});

app.get("/api/restaurants", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM restaurants ORDER BY id");

    res.json({
      success: true,
      count: rows.length,
      data: rows,
    });
  } catch (error) {
    console.error("Error fetching restaurants:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching restaurants",
    });
  }
});

app.get("/api/reservations", async (req, res) => {
  try {
    const { rows } = await pool.query(`
        SELECT 
          r.id, 
          r.date, 
          r.party_count, 
          r.restaurant_id, 
          r.customer_id,
          res.name AS restaurant_name,
          c.name AS customer_name
        FROM 
          reservations r
        JOIN 
          restaurants res ON r.restaurant_id = res.id
        JOIN 
          customers c ON r.customer_id = c.id
        ORDER BY 
          r.date DESC
      `);

    res.json({
      success: true,
      count: rows.length,
      data: rows,
    });
  } catch (error) {
    console.error("Error fetching reservations:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching reservations",
    });
  }
});

app.post("/api/customers/:id/reservations", async (req, res) => {
  try {
    const { id: customer_id } = req.params;
    const { restaurant_id, date, party_count } = req.body;

    // Validate required fields
    if (!restaurant_id || !date || !party_count) {
      return res.status(400).json({
        success: false,
        message: "Please provide restaurant_id, date, and party_count",
      });
    }

    // Validate that party_count is a positive integer
    if (!Number.isInteger(party_count) || party_count <= 0) {
      return res.status(400).json({
        success: false,
        message: "party_count must be a positive integer",
      });
    }

    // Check if customer exists
    const customerCheck = await pool.query(
      "SELECT * FROM customers WHERE id = $1",
      [customer_id]
    );

    if (customerCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Customer with ID ${customer_id} not found`,
      });
    }

    const restaurantCheck = await pool.query(
      "SELECT * FROM restaurants WHERE id = $1",
      [restaurant_id]
    );

    if (restaurantCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Restaurant with ID ${restaurant_id} not found`,
      });
    }

    const newReservation = await pool.query(
      `INSERT INTO reservations 
          (customer_id, restaurant_id, date, party_count) 
         VALUES ($1, $2, $3, $4) 
         RETURNING *`,
      [customer_id, restaurant_id, date, party_count]
    );

    const { rows } = await pool.query(
      `SELECT 
          r.id, 
          r.date, 
          r.party_count, 
          r.restaurant_id, 
          r.customer_id,
          res.name AS restaurant_name,
          c.name AS customer_name
        FROM 
          reservations r
        JOIN 
          restaurants res ON r.restaurant_id = res.id
        JOIN 
          customers c ON r.customer_id = c.id
        WHERE 
          r.id = $1`,
      [newReservation.rows[0].id]
    );

    res.status(201).json({
      success: true,
      data: rows[0],
    });
  } catch (error) {
    console.error("Error creating reservation:", error);
    res.status(500).json({
      success: false,
      message: "Server error while creating reservation",
    });
  }
});

app.delete("/api/customers/:customer_id/reservations/:id", async (req, res) => {
  try {
    const { customer_id, id: reservation_id } = req.params;

    // Check if reservation exists and belongs to the specified customer
    const reservationCheck = await pool.query(
      "SELECT * FROM reservations WHERE id = $1 AND customer_id = $2",
      [reservation_id, customer_id]
    );

    if (reservationCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Reservation with ID ${reservation_id} not found for customer ${customer_id}`,
      });
    }

    // Delete the reservation
    await pool.query("DELETE FROM reservations WHERE id = $1", [
      reservation_id,
    ]);

    // Return 204 No Content status with no response body
    res.status(204).end();
  } catch (error) {
    console.error("Error deleting reservation:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting reservation",
    });
  }
});

app.listen(port, async () => {
  await client.connect();
  console.log("Connected to the database");
  console.log(`Example app listening on port ${port}`);
});
