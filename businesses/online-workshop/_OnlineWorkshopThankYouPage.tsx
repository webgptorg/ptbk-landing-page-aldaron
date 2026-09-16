import { ONLINE_WORKSHOP_HOST_FULLNAME, ONLINE_WORKSHOP_PARTICIPANT_PATH } from '@/businesses/online-workshop/config';
import { WorkshopParticipantOfflineSupport } from '@/businesses/online-workshop/participant/useWorkshopParticipantOfflineSupport';
import { AddToCalendarButtons } from '@/components/calendar/AddToCalendarButtons';
import { MetaPixelEvent } from '@/components/meta-pixel-event';
import { MinimalFooter } from '@/components/minimal-footer';
import { MinimalHeader } from '@/components/minimal-header';
import { Button } from '@/components/ui/button';
import { AI_SUPERVIZE_MINI_PATH } from '@/lib/discounts/discountPlaces';
import {
    createWorkshopCalendarEvent,
    createWorkshopCalendarFileName,
} from '@/lib/workshops/workshopCalendar';
import {
    createWorkshopParticipantLink,
    type WorkshopParticipantIdentity,
} from '@/lib/workshops/workshopParticipantLink';
import {
    formatCzechWorkshopDuration,
    formatCzechWorkshopRelativeDate,
    formatCzechWorkshopTime,
} from '@/lib/workshops/workshopDate';
import type { WorkshopDetails } from '@/lib/workshops/workshopTypes';
import jiriJahn from '@/public/people/jiri-jahn-transparent-square.png';
import pavolHejny from '@/public/people/pavol-hejny-transparent-square.png';
import { ArrowRight, BellRing, CheckCircle2, Mail, Video } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

/**
 * Meta standard event reported once a registration is finished
 *
 * Note: The campaign can optimize either on this event or on a conversion defined by the url of this page - the pixel
 *       reports both, so the choice stays in the Meta administration.
 */
const REGISTRATION_META_PIXEL_EVENT_NAME = 'CompleteRegistration';

function createNextSteps(durationLabel: string) {
    return [
        {
            icon: Mail,
            title: 'Potvrzovací e-mail přijde za chvíli',
            description:
                'V e-mailu najdeš odkaz na připojení. Když během pár minut nedorazí, zkontroluj spam a Hromadné.',
        },
        {
            icon: BellRing,
            title: 'Den předem ti pošleme připomínku',
            description: 'Ať ti workshop nezapadne mezi schůzky.',
        },
        {
            icon: Video,
            title: `${durationLabel} živě`,
            description: 'Projdeme celé workflow od issue po merge na reálném repu. Na konci bude čas na tvoje otázky.',
        },
    ] as const;
}

/**
 * Page confirming a finished registration for the online workshop
 *
 * Note: It lives on its own url, so that an ad campaign can optimize on real registrations instead of clicks.
 */
type OnlineWorkshopThankYouPageProps = {
    readonly workshop: WorkshopDetails;
    readonly participantIdentity: WorkshopParticipantIdentity;

    /**
     * Moment the server built this page at, from which a term near enough is named rather than merely dated
     */
    readonly currentTime: string;
};

export function OnlineWorkshopThankYouPage({
    workshop,
    participantIdentity,
    currentTime,
}: OnlineWorkshopThankYouPageProps) {
    const dateLabel = formatCzechWorkshopRelativeDate(workshop.startsAt, currentTime);
    const timeLabel = formatCzechWorkshopTime(workshop.startsAt);
    const durationLabel = formatCzechWorkshopDuration(workshop.startsAt, workshop.endsAt);
    const nextSteps = createNextSteps(durationLabel);
    const participantLink = createWorkshopParticipantLink(
        ONLINE_WORKSHOP_PARTICIPANT_PATH,
        participantIdentity,
        workshop.slug,
    );
    const calendarEvent = createWorkshopCalendarEvent({
        occurrence: workshop,
        hostFullname: ONLINE_WORKSHOP_HOST_FULLNAME,
        participantIdentity,
        participantPath: ONLINE_WORKSHOP_PARTICIPANT_PATH,
    });

    return (
        <div className="flex min-h-screen flex-col bg-white">
            <WorkshopParticipantOfflineSupport />
            <MetaPixelEvent eventName={REGISTRATION_META_PIXEL_EVENT_NAME} />

            <MinimalHeader />

            <main className="flex flex-1 items-center justify-center px-6 py-12 md:py-20">
                <div className="w-full max-w-2xl text-center">
                    <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-cyan-50 to-teal-50 ring-8 ring-cyan-50/50">
                        <CheckCircle2 className="h-10 w-10 text-cyan-600" />
                    </div>

                    <h1 className="mb-4 text-[32px] font-extrabold tracking-tight text-[#0f172a] sm:text-[40px] leading-tight">
                        Máš rezervované místo na workshopu: {workshop.title}.
                    </h1>
                    <p className="mx-auto mb-10 max-w-lg text-[16px] leading-relaxed text-gray-500 sm:text-[18px]">
                        Uvidíme se {dateLabel} v {timeLabel} online. Registrace je hotová.
                    </p>

                    {participantLink && (
                        <div className="mx-auto mb-10 max-w-md rounded-2xl border border-cyan-100 bg-gradient-to-br from-cyan-50 to-teal-50 p-6 text-left">
                            <h2 className="text-[15px] font-bold text-[#0f172a]">Připojení najdeš i tady</h2>
                            <p className="mt-1 text-[14px] leading-relaxed text-gray-500">
                                Kdyby potvrzovací e-mail zapadl ve spamu, do místnosti se připojíš rovnou tady.
                            </p>
                            <Button
                                asChild
                                className="mt-4 h-11 rounded-full bg-promptbook-blue-dark px-5 text-sm font-semibold text-white hover:bg-promptbook-blue-dark/90"
                            >
                                <Link href={participantLink}>
                                    Připojit se k workshopu
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        </div>
                    )}

                    <AddToCalendarButtons
                        event={calendarEvent}
                        downloadFileName={createWorkshopCalendarFileName(workshop.slug)}
                        className="mx-auto mb-12 max-w-md sm:justify-center"
                    />

                    <div className="mx-auto mb-16 max-w-md space-y-0">
                        {nextSteps.map((step, index) => {
                            const isLast = index === nextSteps.length - 1;

                            return (
                                <div key={step.title} className="flex gap-4 text-left">
                                    <div className="flex flex-col items-center">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cyan-100 text-cyan-700">
                                            <step.icon className="h-5 w-5" />
                                        </div>
                                        {!isLast && <div className="my-1 h-full w-px bg-gray-200" />}
                                    </div>
                                    <div className={isLast ? '' : 'pb-8'}>
                                        <h2 className="mb-1 text-[15px] font-bold text-[#0f172a]">{step.title}</h2>
                                        <p className="text-[14px] leading-relaxed text-gray-500">{step.description}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="mb-12 border-t border-gray-100 pt-12">
                        <div className="mb-6 flex items-center justify-center">
                            <Image
                                src={pavolHejny}
                                alt="Pavol Hejný"
                                width={56}
                                height={56}
                                className="h-14 w-14 rounded-full border-2 border-white object-cover shadow-sm"
                            />
                            <Image
                                src={jiriJahn}
                                alt="Jiří Jahn"
                                width={56}
                                height={56}
                                className="-ml-4 h-14 w-14 rounded-full border-2 border-white object-cover shadow-sm"
                            />
                        </div>
                        <p className="mx-auto max-w-md text-[14px] leading-relaxed text-gray-500">
                            Máš dotaz před workshopem? Napiš na{' '}
                            <Link
                                href="mailto:pavol@ptbk.io"
                                className="font-semibold text-cyan-700 underline-offset-4 hover:underline"
                            >
                                pavol@ptbk.io
                            </Link>
                            .
                        </p>
                    </div>

                    <div className="mb-12 rounded-2xl border border-cyan-100 bg-gradient-to-br from-cyan-50 to-teal-50 p-6 text-left">
                        <h2 className="text-[15px] font-bold text-[#0f172a]">
                            Chceš si to projít s vlastním týmem?
                        </h2>
                        <p className="mt-1 text-[14px] leading-relaxed text-gray-500">
                            AI Supervize Mini pokračuje tam, kde tento workshop skončí.
                        </p>
                        <Link
                            href={AI_SUPERVIZE_MINI_PATH}
                            className="mt-3 inline-flex items-center gap-1.5 text-[14px] font-semibold text-cyan-700 underline-offset-4 hover:underline"
                        >
                            Podívat se na AI Supervize Mini
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>

                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-[14px] text-gray-400 transition-colors hover:text-gray-600"
                    >
                        ← Zpět na hlavní stránku
                    </Link>
                </div>
            </main>

            <MinimalFooter />
        </div>
    );
}
