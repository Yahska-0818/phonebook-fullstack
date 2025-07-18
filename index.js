require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const Contact = require('./models/contact')

morgan.token('content', function (req) { return JSON.stringify(req.body) })

const app =  express()

app.use(express.json())
app.use(morgan(':method :url :status :res[content-length] - :response-time :content', {
  skip: function (req) {
    return !(req.method === 'POST')
  }
}))

app.use(express.static('dist'))

app.get('/api/persons',(request,response) => {
  Contact.find({}).then(contacts => {
    response.json(contacts)
  })
})

app.get('/info',(request,response,next) => {
  const dateNew = new Date()
  Contact.countDocuments()
    .then(count => {
      response.send(`
        <div>Phonebook has info for ${count} people</div>
        <div>${dateNew}</div>
      `)
    })
    .catch(error => next(error))
})

app.get('/api/persons/:id', (request, response,next) => {
  Contact.findById(request.params.id)
    .then(contact => {
      if (contact) {
        response.json(contact)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id',(request,response,next) => {
  Contact.findByIdAndDelete(request.params.id)
    .then(() => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

app.post('/api/persons',(request,response,next) => {
  let person = request.body
  if (!person.name || !person.number) {
    return response.status(400).json({
      error: 'content missing'
    })
  }

  const contact = new Contact({
    name: person.name,
    number: person.number
  })

  contact.save()
    .then(savedPerson => {
      response.json(savedPerson)
    })
    .catch(error => next(error))
})

app.put('/api/persons/:id',(request,response,next) => {
  const { name,number } = request.body
  Contact.findOneAndUpdate({ name },{ $set:{ number } },{ returnDocument:'after' })
    .then(updatedPerson => {
      response.json(updatedPerson)
    })
    .catch(error => next(error))
})

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

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})