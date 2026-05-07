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

                if (user.isDeleted) {
                    throw new Error("Akun Anda telah dinonaktifkan oleh Admin.");
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
                    allowedDevices: user.allowedDevices || [],
                };
            },
        }),
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        }),
    ],

    callbacks: {
        async jwt({ token, account, user, trigger, session }: any) {
            if (account?.provider === "credentials" && user) {
                token.email = user.email;
                token.fullName = user.fullName;
                token.role = user.role;
                token.allowedDevices = user.allowedDevices || [];
            }
            if (account?.provider === "google") {
                const data = {
                    fullName: user.name,
                    email: user.email,
                    image: user.image,
                    type: account.provider,
                };
                await new Promise((resolve, reject) => { 
                    signInOAuth(data, (result: any) => {
                        if (result.status) {
                            token.fullName = result.data.fullName;
                            token.role = result.data.role;
                            token.allowedDevices = result.data.allowedDevices || [];
                            resolve(true);
                        } else {
                            // --- TAMBAHAN: Lempar error agar login Google digagalkan ---
                            reject(new Error(result.message));
                        }
                    });
                });
            }

            if (trigger === "update" && session?.user?.allowedDevices) {
                token.allowedDevices = session.user.allowedDevices;
            }

            return token;
        },
        async session({ session, token }: any) {
            if (token) {
                session.user.email = token.email;
                session.user.fullName = token.fullName;
                session.user.role = token.role;
                session.user.allowedDevices = token.allowedDevices || [];
            }
            return session;
        },
    },
    pages: {
        signIn: "/auth/login",
    },
};

export default NextAuth(authOptions);