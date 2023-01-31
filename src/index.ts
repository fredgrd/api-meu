import express, { Express } from 'express';
import http, { Server } from 'http';
import { WebSocketServer, Server as WSServer } from 'ws';
import dotenv from 'dotenv';

const app: Express = express();
const server: Server = http.createServer(app);
const wss: WSServer = new WebSocketServer({ server });
