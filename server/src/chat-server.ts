import { createServer, Server } from 'http';
import * as express from 'express';
import * as SocketIO from 'socket.io';


export class ChatServer {
    public static readonly PORT:number = 8080;
    private app: express.Application;
    private server: Server;
    private io: SocketIO.Server;
    private port: string | number;
    private messages: any[] = [];

    constructor() {
        this.createApp();
        this.config();
        this.createServer();
        this.sockets();
        this.listen();
    }

    private createApp(): void {
        this.app = express();
    }

    private createServer(): void {
        this.server = createServer(this.app);
    }

    private config(): void {
        this.port = process.env.PORT || ChatServer.PORT;
    }

    private sockets(): void {
        this.io = SocketIO(this.server);
    }

    private listen(): void {
        this.server.listen(this.port, () => {
            console.log('Running server on port %s', this.port);
        });

        this.io.on('connect', socket => {
            console.log('Connected client on port %s.', this.port);
            this.messages.forEach(msg => {
            	socket.emit('message', msg);
			});
            socket.on('message', message => {
                console.log('[server](message): %s', JSON.stringify(message));
                if (this.messages.length >= 10){
                	this.messages.splice(0,1).push(message);
                } else this.messages.push(message);

                this.io.emit('message', message);
            });

            socket.on('disconnect', () => {
                console.log('Client disconnected');
            });
        });
    }

    public getApp(): express.Application {
        return this.app;
    }
}
