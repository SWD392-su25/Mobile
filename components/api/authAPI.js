// src/api/authAPI.js

const BASE_URL = "http://103.90.227.51:8080/api";

export const loginUser = async (email, password) => {
  try {
    const response = await fetch(`${BASE_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const contentType = response.headers.get("Content-Type");

    let message = "Đăng nhập thất bại";
    let data = {};

    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
      message = data.message || data.error || message;
    } else {
      message = await response.text();
    }

    if (!response.ok) {
      return {
        success: false,
        message,
      };
    }

    return {
      success: true,
      token: data.token || "",
      username: data.username || data.fullName || email,
    };
  } catch (error) {
    console.error("Login API error:", error);
    return {
      success: false,
      message: "Lỗi mạng hoặc máy chủ không phản hồi đúng định dạng.",
    };
  }
};

export const registerUser = async (fullName, email, password, gender) => {
  try {
    const response = await fetch(`${BASE_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        password,
        fullName,
        gender:
          gender === "Nam" ? "MALE" : gender === "Nữ" ? "FEMALE" : "OTHER",
        phone: "0000000000",
        image: "",
        role: "USER",
        username: email,
      }),
    });

    const contentType = response.headers.get("Content-Type");
    let data = {};
    let message = "Đăng ký thất bại";

    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
      message = data.message || data.error || message;
    } else {
      message = await response.text();
      console.log("🔥 Register failed - raw response:", message);
    }

    if (!response.ok) {
      return { success: false, message };
    }

    return { success: true };
  } catch (error) {
    console.error("⚠️ Network error in registerUser:", error);
    return {
      success: false,
      message: "Lỗi mạng hoặc máy chủ không phản hồi đúng định dạng.",
    };
  }
};
