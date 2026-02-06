<?php

namespace App\Controller\Api;

use App\Entity\Category;
use App\Repository\CategoryRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

/**
 * @Route("/api/categories")
 */
class CategoryController extends AbstractController
{
    private CategoryRepository $categoryRepository;

    public function __construct(CategoryRepository $categoryRepository)
    {
        $this->categoryRepository = $categoryRepository;
    }

    /**
     * @Route("", name="api_categories_list", methods={"GET"})
     */
    public function list(): JsonResponse
    {
        $user = $this->getUser();
        $categories = $this->categoryRepository->findByUser($user);

        return $this->json([
            'categories' => array_map(function (Category $category) {
                return [
                    'id' => $category->getId(),
                    'name' => $category->getName(),
                ];
            }, $categories)
        ]);
    }

    /**
     * @Route("", name="api_categories_create", methods={"POST"})
     */
    public function create(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (!isset($data['name']) || empty(trim($data['name']))) {
            return $this->json(['error' => 'Category name is required'], Response::HTTP_BAD_REQUEST);
        }

        $user = $this->getUser();
        $name = trim($data['name']);

        $existing = $this->categoryRepository->findOneBy(['user' => $user, 'name' => $name]);
        if ($existing) {
            return $this->json(['error' => 'Category with this name already exists'], Response::HTTP_CONFLICT);
        }

        $category = new Category();
        $category->setName($name);
        $category->setUser($user);

        $this->categoryRepository->save($category, true);

        return $this->json([
            'message' => 'Category created successfully',
            'category' => [
                'id' => $category->getId(),
                'name' => $category->getName(),
            ]
        ], Response::HTTP_CREATED);
    }

    /**
     * @Route("/{id}", name="api_categories_update", methods={"PUT"})
     */
    public function update(int $id, Request $request): JsonResponse
    {
        $user = $this->getUser();
        $category = $this->categoryRepository->findOneBy(['id' => $id, 'user' => $user]);

        if (!$category) {
            return $this->json(['error' => 'Category not found'], Response::HTTP_NOT_FOUND);
        }

        $data = json_decode($request->getContent(), true);

        if (!isset($data['name']) || empty(trim($data['name']))) {
            return $this->json(['error' => 'Category name is required'], Response::HTTP_BAD_REQUEST);
        }

        $name = trim($data['name']);

        $existing = $this->categoryRepository->findOneBy(['user' => $user, 'name' => $name]);
        if ($existing && $existing->getId() !== $category->getId()) {
            return $this->json(['error' => 'Category with this name already exists'], Response::HTTP_CONFLICT);
        }

        $category->setName($name);
        $this->categoryRepository->save($category, true);

        return $this->json([
            'message' => 'Category updated successfully',
            'category' => [
                'id' => $category->getId(),
                'name' => $category->getName(),
            ]
        ]);
    }

    /**
     * @Route("/{id}", name="api_categories_delete", methods={"DELETE"})
     */
    public function delete(int $id): JsonResponse
    {
        $user = $this->getUser();
        $category = $this->categoryRepository->findOneBy(['id' => $id, 'user' => $user]);

        if (!$category) {
            return $this->json(['error' => 'Category not found'], Response::HTTP_NOT_FOUND);
        }

        $this->categoryRepository->remove($category, true);

        return $this->json(['message' => 'Category deleted successfully']);
    }
}
