import { CommonModule } from '@angular/common';
import { AfterViewChecked, Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SocketService } from './service/socket.service';
import { AlertService } from '../../shared/components/alert/service/alert.service';
import Swal from 'sweetalert2';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-chat',
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css'
})
export class ChatComponent implements AfterViewChecked, OnInit {
  @ViewChild('messagesEnd') private messagesEndRef!: ElementRef;
  public showRequestsOnMobile = false;
  screenIsWide = window.innerWidth > 991;

  chatRequests: { sessionId: string; userId: string, patientName?: string, timestamp?: string }[] = [];
  activeRequest = '';
  selectedUser: { name: string; status: string; id: string } = { name: '', status: '', id: '' };
  unseenChatRequestCount = 0;
  doctorList: any[] = [];

  sessionId = '';
  messages: any[] = [];
  newMessage = '';

  public userId = '';
  public role: 'patient' | 'consultant' = 'patient';

  constructor(
    private socketService: SocketService,
    private alertService: AlertService,
    private modalService: NgbModal
  ) { }

  ngOnInit(): void {
    this.onResize()

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
          status: 'Online',
          id: data.id
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
      this.selectedUser = { name: '', status: '', id: '' };
      this.activeRequest = '';
    });

    this.socketService.onDoctorCardReceived().subscribe(data => {
      this.messages.push({
        type: 'doctor-card',
        card: data.doctor
      });
      this.scrollToBottom();
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
      this.socketService.onNewChatRequest().subscribe(({ sessionId, patientId, patientName, timestamp }) => {        
        this.chatRequests.push({ sessionId, userId: patientId, patientName, timestamp });        
        this.unseenChatRequestCount++;
      });

      this.socketService.onChatAlreadyTaken().subscribe(({ sessionId }: any) => {
        this.alertService.showAlert({
          message: 'This chat has already been taken by another consultant.',
          type: 'warning',
          autoDismiss: true,
          duration: 4000
        });

        this.chatRequests = this.chatRequests.filter(req => req.sessionId !== sessionId);
        if (this.sessionId === sessionId) {
          this.activeRequest = '';
          this.selectedUser = { name: '', status: '', id: '' };
          this.sessionId = '';
          this.messages = [];
          this.newMessage = '';
          // this.showChat = false;
        }
      });

      this.socketService.getDoctorList().subscribe((res: any) => {
        if (res.status && res.data) {
          this.doctorList = res.data;
        }
      });
    }
  }

  @HostListener('window:resize')
  onResize() {
    this.screenIsWide = window.innerWidth > 991;
    if (this.screenIsWide) {
      this.showRequestsOnMobile = false; // Auto-close requests on resize to large
    }
  }

  openChatRequests(content: any) {
    const buttonElement = document.activeElement as HTMLElement
    buttonElement.blur();

    this.unseenChatRequestCount = 0;
    this.modalService.open(content, {
      centered: true,
      scrollable: true,
      size: 'lg',
      backdrop: true,
      animation: true
    });
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
    this.selectedUser = { name: request.patientName, status: 'Online', id: request.userId };
    this.sessionId = request.sessionId;
    this.messages = [];

    this.unseenChatRequestCount = 0;
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
          this.selectedUser = { name: '', status: '', id: '' };
          this.activeRequest = '';
        }
      });
    }
  }

  toggleRequests() {
    this.showRequestsOnMobile = !this.showRequestsOnMobile;
  }

  openDoctorListModal(content: any) {
    const buttonElement = document.activeElement as HTMLElement
    buttonElement.blur();

    this.modalService.open(content, {
      centered: true,
      scrollable: true,
      size: 'lg',
      backdrop: true,
      animation: true
    });
  }

  sendDoctorCard(doct: any) {
    if (!this.sessionId || !this.userId) return;

    const doctorCard = this.doctorList.find(doc => doc.id === doct.id);
    if (!doctorCard) return;

    const payload = {
      sessionId: this.sessionId,
      patientId: this.selectedUser.id,
      doctorId: doctorCard.id
    };

    this.socketService.sendDoctorCard(payload);

    this.messages.push({
      type: 'doctor-card',
      card: doctorCard
    });
    this.scrollToBottom();
  }

}