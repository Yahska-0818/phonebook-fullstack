const mongoose = require('mongoose')

if (process.argv.length < 3) {
  console.log('give password as argument')
  process.exit(1)
}

const password = process.argv[2]

const url = `mongodb+srv://therealakshay0818:${password}@cluster0.s5ehhxg.mongodb.net/phonebookApp?retryWrites=true&w=majority&appName=Cluster0`

mongoose.set('strictQuery',false)

mongoose.connect(url)

const contactSchema = new mongoose.Schema({
  name: String,
  number: String,
})

const Contact = mongoose.model('Contact', contactSchema)

if (process.argv.length === 6) {
    console.log('If name is in two parts, it must be enclosed in quotes')
    process.exit(1)
} else if(process.argv.length === 5) {
    const contact = new Contact({
        name: `${process.argv[3]}`,
        number: `${process.argv[4]}`
    })

    contact.save().then(result=>{
        console.log(`added ${contact.name} number ${contact.number} to phonebook`)
        mongoose.connection.close()
    })
}  else {
    console.log('Phonebook')
    Contact.find({}).then(result => {
    result.forEach(contact => {
        console.log(contact.name,contact.number)
    })
    mongoose.connection.close()
    })
}