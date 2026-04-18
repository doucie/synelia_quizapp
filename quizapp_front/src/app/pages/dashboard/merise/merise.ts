import { Component, signal, computed, OnInit, ElementRef, ViewChild, AfterViewInit, ChangeDetectionStrategy, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DOCUMENT } from '@angular/common';

// ── Interfaces ──────────────────────────────────────────────

interface Column {
  name: string;
  type: string;
  pk?: boolean;
  fk?: boolean;
  fkTarget?: string; // table name
  nullable?: boolean;
}

interface TableDef {
  name: string;
  displayName: string;
  columns: Column[];
  color: string;
  x: number;
  y: number;
}

interface Relationship {
  from: string;
  fromColumn: string;
  to: string;
  toColumn: string;
  cardinality: string; // ex: "N,1" or "1,N"
  label: string;
}

// ── Component ───────────────────────────────────────────────

@Component({
  selector: 'app-merise',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './merise.html',
  styleUrls: ['./merise.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MeriseComponent implements OnInit, AfterViewInit {
  @ViewChild('svgContainer', { static: false }) svgContainer!: ElementRef<SVGSVGElement>;

  private document = inject(DOCUMENT);
  private hostEl = inject(ElementRef);

  // ── State ──
  zoom = signal(0.55);
  panX = signal(0);
  panY = signal(0);
  searchTerm = signal('');
  selectedTable = signal<string | null>(null);
  showCommonColumns = signal(false);
  scrollZoomEnabled = signal(true);
  isFullscreen = signal(false);

  private isPanning = false;
  private panStartX = 0;
  private panStartY = 0;

  // Common columns present in all tables (hidden by default)
  private commonColumns = ['created_at', 'created_by', 'updated_at', 'updated_by', 'is_deleted', 'search_string'];

  // ── Tables ──
  tables: TableDef[] = [
    {
      name: 'user', displayName: 'User', color: '#3B82F6', x: 50, y: 50,
      columns: [
        { name: 'id', type: 'INT UNSIGNED', pk: true },
        { name: 'first_name', type: 'VARCHAR(100)' },
        { name: 'last_name', type: 'VARCHAR(500)' },
        { name: 'username', type: 'VARCHAR(50)' },
        { name: 'email', type: 'VARCHAR(255)' },
        { name: 'phone', type: 'VARCHAR(20)', nullable: true },
        { name: 'password', type: 'VARCHAR(255)' },
        { name: 'is_default_password', type: 'BIT', nullable: true },
        { name: 'user_role', type: 'VARCHAR(9)', nullable: true },
        { name: 'is_online', type: 'BIT', nullable: true },
        { name: 'is_locked', type: 'BIT', nullable: true },
        { name: 'last_connection_date', type: 'DATETIME', nullable: true },
        { name: 'admin_mode', type: 'BIT' },
        { name: 'page_size_preference', type: 'INT' },
        { name: 'created_at', type: 'DATETIME' }, { name: 'created_by', type: 'INT UNSIGNED', nullable: true },
        { name: 'updated_at', type: 'DATETIME' }, { name: 'updated_by', type: 'INT UNSIGNED', nullable: true },
        { name: 'is_deleted', type: 'BIT' }, { name: 'search_string', type: 'TEXT', nullable: true },
      ]
    },
    {
      name: 'departments', displayName: 'Departments', color: '#6366F1', x: 50, y: 620,
      columns: [
        { name: 'id', type: 'INT UNSIGNED', pk: true },
        { name: 'department_name', type: 'VARCHAR(255)' },
        { name: 'department_desc', type: 'TEXT', nullable: true },
        { name: 'created_at', type: 'DATETIME' }, { name: 'created_by', type: 'INT UNSIGNED', nullable: true },
        { name: 'updated_at', type: 'DATETIME' }, { name: 'updated_by', type: 'INT UNSIGNED', nullable: true },
        { name: 'is_deleted', type: 'BIT' }, { name: 'search_string', type: 'TEXT', nullable: true },
      ]
    },
    {
      name: 'specialities', displayName: 'Specialities', color: '#8B5CF6', x: 50, y: 870,
      columns: [
        { name: 'id', type: 'INT UNSIGNED', pk: true },
        { name: 'department_id', type: 'INT UNSIGNED', fk: true, fkTarget: 'departments' },
        { name: 'speciality_name', type: 'VARCHAR(255)' },
        { name: 'speciality_desc', type: 'TEXT', nullable: true },
        { name: 'created_at', type: 'DATETIME' }, { name: 'created_by', type: 'INT UNSIGNED', nullable: true },
        { name: 'updated_at', type: 'DATETIME' }, { name: 'updated_by', type: 'INT UNSIGNED', nullable: true },
        { name: 'is_deleted', type: 'BIT' }, { name: 'search_string', type: 'TEXT', nullable: true },
      ]
    },
    {
      name: 'campaigns', displayName: 'Campaigns', color: '#EF4444', x: 450, y: 50,
      columns: [
        { name: 'id', type: 'INT UNSIGNED', pk: true },
        { name: 'creator_id', type: 'INT UNSIGNED', fk: true, fkTarget: 'user' },
        { name: 'speciality_id', type: 'INT UNSIGNED', fk: true, fkTarget: 'specialities', nullable: true },
        { name: 'campaign_title', type: 'VARCHAR(255)' },
        { name: 'campaign_desc', type: 'TEXT', nullable: true },
        { name: 'campaign_status', type: 'VARCHAR(7)' },
        { name: 'campaign_start', type: 'DATETIME', nullable: true },
        { name: 'campaign_end', type: 'DATETIME', nullable: true },
        { name: 'max_apply', type: 'INT', nullable: true },
        { name: 'all_can_evaluate', type: 'BIT' },
        { name: 'total_questions', type: 'INT', nullable: true },
        { name: 'is_timed', type: 'BIT' },
        { name: 'created_at', type: 'DATETIME' }, { name: 'created_by', type: 'INT UNSIGNED', nullable: true },
        { name: 'updated_at', type: 'DATETIME' }, { name: 'updated_by', type: 'INT UNSIGNED', nullable: true },
        { name: 'is_deleted', type: 'BIT' }, { name: 'search_string', type: 'TEXT', nullable: true },
      ]
    },
    {
      name: 'campaign_crud', displayName: 'CampaignCrud', color: '#F97316', x: 450, y: 570,
      columns: [
        { name: 'id', type: 'INT UNSIGNED', pk: true },
        { name: 'user_id', type: 'INT UNSIGNED', fk: true, fkTarget: 'user' },
        { name: 'campaign_id', type: 'INT UNSIGNED', fk: true, fkTarget: 'campaigns' },
        { name: 'can_update', type: 'BIT', nullable: true },
        { name: 'can_delete', type: 'BIT', nullable: true },
        { name: 'can_evaluate', type: 'BIT', nullable: true },
        { name: 'follow', type: 'BIT', nullable: true },
        { name: 'is_admin', type: 'BIT', nullable: true },
        { name: 'is_creator', type: 'BIT', nullable: true },
        { name: 'can_planify', type: 'BIT', nullable: true },
        { name: 'can_accept_pre_screen', type: 'BIT', nullable: true },
        { name: 'can_accept_final', type: 'BIT', nullable: true },
        { name: 'created_at', type: 'DATETIME' }, { name: 'created_by', type: 'INT UNSIGNED', nullable: true },
        { name: 'updated_at', type: 'DATETIME' }, { name: 'updated_by', type: 'INT UNSIGNED', nullable: true },
        { name: 'is_deleted', type: 'BIT' }, { name: 'search_string', type: 'TEXT', nullable: true },
      ]
    },
    {
      name: 'questions', displayName: 'Questions', color: '#84CC16', x: 50, y: 1120,
      columns: [
        { name: 'id', type: 'INT UNSIGNED', pk: true },
        { name: 'speciality_id', type: 'INT UNSIGNED', fk: true, fkTarget: 'specialities', nullable: true },
        { name: 'question_content', type: 'TEXT' },
        { name: 'question_chrono', type: 'INT', nullable: true },
        { name: 'question_type', type: 'ENUM', nullable: true },
        { name: 'created_at', type: 'DATETIME' }, { name: 'created_by', type: 'INT UNSIGNED', nullable: true },
        { name: 'updated_at', type: 'DATETIME' }, { name: 'updated_by', type: 'INT UNSIGNED', nullable: true },
        { name: 'is_deleted', type: 'BIT' }, { name: 'search_string', type: 'TEXT', nullable: true },
      ]
    },
    {
      name: 'answers', displayName: 'Answers', color: '#10B981', x: 50, y: 1420,
      columns: [
        { name: 'id', type: 'INT UNSIGNED', pk: true },
        { name: 'question_id', type: 'INT UNSIGNED', fk: true, fkTarget: 'questions' },
        { name: 'answer_content', type: 'TEXT' },
        { name: 'is_correct', type: 'BIT', nullable: true },
        { name: 'answer_order', type: 'INT', nullable: true },
        { name: 'answer_type', type: 'ENUM', nullable: true },
        { name: 'created_at', type: 'DATETIME' }, { name: 'created_by', type: 'INT UNSIGNED', nullable: true },
        { name: 'updated_at', type: 'DATETIME' }, { name: 'updated_by', type: 'INT UNSIGNED', nullable: true },
        { name: 'is_deleted', type: 'BIT' }, { name: 'search_string', type: 'TEXT', nullable: true },
      ]
    },
    {
      name: 'campaign_questions', displayName: 'CampaignQuestions', color: '#F59E0B', x: 450, y: 920,
      columns: [
        { name: 'id', type: 'INT UNSIGNED', pk: true },
        { name: 'question_id', type: 'INT UNSIGNED', fk: true, fkTarget: 'questions' },
        { name: 'campaign_id', type: 'INT UNSIGNED', fk: true, fkTarget: 'campaigns' },
        { name: 'order', type: 'INT' },
        { name: 'chrono', type: 'INT' },
        { name: 'created_at', type: 'DATETIME' }, { name: 'created_by', type: 'INT UNSIGNED', nullable: true },
        { name: 'updated_at', type: 'DATETIME' }, { name: 'updated_by', type: 'INT UNSIGNED', nullable: true },
        { name: 'is_deleted', type: 'BIT' }, { name: 'search_string', type: 'TEXT', nullable: true },
      ]
    },
    {
      name: 'source_token', displayName: 'SourceToken', color: '#14B8A6', x: 900, y: 50,
      columns: [
        { name: 'id', type: 'INT UNSIGNED', pk: true },
        { name: 'campaign_id', type: 'INT UNSIGNED', fk: true, fkTarget: 'campaigns' },
        { name: 'token_string', type: 'VARCHAR(6)' },
        { name: 'source_token_name', type: 'VARCHAR(100)', nullable: true },
        { name: 'expiration_date', type: 'DATETIME', nullable: true },
        { name: 'created_at', type: 'DATETIME' }, { name: 'created_by', type: 'INT UNSIGNED', nullable: true },
        { name: 'updated_at', type: 'DATETIME' }, { name: 'updated_by', type: 'INT UNSIGNED', nullable: true },
        { name: 'is_deleted', type: 'BIT' }, { name: 'search_string', type: 'TEXT', nullable: true },
      ]
    },
    {
      name: 'applications', displayName: 'Applications', color: '#A855F7', x: 900, y: 330,
      columns: [
        { name: 'id', type: 'INT UNSIGNED', pk: true },
        { name: 'source_token_id', type: 'INT UNSIGNED', fk: true, fkTarget: 'source_token', nullable: true },
        { name: 'candidate_first_name', type: 'VARCHAR(100)' },
        { name: 'candidate_last_name', type: 'VARCHAR(100)' },
        { name: 'candidate_email', type: 'VARCHAR(255)' },
        { name: 'candidate_phone', type: 'VARCHAR(20)', nullable: true },
        { name: 'candidate_cv_path', type: 'VARCHAR(1000)', nullable: true },
        { name: 'candidate_birth_date', type: 'DATE', nullable: true },
        { name: 'motivation_letter', type: 'TEXT', nullable: true },
        { name: 'email_verified', type: 'BIT' },
        { name: 'quiz_score', type: 'INT', nullable: true },
        { name: 'quiz_score_percent', type: 'INT', nullable: true },
        { name: 'quiz_level', type: 'INT', nullable: true },
        { name: 'total_questions', type: 'INT', nullable: true },
        { name: 'quiz_token', type: 'VARCHAR(64)', nullable: true },
        { name: 'quiz_status', type: 'VARCHAR(9)' },
        { name: 'time_elapsed', type: 'INT', nullable: true },
        { name: 'application_status', type: 'VARCHAR(8)', nullable: true },
        { name: 'application_abandoned', type: 'BIT', nullable: true },
        { name: 'visit_token', type: 'VARCHAR(255)', nullable: true },
        { name: 'total_evaluation_score', type: 'FLOAT', nullable: true },
        { name: 'total_evaluation_number', type: 'INT', nullable: true },
        { name: 'total_evaluation_percentage', type: 'DOUBLE', nullable: true },
        { name: 'interview_date', type: 'DATETIME', nullable: true },
        { name: 'interview_status', type: 'VARCHAR(20)', nullable: true },
        { name: 'pre_screen_decision_mail_sent', type: 'BIT', nullable: true },
        { name: 'final_decision_mail_sent', type: 'BIT', nullable: true },
        { name: 'created_at', type: 'DATETIME' }, { name: 'created_by', type: 'INT UNSIGNED', nullable: true },
        { name: 'updated_at', type: 'DATETIME' }, { name: 'updated_by', type: 'INT UNSIGNED', nullable: true },
        { name: 'is_deleted', type: 'BIT' }, { name: 'search_string', type: 'TEXT', nullable: true },
      ]
    },
    {
      name: 'candidate_token', displayName: 'CandidateToken', color: '#06B6D4', x: 1400, y: 50,
      columns: [
        { name: 'id', type: 'INT UNSIGNED', pk: true },
        { name: 'application_id', type: 'INT UNSIGNED', fk: true, fkTarget: 'applications' },
        { name: 'token_string', type: 'VARCHAR(6)', nullable: true },
        { name: 'created_at', type: 'DATETIME' }, { name: 'created_by', type: 'INT UNSIGNED', nullable: true },
        { name: 'updated_at', type: 'DATETIME' }, { name: 'updated_by', type: 'INT UNSIGNED', nullable: true },
        { name: 'is_deleted', type: 'BIT' }, { name: 'search_string', type: 'TEXT', nullable: true },
      ]
    },
    {
      name: 'candidate_ask', displayName: 'CandidateAsk', color: '#EC4899', x: 1400, y: 300,
      columns: [
        { name: 'id', type: 'INT UNSIGNED', pk: true },
        { name: 'application_id', type: 'INT UNSIGNED', fk: true, fkTarget: 'applications' },
        { name: 'request_type', type: 'VARCHAR(10)', nullable: true },
        { name: 'is_verified', type: 'BIT' },
        { name: 'first_name', type: 'VARCHAR(100)', nullable: true },
        { name: 'last_name', type: 'VARCHAR(100)', nullable: true },
        { name: 'new_email', type: 'VARCHAR(255)', nullable: true },
        { name: 'new_phone', type: 'VARCHAR(20)', nullable: true },
        { name: 'created_at', type: 'DATETIME' }, { name: 'created_by', type: 'INT UNSIGNED', nullable: true },
        { name: 'updated_at', type: 'DATETIME' }, { name: 'updated_by', type: 'INT UNSIGNED', nullable: true },
        { name: 'is_deleted', type: 'BIT' }, { name: 'search_string', type: 'TEXT', nullable: true },
      ]
    },
    {
      name: 'candidate_answers', displayName: 'CandidateAnswers', color: '#F43F5E', x: 450, y: 1200,
      columns: [
        { name: 'id', type: 'INT UNSIGNED', pk: true },
        { name: 'application_id', type: 'INT UNSIGNED', fk: true, fkTarget: 'applications' },
        { name: 'answer_id', type: 'INT UNSIGNED', fk: true, fkTarget: 'answers' },
        { name: 'is_selected', type: 'BIT' },
        { name: 'created_at', type: 'DATETIME' }, { name: 'created_by', type: 'INT UNSIGNED', nullable: true },
        { name: 'updated_at', type: 'DATETIME' }, { name: 'updated_by', type: 'INT UNSIGNED', nullable: true },
        { name: 'is_deleted', type: 'BIT' }, { name: 'search_string', type: 'TEXT', nullable: true },
      ]
    },
    {
      name: 'interviews', displayName: 'Interviews', color: '#F59E0B', x: 1400, y: 560,
      columns: [
        { name: 'id', type: 'INT UNSIGNED', pk: true },
        { name: 'campaign_id', type: 'INT UNSIGNED', fk: true, fkTarget: 'campaigns' },
        { name: 'application_id', type: 'INT UNSIGNED', fk: true, fkTarget: 'applications' },
        { name: 'interview_location', type: 'VARCHAR(255)', nullable: true },
        { name: 'interview_date', type: 'DATETIME' },
        { name: 'interview_status', type: 'VARCHAR(20)' },
        { name: 'meet_link', type: 'VARCHAR(500)', nullable: true },
        { name: 'interview_evaluations_link', type: 'VARCHAR(8)', nullable: true },
        { name: 'interview_note', type: 'TEXT', nullable: true },
        { name: 'interview_mail_sent', type: 'BIT' },
        { name: 'interview_type', type: 'VARCHAR(20)' },
        { name: 'started_at', type: 'DATETIME', nullable: true },
        { name: 'ended_at', type: 'DATETIME', nullable: true },
        { name: 'evaluation_score', type: 'INT', nullable: true },
        { name: 'evaluation_number', type: 'INT', nullable: true },
        { name: 'evaluation_percentage', type: 'DOUBLE', nullable: true },
        { name: 'created_at', type: 'DATETIME' }, { name: 'created_by', type: 'INT UNSIGNED', nullable: true },
        { name: 'updated_at', type: 'DATETIME' }, { name: 'updated_by', type: 'INT UNSIGNED', nullable: true },
        { name: 'is_deleted', type: 'BIT' }, { name: 'search_string', type: 'TEXT', nullable: true },
      ]
    },
    {
      name: 'interview_participant', displayName: 'InterviewParticipant', color: '#D97706', x: 1400, y: 1000,
      columns: [
        { name: 'id', type: 'INT UNSIGNED', pk: true },
        { name: 'user_id', type: 'INT UNSIGNED', fk: true, fkTarget: 'user' },
        { name: 'interview_id', type: 'INT UNSIGNED', fk: true, fkTarget: 'interviews' },
        { name: 'can_update', type: 'BIT', nullable: true },
        { name: 'can_delete', type: 'BIT', nullable: true },
        { name: 'can_evaluate', type: 'BIT', nullable: true },
        { name: 'is_admin', type: 'BIT' },
        { name: 'follow', type: 'BIT', nullable: true },
        { name: 'is_online', type: 'BIT', nullable: true },
        { name: 'has_finished', type: 'BIT', nullable: true },
        { name: 'last_ping_at', type: 'DATETIME', nullable: true },
        { name: 'created_at', type: 'DATETIME' }, { name: 'created_by', type: 'INT UNSIGNED', nullable: true },
        { name: 'updated_at', type: 'DATETIME' }, { name: 'updated_by', type: 'INT UNSIGNED', nullable: true },
        { name: 'is_deleted', type: 'BIT' }, { name: 'search_string', type: 'TEXT', nullable: true },
      ]
    },
    {
      name: 'candidate_interview', displayName: 'CandidateInterview', color: '#0EA5E9', x: 1400, y: 1340,
      columns: [
        { name: 'id', type: 'INT UNSIGNED', pk: true },
        { name: 'application_id', type: 'INT UNSIGNED', fk: true, fkTarget: 'applications' },
        { name: 'interview_id', type: 'INT UNSIGNED', fk: true, fkTarget: 'interviews' },
        { name: 'interview_start', type: 'DATETIME', nullable: true },
        { name: 'interview_duration', type: 'INT', nullable: true },
        { name: 'created_at', type: 'DATETIME' }, { name: 'created_by', type: 'INT UNSIGNED', nullable: true },
        { name: 'updated_at', type: 'DATETIME' }, { name: 'updated_by', type: 'INT UNSIGNED', nullable: true },
        { name: 'is_deleted', type: 'BIT' }, { name: 'search_string', type: 'TEXT', nullable: true },
      ]
    },
    {
      name: 'evaluations', displayName: 'Evaluations', color: '#06B6D4', x: 1750, y: 1340,
      columns: [
        { name: 'id', type: 'INT UNSIGNED', pk: true },
        { name: 'candidate_interview_id', type: 'INT UNSIGNED', fk: true, fkTarget: 'candidate_interview' },
        { name: 'candidate_mark', type: 'INT', nullable: true },
        { name: 'recruiter_comment', type: 'TEXT', nullable: true },
        { name: 'created_at', type: 'DATETIME' }, { name: 'created_by', type: 'INT UNSIGNED', nullable: true },
        { name: 'updated_at', type: 'DATETIME' }, { name: 'updated_by', type: 'INT UNSIGNED', nullable: true },
        { name: 'is_deleted', type: 'BIT' }, { name: 'search_string', type: 'TEXT', nullable: true },
      ]
    },
    {
      name: 'notifications', displayName: 'Notifications', color: '#78716C', x: 1750, y: 50,
      columns: [
        { name: 'id', type: 'INT UNSIGNED', pk: true },
        { name: 'user_id', type: 'INT UNSIGNED', fk: true, fkTarget: 'user' },
        { name: 'notif_type', type: 'VARCHAR(100)', nullable: true },
        { name: 'notif_actor', type: 'INT', nullable: true },
        { name: 'notif_link', type: 'VARCHAR(255)', nullable: true },
        { name: 'is_read', type: 'BIT', nullable: true },
        { name: 'object_table_name', type: 'VARCHAR(100)', nullable: true },
        { name: 'object_table_id', type: 'INT', nullable: true },
        { name: 'created_at', type: 'DATETIME' }, { name: 'created_by', type: 'INT UNSIGNED', nullable: true },
        { name: 'updated_at', type: 'DATETIME' }, { name: 'updated_by', type: 'INT UNSIGNED', nullable: true },
        { name: 'is_deleted', type: 'BIT' }, { name: 'search_string', type: 'TEXT', nullable: true },
      ]
    },
    {
      name: 'decisions', displayName: 'Decisions', color: '#BE185D', x: 900, y: 900,
      columns: [
        { name: 'id', type: 'INT UNSIGNED', pk: true },
        { name: 'application_id', type: 'INT UNSIGNED', fk: true, fkTarget: 'applications' },
        { name: 'user_id', type: 'INT UNSIGNED', fk: true, fkTarget: 'user' },
        { name: 'decision_type', type: 'VARCHAR(50)' },
        { name: 'is_cancel', type: 'BIT' },
        { name: 'created_at', type: 'DATETIME' }, { name: 'created_by', type: 'INT UNSIGNED', nullable: true },
        { name: 'updated_at', type: 'DATETIME' }, { name: 'updated_by', type: 'INT UNSIGNED', nullable: true },
        { name: 'is_deleted', type: 'BIT' }, { name: 'search_string', type: 'TEXT', nullable: true },
      ]
    },
    {
      name: 'email_verification_tokens', displayName: 'EmailVerificationTokens', color: '#7C3AED', x: 1750, y: 500,
      columns: [
        { name: 'id', type: 'INT UNSIGNED', pk: true },
        { name: 'application_id', type: 'INT UNSIGNED', fk: true, fkTarget: 'applications', nullable: true },
        { name: 'user_id', type: 'INT UNSIGNED', fk: true, fkTarget: 'user', nullable: true },
        { name: 'email', type: 'VARCHAR(255)' },
        { name: 'token', type: 'VARCHAR(255)' },
        { name: 'token_type', type: 'ENUM' },
        { name: 'expires_at', type: 'DATETIME' },
        { name: 'is_used', type: 'BIT' },
        { name: 'created_at', type: 'DATETIME' },
        { name: 'used_at', type: 'DATETIME', nullable: true },
      ]
    },
  ];

  // ── Relationships ──
  relationships: Relationship[] = [
    { from: 'specialities', fromColumn: 'department_id', to: 'departments', toColumn: 'id', cardinality: 'N,1', label: 'appartient à' },
    { from: 'campaigns', fromColumn: 'creator_id', to: 'user', toColumn: 'id', cardinality: 'N,1', label: 'créée par' },
    { from: 'campaigns', fromColumn: 'speciality_id', to: 'specialities', toColumn: 'id', cardinality: 'N,1', label: 'spécialité' },
    { from: 'campaign_crud', fromColumn: 'user_id', to: 'user', toColumn: 'id', cardinality: 'N,1', label: 'utilisateur' },
    { from: 'campaign_crud', fromColumn: 'campaign_id', to: 'campaigns', toColumn: 'id', cardinality: 'N,1', label: 'campagne' },
    { from: 'campaign_questions', fromColumn: 'question_id', to: 'questions', toColumn: 'id', cardinality: 'N,1', label: 'question' },
    { from: 'campaign_questions', fromColumn: 'campaign_id', to: 'campaigns', toColumn: 'id', cardinality: 'N,1', label: 'campagne' },
    { from: 'questions', fromColumn: 'speciality_id', to: 'specialities', toColumn: 'id', cardinality: 'N,1', label: 'spécialité' },
    { from: 'answers', fromColumn: 'question_id', to: 'questions', toColumn: 'id', cardinality: 'N,1', label: 'question' },
    { from: 'source_token', fromColumn: 'campaign_id', to: 'campaigns', toColumn: 'id', cardinality: 'N,1', label: 'campagne' },
    { from: 'applications', fromColumn: 'source_token_id', to: 'source_token', toColumn: 'id', cardinality: 'N,1', label: 'source' },
    { from: 'candidate_token', fromColumn: 'application_id', to: 'applications', toColumn: 'id', cardinality: 'N,1', label: 'candidature' },
    { from: 'candidate_ask', fromColumn: 'application_id', to: 'applications', toColumn: 'id', cardinality: 'N,1', label: 'candidature' },
    { from: 'candidate_answers', fromColumn: 'application_id', to: 'applications', toColumn: 'id', cardinality: 'N,1', label: 'candidature' },
    { from: 'candidate_answers', fromColumn: 'answer_id', to: 'answers', toColumn: 'id', cardinality: 'N,1', label: 'réponse' },
    { from: 'interviews', fromColumn: 'campaign_id', to: 'campaigns', toColumn: 'id', cardinality: 'N,1', label: 'campagne' },
    { from: 'interviews', fromColumn: 'application_id', to: 'applications', toColumn: 'id', cardinality: 'N,1', label: 'candidature' },
    { from: 'interview_participant', fromColumn: 'user_id', to: 'user', toColumn: 'id', cardinality: 'N,1', label: 'utilisateur' },
    { from: 'interview_participant', fromColumn: 'interview_id', to: 'interviews', toColumn: 'id', cardinality: 'N,1', label: 'entretien' },
    { from: 'candidate_interview', fromColumn: 'application_id', to: 'applications', toColumn: 'id', cardinality: 'N,1', label: 'candidature' },
    { from: 'candidate_interview', fromColumn: 'interview_id', to: 'interviews', toColumn: 'id', cardinality: 'N,1', label: 'entretien' },
    { from: 'evaluations', fromColumn: 'candidate_interview_id', to: 'candidate_interview', toColumn: 'id', cardinality: 'N,1', label: 'entretien candidat' },
    { from: 'decisions', fromColumn: 'application_id', to: 'applications', toColumn: 'id', cardinality: 'N,1', label: 'candidature' },
    { from: 'decisions', fromColumn: 'user_id', to: 'user', toColumn: 'id', cardinality: 'N,1', label: 'décideur' },
    { from: 'notifications', fromColumn: 'user_id', to: 'user', toColumn: 'id', cardinality: 'N,1', label: 'utilisateur' },
    { from: 'email_verification_tokens', fromColumn: 'application_id', to: 'applications', toColumn: 'id', cardinality: 'N,1', label: 'candidature' },
    { from: 'email_verification_tokens', fromColumn: 'user_id', to: 'user', toColumn: 'id', cardinality: 'N,1', label: 'utilisateur' },
  ];

  // ── Computed ──
  filteredTables = computed(() => {
    const term = this.searchTerm().toLowerCase();
    if (!term) return this.tables;
    return this.tables.filter(t =>
      t.name.toLowerCase().includes(term) ||
      t.displayName.toLowerCase().includes(term) ||
      t.columns.some(c => c.name.toLowerCase().includes(term))
    );
  });

  visibleColumns = computed(() => {
    const show = this.showCommonColumns();
    return (columns: Column[]) =>
      show ? columns : columns.filter(c => !this.commonColumns.includes(c.name));
  });

  stats = computed(() => {
    const totalTables = this.tables.length;
    const totalColumns = this.tables.reduce((sum, t) => sum + t.columns.length, 0);
    const totalFKs = this.relationships.length;
    return { totalTables, totalColumns, totalFKs };
  });

  // ── Lifecycle ──
  ngOnInit(): void {
    this.computeLayout();
  }

  ngAfterViewInit(): void {}

  @HostListener('document:fullscreenchange')
  onFullscreenChange(): void {
    this.isFullscreen.set(!!this.document.fullscreenElement);
  }

  // ── Pan & Zoom ──
  onWheel(event: WheelEvent): void {
    if (!this.scrollZoomEnabled()) return; // let normal scroll happen
    event.preventDefault();
    const delta = event.deltaY > 0 ? -0.05 : 0.05;
    const newZoom = Math.max(0.15, Math.min(2, this.zoom() + delta));
    this.zoom.set(newZoom);
  }

  onMouseDown(event: MouseEvent): void {
    if (event.button === 0 || event.button === 1) {
      this.isPanning = true;
      this.panStartX = event.clientX - this.panX();
      this.panStartY = event.clientY - this.panY();
    }
  }

  onMouseMove(event: MouseEvent): void {
    if (!this.isPanning) return;
    this.panX.set(event.clientX - this.panStartX);
    this.panY.set(event.clientY - this.panStartY);
  }

  onMouseUp(): void {
    this.isPanning = false;
  }

  resetView(): void {
    this.zoom.set(0.55);
    this.panX.set(0);
    this.panY.set(0);
  }

  zoomIn(): void {
    this.zoom.set(Math.min(2, this.zoom() + 0.1));
  }

  zoomOut(): void {
    this.zoom.set(Math.max(0.15, this.zoom() - 0.1));
  }

  toggleScrollZoom(): void {
    this.scrollZoomEnabled.set(!this.scrollZoomEnabled());
  }

  toggleFullscreen(): void {
    const el = this.hostEl.nativeElement;
    if (!this.document.fullscreenElement) {
      el.requestFullscreen?.();
    } else {
      this.document.exitFullscreen?.();
    }
  }

  // ── Table interaction ──
  selectTable(name: string): void {
    this.selectedTable.set(this.selectedTable() === name ? null : name);
  }

  isRelatedToSelected(tableName: string): boolean {
    const sel = this.selectedTable();
    if (!sel) return false;
    return this.relationships.some(
      r => (r.from === sel && r.to === tableName) || (r.to === sel && r.from === tableName)
    );
  }

  getTableRelationships(tableName: string): Relationship[] {
    return this.relationships.filter(r => r.from === tableName || r.to === tableName);
  }

  // ── SVG helpers ──
  getTableHeight(table: TableDef): number {
    const cols = this.showCommonColumns()
      ? table.columns
      : table.columns.filter(c => !this.commonColumns.includes(c.name));
    return 36 + cols.length * 22 + 8;
  }

  getTableWidth(): number {
    return 300;
  }

  getTableCenter(table: TableDef): { x: number; y: number } {
    return {
      x: table.x + this.getTableWidth() / 2,
      y: table.y + this.getTableHeight(table) / 2
    };
  }

  /** Compute the Y pixel of a column row center inside a table */
  private getColumnY(table: TableDef, colName: string): number {
    const cols = this.showCommonColumns()
      ? table.columns
      : table.columns.filter(c => !this.commonColumns.includes(c.name));
    const idx = cols.findIndex(c => c.name === colName);
    return table.y + 36 + (idx >= 0 ? idx : 0) * 22 + 11;
  }

  getRelationshipPath(rel: Relationship): string {
    const fromTable = this.tables.find(t => t.name === rel.from);
    const toTable = this.tables.find(t => t.name === rel.to);
    if (!fromTable || !toTable) return '';

    const tw = this.getTableWidth();
    const fromColY = this.getColumnY(fromTable, rel.fromColumn);
    const toColY = this.getColumnY(toTable, rel.toColumn);
    const fromCX = fromTable.x + tw / 2;
    const toCX = toTable.x + tw / 2;

    let startX: number, startY: number, endX: number, endY: number;

    if (Math.abs(fromCX - toCX) > 20) {
      // Horizontal: connect right side → left side (or vice-versa)
      if (fromCX < toCX) {
        startX = fromTable.x + tw;
        endX = toTable.x;
      } else {
        startX = fromTable.x;
        endX = toTable.x + tw;
      }
      startY = fromColY;
      endY = toColY;
      const midX = (startX + endX) / 2;
      return `M ${startX} ${startY} C ${midX} ${startY}, ${midX} ${endY}, ${endX} ${endY}`;
    } else {
      // Same column — vertical
      const fromBottom = fromTable.y + this.getTableHeight(fromTable);
      const toBottom = toTable.y + this.getTableHeight(toTable);
      startX = fromCX;
      endX = toCX;
      if (fromTable.y < toTable.y) {
        startY = fromBottom;
        endY = toTable.y;
      } else {
        startY = fromTable.y;
        endY = toBottom;
      }
      const midY = (startY + endY) / 2;
      return `M ${startX} ${startY} C ${startX} ${midY}, ${endX} ${midY}, ${endX} ${endY}`;
    }
  }

  getCardinalityPositions(rel: Relationship): { startLabel: string; endLabel: string; startPos: { x: number; y: number }; endPos: { x: number; y: number } } {
    const fromTable = this.tables.find(t => t.name === rel.from);
    const toTable = this.tables.find(t => t.name === rel.to);
    if (!fromTable || !toTable) return { startLabel: '', endLabel: '', startPos: { x: 0, y: 0 }, endPos: { x: 0, y: 0 } };

    const [startCard, endCard] = rel.cardinality.split(',');
    const tw = this.getTableWidth();
    const fromColY = this.getColumnY(fromTable, rel.fromColumn);
    const toColY = this.getColumnY(toTable, rel.toColumn);
    const fromCX = fromTable.x + tw / 2;
    const toCX = toTable.x + tw / 2;

    let startPos: { x: number; y: number };
    let endPos: { x: number; y: number };

    if (Math.abs(fromCX - toCX) > 20) {
      if (fromCX < toCX) {
        startPos = { x: fromTable.x + tw + 12, y: fromColY - 10 };
        endPos = { x: toTable.x - 12, y: toColY - 10 };
      } else {
        startPos = { x: fromTable.x - 12, y: fromColY - 10 };
        endPos = { x: toTable.x + tw + 12, y: toColY - 10 };
      }
    } else {
      const fromBottom = fromTable.y + this.getTableHeight(fromTable);
      if (fromTable.y < toTable.y) {
        startPos = { x: fromCX + 10, y: fromBottom + 14 };
        endPos = { x: toCX + 10, y: toTable.y - 8 };
      } else {
        startPos = { x: fromCX + 10, y: fromTable.y - 8 };
        endPos = { x: toCX + 10, y: toTable.y + this.getTableHeight(toTable) + 14 };
      }
    }

    return { startLabel: startCard, endLabel: endCard, startPos, endPos };
  }

  toggleCommonColumns(): void {
    this.showCommonColumns.set(!this.showCommonColumns());
  }

  onSearchChange(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.searchTerm.set(val);
  }

  scrollToTable(tableName: string): void {
    const table = this.tables.find(t => t.name === tableName);
    if (!table) return;
    this.selectedTable.set(tableName);
    const svgEl = this.svgContainer?.nativeElement;
    if (!svgEl) return;
    const rect = svgEl.getBoundingClientRect();
    this.panX.set(-(table.x * this.zoom()) - (this.getTableWidth() * this.zoom() / 2) + rect.width / 2);
    this.panY.set(-(table.y * this.zoom()) - (this.getTableHeight(table) * this.zoom() / 2) + rect.height / 2);
  }

  // ── Layout algorithm (importance-based radial with collision avoidance) ──
  private computeLayout(): void {
    const tw = this.getTableWidth();
    const hGap = 80;  // horizontal gap between tables
    const vGap = 60;  // vertical gap between tables

    // 1. Compute importance = number of incoming FK references (tables that have FK pointing to this one)
    const incoming = new Map<string, string[]>(); // target → [sources...]
    for (const t of this.tables) incoming.set(t.name, []);
    for (const rel of this.relationships) {
      incoming.get(rel.to)?.push(rel.from);
    }

    // 2. Sort tables by importance (most referenced first)
    const sortedByImportance = [...this.tables].sort((a, b) =>
      (incoming.get(b.name)?.length || 0) - (incoming.get(a.name)?.length || 0)
    );

    // 3. Placed rectangles for collision detection
    interface Rect { x: number; y: number; w: number; h: number; name: string; }
    const placed: Rect[] = [];
    const placedSet = new Set<string>();

    const getRect = (t: TableDef): Rect => ({
      x: t.x, y: t.y, w: tw, h: this.getTableHeight(t), name: t.name
    });

    const overlaps = (r1: Rect, r2: Rect): boolean =>
      r1.x < r2.x + r2.w + hGap && r1.x + r1.w + hGap > r2.x &&
      r1.y < r2.y + r2.h + vGap && r1.y + r1.h + vGap > r2.y;

    const hasCollision = (rect: Rect): boolean =>
      placed.some(p => p.name !== rect.name && overlaps(rect, p));

    // Check if a link (straight line from p1 to p2) crosses through any placed table rect
    const linkCrossesTable = (x1: number, y1: number, x2: number, y2: number, excludeNames: Set<string>): boolean => {
      for (const p of placed) {
        if (excludeNames.has(p.name)) continue;
        // Simple AABB line intersection: check if line segment crosses the rectangle
        const rx = p.x - hGap / 4;
        const ry = p.y - vGap / 4;
        const rw = p.w + hGap / 2;
        const rh = p.h + vGap / 2;
        if (lineIntersectsRect(x1, y1, x2, y2, rx, ry, rw, rh)) return true;
      }
      return false;
    };

    // Line-rectangle intersection using Liang-Barsky
    const lineIntersectsRect = (x1: number, y1: number, x2: number, y2: number,
                                 rx: number, ry: number, rw: number, rh: number): boolean => {
      const dx = x2 - x1;
      const dy = y2 - y1;
      const p = [-dx, dx, -dy, dy];
      const q = [x1 - rx, rx + rw - x1, y1 - ry, ry + rh - y1];
      let tMin = 0, tMax = 1;
      for (let i = 0; i < 4; i++) {
        if (Math.abs(p[i]) < 1e-10) {
          if (q[i] < 0) return false;
        } else {
          const t = q[i] / p[i];
          if (p[i] < 0) { if (t > tMin) tMin = t; }
          else           { if (t < tMax) tMax = t; }
        }
      }
      return tMin < tMax;
    };

    const placeTable = (t: TableDef, x: number, y: number): void => {
      t.x = x;
      t.y = y;
      placed.push(getRect(t));
      placedSet.add(t.name);
    };

    // Find a non-colliding position near the desired (cx, cy), trying outward in a spiral
    const findFreePosition = (t: TableDef, cx: number, cy: number): { x: number; y: number } => {
      const h = this.getTableHeight(t);
      const candidate: Rect = { x: cx, y: cy, w: tw, h, name: t.name };

      // Try the desired position first
      if (!hasCollision(candidate)) return { x: cx, y: cy };

      // Spiral outward: try positions at increasing distances
      for (let dist = 1; dist <= 20; dist++) {
        const step = dist * (vGap + 40);
        // Prefer downward positions, then left/right, then up
        const offsets = [
          { dx: 0, dy: step },                                 // down
          { dx: -(tw + hGap), dy: 0 },                         // left
          { dx: (tw + hGap), dy: 0 },                          // right
          { dx: -(tw + hGap), dy: step },                       // down-left
          { dx: (tw + hGap), dy: step },                        // down-right
          { dx: 0, dy: -step },                                 // up
          { dx: -(tw + hGap), dy: -step },                      // up-left
          { dx: (tw + hGap), dy: -step },                       // up-right
          { dx: -(tw + hGap) * 2, dy: step / 2 },               // far left-down
          { dx: (tw + hGap) * 2, dy: step / 2 },                // far right-down
        ];
        for (const off of offsets) {
          const nx = cx + off.dx;
          const ny = cy + off.dy;
          candidate.x = nx;
          candidate.y = ny;
          if (!hasCollision(candidate)) return { x: nx, y: ny };
        }
      }
      // Fallback: just push really far down
      return { x: cx, y: (placed.length > 0 ? Math.max(...placed.map(p => p.y + p.h)) : 0) + vGap };
    };

    // Find position for a child that minimizes link crossings with other tables
    const findBestChildPosition = (child: TableDef, parent: TableDef, childIndex: number, totalChildren: number): { x: number; y: number } => {
      const ph = this.getTableHeight(parent);
      const ch = this.getTableHeight(child);

      // Calculate base position: spread children below parent
      // Fan out horizontally based on number of children
      const spreadWidth = Math.max(totalChildren - 1, 1) * (tw + hGap);
      const startX = parent.x + tw / 2 - spreadWidth / 2;
      const baseX = startX + childIndex * (tw + hGap) - tw / 2;
      const baseY = parent.y + ph + vGap * 2;

      // Try preferred position, then find free
      const pos = findFreePosition(child, baseX, baseY);

      // Check if the link from parent to this position crosses other tables
      const parentCX = parent.x + tw / 2;
      const parentBottom = parent.y + ph;
      const childCX = pos.x + tw / 2;
      const childTop = pos.y;
      const excludes = new Set([parent.name, child.name]);

      if (!linkCrossesTable(parentCX, parentBottom, childCX, childTop, excludes)) {
        return pos;
      }

      // Try alternative positions to avoid crossing
      const alternatives = [
        { x: parent.x, y: baseY },
        { x: parent.x + tw + hGap, y: baseY },
        { x: parent.x - tw - hGap, y: baseY },
        { x: parent.x, y: baseY + ch + vGap },
        { x: parent.x + tw + hGap, y: baseY + ch + vGap },
        { x: parent.x - tw - hGap, y: baseY + ch + vGap },
      ];

      for (const alt of alternatives) {
        const altPos = findFreePosition(child, alt.x, alt.y);
        const altCX = altPos.x + tw / 2;
        const altTop = altPos.y;
        if (!linkCrossesTable(parentCX, parentBottom, altCX, altTop, excludes)) {
          return altPos;
        }
      }

      return pos; // fallback to first free position found
    };

    // 4. Place tables using BFS from most-important tables
    const queue: string[] = [];

    // Start with the most important unplaced tables
    for (const t of sortedByImportance) {
      if (placedSet.has(t.name)) continue;

      // Place this root table
      const pos = findFreePosition(t, 50, placed.length === 0 ? 50 :
        Math.max(...placed.map(p => p.y + p.h)) + vGap * 2);
      placeTable(t, pos.x, pos.y);
      queue.push(t.name);

      // BFS: place all children reachable from this root
      while (queue.length > 0) {
        const currentName = queue.shift()!;
        const currentTable = this.tables.find(tb => tb.name === currentName)!;

        // Find children: tables that have FK pointing to currentTable (incoming)
        const children = (incoming.get(currentName) || [])
          .filter(name => !placedSet.has(name))
          .map(name => this.tables.find(tb => tb.name === name)!)
          .filter(Boolean);

        // Sort children by their own importance (most-referenced first) for better placement
        children.sort((a, b) =>
          (incoming.get(b.name)?.length || 0) - (incoming.get(a.name)?.length || 0)
        );

        for (let i = 0; i < children.length; i++) {
          const child = children[i];
          if (placedSet.has(child.name)) continue;
          const childPos = findBestChildPosition(child, currentTable, i, children.length);
          placeTable(child, childPos.x, childPos.y);
          queue.push(child.name);
        }
      }
    }

    // 5. Normalize: shift all tables so minimum x,y is 50
    const minX = Math.min(...this.tables.map(t => t.x));
    const minY = Math.min(...this.tables.map(t => t.y));
    const offsetX = 50 - minX;
    const offsetY = 50 - minY;
    for (const t of this.tables) {
      t.x += offsetX;
      t.y += offsetY;
    }
  }
}
