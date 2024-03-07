import "dotenv/config";
import {
    Clerk,
    decodeJwt
} from '@clerk/clerk-sdk-node';
import express, { Application, Request, Response } from 'express';

const port =  3000;

const app: Application = express();

const clerk = Clerk({secretKey:process.env.CLERK_SECRET_KEY});

app.get(
    '/me',
    async (req: Request, res: Response) => {
        try{
            const token = req.headers.authorization?.split(' ')[1];

            if (!token) {
                return res.status(401).json({ message: "Unauthorized" });
            }

            const decodedToken = decodeJwt(token);

            const client_id = decodedToken?.payload?.id as string;
            const findClient = decodedToken ? await clerk.clients.getClient(client_id) : undefined;

            const user_id = findClient?.sessions.find(i => i.clientId === client_id)?.userId as string;
            const findUser = user_id ? await clerk.users.getUser(user_id) : undefined;

            const emailAddresses = findUser?.emailAddresses || [];
            const userEmail = emailAddresses.length === 1 ? emailAddresses[0].emailAddress : emailAddresses.map(address => address.emailAddress);

            return res.json({ id: findUser?.id, email: userEmail });
        } catch (e) {
            return res.status(401).json({ message: "Unauthorized" });
        }
    }
);


app.listen(port, () => {
    console.log(`Started on port ${port}`);
});