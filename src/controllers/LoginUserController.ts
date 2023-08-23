import { compare } from "bcryptjs";
import { Request, Response } from "express";
import { sign } from "jsonwebtoken";
import { createConnection } from "../postgres";
import { getRedis, setRedis } from "../redisConfig";

type User = {
  username: string;
  password: string;
  name: string;
  id: string;
};

export class LoginUserController {
  async handle(request: Request, response: Response) {
    const { username, password } = request.body;

    console.log({ username })
    let user: User | null = null;

    const userRedis = await getRedis(`user-${username}`);

    if (JSON.parse(userRedis)) {
      user = JSON.parse(userRedis);
    }else {
      const clientConnection = await createConnection();

      const { rows } = await clientConnection.query(
        `SELECT * FROM USERS WHERE USERNAME  = $1 LIMIT 1`,
        [username]
      );
  
      if (!rows[0]) {
        return response.status(401).end();
      }
      user = rows[0];

      await setRedis(`user-${username}`, JSON.stringify(rows[0]));
    }

    console.log({ user })

    const passwordMatch = await compare(password, user.password);

    if (!passwordMatch) {
      return response.status(401).end();
    }

    const token = sign({}, process.env.JWT_SECRET, {
      subject: JSON.stringify({
        id: user.id,
        username: user.username,
      }),
    });

    return response.json(token);
  }
}
