<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreFlashcardRequest;
use App\Http\Requests\Admin\UpdateFlashcardRequest;
use App\Models\Flashcard;
use App\Services\FlashcardService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use PhpOffice\PhpSpreadsheet\IOFactory;

class FlashcardAdminController extends Controller
{
    public function __construct(private FlashcardService $service) {}

    public function index(Request $request): JsonResponse
    {
        $paginator = $this->service->list(
            $request->query('type'),
            $request->query('level'),
        );
        return response()->json([
            'data'     => $paginator->items(),
            'count'    => $paginator->total(),
            'next'     => $paginator->nextPageUrl(),
            'previous' => $paginator->previousPageUrl(),
        ]);
    }

    public function store(StoreFlashcardRequest $request): JsonResponse
    {
        $flashcard = $this->service->create($request->validated());
        return response()->json(['data' => $flashcard], 201);
    }

    public function update(UpdateFlashcardRequest $request, int $id): JsonResponse
    {
        $flashcard = Flashcard::findOrFail($id);
        $updated   = $this->service->update($flashcard, $request->validated());
        return response()->json(['data' => $updated]);
    }

    public function destroy(int $id): JsonResponse
    {
        $flashcard = Flashcard::findOrFail($id);
        $this->service->delete($flashcard);
        return response()->json(null, 204);
    }

    public function import(Request $request): JsonResponse
    {
        $request->validate([
            'file' => ['required', 'file', 'mimes:xlsx,xls', 'max:10240'],
        ]);

        $path     = $request->file('file')->getRealPath();
        $rows     = $this->parseExcel($path);
        $imported = 0;
        $skippedDuplicates = 0;
        $errors   = [];

        $validTypes  = ['kanji', 'vocab', 'grammar'];
        $validLevels = ['N1', 'N2', 'N3', 'N4', 'N5'];

        foreach ($rows as $index => $row) {
            $lineNum = $index + 2;

            $missing = array_keys(array_filter(
                ['type' => $row['type'], 'level' => $row['level'], 'front' => $row['front'], 'meaning' => $row['meaning']],
                fn ($v) => $v === ''
            ));
            if (!empty($missing)) {
                $errors[] = "Row {$lineNum}: missing " . implode(', ', $missing);
                continue;
            }

            if (!in_array($row['type'], $validTypes, true)) {
                $errors[] = "Row {$lineNum}: type must be kanji, vocab, or grammar (got \"{$row['type']}\").";
                continue;
            }

            if (!in_array($row['level'], $validLevels, true)) {
                $errors[] = "Row {$lineNum}: level must be N1–N5 (got \"{$row['level']}\").";
                continue;
            }

            $exists = Flashcard::where('type', $row['type'])
                ->where('level', $row['level'])
                ->where('front', $row['front'])
                ->exists();

            if ($exists) {
                $skippedDuplicates++;
                continue;
            }

            try {
                $this->service->create([
                    'type'                => $row['type'],
                    'level'               => $row['level'],
                    'front'               => $row['front'],
                    'reading'             => $row['reading']             ?: null,
                    'meaning'             => $row['meaning'],
                    'example_sentence'    => $row['example_sentence']    ?: null,
                    'example_translation' => $row['example_translation'] ?: null,
                ]);
                $imported++;
            } catch (\Throwable $e) {
                $errors[] = "Row {$lineNum}: " . $e->getMessage();
            }
        }

        return response()->json([
            'data' => [
                'imported'   => $imported,
                'duplicates' => $skippedDuplicates,
                'skipped'    => count($errors),
                'errors'     => $errors,
            ],
        ]);
    }

    private function parseExcel(string $path): array
    {
        $spreadsheet = IOFactory::load($path);
        $sheet       = $spreadsheet->getActiveSheet();
        $data        = $sheet->toArray(nullValue: '', calculateFormulas: true, formatData: false, returnCellRef: false);

        if (empty($data)) {
            return [];
        }

        $rawHeader = array_shift($data);
        $header    = array_map(fn ($h) => strtolower(trim((string) $h)), $rawHeader);
        $col       = array_flip($header);

        $rows = [];
        foreach ($data as $r) {
            if (count(array_filter(array_map('strval', $r))) === 0) {
                continue;
            }

            $get = fn (string $key): string => trim((string) ($r[$col[$key] ?? -1] ?? ''));

            $rows[] = [
                'type'                => $get('type'),
                'level'               => $get('level'),
                'front'               => $get('front'),
                'reading'             => $get('reading'),
                'meaning'             => $get('meaning'),
                'example_sentence'    => $get('example_sentence'),
                'example_translation' => $get('example_translation'),
            ];
        }

        return $rows;
    }
}
