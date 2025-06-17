import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SocketService {
  private socket!: Socket;

  constructor() { }

  connect(userId: string, role: 'consultant' | 'patient') {
    this.socket = io('https://api.cuddlemind.com/', {
      query: { userId, role }
    });

    // this.socket.on('connect', () => {
    //   console.log('Connected:', this.socket.id);
    // });

    // this.socket.on('disconnect', () => {
    //   console.log('Disconnected');
    // });
  }

  joinSession(sessionId: string) {
    this.socket.emit('joinSession', sessionId);
  }

  sendMessage(payload: {
    sessionId: string;
    senderId: string;
    senderName?: string;
    message: string;
  }) {
    this.socket.emit('send_message', payload);
  }

  onMessage(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('receive_message', data => observer.next(data));
    });
  }

  requestChat(patientId: string) {
    this.socket.emit('request_chat', { patientId });
  }

  onNoConsultants(): Observable<void> {
    return new Observable(observer => {
      this.socket.on('no_consultants_available', () => observer.next());
    });
  }

  onNewChatRequest(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('new_chat_request', data => observer.next(data));
    });
  }

  acceptChat(sessionId: string, supportId: string) {
    this.socket.emit('accept_chat', { sessionId, supportId });
  }

  onChatStarted(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('chat_started', data => observer.next(data));
    });
  }

  endChat(sessionId: string) {
    this.socket.emit('end_chat', { sessionId });
  }

  onChatEnded(): Observable<void> {
    return new Observable(observer => {
      this.socket.on('chat_ended', () => observer.next());
    });
  }

  onChatAlreadyTaken() {
    return new Observable(observer => {
      this.socket.on('chat_already_taken', data => observer.next(data));
    });
  }
}
