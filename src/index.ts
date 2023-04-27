import * as dotenv from "dotenv";
import { Neo4jGraphQL } from "@neo4j/graphql";
import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import neo4j from "neo4j-driver";

dotenv.config();

const typeDefs = `#graphql
  enum Genre {
    ACTION
    ADVENTURE
    ANIMATION
    COMEDY
    CRIME
    DOCUMENTARY
    DRAMA
    FAMILY
    FANTASY
    HISTORY
    HORROR
    MUSIC
  }

  type Movie {
    id: ID! @id
    title: String
    description: String
    year: Int
    genre: Genre @coalesce(value: HORROR)
    createdAt: DateTime @timestamp(operations: [CREATE])
    actors: [Actor!]! @relationship(type: "ACTED_IN", direction: IN)
    similarMovies(limit: Int = 10): [Movie]
      @cypher(
        statement: """
        MATCH (this)<-[:ACTED_IN]-(:Actor)-[:ACTED_IN]->(rec:Movie)
        WITH rec, COUNT(*) AS score ORDER BY score DESC
        RETURN rec LIMIT $limit
        """
      )
  }

  type Actor {
    id: ID! @id
    name: String
    createdAt: DateTime @timestamp(operations: [CREATE])
    movies: [Movie!]! @relationship(type: "ACTED_IN", direction: OUT)
  }
`;

const driver = neo4j.driver(
  process.env.NEO4J_DB_URI || "",
  neo4j.auth.basic(
    process.env.NEO4J_DB_USER || "",
    process.env.NEO4J_DB_PASS || ""
  )
);

const neoSchema = new Neo4jGraphQL({ typeDefs, driver });

neoSchema.getSchema().then(async (schema) => {
  const server = new ApolloServer({
    schema,
  });

  startStandaloneServer(server, {
    context: async ({ req }) => ({ req }),
    listen: { port: Number(process.env.APOLLO_SERVER_PORT) || 4000 },
  }).then(({ url }) => console.log(`🚀 Server ready at ${url}`));
});
