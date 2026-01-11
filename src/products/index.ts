import { Hono } from 'hono'
import * as z from 'zod'
import { zValidator } from '@hono/zod-validator'

const productsRoutes = new Hono()

const createProductsSchema = z.object({
    productid : z.string("กรุณากรอกรหัส Products").min(5,"กรอกรหัส Products มีความยาว 5 ตัวอักษร").max(5, "กรอกรหัส Products มีความยาว 5 ตัวอักษร"),
    name : z.string("กรุณากรอกชื่อ").min(5, "ชื่อสินค้า ความยาวไม่น้อยกว่า 5 ตัวอักษร").max(50),
    price : z.number(),
    cost : z.number(),
    note : z.string().optional(),
})

productsRoutes.post('/',
    zValidator('json', createProductsSchema)
    , async (c) => {
    const body = await c.req.json()
    return c.json({ message: 'Products created', data: body })
    })

export default productsRoutes