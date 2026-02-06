<?php

namespace App\Controller\Api;

use App\Entity\Note;
use App\Repository\CategoryRepository;
use App\Repository\NoteRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

/**
 * @Route("/api/notes")
 */
class NoteController extends AbstractController
{
    private NoteRepository $noteRepository;
    private CategoryRepository $categoryRepository;

    public function __construct(NoteRepository $noteRepository, CategoryRepository $categoryRepository)
    {
        $this->noteRepository = $noteRepository;
        $this->categoryRepository = $categoryRepository;
    }

    /**
     * @Route("", name="api_notes_list", methods={"GET"})
     */
    public function list(Request $request): JsonResponse
    {
        $user = $this->getUser();
        $search = $request->query->get('search');
        $status = $request->query->get('status');
        $categoryId = $request->query->get('category');

        $notes = $this->noteRepository->searchNotes(
            $user,
            $search,
            $status,
            $categoryId ? (int) $categoryId : null
        );

        return $this->json([
            'notes' => array_map(function (Note $note) {
                return $this->serializeNote($note);
            }, $notes)
        ]);
    }

    /**
     * @Route("/statuses", name="api_notes_statuses", methods={"GET"})
     */
    public function statuses(): JsonResponse
    {
        return $this->json([
            'statuses' => Note::STATUSES
        ]);
    }

    /**
     * @Route("/{id}", name="api_notes_show", methods={"GET"}, requirements={"id"="\d+"})
     */
    public function show(int $id): JsonResponse
    {
        $user = $this->getUser();
        $note = $this->noteRepository->findOneBy(['id' => $id, 'user' => $user]);

        if (!$note) {
            return $this->json(['error' => 'Note not found'], Response::HTTP_NOT_FOUND);
        }

        return $this->json(['note' => $this->serializeNote($note)]);
    }

    /**
     * @Route("", name="api_notes_create", methods={"POST"})
     */
    public function create(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        $errors = $this->validateNoteData($data);
        if (!empty($errors)) {
            return $this->json(['error' => implode(', ', $errors)], Response::HTTP_BAD_REQUEST);
        }

        $user = $this->getUser();
        $note = new Note();
        $note->setTitle(trim($data['title']));
        $note->setContent(trim($data['content']));
        $note->setStatus($data['status'] ?? Note::STATUS_NEW);
        $note->setUser($user);

        if (isset($data['categoryId']) && $data['categoryId']) {
            $category = $this->categoryRepository->findOneBy(['id' => $data['categoryId'], 'user' => $user]);
            if (!$category) {
                return $this->json(['error' => 'Category not found'], Response::HTTP_NOT_FOUND);
            }
            $note->setCategory($category);
        }

        $this->noteRepository->save($note, true);

        return $this->json([
            'message' => 'Note created successfully',
            'note' => $this->serializeNote($note)
        ], Response::HTTP_CREATED);
    }

    /**
     * @Route("/{id}", name="api_notes_update", methods={"PUT"})
     */
    public function update(int $id, Request $request): JsonResponse
    {
        $user = $this->getUser();
        $note = $this->noteRepository->findOneBy(['id' => $id, 'user' => $user]);

        if (!$note) {
            return $this->json(['error' => 'Note not found'], Response::HTTP_NOT_FOUND);
        }

        $data = json_decode($request->getContent(), true);

        $errors = $this->validateNoteData($data);
        if (!empty($errors)) {
            return $this->json(['error' => implode(', ', $errors)], Response::HTTP_BAD_REQUEST);
        }

        $note->setTitle(trim($data['title']));
        $note->setContent(trim($data['content']));
        $note->setStatus($data['status'] ?? $note->getStatus());
        $note->setUpdatedAt(new \DateTime());

        if (array_key_exists('categoryId', $data)) {
            if ($data['categoryId']) {
                $category = $this->categoryRepository->findOneBy(['id' => $data['categoryId'], 'user' => $user]);
                if (!$category) {
                    return $this->json(['error' => 'Category not found'], Response::HTTP_NOT_FOUND);
                }
                $note->setCategory($category);
            } else {
                $note->setCategory(null);
            }
        }

        $this->noteRepository->save($note, true);

        return $this->json([
            'message' => 'Note updated successfully',
            'note' => $this->serializeNote($note)
        ]);
    }

    /**
     * @Route("/{id}", name="api_notes_delete", methods={"DELETE"})
     */
    public function delete(int $id): JsonResponse
    {
        $user = $this->getUser();
        $note = $this->noteRepository->findOneBy(['id' => $id, 'user' => $user]);

        if (!$note) {
            return $this->json(['error' => 'Note not found'], Response::HTTP_NOT_FOUND);
        }

        $this->noteRepository->remove($note, true);

        return $this->json(['message' => 'Note deleted successfully']);
    }

    private function validateNoteData(array $data): array
    {
        $errors = [];

        if (!isset($data['title']) || empty(trim($data['title']))) {
            $errors[] = 'Title is required';
        }

        if (!isset($data['content']) || empty(trim($data['content']))) {
            $errors[] = 'Content is required';
        }

        if (isset($data['status']) && !in_array($data['status'], Note::STATUSES)) {
            $errors[] = 'Invalid status. Must be one of: ' . implode(', ', Note::STATUSES);
        }

        return $errors;
    }

    private function serializeNote(Note $note): array
    {
        return [
            'id' => $note->getId(),
            'title' => $note->getTitle(),
            'content' => $note->getContent(),
            'status' => $note->getStatus(),
            'category' => $note->getCategory() ? [
                'id' => $note->getCategory()->getId(),
                'name' => $note->getCategory()->getName(),
            ] : null,
            'createdAt' => $note->getCreatedAt()->format('c'),
            'updatedAt' => $note->getUpdatedAt()->format('c'),
        ];
    }
}
