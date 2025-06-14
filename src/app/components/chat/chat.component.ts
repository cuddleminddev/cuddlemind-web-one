import { CommonModule } from '@angular/common';
import { AfterViewChecked, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SocketService } from './service/socket.service';
import { AlertService } from '../../shared/components/alert/service/alert.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-chat',
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css'
})
export class ChatComponent implements AfterViewChecked, OnInit {
  @ViewChild('messagesEnd') private messagesEndRef!: ElementRef;

  chatRequests: { sessionId: string; userId: string }[] = [];
  activeRequest = '';
  selectedUser: { name: string; status: string } = { name: '', status: '' };

  sessionId = '';
  messages: any[] = [];
  newMessage = '';

  public userId = '';
  public role: 'patient' | 'consultant' = 'patient';

  constructor(
    private socketService: SocketService,
    private alertService: AlertService,

  ) { }

  ngOnInit(): void {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      this.userId = parsed.id;
      this.role = parsed.role === 'client' ? 'patient' : 'consultant';
    } else {
      this.alertService.showAlert({
        message: 'Failed to connect. Please try again.',
        type: 'error',
        autoDismiss: true,
        duration: 4000
      });
      return;
    }

    this.socketService.connect(this.userId, this.role);

    this.socketService.onMessage().subscribe(msg => {
      this.messages.push({
        type: msg.senderId === this.userId ? 'sent' : 'received',
        text: msg.message
      });
      this.scrollToBottom();
    });

    this.socketService.onChatStarted().subscribe(data => {
      this.sessionId = data.sessionId;
      this.socketService.joinSession(this.sessionId);

      if (this.role === 'patient') {
        this.selectedUser = {
          name: data.consultantName || 'Consultant',
          status: 'Online'
        };
      }
    });

    this.socketService.onChatEnded().subscribe(() => {
      this.alertService.showAlert({
        message: 'Chat session has ended.',
        type: 'info',
        autoDismiss: true,
        duration: 4000
      });

      this.messages.push({ type: 'system', text: 'Chat has ended.' });
      this.sessionId = '';
      this.selectedUser = { name: '', status: '' };
      this.activeRequest = '';
    });

    if (this.role === 'patient') {
      // this.socketService.requestChat(this.userId);
      this.socketService.onNoConsultants().subscribe(() => {
        this.alertService.showAlert({
          message: 'No Consultants Available. Please try again.',
          type: 'error',
          autoDismiss: true,
          duration: 4000
        });
      });
    }

    if (this.role === 'consultant') {
      this.socketService.onNewChatRequest().subscribe(({ sessionId, patientId }) => {
        this.chatRequests.push({ sessionId, userId: patientId });
      });
    }
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  scrollToBottom(): void {
    try {
      this.messagesEndRef.nativeElement.scrollTop = this.messagesEndRef.nativeElement.scrollHeight;
    } catch { }
  }

  sendMessage() {
    if (!this.newMessage.trim() || !this.sessionId) return;

    const payload = {
      sessionId: this.sessionId,
      senderId: this.userId,
      message: this.newMessage
    };

    this.socketService.sendMessage(payload);

    this.newMessage = '';
  }

  selectRequest(request: any) {
    this.activeRequest = request.userId;
    this.selectedUser = { name: request.userId, status: 'Online' };
    this.sessionId = request.sessionId;
    this.messages = [];

    this.socketService.acceptChat(request.sessionId, this.userId);
  }

  requestChat() {
    this.socketService.requestChat(this.userId);
  }

  endChat() {
    if (this.sessionId) {
      Swal.fire({
        title: "Are you sure?",
        text: "You want to end this session",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes",
        cancelButtonText: "No"
      }).then((result) => {
        if (result.isConfirmed) {
          
          this.socketService.endChat(this.sessionId);
          this.messages.push({ type: 'system', text: 'You ended the chat.' });

          if (this.role === 'consultant') {
            this.chatRequests = this.chatRequests.filter(req => req.sessionId !== this.sessionId);
          }
          this.sessionId = '';
          this.selectedUser = { name: '', status: '' };
          this.activeRequest = '';
        }
      });
    }
  }

}