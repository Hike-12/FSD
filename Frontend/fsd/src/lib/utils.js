const DJANGO_BASE_URL =
  window.location.hostname === "localhost"
    ? "http://127.0.0.1:8000" // Localhost backend
    : "http://192.168.0.110:8000/"; // Ngrok backend
export default DJANGO_BASE_URL;

import clsx from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(...inputs));
}
