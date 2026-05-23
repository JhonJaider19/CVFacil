import { createClient } from "@insforge/sdk";

const client = createClient({
  baseUrl: "https://j67tvrnn.us-east.insforge.app",
  anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3OC0xMjM0LTU2NzgtOTBhYi1jZGVmMTIzNDU2NzgiLCJlbWFpbCI6ImFub25AaW5zZm9yZ2UuY29tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3OTgwODN9.ig_kHNPGYIRlOMxwm1Be22Wn_eTJThTwjaqHprL8SCA",
});

try {
  const { data, error } = await client.database.rpc("confirm_user_email", {
    p_email: "prueba1@cvfacil.com",
  });
  if (error) {
    console.log("RPC error:", error.message);
  } else {
    console.log("RPC result:", data);
  }
} catch (e) {
  console.log("Exception:", e.message);
}

// Try login now
const { data: loginData, error: loginError } = await client.auth.signInWithPassword({
  email: "prueba1@cvfacil.com",
  password: "prueba1",
});

if (loginError) {
  console.log("Login still fails:", loginError.message);
} else {
  console.log("Login OK! User:", loginData.user?.id);
  console.log("Email:", loginData.user?.email);
}
