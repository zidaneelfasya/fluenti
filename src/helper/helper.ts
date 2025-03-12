import axios from "@/lib/axios";
import Swal, { SweetAlertOptions } from "sweetalert2";

type RequestMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
}

const HELPER = {
  block: () => {
    document.getElementById("loading")!.style.display = "flex";
  },

  unblock: () => {
    document.getElementById("loading")!.style.display = "none";
  },

  Axios: async (
    method: RequestMethod = "GET",
    url: string = "/",
    data: Record<string, any> = {},
    headers: Record<string, string> = {}
  ) => {
    HELPER.block();
    try {
      const response = await axios({
        method,
        url,
        data: method !== "GET" ? data : undefined,
        params: method == "GET" ? data : undefined,
        headers: {
          "Content-Type": "application/json",
          ...headers,
        },
        withCredentials: true,
      });
      return { success: true, data: response.data };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Terjadi kesalahan.",
      };
    } finally {
      HELPER.unblock();
    }
  },

  showAlert: (
    icon: "success" | "error" | "warning" | "info" | "question",
    options: SweetAlertOptions = {}
  ) => {
    return Swal.fire({
      icon,
      title: options.title || "Alert",
      text: options.text || "Pesan ....",
      confirmButtonText: options.confirmButtonText || "OK",
      ...options,
    });
  },

  form: async <T = any>(
    method: RequestMethod = "GET",
    url: string = "/",
    data: Record<string, any> = {},
    headers: Record<string, string> = {},
    confirmMessage: boolean = false
  ): Promise<ApiResponse<T>> => {
    HELPER.block();
    try {
      if (confirmMessage) {
        const result = await HELPER.showAlert("warning", {
          title: "Konfirmasi",
          text: "Apakah data sudah sesuai?",
          showCancelButton: true,
          confirmButtonText: "Ya",
          cancelButtonText: "Tidak",
        });

        if (!result.isConfirmed) {
          return { success: false, message: "Aksi dibatalkan oleh pengguna." };
        }
      }

      const response = await axios({
        method,
        url,
        data,
        headers: {
          "Content-Type": "application/json",
          ...headers,
        },
      });

      await HELPER.showAlert("success", {
        title: "Berhasil!",
        text: response.data.message || "Data berhasil diproses.",
        timer: 2000,
        showConfirmButton: false,
      });

      return { success: true, data: response.data };
    } catch (error: any) {
      const errorMessage: string =
        error.response?.data?.message ||
        "Terjadi kesalahan saat memproses permintaan.";

      await HELPER.showAlert("error", {
        title: "Oops!",
        text: errorMessage,
      });

      return { success: false, message: errorMessage };
    } finally {
      HELPER.unblock();
    }
  },
};

export default HELPER;
