import { CommonModule } from '@angular/common';
import { AfterViewChecked, Component, ElementRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-chat',
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css'
})
export class ChatComponent implements AfterViewChecked{
  @ViewChild('messagesEnd') private messagesEndRef!: ElementRef;
  selectedUser = {
    name: 'John Doe',
    status: 'Online'
  };

  messages = [
    { type: 'received', text: 'Hi there! How can I help you?' },
    { type: 'sent', text: 'I have a question about your service.' },
    { type: 'received', text: 'Sure! Feel free to ask.' }
  ];

  chatRequests = ['John Doe', 'Jane Smith', 'Support Team', 'Alex Johnson'];
  activeRequest = 'John Doe';

  newMessage = '';

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  scrollToBottom(): void {
    try {
      this.messagesEndRef.nativeElement.scrollTop = this.messagesEndRef.nativeElement.scrollHeight;
    } catch (err) { }
  }

  sendMessage() {
    if (this.newMessage.trim()) {
      this.messages.push({ type: 'sent', text: this.newMessage });
      this.newMessage = '';
    }
  }

  selectRequest(name: string) {
    this.activeRequest = name;
    this.selectedUser.name = name;
    this.messages = [
      { type: 'received', text: `Hello, this is ${name}.` }
    ];
  }
}
