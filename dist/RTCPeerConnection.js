"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const RTCDataChannel_1 = require("./RTCDataChannel");
const Signaling_1 = require("./Signaling");
const Logger_1 = require("./Logger");
const PreviewStreamer_1 = require("./PreviewStreamer");
const iceConnectionStates = [
    'new',
    'checking',
    'connected',
    'completed',
    'disconnected',
    'failed',
    'closed',
];
const iceGatheringStates = ['new', 'gathering', 'complete'];
const signalingStates = [
    'stable',
    'have-local-offer',
    'have-remote-offer',
    'have-local-pranswer',
    'have-remote-pranswer',
    'closed',
];
class RTCPeerConnection {
    //
    constructor(configuration) {
        this.configuration = configuration;
        //
        this.receivedTracks = new Map();
        this.signaling = new Signaling_1.Signaling(this);
        this.signaling.spawn();
        //
        if (configuration.preview) {
            const name = configuration.preview.name
                ? configuration.preview.name
                : configuration.ndi.name;
            this.preview = new PreviewStreamer_1.PreviewStreamer(configuration.preview, name);
            this.preview.spawn();
        }
        //
        this.created = this.createNativePeer();
    }
    setLocalDescription(desc) {
        return this.request('setLocalDescription', desc).then(() => {
            this.localDescription = desc;
        });
    }
    setRemoteDescription(desc) {
        return this.request('setRemoteDescription', desc).then(() => {
            this.remoteDescription = desc;
        });
    }
    async createAnswer(answer) {
        return this.request('createAnswer', answer);
    }
    createOffer(offer) {
        return this.request('createOffer', offer);
    }
    async addIceCandidate(candidate) {
        return this.request('addIceCandidate', candidate);
    }
    createDataChannel(name, config) {
        if (!this.channel) {
            this.channel = new RTCDataChannel_1.RTCDataChannel(name, this.signaling);
            this.request('createDataChannel', {
                config,
                name,
            }).catch(e => {
                this.channel._onError(e);
            });
        }
        return this.channel;
    }
    getStats() {
        // promise api
        return this.request('getStats', {});
    }
    getStatsOld(cb, err) {
        // callback api (old)
        this.request('getStatsOld', {})
            .then(stats => {
            cb(stats);
        })
            .catch(error => {
            err(error);
        });
    }
    getSenders() {
        return this.request('getSenders', {});
    }
    getReceivers() {
        return this.request('getReceivers', {});
    }
    addTrack(track) {
        JSON.stringify(track);
        this.request('addTrack', track)
            .then(() => {
            Logger_1.ndiLogger.info('Track ' + JSON.stringify(track) + ' added');
        })
            .catch(e => {
            if (this.channel) {
                this.channel._onError(e);
            }
            else {
                Logger_1.ndiLogger.error('addTrack:' + e);
            }
        });
        //
        track.replaceTrack = this.replaceTrack.bind(this);
        return track;
    }
    removeTrack(track) {
        this.request('removeTrack', {
            trackId: track.id,
        })
            .then(() => {
            Logger_1.ndiLogger.info('Track ' + JSON.stringify(track) + ' removed');
        })
            .catch(e => {
            if (this.channel) {
                this.channel._onError(e);
            }
            else {
                Logger_1.ndiLogger.error('removeTrack:' + e);
            }
        });
    }
    replaceTrack(newTrack) {
        return this.request('replaceTrack', newTrack)
            .then(() => {
            Logger_1.ndiLogger.info('Track replaced with ' + JSON.stringify(newTrack));
        })
            .catch(e => {
            if (this.channel) {
                this.channel._onError(e);
            }
            else {
                Logger_1.ndiLogger.error('replaceTrack:' + e);
            }
        });
    }
    close() {
        Logger_1.ndiLogger.info('Closing PeerConnection');
        this.signaling.destroy();
        this.signaling = null;
        //
        if (this.preview) {
            this.preview.destroy();
            this.preview = undefined;
        }
        //
        this.receivedTracks.clear();
    }
    //
    _updateIceConnectionState(state) {
        this.iceConnectionState = iceConnectionStates[state];
        if (this.oniceconnectionstatechange) {
            this.oniceconnectionstatechange();
        }
    }
    _updateIceGatheringState(state) {
        this.iceGatheringState = iceGatheringStates[state];
        if (this.onicegatheringstatechange) {
            this.onicegatheringstatechange();
        }
    }
    _updateSignalingState(state) {
        this.signalingState = signalingStates[state];
        if (this.onsignalingstatechange) {
            this.onsignalingstatechange();
        }
    }
    _onDataChannel(name) {
        if (!this.channel) {
            this.channel = new RTCDataChannel_1.RTCDataChannel(name, this.signaling);
            this.ondatachannel({ channel: this.channel });
        }
    }
    _getChannel() {
        return this.channel;
    }
    _onAddTrack(track) {
        if (this.ontrack) {
            this.ontrack(track);
        }
    }
    _onRemoveTrack(track) { }
    _onError(error) {
        if (this.channel) {
            this.channel._onError(error);
        }
    }
    //
    shouldSpawnPreview(track) {
        this.receivedTracks.set(track.id, track.streams[0].id);
        return true;
    }
    shouldDestroyPreview(track) {
        //
        let should = false;
        const stream = this.receivedTracks.get(track.id);
        this.receivedTracks.forEach((value, key) => {
            if (key !== track.id) {
                should = should || stream !== value;
            }
        });
        //
        this.receivedTracks.delete(track.id);
        //
        return this.receivedTracks.size === 0 || should;
    }
    request(command, payload) {
        return this.created.then(() => {
            return this.signaling.request(command, payload);
        });
    }
    createNativePeer() {
        const config = this.configuration;
        // update preview with ndi config from preview streamer
        if (this.preview) {
            config.preview = this.preview.getNDIConfig(this.configuration.ndi);
        }
        // send signal
        // ndiLogger.info(config);
        return this.signaling.request('createPeer', config);
    }
}
exports.RTCPeerConnection = RTCPeerConnection;
//# sourceMappingURL=RTCPeerConnection.js.map