import express, { Request, Router } from "express";
import serverless from "serverless-http";
import {
  identifyContacts,
  resetAndSeedData,
} from "../../services/contact.service";
import { IContactIdentificationInput } from "../../types/types";

interface IdentifyRequest extends Request {
  body: IContactIdentificationInput;
}

const api = express();

const router = Router();
router.get("/hello", async (_req, res) => {
  res.json({ message: "Hello world" }).end();
});

router.post("/identify", async (req: IdentifyRequest, res, next) => {
  try {
    const { body } = req;
    const output = await identifyContacts(body);
    res.json(output).end();
  } catch (error) {
    console.error(`Error while processing the /identify input ... ${error}`);
    next(error);
  }
});

router.post("/seed", async (_req, res, next) => {
  try {
    await resetAndSeedData();
    res.json({ message: "Successfully seeded 2 records" }).end();
  } catch (error) {
    console.error(`Error while processing /seed endpoint ... ${error}`);
    next(error);
  }
});

api.use("/api/", router);

export const handler = serverless(api);
