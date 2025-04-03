const DJANGO_BASE_URL = "https://15b0-103-187-228-77.ngrok-free.app";
export default DJANGO_BASE_URL;

import clsx from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(...inputs));
}
