import express from "express"
import cors from "cors"
import prisma from "./src/utils/prisma.js"
import { Prisma } from "@prisma/client"

const app = express()

app.use(cors())

const port = process.env.PORT || 8080

app.use(express.json())

app.get('/', async (req, res) => {
  const allUsers = await prisma.user.findMany()
  res.json(allUsers)
})


function filter(obj, ...keys) {
  return keys.reduce((a, c) => ({ ...a, [c]: obj[c]}), {})
}

// app.post(`/user`, async (req, res) => {
//     const { name, email, password } = req.body
//     const result = await prisma.user.create({
//       data: {
//         name,
//         email,
//         password, 
//       }
//     })
//     res.json(result)
//   })

function validateUser(input) {
  const validationErrors = {}

  if (!('name' in input) || input['name'].length == 0) {
    validationErrors['name'] = 'cannot be blank'
  }

  if (!('email' in input) || input['email'].length == 0) {
    validationErrors['email'] = 'cannot be blank'
  }

  if (!('password' in input) || input['password'].length == 0) {
    validationErrors['password'] = 'cannot be blank'
  } 

  if ('password' in input && input['password'].length < 8) {
    validationErrors['password'] = 'should be at least 8 characters'
  }

  if ('email' in input && !input['email'].match(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)) {
    validationErrors['email'] = 'is invalid'
  }

  return validationErrors
}

app.post('/users', async (req, res) => {
  const data = req.body
  const validationErrors = validateUser(data)

  if (Object.keys(validationErrors).length != 0) return res.status(400).send({
    error: validationErrors
  })


  prisma.user.create({
    data
  }).then(user => {
    return res.json(filter(user, 'id','name','email'))

  }).catch(err => {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      const formattedError = {}
      formattedError[`${err.meta.target[0]}`] = 'already taken'

      return res.status(500).send({
        error: formattedError
      });  // friendly error handling
    }
    throw err  // if this happens, our backend application will crash and not respond to the client. because we don't recognize this error yet, we don't know how to handle it in a friendly manner. we intentionally throw an error so that the error monitoring service we'll use in production will notice this error and notify us and we can then add error handling to take care of previously unforeseen errors.
  })
})


//post is used when there is a requirement to fecth data from the client side
//find the user which match the specified email 
app.post('/sign-in', async(req,res) => {
  const data = req.body;
  await prisma.user.findUnique({
    where: {
      email: data.email
    }
  }).then(user =>{
    return res.json(user)
  })
})

app.put('/user/:id', async (req, res) => {
    const { id } = req.body
    const { name, email, password } = req.body 
    const post = await prisma.user.update({
      where: { id: Number(id) },
      data: { 
        name,
        email,
        password
      },
    })
    res.json(post)
  })

  app.delete(`/delete-user/:id`, async (req, res) => {
    const { id } = req.body
    const post = await prisma.user.delete({
      where: {
        id: Number(id)
      },
    })
    res.json(post)
  })


app.listen(port, () => {
  console.log(`App started; listening on port ${port}`)
})

