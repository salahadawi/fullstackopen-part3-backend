const mongoose = require('mongoose')

if (process.argv.length < 3) {
  console.log('Please provide the password as an argument: node mongo.js <password>')
  process.exit(1)
}

const password = process.argv[2]

const url = `mongodb+srv://sadawi:${password}@cluster0.e3ngvqr.mongodb.net/?retryWrites=true&w=majority`

const personSchema = new mongoose.Schema({
  name: String,
  number: Number,
})

const Person = mongoose.model('Person', personSchema)

mongoose
  .connect(url)
  .then((result) => {
    if (process.argv.length === 3) {
      console.log("phonebook:")
      Person.find({}).then(result => {
        result.forEach(person => {
          console.log(person.name, person.number)
        })
        mongoose.connection.close()
      })

    } else if (process.argv.length === 5) {
      const person = new Person({
        name: process.argv[3],
        number: process.argv[4]
      })

      return person.save().then(() => {
        console.log(`added ${person.name} number ${person.number} to phonebook`)
        return mongoose.connection.close()
      })
    }
  })
  .catch((err) => console.log(err))