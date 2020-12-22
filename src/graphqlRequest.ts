import { INestApplication } from "@nestjs/common";
import request from "supertest";

/**
 * Given a NestJS app, spins up a real HTTP server and sends the given
 * GraphQL query to the server/app.
 */
export async function graphqlRequest(
  app: INestApplication,
  payload: { query: string; variables?: Record<string, unknown> }
) {
  const response = await request(app.getHttpServer())
    .post("/graphql")
    .send(payload)
    .expect((res) => res.ok || console.error(res.body))
    .expect(200);
  return JSON.parse(response.text);
}
