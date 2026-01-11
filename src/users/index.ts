import { Hono } from 'hono'
import * as z from 'zod'
import { zValidator } from '@hono/zod-validator'
import db from '../db/index.js'

const userRouets = new Hono()

const createUserSchema = z.object({
    username: z.string("กรุณากรอกชื่อผู้ใข้")
        .min(5, "ชื่อต้องมีความยาวอย่างน้อย 5 ตัวอักษร"),
    password: z.string("กรุณากรอกชื่อผู้ใข้"),
    firstname: z.string("กรุณากรอกชื่อจริง").optional(),
    lastname: z.string("กรุณากรอกนามสกุล").optional()
})

userRouets.post('/',
    zValidator('json', createUserSchema)
    , async (c) => {
        const body = await c.req.json()
        return c.json({ message: 'User created', data: body })
    })

type User = {
    id: number,
    username : string,
    firstname : string,
    lastname : string
}

userRouets.get('/', async (c) =>{
    let sql = 'SELECT * FROM users'
    let stmt = db.prepare<[],User>(sql)
    let users : User[] = stmt.all()

    return c.json({ message: 'List of users', data : users })
})

userRouets.get('/:id', (c) => {
    const { id } = c.req.param()
    let sql = 'SELECT * FROM users WHERE id = @id'
    let stmt = db.prepare<{id:string},User>(sql)
    let user = stmt.get({id:id})

    if (!user){
        return c.json({ message: 'User not found' }, 404)
    }

    return c.json({
        message: `User details for ID: ${id}`,
        data : user
    })
})

userRouets.post('/',
    zValidator('json', createUserSchema)
    , async (c) => {
        const body = await c.req.json<User>()
        let sql = `INSERT INTO users
            (username, password, firstname, lastname)
            VALUES(@username, @password, @firstname, @lastname);
        `
        let stmt = db.prepare<Omit<User,"id">>(sql)
        let result = stmt.run(body)
        return c.json({ message: 'User created', data: result })
    })

export default userRouets