import WebSocket from 'ws';
import sqlite3, { Database } from 'sqlite3';
import { open } from 'sqlite'
import { ipcMain } from 'electron';
import { v4 } from 'uuid';

import { getSelectedView } from '../browser';
import { createRunner } from './runner';
import { ChatState } from 'types/chat';
import { setState } from '../../main/BonBon_Global_State';

// Setup in-memory SQLite database
let memory: Database

const makeMemoryDb = async () => {
    memory = await open({
        filename: ':memory:',
        driver: sqlite3.Database
    }) as unknown as Database

    await memory.exec(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        uuid TEXT NOT NULL,
        username TEXT NOT NULL,
        magic TEXT,
        webrtcOffer TEXT,
        registered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    )`);
}

makeMemoryDb()

const url = 'ws://echo.websocket.events/echo/BonBon/public_place';

let forProxyConnect: () => void;
const uuidv4 = v4()
const userProxy = new Proxy({ username: "", magic: "", askForMagic: true, uuid: uuidv4 }, {
    set(target, property, value) {
        if (property === 'username' && target[property] !== value) {
            const wasEmpty = target[property] === "";
            target[property] = value;
            console.log(`Username changed to: ${value}`);
            if (wasEmpty) {
                forProxyConnect();
            }
        }
        if (property === "magic") {
            target[property] = value;
            console.log(`Magic changed to: ${value}`);
        }
        return true;
    },
    get(target, property) {
        return ["username", "magic", "uuid"].includes(property.toString()) ? target[property.toString() as "username" | "magic" | "uuid"] : null;
    }
});

// const unregistrationMessage = JSON.stringify({ event: 'unregister', usr: username }); // Format your message``

const buildConnectionRequestMessage = (target: string, webrtcParticipant: string, username: string, magic: string) => JSON.stringify({ event: 'connection-request', target, webrtcParticipant, username, magic })

const setUsername = (usr: string) => {
    userProxy.username = usr
    console.log({ usr })
}

const setMagic = (mgc: string) => {
    userProxy.magic = mgc
    console.log({ mgc })
}

let ws: WebSocket;
let reconnectInterval: any;
let isConnected = false;

// Function to add a new user
const registerUser = async (usr: string, uuid: string) => {
    await makeMemoryDb()
    try {
        await memory.run("INSERT INTO users (username, uuid) VALUES (?, ?)", [usr, uuid]);
        console.log(`User ${usr} registered`);
    } catch (err: unknown) {
        console.error("Error registering user:", err);
    }
}

// Function to remove a user
const unregisterUser = async (usr: string, uuid: string) => {
    await makeMemoryDb()
    try {
        await memory.run("DELETE FROM users WHERE username = ? AND uuid = ?", [usr, uuid]);
        console.log(`User ${usr} unregistered`);
    } catch (err: unknown) {
        console.error("Error unregistering user:", err);
    }
}

// Function to list all registered users
const listUsers = async (callback: (users: Database) => any) => {
    await makeMemoryDb()
    try {
        const rows = await memory.all("SELECT * FROM users");
        callback(rows);
    } catch (err: unknown) {
        console.error("Error listing users:", err);
    }
}

const shakeHandWith = async (usr: string) => {
    await makeMemoryDb()
    await memory.all("SELECT webrtcOffer FROM users WHERE username = ?", [usr], (rows: { webrtcOffer: string }[]) => {
        getSelectedView()?.webContents.send('create-webrtc-participant', { webrtcOffer: rows[0].webrtcOffer, usr })
        ipcMain.on('created-webrtc-participants', (_event, args: { webrtcParticipant: string }) => {
            const connectionMessage = buildConnectionRequestMessage(usr, `${args.webrtcParticipant}`, userProxy.username, userProxy.magic)
            ws.send(connectionMessage);
        })
    });

}
const connect = async () => {
    if (isConnected) return;
    await makeMemoryDb()

    const reconnect = () => {
        console.log('Attempting to reconnect in 5 seconds...');
        reconnectInterval = setInterval(connect, 5000);
    }

    ws = new WebSocket(url, {
        rejectUnauthorized: false // Allow self-signed certificates if needed
    });

    ws.on('open', () => {
        console.log('Connected to echo server');
        getSelectedView()?.webContents.send('create-webrtc-offer')

        ipcMain.on('created-webrtc-offer', (_event, webrtcOffer: string) => {
            const registrationMessage = JSON.stringify({ event: 'register', usr: userProxy.username, webrtcOffer: webrtcOffer, uuid: userProxy.uuid }); // Format your message
            ws.send(registrationMessage);
            clearInterval(reconnectInterval); // Clear reconnect interval if connected
            isConnected = true;
            registerUser(userProxy.username, userProxy.uuid);
        });
    });

    ws.on('message', async (message) => {
        console.log('Received echo:', message.toString());

        try {
            const parsedMessage = JSON.parse(message.toString());
            if (parsedMessage.event === 'register') {
                const { usr, uuid } = parsedMessage;
                await registerUser(usr, uuid);
            } else if (parsedMessage.event === 'unregister') {
                const { usr, uuid } = parsedMessage;
                await unregisterUser(usr, uuid);
            } else if (parsedMessage.event === 'connection-request' && parsedMessage.target === userProxy.username && parsedMessage.username && parsedMessage.magic) {
                if (parsedMessage.magic === userProxy.magic && parsedMessage.username === userProxy.username) {
                    getSelectedView()?.webContents.send('connection-request', { webrtcParticipant: parsedMessage.webrtcParticipant })
                } else {
                    getSelectedView()?.webContents.send('unauthorized-attempt-to-contact-you', { ...parsedMessage })
                }
            }
        } catch (error) {
            console.error("Error processing message:", error);
        }
    });

    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        isConnected = false;
        reconnect(); // Attempt to reconnect on error
    });

    ws.on('close', (code, reason) => {
        console.log('WebSocket closed:', code, reason);
        isConnected = false;
        unregisterUser(userProxy.username, userProxy.uuid);
        reconnect(); // Attempt to reconnect on close
    });
}

forProxyConnect = connect

const initChat = () => {
    // connect();
}

const endChat = () => {
    // ws.send(unregistrationMessage);
    // ws.close();
}

const setChatState = (state: ChatState) => {
    setState('chat', state)
}

// Export the listUsers function for external usage
export { listUsers, initChat, endChat, shakeHandWith, setUsername, setMagic, createRunner, setChatState };
