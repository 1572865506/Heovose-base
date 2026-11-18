"use server";

import { signIn } from "@/auth";

export async function loginAction(formData: any) {
  try {
    await signIn("credentials", {
      email: formData.email,
      password: formData.password,
      redirect: false,
    });
    return { success: true };
  } catch (error: any) {
    const causeMsg = error?.cause?.err?.message || "";
    const errorMsg = error?.message || String(error || "");
    const combined = `${errorMsg} ${causeMsg}`;

    if (combined.includes("TOO_MANY_ATTEMPTS")) {
      return { error: "TooManyAttempts" };
    }

    if (
      combined.includes("CredentialsSignin") ||
      combined.includes("credentialssignin") ||
      combined.includes("Credentials") ||
      combined.includes("credentials")
    ) {
      return { error: "CredentialsSignin" };
    }

    if (combined.includes("AccessDenied") || combined.includes("accessdenied")) {
      return { error: "AccessDenied" };
    }

    // 仅在服务端记录内部异常详情，不向客户端透传底层堆栈或错误信息
    console.error("[Auth Action] Unexpected login error:", error);
    return { error: "UnexpectedError" };
  }
}

