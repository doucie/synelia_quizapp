import { Component, Input, Output, EventEmitter, ViewChild, ElementRef, AfterViewInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-rich-text-editor',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './rich-text-editor.html',
  styleUrl: './rich-text-editor.scss'
})
export class RichTextEditorComponent implements AfterViewInit, OnChanges {
  @Input() value = '';
  @Input() placeholder = '';
  @Input() variables: string[] = [];
  @Output() valueChange = new EventEmitter<string>();

  @ViewChild('editor') editorRef!: ElementRef<HTMLDivElement>;

  private internalChange = false;

  ngAfterViewInit() {
    if (this.value) {
      this.editorRef.nativeElement.innerHTML = this.value;
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['value'] && !this.internalChange && this.editorRef) {
      this.editorRef.nativeElement.innerHTML = this.value || '';
    }
    this.internalChange = false;
  }

  onInput() {
    this.internalChange = true;
    this.valueChange.emit(this.editorRef.nativeElement.innerHTML);
  }

  exec(cmd: string, value?: string) {
    this.editorRef.nativeElement.focus();
    document.execCommand(cmd, false, value);
    this.onInput();
  }

  setFontSize(event: Event) {
    const val = (event.target as HTMLSelectElement).value;
    if (val) this.exec('fontSize', val);
  }

  setForeColor(event: Event) {
    const val = (event.target as HTMLInputElement).value;
    this.exec('foreColor', val);
  }

  insertVariable(v: string) {
    this.editorRef.nativeElement.focus();
    document.execCommand('insertHTML', false, `<span class="rte-var">{{${v}}}</span>&nbsp;`);
    this.onInput();
  }
}
