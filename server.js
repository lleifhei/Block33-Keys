const express = require('express')
const { Client } = require('pg')
const app = express()
const port = 3000

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, async() => {
    // Connect to the database
    await Client.connect({
        user: 'user',
        host: 'localhost',
        database: 'postgres',
        password: '',
        port: 5432,
    })
    console.log('Connected to the database')
  console.log(`Example app listening on port ${port}`)
})