import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        company: { label: "Firmenname", type: "text", placeholder: "Firma" },
        email: { label: "E-Mail", type: "email", placeholder: "E-Mail" },
        password: { label: "Passwort", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials) return null;
        const { company, email, password } = credentials;
        // Multi-Tenant: Suche User anhand Firma UND E-Mail
        const user = await prisma.user.findFirst({
          where: {
            email,
            company: {
              name: company,
            },
          },
          include: { company: true },
        });
        if (!user || !user.company) return null;
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) return null;
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          companyId: user.company.id,
          company: user.company.name,
          role: user.role,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.companyId = user.companyId;
        token.company = user.company;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.companyId = token.companyId;
        session.user.company = token.company;
        session.user.role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login?error=1",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST }; 