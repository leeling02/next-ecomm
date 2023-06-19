import express from "express"
import cors from "cors"
import prisma from "./src/utils/prisma.js"

const app = express()

app.use(cors())

const port = process.env.PORT || 8080

app.use(express.json())

app.get('/', async (req, res) => {
  const allUsers = await prisma.user.findMany()
  res.json(allUsers)
})

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

app.post('/users', async (req, res) => {
    const data = req.body
  
    prisma.user.create({
      data,
    }).then(user => {
      return res.json(user)
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

