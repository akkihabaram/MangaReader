import { auth, currentUser } from "@clerk/nextjs";
import axios from "axios";

export async function POST(req) {
  try {
    const { userId } = auth();
    const user = await currentUser();

    if (!userId || !user) {
      return Response.json(
        { error: "User not authenticated" },
        { status: 401 }
      );
    }

    const email = user.emailAddresses?.[0]?.emailAddress || user.email;
    const username = user.username || user.firstName || email.split("@")[0];

    // Send user data to MongoDB via backend
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_MONGO_DB_URL}users/create`,
      {
        clerkId: userId,
        email,
        username,
      }
    );

    // Update Clerk user metadata with role and admin status
    if (response.data.user) {
      const { role, isFirstUser } = response.data.user;
      return Response.json({
        success: true,
        user: response.data.user,
        role,
        isFirstUser,
      });
    }

    return Response.json(response.data);
  } catch (error) {
    console.error("Error syncing user:", error);
    // Return success even if user already exists
    if (error.response?.status === 409) {
      return Response.json({ 
        success: true, 
        message: "User already exists",
        isExistingUser: true 
      });
    }
    return Response.json(
      { error: error.message || "Failed to sync user" },
      { status: error.response?.status || 500 }
    );
  }
}

export async function GET(req) {
  try {
    const { userId } = auth();

    if (!userId) {
      return Response.json(
        { error: "User not authenticated" },
        { status: 401 }
      );
    }

    // Fetch user data from MongoDB
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_MONGO_DB_URL}users/${userId}`
    );

    return Response.json(response.data);
  } catch (error) {
    console.error("Error fetching user:", error);
    if (error.response?.status === 404) {
      return Response.json(
        { error: "User not found in database" },
        { status: 404 }
      );
    }
    return Response.json(
      { error: error.message || "Failed to fetch user" },
      { status: error.response?.status || 500 }
    );
  }
}
