import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';
import { environment } from '../../../../environment/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class SocketService {
  private socket!: Socket;
  private BaseUrl = `${environment.apiUrl}/users/doctors`
  private ApiUrl = `${environment.apiUrl}/chat/messages-by-sender`

  constructor(
    private http: HttpClient
  ) { }

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

  rejoinSession(sessionId: string, userId: string) {
    this.socket.emit('rejoin_session', { sessionId, userId });

    this.socket.once('rejoined_session', (payload: { sessionId: string }) => {
      console.log('✅ Rejoined session:', payload.sessionId);
    });

    this.socket.once('rejoin_error', (err) => {
      console.error('❌ Rejoin session failed:', err.message);
    });
  }


  getChatHistory() {
    return new Observable(observer => {
      this.socket.on('chat_history', data => observer.next(data));
    });
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
      this.socket.on('chat_ended', data => {
        observer.next(data)
      });
    });
  }

  onChatAlreadyTaken() {
    return new Observable(observer => {
      this.socket.on('chat_already_taken', data => observer.next(data));
    });
  }

  sendDoctorCard(payload: {
    sessionId: string;
    patientId: string;
    doctorId: any;
  }) {
    this.socket.emit('send_doctor_card', payload)
  }

  sendDoctorCardInstantbooking(payload: {
    sessionId: string;
    patientId: string;
    doctorId: any;
  }) {
    this.socket.emit('send_doctor_info', payload)
  }

  onDoctorCardReceived(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('receive_doctor_card', data => {
        observer.next(data)
      });
    });
  }

  onRequestAlreadyAccepted(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('chat_taken', data => {
        observer.next(data)
      })
    })
  }

  getDoctorList() {
    return this.http.get(`${this.BaseUrl}`)
  }

  getChatHistoryApi(){
    return this.http.get(`${this.ApiUrl}`)
  }

}
