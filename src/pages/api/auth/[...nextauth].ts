import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { signIn, signInOAuth } from "../../../lib/servicefirebase";
import bcrypt from "bcrypt";

export const authOptions: NextAuthOptions = {
    session: {
        strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET,
    providers: [
        CredentialsProvider({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Email dan Password wajib diisi");
                }

                const user: any = await signIn(credentials.email);

                if (!user) {
                    throw new Error("Email tidak terdaftar");
                }
            
                const isPasswordValid = await bcrypt.compare(
                    credentials.password,
                    user.password
                );
            
                if (!isPasswordValid) {
                    throw new Error("Password salah");
                }
            
                return {
                    id: user.id,
                    email: user.email,
                    fullName: user.fullName,
                    role: user.role,
                };
            },
        }),
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        }),
    ],

    callbacks: {
        async jwt({ token, account, user }: any) {
            if (account?.provider === "credentials" && user) {
                token.email = user.email;
                token.fullName = user.fullName;
                token.role = user.role;
            }
            if (account?.provider === "google") {
                const data = {
                    fullName: user.name,
                    email: user.email,
                    image: user.image,
                    type: account.provider,
                };
                await signInOAuth(data, (result: any) => {
                    if (result.status) {
                        token.fullName = result.data.fullName;
                        token.role = result.data.role;
                    }
                });
            }
            return token;
        },
        async session({ session, token }: any) {
            if (token) {
                session.user.email = token.email;
                session.user.fullName = token.fullName;
                session.user.role = token.role;
            }
            return session;
        },
    },
    pages: {
        signIn: "/auth/login",
    },
};

export default NextAuth(authOptions);