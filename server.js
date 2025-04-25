const express = require('express')
const { Client } = require('pg')
const client = new Client({
  user: '',
  host: 'localhost',
  database: 'postgres',
  password: '',
  port: 5432,
})
  
const app = express()
app.use(express.json())
const port = 3000



app.listen(port, async() => {
    // Connect to the database
    await client.connect()
    console.log('Connected to the database')
  console.log(`Example app listening on port ${port}`)
})