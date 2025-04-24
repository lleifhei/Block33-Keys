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

<<<<<<< HEAD

=======
app.get('/api/employees', (req, res) => {
    client.query('SELECT * FROM employees', (err, result) => {
        if (err) {
            console.error(err)
            res.status(500).send('Error executing query')
        } else {
            res.json(result.rows)
        }
    })
})
>>>>>>> ab16ec9 (finished routes)

app.get('/api/departments', (req, res) => {
    client.query('SELECT * FROM departments', (err, result) => {
        if (err) {
            console.error(err)
            res.status(500).send('Error executing query')
        } else {
            res.json(result.rows)
        }
    })
})

app.post('/api/employees', (req, res) => {
    const { name, department_id } = req.body
    client.query('INSERT INTO employees (name, department_id) VALUES ($1, $2)', [name, department_id], (err, result) => {
        if (err) {
            console.error(err)
            res.status(500).send('Error executing query')
        } else {
            res.status(201).send('Employee added')
        }
    })
}
)
app.delete('/api/employees/:id', (req, res) => {
    const id = req.params.id
    client.query('DELETE FROM employees WHERE id = $1', [id], (err, result) => {
        if (err) {
            console.error(err)
            res.status(500).send('Error executing query')
        } else {
            res.status(200).send('Employee deleted')
        }
    })
})
app.put('/api/employees/:id', (req, res) => {
    const id = req.params.id
    const { name, department_id } = req.body
    client.query('UPDATE employees SET name = $1, department_id = $2 WHERE id = $3', [name, department_id, id], (err, result) => {
        if (err) {
            console.error(err)
            res.status(500).send('Error executing query')
        } else {
            res.status(200).send('Employee updated')
        }
    })
})
  

app.listen(port, async() => {
    // Connect to the database
    await client.connect()
    console.log('Connected to the database')
  console.log(`Example app listening on port ${port}`)
})