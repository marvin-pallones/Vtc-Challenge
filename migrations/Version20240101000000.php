<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20240101000000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Create user, category, and note tables';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('CREATE TABLE `user` (
            id INT AUTO_INCREMENT NOT NULL,
            email VARCHAR(180) NOT NULL,
            roles JSON NOT NULL,
            password VARCHAR(255) NOT NULL,
            is_verified TINYINT(1) NOT NULL DEFAULT 0,
            confirmation_token VARCHAR(255) DEFAULT NULL,
            UNIQUE INDEX UNIQ_8D93D649E7927C74 (email),
            PRIMARY KEY(id)
        ) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');

        $this->addSql('CREATE TABLE category (
            id INT AUTO_INCREMENT NOT NULL,
            user_id INT NOT NULL,
            name VARCHAR(255) NOT NULL,
            INDEX IDX_64C19C1A76ED395 (user_id),
            PRIMARY KEY(id),
            CONSTRAINT FK_64C19C1A76ED395 FOREIGN KEY (user_id) REFERENCES `user` (id)
        ) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');

        $this->addSql('CREATE TABLE note (
            id INT AUTO_INCREMENT NOT NULL,
            user_id INT NOT NULL,
            category_id INT DEFAULT NULL,
            title VARCHAR(255) NOT NULL,
            content LONGTEXT NOT NULL,
            status VARCHAR(20) NOT NULL DEFAULT "new",
            created_at DATETIME NOT NULL,
            updated_at DATETIME NOT NULL,
            INDEX IDX_CFBDFA14A76ED395 (user_id),
            INDEX IDX_CFBDFA1412469DE2 (category_id),
            PRIMARY KEY(id),
            CONSTRAINT FK_CFBDFA14A76ED395 FOREIGN KEY (user_id) REFERENCES `user` (id),
            CONSTRAINT FK_CFBDFA1412469DE2 FOREIGN KEY (category_id) REFERENCES category (id)
        ) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE note DROP FOREIGN KEY FK_CFBDFA14A76ED395');
        $this->addSql('ALTER TABLE note DROP FOREIGN KEY FK_CFBDFA1412469DE2');
        $this->addSql('ALTER TABLE category DROP FOREIGN KEY FK_64C19C1A76ED395');
        $this->addSql('DROP TABLE note');
        $this->addSql('DROP TABLE category');
        $this->addSql('DROP TABLE `user`');
    }
}
