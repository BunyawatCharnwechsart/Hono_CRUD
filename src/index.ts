import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import userRouets from './users/index.js'
import rolesRouets from './roles/index.js'
import productsRoutes from './products/index.js'
//import Database มาก่่อน
import db from './db/index.js'

const app = new Hono()

app.route('/api/users',userRouets)
app.route('/api/roles',rolesRouets)
app.route('/api/products',productsRoutes)

serve({
  fetch: app.fetch,
  port: 3000
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})