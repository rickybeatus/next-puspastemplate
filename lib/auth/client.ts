import { usernameClient, adminClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const { signIn, signUp, signOut, useSession, getSession } = createAuthClient({
    baseURL: process.env.BETTER_AUTH_URL,
    emailAndPassword: {
        enabled: true,
    },
    plugins: [
        usernameClient(),
        adminClient()
    ],
});