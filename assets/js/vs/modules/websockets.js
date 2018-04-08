---
layout: compress-js
---
VS.WebSocket = (function() {
    var ws = {};

    var socket,
        host = (location.protocol === 'https:' ? 'wss://' : 'ws://') + location.hostname + ':4001';

    var log = (function() {
        var element = document.getElementById('ws-log');

        return function(msg) {
            element.innerHTML = msg;
        };
    })();

    log('Not connected');

    function addControlCallbacks() {
        if (VS.control) {
            VS.control.playCallback = function() {
                VS.WebSocket.send(['vs', 'play', VS.score.pointer]);
            };
            VS.control.pauseCallback = function() {
                VS.WebSocket.send(['vs', 'pause', VS.score.pointer]);
            };
            VS.control.stopCallback = function() {
                VS.WebSocket.send(['vs', 'stop']);
            };
            VS.control.stepCallback = function() {
                VS.WebSocket.send(['vs', 'step', VS.score.pointer]);
            };
        }
    }

    ws.messageCallback = VS.noop;
    ws.playCallback = VS.noop;
    ws.pauseCallback = VS.noop;
    ws.stopCallback = VS.noop;
    ws.stepCallback = VS.noop;

    function handleWebSocketMsg(data) {
        var cid = data[0];
        var content = data[2];

        if (content === 'connected') {
            ws.cid = cid;
        } else if (content === 'connections') {
            log('Open, ' + data[3] + ' connection(s) total');
        } else if (content === 'reload') {
            window.location.reload(true);
        }
    }

    function handleVectorscoresMsg(data) {
        var content = data[2];

        switch (content) {
            case 'play':
                VS.score.play();
                ws.playCallback();
                break;
            case 'pause':
                VS.score.pause();
                ws.pauseCallback();
                break;
            case 'stop':
                VS.score.stop();
                ws.stopCallback();
                break;
            case 'step':
                VS.score.updatePointer(data[3]);
                VS.control.updateStepButtons();
                ws.stepCallback();
                break;
        }
    }

    ws.connect = function() {
        try {
            socket = new WebSocket(host);

            socket.onopen = function() {
                log('Open');
                addControlCallbacks();
            };

            socket.onclose = function(e) {
                if (e.code === 3001) {
                    log('Closed');
                } else {
                    log('Not connected');
                }
            };

            socket.onmessage = function(msg) {
                try {
                    var data = JSON.parse(msg.data);
                    var cid = data[0];
                    var type = data[1];

                    // WebSockets messages
                    if (type === 'ws') {
                        handleWebSocketMsg(data);
                    }

                    // vectorscores messages, only handle if not sent by self
                    if (type === 'vs' && cid !== ws.cid) {
                        handleVectorscoresMsg(data);
                    }

                    ws.messageCallback(data);
                }
                catch (err) {
                    log('Receive error: ' + err);
                }
            };

        } catch (err) {
            log('Connection error: ' + err);
        }
    };

    ws.send = function(data) {
        // attach client ID to all
        data.unshift(ws.cid);

        try {
            socket.send(JSON.stringify(data));
        } catch (err) {
            log('Send error: ' + err);
        }
    };

    return ws;
})();