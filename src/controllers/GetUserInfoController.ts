import { Request, Response } from "express";
import { getRedis, setRedis } from "../redisConfig";
import { createConnection } from "../postgres";

export class GetUserInfoController {
  async handle(request: Request, response: Response) {
    const { userId, username } = request;

    const userRedis = await getRedis(`user-${username}`);

    if (JSON.parse(userRedis)) {
      return response.json(JSON.parse(userRedis));
    } else {
      const clientConnection = await createConnection();

      const { rows } = await clientConnection.query(
        `SELECT * FROM USERS WHERE ID  = $1 LIMIT 1`,
        [userId]
      );

      if (!rows[0]) {
        return response.status(401).end();
      }

      await setRedis(`user-${username}`, JSON.stringify(rows[0]));

      return response.json(rows[0]);
    }
  }
}
