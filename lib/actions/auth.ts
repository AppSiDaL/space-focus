"use server";

import { cookies } from "next/headers";
import { getUserFromToken } from "@/lib/getUser";

export async function checkAuthStatus() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("authToken")?.value;
    
    if (!token) {
      return { success: false, authenticated: false };
    }
    
    const user = await getUserFromToken(token);
    
    if (!user) {
      return { success: false, authenticated: false };
    }
    
    return { 
      success: true,
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    };
  } catch (error) {
    console.error("Error checking auth status:", error);
    return { success: false, authenticated: false, error: "Error checking authentication" };
  }
}

export async function getAuthenticatedUser() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("authToken")?.value;

  if (!sessionToken) {
    return null;
  }

  const user = await getUserFromToken(sessionToken);
  
  if (!user) {
    return null;
  }
  
  return user;
}