<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: ipaexgothic, sans-serif; font-size: 12px; color: #1e293b; background: #fff; padding: 32px; }
  .header { border-bottom: 2px solid #6366f1; padding-bottom: 16px; margin-bottom: 24px; }
  .header h1 { font-size: 20px; font-weight: 700; color: #4f46e5; }
  .header p { font-size: 11px; color: #64748b; margin-top: 4px; }
  .meta-grid { display: table; width: 100%; margin-bottom: 24px; border-collapse: collapse; }
  .meta-cell { display: table-cell; width: 50%; vertical-align: top; }
  .meta-item { margin-bottom: 8px; }
  .meta-label { font-size: 10px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; }
  .meta-value { font-size: 13px; font-weight: 600; color: #1e293b; margin-top: 2px; }
  .score-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px 20px; margin-bottom: 24px; display: table; width: 100%; }
  .score-num { font-size: 36px; font-weight: 700; color: #1e293b; display: table-cell; vertical-align: middle; width: 120px; }
  .score-num span { font-size: 18px; color: #94a3b8; }
  .score-info { display: table-cell; vertical-align: middle; padding-left: 16px; }
  .score-pct { font-size: 20px; font-weight: 700; }
  .score-passing { font-size: 11px; color: #64748b; margin-top: 4px; }
  .badge { display: inline-block; padding: 4px 12px; border-radius: 9999px; font-size: 11px; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; }
  .badge-pass { background: #dcfce7; color: #166534; }
  .badge-fail { background: #fee2e2; color: #991b1b; }
  .section-title { font-size: 13px; font-weight: 700; color: #475569; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; margin-bottom: 12px; }
  .passage-block { margin-bottom: 16px; border: 1px solid #c7d2fe; border-radius: 6px; overflow: hidden; }
  .passage-header { background: #eef2ff; padding: 8px 12px; font-size: 11px; font-weight: 700; color: #4338ca; border-bottom: 1px solid #c7d2fe; }
  .passage-body { padding: 10px 12px; font-size: 11px; line-height: 1.8; color: #334155; white-space: pre-wrap; }
  .question { margin-bottom: 14px; border: 1px solid #e2e8f0; border-radius: 6px; overflow: hidden; }
  .question-indented { margin-left: 16px; }
  .q-header { padding: 8px 12px; display: table; width: 100%; }
  .q-header-correct { background: #f0fdf4; }
  .q-header-wrong { background: #fff7f7; }
  .q-num { display: table-cell; width: 28px; vertical-align: top; }
  .q-num-badge { width: 20px; height: 20px; border-radius: 50%; text-align: center; line-height: 20px; font-size: 10px; font-weight: 700; color: #fff; }
  .q-num-correct { background: #22c55e; }
  .q-num-wrong { background: #ef4444; }
  .q-text { display: table-cell; vertical-align: top; font-size: 11px; font-weight: 500; color: #1e293b; padding-top: 2px; }
  .q-body { padding: 6px 12px 8px 40px; }
  .choice { padding: 3px 8px; border-radius: 4px; font-size: 10px; margin-bottom: 3px; }
  .choice-correct { background: #dcfce7; color: #166534; font-weight: 600; }
  .choice-wrong { background: #fee2e2; color: #991b1b; font-weight: 600; }
  .choice-neutral { color: #64748b; }
  .explanation { margin-top: 6px; padding: 6px 8px; background: #eff6ff; border-left: 3px solid #6366f1; font-size: 10px; color: #1e40af; }
  .footer { margin-top: 32px; border-top: 1px solid #e2e8f0; padding-top: 10px; font-size: 10px; color: #94a3b8; text-align: center; }
</style>
</head>
<body>

<div class="header">
  <h1>Mock Exam System — Exam Result</h1>
  <p>Generated on {{ now()->format('Y-m-d H:i') }}</p>
</div>

<div class="meta-grid">
  <div class="meta-cell">
    <div class="meta-item">
      <div class="meta-label">Candidate</div>
      <div class="meta-value">{{ $result->user->name ?? '—' }}</div>
    </div>
    <div class="meta-item">
      <div class="meta-label">Category</div>
      <div class="meta-value">{{ $result->session->category ?? '—' }}</div>
    </div>
  </div>
  <div class="meta-cell">
    <div class="meta-item">
      <div class="meta-label">Mode</div>
      <div class="meta-value" style="text-transform: capitalize;">{{ $result->session->mode ?? '—' }}</div>
    </div>
    <div class="meta-item">
      <div class="meta-label">Completed</div>
      <div class="meta-value">{{ \Carbon\Carbon::parse($result->completed_at)->format('Y-m-d H:i') }}</div>
    </div>
  </div>
</div>

<div class="score-box">
  <div class="score-num">{{ $result->score }}<span>/{{ $result->total_questions }}</span></div>
  <div class="score-info">
    @php $pct = $result->total_questions > 0 ? round($result->score / $result->total_questions * 100) : 0; @endphp
    <div class="score-pct" style="color: {{ $result->status === 'pass' ? '#16a34a' : '#dc2626' }}">
      {{ $pct }}%
    </div>
    <div class="score-passing">Passing score: {{ $result->passing_score }}%</div>
    <div style="margin-top: 6px;">
      <span class="badge {{ $result->status === 'pass' ? 'badge-pass' : 'badge-fail' }}">
        {{ strtoupper($result->status) }}
      </span>
    </div>
  </div>
</div>

<div class="section-title">Answer Review ({{ $result->answerRecords->count() }} questions)</div>

@php
  // Replace circled Unicode letters (Ⓐ–Ⓩ) with ASCII [A]–[Z] so IPAex Gothic
  // renders them correctly (the font does not cover U+24B6–U+24CF).
  function sanitizeText(?string $text): string {
    if ($text === null) return '';
    $from = ['Ⓐ','Ⓑ','Ⓒ','Ⓓ','Ⓔ','Ⓕ','Ⓖ','Ⓗ','Ⓘ','Ⓙ','Ⓚ','Ⓛ','Ⓜ','Ⓝ','Ⓞ','Ⓟ','Ⓠ','Ⓡ','Ⓢ','Ⓣ','Ⓤ','Ⓥ','Ⓦ','Ⓧ','Ⓨ','Ⓩ',
              'ⓐ','ⓑ','ⓒ','ⓓ','ⓔ','ⓕ','ⓖ','ⓗ','ⓘ','ⓙ','ⓚ','ⓛ','ⓜ','ⓝ','ⓞ','ⓟ','ⓠ','ⓡ','ⓢ','ⓣ','ⓤ','ⓥ','ⓦ','ⓧ','ⓨ','ⓩ'];
    $to   = [
             '[ A ]','[ B ]','[ C ]','[ D ]','[ E ]','[ F ]','[ G ]','[ H ]','[ I ]','[ J ]','[ K ]','[ L ]','[ M ]','[ N ]','[ O ]','[ P ]','[ Q ]','[ R ]','[ S ]','[ T ]','[ U ]','[ V ]','[ W ]','[ X ]','[ Y ]','[ Z ]',
             '[ a ]','[ b ]','[ c ]','[ d ]','[ e ]','[ f ]','[ g ]','[ h ]','[ i ]','[ j ]','[ k ]','[ l ]','[ m ]','[ n ]','[ o ]','[ p ]','[ q ]','[ r ]','[ s ]','[ t ]','[ u ]','[ v ]','[ w ]','[ x ]','[ y ]','[ z ]'
            ];
    return str_replace($from, $to, $text);
  }

  // Group answer records: passage-linked questions share a passage block;
  // questions without a passage are rendered individually (passageId = null key).
  $groups = [];
  $seenPassageIds = [];
  $globalIndex = 0;

  foreach ($result->answerRecords as $record) {
    $passageId = $record->question?->passage_id ?? null;

    if ($passageId !== null) {
      // First encounter for this passage — create a new group.
      if (!isset($groups['p_' . $passageId])) {
        $groups['p_' . $passageId] = [
          'passage'  => $record->question->passage,
          'records'  => [],
        ];
      }
      $groups['p_' . $passageId]['records'][] = $record;
    } else {
      // No passage — each record gets its own standalone group.
      $groups['standalone_' . $globalIndex] = [
        'passage' => null,
        'records' => [$record],
      ];
      $globalIndex++;
    }
  }

  $qNum = 0;
@endphp

@foreach($groups as $group)
  @if($group['passage'])
    <div class="passage-block">
      <div class="passage-header">{{ sanitizeText($group['passage']->title) }}</div>
      <div class="passage-body">{{ sanitizeText($group['passage']->content) }}</div>
    </div>
  @endif

  @foreach($group['records'] as $record)
    @php
      $qNum++;
      $q = $record->question;
      $choices = $q ? $q->choices : collect();
      $correctChoice = $choices->firstWhere('is_correct', true);
      $selectedChoice = $record->selectedChoice;
      $indented = $group['passage'] !== null;
    @endphp
    <div class="question {{ $indented ? 'question-indented' : '' }}">
      <div class="q-header {{ $record->is_correct ? 'q-header-correct' : 'q-header-wrong' }}">
        <div class="q-num">
          <div class="q-num-badge {{ $record->is_correct ? 'q-num-correct' : 'q-num-wrong' }}">
            {{ $record->is_correct ? 'O' : 'X' }}
          </div>
        </div>
        <div class="q-text">Q{{ $qNum }}. {{ sanitizeText($q->text ?? '—') }}</div>
      </div>
      <div class="q-body">
        @foreach($choices as $choice)
          @php
            $isCorrect = $choice->is_correct;
            $isWrongSelected = $selectedChoice && $choice->id === $selectedChoice->id && !$record->is_correct;
          @endphp
          <div class="choice {{ $isCorrect ? 'choice-correct' : ($isWrongSelected ? 'choice-wrong' : 'choice-neutral') }}">
            {{ sanitizeText($choice->text) }}
            @if($isCorrect) <- Correct @endif
            @if($isWrongSelected) <- Your answer @endif
          </div>
        @endforeach
        @if($q && $q->explanation)
          <div class="explanation">{{ sanitizeText($q->explanation) }}</div>
        @endif
      </div>
    </div>
  @endforeach

  @if($group['passage'])
    <div style="margin-bottom: 20px;"></div>
  @endif
@endforeach

<div class="footer">Mock Exam System &nbsp;·&nbsp; {{ $result->user->name ?? '' }} &nbsp;·&nbsp; {{ $result->session->category ?? '' }}</div>

</body>
</html>
