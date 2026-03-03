import { cache } from "react";
import { auth } from "./server";
import { headers } from "next/headers";

export const gerServerSession = cache(async () => {
    return await auth.api.getSession({ headers: await headers() });
})