import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./prisma";

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    // @ts-expect-error NextAuth v4 callback types
    session: ({ session, user }) => ({
      ...session,
      user: {
        ...session.user,
        id: user.id,
      },
    }),
  },
};
