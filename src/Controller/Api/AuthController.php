<?php

namespace App\Controller\Api;

use App\Entity\User;
use App\Repository\UserRepository;
use App\Service\EmailService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;

/**
 * @Route("/api")
 */
class AuthController extends AbstractController
{
    private UserRepository $userRepository;
    private UserPasswordHasherInterface $passwordHasher;
    private EmailService $emailService;
    private ValidatorInterface $validator;

    public function __construct(
        UserRepository $userRepository,
        UserPasswordHasherInterface $passwordHasher,
        EmailService $emailService,
        ValidatorInterface $validator
    ) {
        $this->userRepository = $userRepository;
        $this->passwordHasher = $passwordHasher;
        $this->emailService = $emailService;
        $this->validator = $validator;
    }

    /**
     * @Route("/register", name="api_register", methods={"POST"})
     */
    public function register(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (!isset($data['email']) || !isset($data['password'])) {
            return $this->json(['error' => 'Email and password are required'], Response::HTTP_BAD_REQUEST);
        }

        $email = trim($data['email']);
        $password = $data['password'];

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return $this->json(['error' => 'Invalid email format'], Response::HTTP_BAD_REQUEST);
        }

        if (strlen($password) < 6) {
            return $this->json(['error' => 'Password must be at least 6 characters'], Response::HTTP_BAD_REQUEST);
        }

        $existingUser = $this->userRepository->findOneBy(['email' => $email]);
        if ($existingUser) {
            return $this->json(['error' => 'This email is already registered'], Response::HTTP_CONFLICT);
        }

        $user = new User();
        $user->setEmail($email);
        $user->setPassword($this->passwordHasher->hashPassword($user, $password));
        $user->setConfirmationToken(bin2hex(random_bytes(32)));

        $errors = $this->validator->validate($user);
        if (count($errors) > 0) {
            $errorMessages = [];
            foreach ($errors as $error) {
                $errorMessages[] = $error->getMessage();
            }
            return $this->json(['error' => implode(', ', $errorMessages)], Response::HTTP_BAD_REQUEST);
        }

        $this->userRepository->save($user, true);

        $confirmationUrl = $this->generateUrl(
            'api_confirm',
            ['token' => $user->getConfirmationToken()],
            UrlGeneratorInterface::ABSOLUTE_URL
        );

        $this->emailService->sendConfirmationEmail($user, $confirmationUrl);

        return $this->json([
            'message' => 'Registration successful. Please check your email to confirm your account.',
            'user' => [
                'id' => $user->getId(),
                'email' => $user->getEmail(),
            ]
        ], Response::HTTP_CREATED);
    }

    /**
     * @Route("/confirm/{token}", name="api_confirm", methods={"GET"})
     */
    public function confirmAccount(string $token): Response
    {
        $user = $this->userRepository->findByConfirmationToken($token);

        if (!$user) {
            return new Response(
                '<html><body><h1>Invalid or expired confirmation link</h1><p><a href="/">Go to homepage</a></p></body></html>',
                Response::HTTP_NOT_FOUND,
                ['Content-Type' => 'text/html']
            );
        }

        $user->setIsVerified(true);
        $user->setConfirmationToken(null);
        $this->userRepository->save($user, true);

        return new Response(
            '<html><body><h1>Account confirmed successfully!</h1><p>You can now <a href="/">login</a> to your account.</p></body></html>',
            Response::HTTP_OK,
            ['Content-Type' => 'text/html']
        );
    }

    /**
     * @Route("/login", name="api_login", methods={"POST"})
     */
    public function login(): JsonResponse
    {
        $user = $this->getUser();

        if (!$user) {
            return $this->json(['error' => 'Invalid credentials'], Response::HTTP_UNAUTHORIZED);
        }

        if (!$user->isVerified()) {
            return $this->json(['error' => 'Please confirm your email before logging in'], Response::HTTP_FORBIDDEN);
        }

        return $this->json([
            'message' => 'Login successful',
            'user' => [
                'id' => $user->getId(),
                'email' => $user->getEmail(),
            ]
        ]);
    }

    /**
     * @Route("/logout", name="api_logout", methods={"POST"})
     */
    public function logout(): void
    {
        throw new \Exception('This should never be reached!');
    }

    /**
     * @Route("/user", name="api_user", methods={"GET"})
     */
    public function getCurrentUser(): JsonResponse
    {
        $user = $this->getUser();

        if (!$user) {
            return $this->json(['user' => null]);
        }

        return $this->json([
            'user' => [
                'id' => $user->getId(),
                'email' => $user->getEmail(),
                'isVerified' => $user->isVerified(),
            ]
        ]);
    }
}
