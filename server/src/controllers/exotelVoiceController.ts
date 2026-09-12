import { Request, Response } from 'express';
import { prisma } from '../config/prisma.js';

export async function exotelVoiceGreeting(
    req: Request,
    res: Response
) {
    try {
        console.log(
            '[Exotel Voice Greeting] Method:',
            req.method
        );

        console.log(
            '[Exotel Voice Greeting] Query:',
            req.query
        );

        // --------------------------------------------------
        // 1. Support HEAD request from Exotel
        // --------------------------------------------------

        if (req.method === 'HEAD') {
            res
                .status(200)
                .type('text/plain')
                .send();

            return;
        }

        // --------------------------------------------------
        // 2. Get the REAL Exotel CallSid
        // --------------------------------------------------

        const callSid =
            typeof req.query.CallSid === 'string'
                ? req.query.CallSid.trim()
                : undefined;

        // --------------------------------------------------
        // 3. CustomField is a fallback
        // --------------------------------------------------

        const callLogId =
            typeof req.query.CustomField === 'string'
                ? req.query.CustomField.trim()
                : typeof req.query.customfield === 'string'
                    ? req.query.customfield.trim()
                    : undefined;

        console.log(
            '[Exotel Voice Greeting] Identifiers:',
            {
                callSid,
                callLogId,
            }
        );

        // --------------------------------------------------
        // 4. Find CallLog using REAL Exotel CallSid
        // --------------------------------------------------

        let callLog = null;

        if (callSid) {
            callLog =
                await prisma.callLog.findFirst({
                    where: {
                        callSid,
                    },
                });

            console.log(
                '[Exotel Voice Greeting] CallSid lookup:',
                {
                    callSid,
                    found: !!callLog,
                    callId: callLog?.callId,
                    status: callLog?.status,
                }
            );
        }

        // --------------------------------------------------
        // 5. Fallback to Recovera CallLog ID
        // --------------------------------------------------

        if (!callLog && callLogId) {
            callLog =
                await prisma.callLog.findUnique({
                    where: {
                        callId: callLogId,
                    },
                });

            console.log(
                '[Exotel Voice Greeting] CustomField lookup:',
                {
                    callLogId,
                    found: !!callLog,
                    status: callLog?.status,
                }
            );
        }

        // --------------------------------------------------
        // 6. Make sure reminder text exists
        // --------------------------------------------------

        if (!callLog || !callLog.transcription) {
            console.error(
                '[Exotel Voice Greeting] CallLog not found or reminder text missing',
                {
                    callSid,
                    callLogId,
                }
            );

            res
                .status(404)
                .type('text/plain')
                .send(
                    'Recovera appointment reminder unavailable.'
                );

            return;
        }

        // --------------------------------------------------
        // 7. Return reminder text to Exotel
        // --------------------------------------------------

        console.log(
            '[Exotel Voice Greeting] Returning reminder:',
            {
                callId: callLog.callId,
                callSid: callLog.callSid,
                patientName: callLog.patientName,
                appointmentId: callLog.appointmentId,
            }
        );

        res
            .status(200)
            .type('text/plain')
            .send(callLog.transcription);

    } catch (error) {
        console.error(
            '[Exotel Voice Greeting Error]',
            error
        );

        res
            .status(500)
            .type('text/plain')
            .send(
                'Recovera appointment reminder unavailable.'
            );
    }
}