import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { updateUserProfileByEmail } from "../../../lib/servicefirebase";

type ApiResponse = {
  status: boolean;
  message: string;
  data?: {
    fullName: string;
    image: string;
  };
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>,
) {
  if (req.method !== "POST") {
    return res.status(405).json({
      status: false,
      message: "Method Not Allowed",
    });
  }

  const session = await getServerSession(req, res, authOptions);

  if (!session?.user?.email) {
    return res.status(401).json({
      status: false,
      message: "Unauthorized",
    });
  }

  const fullName = String(req.body?.fullName || "").trim();
  const image = String(req.body?.image || "").trim();

  if (!fullName) {
    return res.status(400).json({
      status: false,
      message: "Nama lengkap wajib diisi.",
    });
  }

  const result = await updateUserProfileByEmail(session.user.email, {
    fullName,
    image,
  });

  if (!result.status) {
    return res.status(400).json({
      status: false,
      message: result.message,
    });
  }

  return res.status(200).json({
    status: true,
    message: result.message,
    data: result.data,
  });
}
