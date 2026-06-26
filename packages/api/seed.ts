import { config } from 'dotenv'
import path from 'path'
config({ path: path.resolve(__dirname, '../../.env') })
import pool from './src/db'
async function seed() {
  console.log('🌱 Iniciando seed da Lista da Semana...')

  try {
    const { rows: users } = await pool.query('SELECT id FROM users LIMIT 1')
    if (!users.length) {
      console.log('❌ Nenhum usuário encontrado. Crie um usuário no app primeiro.')
      process.exit(1)
    }

    const userId = users[0].id

    // 1. Criar a Lista
    const { rows: [list] } = await pool.query(
      `INSERT INTO lists (user_id, name) VALUES ($1, $2) RETURNING id`,
      [userId, 'Lista da Semana']
    )
    console.log(`✅ Lista criada com ID: ${list.id}`)

    // 2. Inserir Produtos Base
    const baseProducts = [
      { name: 'Arroz Branco 5kg', category: 'Alimentos', unit: 'un' },
      { name: 'Feijão Carioca 1kg', category: 'Alimentos', unit: 'un' },
      { name: 'Leite Integral 1L', category: 'Laticínios', unit: 'un' },
      { name: 'Pão de Forma', category: 'Padaria', unit: 'un' },
      { name: 'Ovos Brancos dúzia', category: 'Alimentos', unit: 'dz' },
      { name: 'Carne Moída Patinho 1kg', category: 'Carnes', unit: 'kg' },
      { name: 'Café em Pó 500g', category: 'Bebidas', unit: 'un' },
      { name: 'Óleo de Soja 900ml', category: 'Alimentos', unit: 'un' },
    ]

    const productIds: string[] = []

    for (const p of baseProducts) {
      const { rows: [prod] } = await pool.query(
        `INSERT INTO products (name, category, unit) 
         VALUES ($1, $2, $3) 
         ON CONFLICT (barcode) DO NOTHING -- se tivesse barcode unico, aqui nao tem, entao inserimos se nao existir pelo nome
         RETURNING id`,
        [p.name, p.category, p.unit]
      )
      // Se não retornou id (ex: se houvesse conflito, busco o id)
      if (prod) {
        productIds.push(prod.id)
      } else {
        const { rows: [existing] } = await pool.query('SELECT id FROM products WHERE name = $1 LIMIT 1', [p.name])
        if (existing) productIds.push(existing.id)
      }
    }
    console.log(`✅ ${productIds.length} produtos base garantidos no banco.`)

    // 3. Adicionar itens à lista
    for (const pId of productIds) {
      await pool.query(
        `INSERT INTO list_items (list_id, product_id, quantity) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING`,
        [list.id, pId, 1]
      )
    }
    console.log(`✅ Produtos inseridos na Lista da Semana.`)

    console.log('🎉 Seed concluído com sucesso!')
    process.exit(0)
  } catch (err) {
    console.error('❌ Erro no seed:', err)
    process.exit(1)
  }
}

seed()
