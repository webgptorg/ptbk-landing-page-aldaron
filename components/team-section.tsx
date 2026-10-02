import jiriJahn from '@/public/people/jiri-jahn-transparent.png';
import pavolHejny from '@/public/people/pavol-hejny-transparent.png';
import { Mail, Phone } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface TeamSectionProps {
    title?: string;
    description?: React.ReactNode;
    jiriDescription?: React.ReactNode;
    pavolDescription?: React.ReactNode;
}

export const TeamSection = ({
    title = 'Meet Our Team',
    description = (
        <>
            We are a dedicated group of professionals committed to leveraging AI to transform businesses. With diverse
            backgrounds in technology, research, and entrepreneurship:
        </>
    ),
    jiriDescription = (
        <>
            Ph.D. in Mathematics, former researcher at{' '}
            <Link href="https://www.it4i.cz/">IT4I National Supercomputing Centre</Link>.
        </>
    ),
    pavolDescription = (
        <>
            Top <Link href="https://www.pavolhejny.com/">open-source contributor</Link> in CZE. Developer with 15+ years
            of experience.
        </>
    ),
}: TeamSectionProps) => {
    return (
        <section className="py-12 bg-white sm:py-16 lg:py-20">
            <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
                <div className="text-center">
                    <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h2>
                    <p className="mt-4 text-lg text-muted-foreground">{description}</p>
                </div>

                <div className="mt-12  grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-x-8 gap-y-12 lg:mt-16 items-center">
                    <div className="grid grid-cols-2 gap-x-4 items-center">
                        <Image
                            className="object-cover mx-auto"
                            src={jiriJahn}
                            alt="Jiri Jahn"
                            height={350}
                            style={{ transform: 'translateY(80px)' }}
                        />
                        <div className="text-left">
                            <p className="text-xl font-bold text-gray-900 font-pj">CEO | Jiří Jahn</p>
                            <p className="mt-4 text-base text-gray-500">{jiriDescription}</p>
                            <p className="mt-4 text-base text-gray-500 flex items-center gap-2">
                                <Mail className="inline-block w-5 h-5" />
                                <Link href="mailto:jiri@ptbk.io">jiri@ptbk.io</Link>
                            </p>
                            <p className="mt-1 text-base text-gray-500 flex items-center gap-2">
                                <Phone className="inline-block w-5 h-5" />
                                <Link href="tel:+420777090067">+420 777 090 067</Link>
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-x-4 items-center">
                        <div className="text-left">
                            <p className="text-xl font-bold text-gray-900 font-pj">Pavol Hejný | CTO</p>
                            <p className="mt-4 text-base text-gray-500">{pavolDescription}</p>
                            <p className="mt-4 text-base text-gray-500 flex items-center gap-2">
                                <Mail className="inline-block w-5 h-5" />
                                <Link href="mailto:pavol@ptbk.io">pavol@ptbk.io</Link>
                            </p>
                            <p className="mt-1 text-base text-gray-500 flex items-center gap-2">
                                <Phone className="inline-block w-5 h-5" />
                                <Link href="tel:+420777759767">+420 777 759 767</Link>
                            </p>
                        </div>
                        <Image
                            className="object-cover mx-auto"
                            src={pavolHejny}
                            alt="Pavol Hejný"
                            height={350}
                            style={{ transform: 'translateY(80px)' }}
                        />
                    </div>
                </div>
            </div>
        </section>
    );
};
