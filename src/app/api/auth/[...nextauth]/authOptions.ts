import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import type { AuthOptions, User as NextAuthUser, Session } from "next-auth";
import type { JWT } from "next-auth/jwt";

const prisma = new PrismaClient();

// Zusätzliche Typen für die erweiterten User- und Token-Objekte
type ExtendedUser = NextAuthUser & {
  companyId?: number;
  company?: string;
  role?: string;
};

type ExtendedToken = JWT & {
  companyId?: number;
  company?: string;
  role?: string;
};

export const authOptions: AuthOptions = {
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
        } as ExtendedUser;
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const extUser = user as ExtendedUser;
        token.companyId = extUser.companyId;
        token.company = extUser.company;
        token.role = extUser.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        const extToken = token as ExtendedToken;
        (session.user as ExtendedUser).companyId = extToken.companyId;
        (session.user as ExtendedUser).company = extToken.company;
        (session.user as ExtendedUser).role = extToken.role;
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