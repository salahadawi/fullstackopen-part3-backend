require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()

const Person = require('./models/person')

app.use(express.json())
app.use(express.static('build'))

morgan.token('data', function getId(req) {
  if (req.method === 'POST')
    return JSON.stringify(req.body)
})

app.use(morgan(':method :url :response-time :data'))
app.use(cors())

app.get('/api/persons', (request, response) => {
  Person.find({}).then(persons => {
    console.log(persons)
    response.json(persons)
  })
})

app.get('/info', (request, response, next) => {
  Person.collection.countDocuments().then(count => {
    response.send(`<p>Phonebook has info for ${count} people</p> <p>${new Date()}</p>`)
  }).catch(error => next(error))
})

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id).then(person => {
    if (person) {
      response.json(person)
    } else {
      response.status(404).end()
    }
  }).catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndRemove(request.params.id).then(response.status(204).end())
    .catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {
  Person.findOne({ name: request.body.name }).then(personMatches => {
    if (personMatches) {
      return response.status(400).json({ error: 'name must be unique' })
    }
    const person = new Person({
      name: request.body.name,
      number: request.body.number
    })
    person.save().then(() => {
      response.json(person)
    }).catch(error => next(error))
  }).catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body

  const person = {
    name: body.name,
    number: body.number
  }
  Person.findByIdAndUpdate(request.params.id, person, {
    new: true, runValidators: true, context: 'query'
  }).then(updatedPerson => {
    response.json(updatedPerson)
  }).catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})