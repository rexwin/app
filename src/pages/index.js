import Image from "next/image";
import { Inter } from "next/font/google";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  return (
      <>
        <h1>
          Video upload component
          at /video
        </h1>

      <div>
          <Link href='/video'>
            Link To Page
          </Link>
      </div>
      </>
  );
}
