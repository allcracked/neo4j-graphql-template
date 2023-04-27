import * as dotenv from "dotenv";
import { Neo4jGraphQL } from "@neo4j/graphql";
import { ApolloServer, gql } from "apollo-server";
import neo4j from "neo4j-driver";

dotenv.config();

const typeDefs = gql`
  type Movie {
    title: String
    actors: [Actor!]! @relationship(type: "ACTED_IN", direction: IN)
  }

  type Actor {
    name: String
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

neoSchema.getSchema().then((schema) => {
  const server = new ApolloServer({
    schema,
  });

  server.listen().then(({ url }) => {
    console.log(`🚀 Server ready at ${url}`);
  });
});
