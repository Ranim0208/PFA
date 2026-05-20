// components/candidatures/AppelCard.js
"use client";
import { useState } from "react"
import { Calendar, MapPin, Gift, Clock, ArrowRight, Users, Award } from "lucide-react";
import Image from "next/image";
import { Button } from '@/components/ui/button'
import CandidatureSubmissionForm from "../../features/forms/candidatureSubmission/CandidatureSubmissionForm"
import { Badge } from "@/components/ui/badge"
export default function AppelCard({ form }) {
    const [dialogOpen, setDialogOpen] = useState(false);

    const {
        _id,
        title,
        description,
        endDate,
        imageUrl,
        prizes = [],
        eventDates = [],
        eventLocation,
        daysRemaining,
        region
    } = form;

    const formattedEndDate = new Date(endDate).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });

    const isUrgent = daysRemaining <= 3;
    const isAlmostOver = daysRemaining <= 7;

    return (
        <div className="relative w-full bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 group border border-tacir-lightgray/50">
            {/* Header with Image */}
            <div className="relative h-56 w-full overflow-hidden rounded-t-2xl">
                {imageUrl ? (
                    <Image
                        src={imageUrl}
                        alt={title?.fr}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-tacir-blue to-tacir-darkblue flex items-center justify-center">
                        <Award className="h-16 w-16 text-white opacity-50" />
                    </div>
                )}

                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                    <Badge
                        variant={isUrgent ? "destructive" : isAlmostOver ? "warning" : "default"}
                        className="text-sm font-semibold"
                    >
                        <Clock className="h-3 w-3 mr-1" />
                        {daysRemaining} jour{daysRemaining > 1 ? 's' : ''}
                    </Badge>
                    {region && (
                        <Badge variant="secondary" className="bg-white/20 text-white backdrop-blur-sm">
                            <MapPin className="h-3 w-3 mr-1" />
                            {region.name?.fr}
                        </Badge>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-5">
                {/* Title and Description */}
                <div className="space-y-3">
                    <h2 className="text-xl font-bold text-tacir-darkblue line-clamp-2 group-hover:text-tacir-blue transition-colors">
                        {title?.fr}
                    </h2>

                    {description?.fr && (
                        <p className="text-tacir-darkgray line-clamp-3 leading-relaxed">
                            {description?.fr}
                        </p>
                    )}
                </div>

                {/* Key Information */}
                <div className="space-y-3">
                    {/* Location */}
                    {eventLocation?.fr && (
                        <div className="flex items-center gap-3 text-sm text-tacir-darkblue">
                            <MapPin className="h-4 w-4 text-tacir-pink flex-shrink-0" />
                            <span>{eventLocation?.fr}</span>
                        </div>
                    )}

                    {/* Deadline */}
                    <div className="flex items-center gap-3 text-sm text-tacir-darkblue">
                        <Calendar className="h-4 w-4 text-tacir-green flex-shrink-0" />
                        <span>Clôture: {formattedEndDate}</span>
                    </div>
                </div>

                {/* Prizes Preview */}
                {prizes.length > 0 && (
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Gift className="h-4 w-4 text-tacir-orange" />
                            <span className="text-sm font-semibold text-tacir-darkblue">
                                Récompenses jusqu&apos;à {Math.max(...prizes.map(p => p.amount))} DTN
                            </span>
                        </div>
                    </div>
                )}

                {/* Events Preview */}
                {eventDates.length > 0 && (
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-tacir-lightblue" />
                            <span className="text-sm font-semibold text-tacir-darkblue">
                                {eventDates.length} événement{eventDates.length > 1 ? 's' : ''} programmé{eventDates.length > 1 ? 's' : ''}
                            </span>
                        </div>
                    </div>
                )}

                {/* CTA Button */}
                <div className="pt-4 border-t border-tacir-lightgray">
                    <Button

                        onClick={() => setDialogOpen(true)}
                        className="w-full bg-tacir-blue hover:bg-tacir-darkblue text-white font-semibold py-3 rounded-xl transition-all duration-200 hover:shadow-lg hover:scale-[1.02]"
                        size="lg" variant={undefined}                    >
                        Voir les détails et postuler
                        <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                </div>
            </div>

            {/* Dialog */}
            <CandidatureSubmissionForm
                form={form}
                open={dialogOpen}
                onOpenChange={setDialogOpen}
            />
        </div>
    );
}