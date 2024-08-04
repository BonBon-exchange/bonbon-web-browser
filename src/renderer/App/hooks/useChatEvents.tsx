import { IpcRendererEvent } from 'electron';
import { useCallback, useEffect } from 'react';

// webrtc peerconnection
const peerConnection = new window.RTCPeerConnection();
const sdpConstraints = { optional: [{ RtpDataChannels: true }] };
let webrtcDataChannel: RTCDataChannel = peerConnection.createDataChannel(
  'BonBon/public_place'
);
let webrtcOffer;

peerConnection.oniceconnectionstatechange = (e: unknown) => {
  const state = peerConnection.iceConnectionState;
  console.log('oniceconnectionstatechange', { e, state });
};

peerConnection.onicecandidate = (e) => {
  console.log('onicecandidate', { e });
};

peerConnection.ondatachannel = (e) => {
  webrtcDataChannel = e.channel;
  webrtcDataChannel.onopen = () => {
    console.log('ondatachannel/onopen/connected');
  };
  webrtcDataChannel.onmessage = function (onMessageEvent) {
    console.log('onmessage', { onMessageEvent });
  };
};

export default () => {
  const createWebrtcParticipantAction = useCallback(
    (_e: IpcRendererEvent, args: { webrtcOffer: string; username: string }) => {
      peerConnection.setRemoteDescription(
        args.webrtcOffer as unknown as RTCSessionDescriptionInit
      );
      peerConnection
        .createAnswer(sdpConstraints)
        .then((webrtcParticipant) => {
          peerConnection.setLocalDescription(webrtcParticipant);
          console.log({ webrtcParticipant });
          window.app.chat.createdWebrtcParticipant(
            webrtcParticipant as unknown as string
          );
          return true;
        })
        .catch((e: unknown) => {
          console.log({ e });
        });
    },
    []
  );

  const createWebrtcOfferAction = useCallback(async () => {
    webrtcOffer = await peerConnection.createOffer();
    window.app.chat.createdWebrtcOffer(
      JSON.stringify(webrtcOffer as unknown as string)
    );
  }, []);

  const webrtcConnectionRequestAction = useCallback(
    (_e: IpcRendererEvent, args: { webrtcParticipant: string }) => {
      console.log({ webrtcParticipant: args.webrtcParticipant });
      const answerDesc = new RTCSessionDescription(
        JSON.parse(args.webrtcParticipant)
      );
      peerConnection.setRemoteDescription(answerDesc);
    },
    []
  );

  useEffect(() => {
    window.app.listener.createWebrtcOffer(createWebrtcOfferAction);
    return () => window.app.off.createWebrtcOffer();
  }, [createWebrtcOfferAction]);

  useEffect(() => {
    window.app.listener.createWebrtcParticipant(createWebrtcParticipantAction);
    return () => window.app.off.createWebrtcParticipant();
  }, [createWebrtcParticipantAction]);

  useEffect(() => {
    window.app.listener.webrtcConnectionRequest(webrtcConnectionRequestAction);
    return () => window.app.off.webrtcConnectionRequest();
  }, [webrtcConnectionRequestAction]);
};
