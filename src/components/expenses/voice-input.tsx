"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Square, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface VoiceInputProps {
    onAudioCaptured: (audioBlob: Blob) => void;
    disabled?: boolean;
}

export function VoiceInput({ onAudioCaptured, disabled }: VoiceInputProps) {
    const [isRecording, setIsRecording] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<BlobPart[]>([]);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: "audio/webm" }); // webm is standard for MediaRecorder
                onAudioCaptured(blob);

                // Stop all tracks
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
        } catch (error) {
            console.error("Error accessing microphone:", error);
            toast.error("Could not access microphone. Please check permissions.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    return (
        <div className="flex items-center gap-2">
            {!isRecording ? (
                <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={startRecording}
                    disabled={disabled}
                    className="rounded-full h-10 w-10 border-primary/20 hover:bg-primary/10 transition-all hover:scale-105"
                    title="Record Voice Instruction"
                >
                    <Mic className="h-5 w-5 text-primary" />
                </Button>
            ) : (
                <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={stopRecording}
                    className="rounded-full h-10 w-10 animate-pulse relative"
                    title="Stop Recording"
                >
                    <Square className="h-4 w-4 fill-current" />
                    <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full animate-ping"></span>
                </Button>
            )}
            {isRecording && <span className="text-sm text-red-500 font-medium animate-pulse">Recording...</span>}
        </div>
    );
}
