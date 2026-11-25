import { redirect } from "next/navigation";

export default function OdishaToursPage() {
  redirect("/packages?search=odisha");
}

