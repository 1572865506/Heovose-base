"use server";

import { signIn } from "@/auth";

export async function loginAction(formData: any) {
  try {
    const result = await signIn("credentials", {
      email: formData.email,
      password: formData.password,
      redirect: false,
    });
    return { success: true };
  } catch (error: any) {
    // 捕获认证失败并安全返回给客户端组件
    const errorMsg = error?.message || String(error || "");
    if (
      errorMsg.includes("CredentialsSignin") || 
      errorMsg.includes("credentialssignin") || 
      errorMsg.includes("Credentials") ||
      errorMsg.includes("credentials")
    ) {
      return { error: "CredentialsSignin" };
    }
    
    if (errorMsg.includes("AccessDenied") || errorMsg.includes("accessdenied")) {
      return { error: "AccessDenied" };
    }

    return { error: errorMsg || "Unexpected error" };
  }
}

