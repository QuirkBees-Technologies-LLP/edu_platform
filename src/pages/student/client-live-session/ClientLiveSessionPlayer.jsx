import { LivestreamPlayer, StreamCall, StreamVideo } from '@stream-io/video-react-sdk'
import React from 'react'

const ClientLiveSessionPlayer = ({ callId, client, call }) => {
    return (
        client && (
            <StreamVideo client={client}>
                <StreamCall call={call}>
                    <LivestreamPlayer displayName="Hello guys"
                        layoutProps={{
                            showLiveBadge: true,
                            showSpeakerName: true,
                            showParticipantCount: false,
                            showDuration: true,
                            enableFullScreen: true,
                        }}
                        callType="livestream"
                        callId={callId}
                    />
                </StreamCall>
            </StreamVideo>
        )
    )
}

export default ClientLiveSessionPlayer