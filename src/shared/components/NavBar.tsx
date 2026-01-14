import Image from "next/image";
import Link from "next/link";

export default function NavBar() {
    return (
        <div className='sticky top-0 z-100 w-full'>

            <nav className="bg-white border-b-4 border-[#005831] shadow-lg relative z-100 flex justify-center items-center h-20">

                <div className="container w-full max-w-4/5 flex justify-between items-center">
                    <Link href="/">
                        <Image src="/logo.png" alt="Logo" width={120} height={50} className="w-[120px] md:w-[150px] object-contain" />
                    </Link>

                    <div>
                        <Link href="/" className="mx-2 text-gray-700 hover:text-gray-900">Inicio</Link>
                        <Link href="/unidades" className="mx-2 text-gray-700 hover:text-gray-900">Unidades</Link>
                        <Link href="https://somosempilhadeiras.com" className="mx-2 text-gray-700 hover:text-gray-900">Site</Link>
                    </div>
                </div>
            </nav>
        </div>
    );
}