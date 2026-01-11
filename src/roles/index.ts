import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'
import * as z from 'zod'
import db from '../db/index.js'

const rolesRouets = new Hono()

type Roles = {
    name: string
}

rolesRouets.get('/', (c) => {
    const roles = db.prepare('SELECT * FROM roles').all()
    return c.json(roles)
})

rolesRouets.get('/:id', (c) => {
    const { id } = c.req.param()
    let sql = 'SELECT * FROM roles WHERE id = @id'
    let stmt = db.prepare<{id:string},Roles>(sql)
    let roles = stmt.get({id:id})

    if (!roles){
        return c.json({ message: 'Roles not found' }, 404)
    }

    return c.json({
        message: `Roles details for ID: ${id}`,
        data : roles
    })
})

const createRolesSchema = z.object({
    name: z.string("กรอกชื่อ Roles").max(20,"ยาวไม่เกิน 20 ตัวอักษร")
})

rolesRouets.post('/',
    zValidator('json', createRolesSchema)
    ,async (c) => {
        const body = await c.req.json<Roles>()
        let sql = `INSERT INTO roles
        (name) VALUES(@name);`
        let stmt = db.prepare<Roles>(sql)
        let result = stmt.run(body)
        return c.json({ message: 'Roles created', data: result })
    }
)

const updateRolesSchema = z.object({
    name: z.string({ message: 'กรอกชื่อ Roles' })
        .max(20, 'ยาวไม่เกิน 20 ตัวอักษร')
})

rolesRouets.patch('/:id',
    zValidator('json', updateRolesSchema),
    async (c) => {
        const id = Number(c.req.param('id'))
        const body = await c.req.json<Roles>()
        const sql = `
            UPDATE roles
            SET name = @name
            WHERE id = @id
            `
        const stmt = db.prepare<{id: number; name: string}>(sql)
        const result = stmt.run({ id, name: body.name })

        if (result.changes === 0){
            return c.json({ message: 'Roles not found' }, 404)
        }
        return c.json({ message: 'Roles updated', data: result })
    }
)

rolesRouets.delete('/:id', async (c) => {
    const id = Number(c.req.param('id'))
    const sql  = `DELETE FROM roles WHERE id = @id`
    const stmt = db.prepare<{ id:number }>(sql)
    const result = stmt.run({ id })

    if (result.changes === 0 ){
        return c.json({ message: 'Roles not found' }, 404)
    }
    return c.json({ message : 'Roles Deleted', data: result })
})
export default rolesRouets