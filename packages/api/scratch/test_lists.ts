import { config } from 'dotenv'
import path from 'path'
config({ path: path.resolve(__dirname, '../../../.env') })
import jwt from 'jsonwebtoken'
import axios from 'axios'
import pool from '../src/db'

async function runTest() {
  try {
    const email = 'dev@listasmart.com'
    const listId = 'd1000000-0000-0000-0000-000000000001' // Compras de Junho
    
    // Get user details
    const { rows: users } = await pool.query('SELECT id, email, role FROM users WHERE email = $1', [email])
    if (users.length === 0) {
      console.log(`❌ User ${email} not found!`)
      process.exit(1)
    }
    const user = users[0]
    console.log(`- Selected user: ${user.email} (${user.id})`)

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '1h' }
    )
    console.log('- Token generated successfully.')

    // Call the items API endpoint
    const url = `http://localhost:3001/api/v1/lists/${listId}/items`
    console.log(`Calling API: GET ${url}`)
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    console.log('\n--- API Response Status ---')
    console.log(response.status)
    console.log('\n--- API Response Data ---')
    console.log(JSON.stringify(response.data, null, 2))
    
    process.exit(0)
  } catch (err: any) {
    console.error('❌ Test failed with error:', err.response?.data ?? err.message)
    process.exit(1)
  }
}

runTest()
