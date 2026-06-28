import { buildSchema, graphql as executeGraphql } from 'graphql'
import type { NextRequest } from 'next/server'
import { typeDefs } from '@/lib/graphql/typeDefs'
import { resolvers } from '@/lib/graphql/resolvers'

const schema = buildSchema(typeDefs)

export async function POST(request: NextRequest) {
  try {
    const { query, variables } = await request.json()

    const result = await executeGraphql({
      schema,
      source: query,
      rootValue: resolvers,
      variableValues: variables,
    })

    return Response.json(result, {
      status: result.errors ? 400 : 200,
    })
  } catch (err) {
    console.error(err)
    return Response.json({ errors: [{ message: 'Internal server error' }] }, { status: 500 })
  }
}

export async function GET() {
  return Response.json({ message: 'Use POST for GraphQL queries' })
}
