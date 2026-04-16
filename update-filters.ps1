$base = "c:\Users\kokoe\Documents\work\synelia\projects\quiz\codes\quizapp_full\quizapp_front\src\app\pages\dashboard\entities\solo"

# Date block template (reused by all entities)
$dateBlock = @'
        <!-- Date de création -->
        <div class="form-row-full">
          <div class="form-group-inline">
            <label>Date de création de</label>
            <input type="date" class="form-input-inline" [(ngModel)]="advancedCriteria.dateCreationDe" />
          </div>
          <span class="range-separator">à</span>
          <div class="form-group-inline">
            <input type="date" class="form-input-inline" [(ngModel)]="advancedCriteria.dateCreationA" />
          </div>
        </div>

        <!-- Date de modification -->
        <div class="form-row-full">
          <div class="form-group-inline">
            <label>Date de modification de</label>
            <input type="date" class="form-input-inline" [(ngModel)]="advancedCriteria.dateModificationDe" />
          </div>
          <span class="range-separator">à</span>
          <div class="form-group-inline">
            <input type="date" class="form-input-inline" [(ngModel)]="advancedCriteria.dateModificationA" />
          </div>
        </div>
'@

# ID block template (reused by all entities)
$idBlock = @'
        <!-- Intervalle d'ID -->
        <div class="form-row-full">
          <div class="form-group-inline">
            <label>ID de</label>
            <input type="text" class="form-input-inline" [(ngModel)]="advancedCriteria.idDe" placeholder="ID minimum" />
          </div>
          <span class="range-separator">à</span>
          <div class="form-group-inline">
            <input type="text" class="form-input-inline" [(ngModel)]="advancedCriteria.idA" placeholder="ID maximum" />
          </div>
        </div>
'@

# isDeleted block
$isDeletedBlock = @'
        <div class="form-group">
          <label>Supprimé</label>
          <select class="form-select" [(ngModel)]="advancedCriteria.isDeleted">
            <option [ngValue]="undefined">Tous</option>
            <option [ngValue]="false">Non supprimé</option>
            <option [ngValue]="true">Supprimé</option>
          </select>
        </div>
'@

function MakeText($field, $label, $placeholder) {
  return @"
        <div class="form-group">
          <label>$label</label>
          <input type="text" class="form-input" [(ngModel)]="advancedCriteria.$field" placeholder="$placeholder" />
        </div>
"@
}

function MakeNum($field, $label) {
  return @"
        <div class="form-group">
          <label>$label</label>
          <input type="number" class="form-input" [(ngModel)]="advancedCriteria.$field" placeholder="$label" />
        </div>
"@
}

function MakeBool($field, $label) {
  return @"
        <div class="form-group">
          <label>$label</label>
          <select class="form-select" [(ngModel)]="advancedCriteria.$field">
            <option [ngValue]="undefined">Tous</option>
            <option [ngValue]="true">Oui</option>
            <option [ngValue]="false">Non</option>
          </select>
        </div>
"@
}

function MakeFK($field, $label, $signalName, $displayExpr) {
  return @"
        <div class="form-group">
          <label>$label</label>
          <select class="form-select" [(ngModel)]="advancedCriteria.$field">
            <option [ngValue]="undefined">-- Tous --</option>
            @for (item of $signalName(); track item.id) {
              <option [ngValue]="item.id">{{ $displayExpr }}</option>
            }
          </select>
        </div>
"@
}

function MakeEnum($field, $label, $options) {
  $opts = ""
  foreach ($o in $options) {
    $opts += "            <option value=`"$($o.value)`">$($o.label)</option>`n"
  }
  return @"
        <div class="form-group">
          <label>$label</label>
          <select class="form-select" [(ngModel)]="advancedCriteria.$field">
            <option [ngValue]="undefined">Tous</option>
$opts          </select>
        </div>
"@
}

function BuildFormGrid($entityFields) {
  $content = "      <div class=`"form-grid`">`n"
  $content += $idBlock + "`n"
  $content += $entityFields + "`n"
  $content += $isDeletedBlock + "`n"
  $content += $dateBlock + "`n"
  $content += "      </div>"
  return $content
}

function ReplaceFormGrid($entityDir, $htmlFile, $newFormGrid) {
  $path = Join-Path $base "$entityDir/$htmlFile"
  if (!(Test-Path $path)) { Write-Host "NOT FOUND: $path"; return }
  
  $content = [System.IO.File]::ReadAllText($path)
  
  # Find <div class="form-grid"> to its closing </div> (before panel-actions)
  $startMarker = '<div class="form-grid">'
  $endMarker = '<div class="panel-actions">'
  
  $startIdx = $content.IndexOf($startMarker)
  $endIdx = $content.IndexOf($endMarker)
  
  if ($startIdx -lt 0 -or $endIdx -lt 0) {
    Write-Host "MARKERS NOT FOUND in $entityDir"
    return
  }
  
  # Find the </div> right before panel-actions (the closing of form-grid)
  # We need the closing </div> that's between form-grid start and panel-actions
  $beforePanelActions = $content.Substring(0, $endIdx).TrimEnd()
  # Find last </div> before panel-actions
  $lastDivClose = $beforePanelActions.LastIndexOf('</div>')
  
  if ($lastDivClose -lt $startIdx) {
    Write-Host "CLOSING DIV NOT FOUND in $entityDir"
    return
  }
  
  $endReplace = $lastDivClose + 6 # length of "</div>"
  
  $newContent = $content.Substring(0, $startIdx) + $newFormGrid + "`n" + $content.Substring($endReplace)
  [System.IO.File]::WriteAllText($path, $newContent)
  Write-Host "UPDATED: $entityDir"
}

# ===== ENTITY DEFINITIONS =====

# answers: answerText(text), answerOrder(num), isCorrect(bool), questionId(FK)
$answersFields = (MakeText "answerText" "Texte de la réponse" "Texte...") + "`n" + (MakeNum "answerOrder" "Ordre") + "`n" + (MakeBool "isCorrect" "Correcte") + "`n" + (MakeFK "questionId" "Question" "allQuestions" "item.questionText || ''#'' + item.id")
ReplaceFormGrid "answers" "entities-answers.html" (BuildFormGrid $answersFields)

# applications: sourceTokenId(FK), formVersionId(FK)
$applicationsFields = (MakeFK "sourceTokenId" "Source Token" "allSourceTokens" "item.sourceTokenName || ''#'' + item.id") + "`n" + (MakeFK "formVersionId" "Version de formulaire" "allFormVersions" "''Version '' + item.versionNumber + '' (#'' + item.id + '')''")
ReplaceFormGrid "applications" "entities-applications.html" (BuildFormGrid $applicationsFields)

# campaign-crud: userId(FK), campaignId(FK)
$campaignCrudFields = (MakeFK "userId" "Utilisateur" "allUsers" "item.firstName + '' '' + item.lastName") + "`n" + (MakeFK "campaignId" "Campagne" "allCampaigns" "item.campaignTitle || ''#'' + item.id")
ReplaceFormGrid "campaign-crud" "entities-campaign-crud.html" (BuildFormGrid $campaignCrudFields)

# campaigns: nom(text), specialityId(FK), isActive(bool)
$campaignsFields = (MakeText "campaignName" "Nom de la campagne" "Nom...") + "`n" + (MakeFK "specialitiesId" "Spécialité" "allSpecialities" "item.specialityName || ''#'' + item.id") + "`n" + (MakeBool "isActive" "Active")
ReplaceFormGrid "campaigns" "entities-campaigns.html" (BuildFormGrid $campaignsFields)

# candidate-answers: applicationId(FK), questionId(FK), answerId(FK), isSelected(bool)
$candAnswersFields = (MakeFK "applicationId" "Candidature" "allApplications" "''#'' + item.id + '' - '' + (item.candidateFirstName || '''') + '' '' + (item.candidateLastName || '''')") + "`n" + (MakeFK "questionId" "Question" "allQuestions" "item.questionText || ''#'' + item.id") + "`n" + (MakeFK "answerId" "Réponse" "allAnswers" "item.answerText || ''#'' + item.id") + "`n" + (MakeBool "isSelected" "Sélectionnée")
ReplaceFormGrid "candidate-answers" "entities-candidate-answers.html" (BuildFormGrid $candAnswersFields)

# candidate-ask: applicationId(FK)
$candAskFields = (MakeFK "applicationId" "Candidature" "allApplications" "''#'' + item.id + '' - '' + (item.candidateFirstName || '''') + '' '' + (item.candidateLastName || '''')")
ReplaceFormGrid "candidate-ask" "entities-candidate-ask.html" (BuildFormGrid $candAskFields)

# candidate-interview: applicationId(FK), interviewId(FK)
$candInterviewFields = (MakeFK "applicationId" "Candidature" "allApplications" "''#'' + item.id + '' - '' + (item.candidateFirstName || '''') + '' '' + (item.candidateLastName || '''')") + "`n" + (MakeFK "interviewId" "Entretien" "allInterviews" "''#'' + item.id + '' ('' + (item.interviewType || '''') + '')''")
ReplaceFormGrid "candidate-interview" "entities-candidate-interview.html" (BuildFormGrid $candInterviewFields)

# candidate-token: applicationId(FK)
$candTokenFields = (MakeFK "applicationId" "Candidature" "allApplications" "''#'' + item.id + '' - '' + (item.candidateFirstName || '''') + '' '' + (item.candidateLastName || '''')")
ReplaceFormGrid "candidate-token" "entities-candidate-token.html" (BuildFormGrid $candTokenFields)

# decisions: applicationId(FK), userId(FK)
$decisionsFields = (MakeFK "applicationId" "Candidature" "allApplications" "''#'' + item.id + '' - '' + (item.candidateFirstName || '''') + '' '' + (item.candidateLastName || '''')") + "`n" + (MakeFK "userId" "Utilisateur" "allUsers" "item.firstName + '' '' + item.lastName")
ReplaceFormGrid "decisions" "entities-decisions.html" (BuildFormGrid $decisionsFields)

# evaluations: candidateInterviewId(FK)
$evaluationsFields = (MakeFK "candidateInterviewId" "Entretien candidat" "allCandidateInterviews" "''#'' + item.id")
ReplaceFormGrid "evaluations" "entities-evaluations.html" (BuildFormGrid $evaluationsFields)

# form-questions: formVersionId(FK), questionId(FK), questionOrder(num)
$formQuestionsFields = (MakeFK "formVersionId" "Version du formulaire" "allFormVersions" "''Version '' + item.versionNumber + '' (#'' + item.id + '')''") + "`n" + (MakeFK "questionId" "Question" "allQuestions" "item.questionText || ''#'' + item.id") + "`n" + (MakeNum "questionOrder" "Ordre de la question")
ReplaceFormGrid "form-questions" "entities-form-questions.html" (BuildFormGrid $formQuestionsFields)

# form-versions: versionNumber(num), formId(FK), isPublished(bool), isLocked(bool)
$formVersionsFields = (MakeNum "versionNumber" "Numéro de version") + "`n" + (MakeFK "formId" "Formulaire" "allForms" "item.formName || ''#'' + item.id") + "`n" + (MakeBool "isPublished" "Publié") + "`n" + (MakeBool "isLocked" "Verrouillé")
ReplaceFormGrid "form-versions" "entities-form-versions.html" (BuildFormGrid $formVersionsFields)

# forms: formName(text), campaignId(FK), isActive(bool)
$formsFields = (MakeText "formName" "Nom du formulaire" "Nom...") + "`n" + (MakeFK "campaignId" "Campagne" "allCampaigns" "item.campaignTitle || ''#'' + item.id") + "`n" + (MakeBool "isActive" "Actif")
ReplaceFormGrid "forms" "entities-forms.html" (BuildFormGrid $formsFields)

# interview-crud: userId(FK), interviewId(FK)
$interviewCrudFields = (MakeFK "userId" "Utilisateur" "allUsers" "item.firstName + '' '' + item.lastName") + "`n" + (MakeFK "interviewId" "Entretien" "allInterviews" "''#'' + item.id + '' ('' + (item.interviewType || '''') + '')''")
ReplaceFormGrid "interview-crud" "entities-interview-crud.html" (BuildFormGrid $interviewCrudFields)

# interviews: campaignId(FK), applicationId(FK)
$interviewsFields = (MakeFK "campaignId" "Campagne" "allCampaigns" "item.campaignTitle || ''#'' + item.id") + "`n" + (MakeFK "applicationId" "Candidature" "allApplications" "''#'' + item.id + '' - '' + (item.candidateFirstName || '''') + '' '' + (item.candidateLastName || '''')")
ReplaceFormGrid "interviews" "entities-interviews.html" (BuildFormGrid $interviewsFields)

# notifications: userId(FK)
$notificationsFields = (MakeFK "userId" "Utilisateur" "allUsers" "item.firstName + '' '' + item.lastName")
ReplaceFormGrid "notifications" "entities-notifications.html" (BuildFormGrid $notificationsFields)

# questions: questionText(text), questionType(enum), difficultyLevel(enum), score(num), questionChrono(num), specialityId(FK)
$qtypeOptions = @(
  @{value="SINGLE_CHOICE"; label="Choix unique"},
  @{value="MULTIPLE_CHOICE"; label="Choix multiple"},
  @{value="TRUE_FALSE"; label="Vrai/Faux"},
  @{value="TEXT"; label="Texte libre"}
)
$dlevelOptions = @(
  @{value="EASY"; label="Facile"},
  @{value="MEDIUM"; label="Moyen"},
  @{value="HARD"; label="Difficile"}
)
$questionsFields = (MakeText "questionText" "Texte de la question" "Texte...") + "`n" + (MakeEnum "questionType" "Type de question" $qtypeOptions) + "`n" + (MakeEnum "difficultyLevel" "Niveau de difficulté" $dlevelOptions) + "`n" + (MakeNum "score" "Score") + "`n" + (MakeNum "questionChrono" "Chrono (sec)") + "`n" + (MakeFK "specialityId" "Spécialité" "allSpecialities" "item.specialityName || ''#'' + item.id")
ReplaceFormGrid "questions" "entities-questions.html" (BuildFormGrid $questionsFields)

Write-Host "`n=== ALL DONE ==="