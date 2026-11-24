-- CreateTable
CREATE TABLE `users` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(50) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `email_verified` BOOLEAN NOT NULL DEFAULT false,
    `name` VARCHAR(100) NOT NULL,
    `phone` VARCHAR(20) NULL,
    `role_id` BIGINT UNSIGNED NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `last_login_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `created_by` BIGINT UNSIGNED NULL,
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_by` BIGINT UNSIGNED NULL,
    `deleted_at` DATETIME(3) NULL,
    `deleted_by` BIGINT UNSIGNED NULL,

    UNIQUE INDEX `users_username_key`(`username`),
    UNIQUE INDEX `users_email_key`(`email`),
    INDEX `users_role_id_idx`(`role_id`),
    INDEX `users_is_active_idx`(`is_active`),
    INDEX `users_deleted_at_idx`(`deleted_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `auth_accounts` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `provider_id` VARCHAR(50) NOT NULL DEFAULT 'credential',
    `account_id` VARCHAR(255) NOT NULL,
    `password` VARCHAR(255) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `created_by` BIGINT UNSIGNED NULL,
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_by` BIGINT UNSIGNED NULL,

    INDEX `auth_accounts_user_id_idx`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `auth_sessions` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `token` VARCHAR(255) NOT NULL,
    `expires_at` DATETIME(3) NOT NULL,
    `ip_address` VARCHAR(45) NULL,
    `user_agent` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `created_by` BIGINT UNSIGNED NULL,
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_by` BIGINT UNSIGNED NULL,

    UNIQUE INDEX `auth_sessions_token_key`(`token`),
    INDEX `auth_sessions_user_id_idx`(`user_id`),
    INDEX `auth_sessions_expires_at_idx`(`expires_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `auth_verifications` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `identifier` VARCHAR(255) NOT NULL,
    `value` VARCHAR(255) NOT NULL,
    `expires_at` DATETIME(3) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `created_by` BIGINT UNSIGNED NULL,
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_by` BIGINT UNSIGNED NULL,

    INDEX `auth_verifications_identifier_idx`(`identifier`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `roles` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(50) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `description` VARCHAR(255) NULL,
    `is_system` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `created_by` BIGINT UNSIGNED NULL,
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_by` BIGINT UNSIGNED NULL,
    `deleted_at` DATETIME(3) NULL,
    `deleted_by` BIGINT UNSIGNED NULL,

    UNIQUE INDEX `roles_code_key`(`code`),
    INDEX `roles_deleted_at_idx`(`deleted_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `menus` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(50) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `parent_id` BIGINT UNSIGNED NULL,
    `path` VARCHAR(100) NULL,
    `sort_order` INTEGER NOT NULL DEFAULT 0,

    UNIQUE INDEX `menus_code_key`(`code`),
    INDEX `menus_parent_id_idx`(`parent_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `role_permissions` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `role_id` BIGINT UNSIGNED NOT NULL,
    `menu_id` BIGINT UNSIGNED NOT NULL,
    `can_view` BOOLEAN NOT NULL DEFAULT false,
    `can_create` BOOLEAN NOT NULL DEFAULT false,
    `can_edit` BOOLEAN NOT NULL DEFAULT false,
    `can_confirm` BOOLEAN NOT NULL DEFAULT false,
    `can_cancel` BOOLEAN NOT NULL DEFAULT false,
    `can_add_after_cutoff` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `created_by` BIGINT UNSIGNED NULL,
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_by` BIGINT UNSIGNED NULL,

    INDEX `role_permissions_menu_id_idx`(`menu_id`),
    UNIQUE INDEX `role_permissions_role_id_menu_id_key`(`role_id`, `menu_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notifications` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NULL,
    `role_id` BIGINT UNSIGNED NULL,
    `type` VARCHAR(50) NOT NULL,
    `title` VARCHAR(200) NOT NULL,
    `body` TEXT NULL,
    `link` VARCHAR(255) NULL,
    `read_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `created_by` BIGINT UNSIGNED NULL,

    INDEX `notifications_user_id_idx`(`user_id`),
    INDEX `notifications_role_id_idx`(`role_id`),
    INDEX `notifications_type_idx`(`type`),
    INDEX `notifications_created_at_idx`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `audit_logs` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NULL,
    `action` VARCHAR(50) NOT NULL,
    `entity_type` VARCHAR(50) NULL,
    `entity_id` VARCHAR(50) NULL,
    `before_data` JSON NULL,
    `after_data` JSON NULL,
    `ip_address` VARCHAR(45) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `created_by` BIGINT UNSIGNED NULL,

    INDEX `audit_logs_user_id_idx`(`user_id`),
    INDEX `audit_logs_action_idx`(`action`),
    INDEX `audit_logs_entity_type_entity_id_idx`(`entity_type`, `entity_id`),
    INDEX `audit_logs_created_at_idx`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `channels` (
    `code` VARCHAR(20) NOT NULL,
    `name` VARCHAR(50) NOT NULL,
    `kind` ENUM('marketplace', 'manual') NOT NULL,
    `default_billing` ENUM('VAT', 'NOVAT') NOT NULL DEFAULT 'NOVAT',
    `show_on_dashboard` BOOLEAN NOT NULL DEFAULT true,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `is_active` BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY (`code`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `platform_shops` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `channel_code` VARCHAR(20) NOT NULL,
    `shop_name` VARCHAR(150) NOT NULL,
    `external_shop_id` VARCHAR(50) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `created_by` BIGINT UNSIGNED NULL,
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_by` BIGINT UNSIGNED NULL,

    UNIQUE INDEX `platform_shops_channel_code_external_shop_id_key`(`channel_code`, `external_shop_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `products` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(20) NOT NULL,
    `name` VARCHAR(150) NOT NULL,
    `short_name` VARCHAR(50) NOT NULL,
    `kind` ENUM('tofu', 'sauce', 'other') NOT NULL DEFAULT 'other',
    `unit` VARCHAR(20) NOT NULL,
    `list_price` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `created_by` BIGINT UNSIGNED NULL,
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_by` BIGINT UNSIGNED NULL,
    `deleted_at` DATETIME(3) NULL,
    `deleted_by` BIGINT UNSIGNED NULL,

    UNIQUE INDEX `products_code_key`(`code`),
    INDEX `products_deleted_at_idx`(`deleted_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `price_groups` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(30) NOT NULL,
    `name` VARCHAR(150) NOT NULL,
    `description` VARCHAR(255) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `created_by` BIGINT UNSIGNED NULL,
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_by` BIGINT UNSIGNED NULL,
    `deleted_at` DATETIME(3) NULL,
    `deleted_by` BIGINT UNSIGNED NULL,

    UNIQUE INDEX `price_groups_code_key`(`code`),
    INDEX `price_groups_deleted_at_idx`(`deleted_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `price_rules` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `product_id` BIGINT UNSIGNED NOT NULL,
    `price_group_id` BIGINT UNSIGNED NULL,
    `min_qty` INTEGER NOT NULL DEFAULT 1,
    `unit_price` DECIMAL(12, 2) NOT NULL,
    `condition_text` VARCHAR(255) NULL,
    `effective_from` DATE NOT NULL,
    `effective_to` DATE NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `created_by` BIGINT UNSIGNED NULL,
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_by` BIGINT UNSIGNED NULL,
    `deleted_at` DATETIME(3) NULL,
    `deleted_by` BIGINT UNSIGNED NULL,

    INDEX `price_rules_product_id_price_group_id_min_qty_idx`(`product_id`, `price_group_id`, `min_qty`),
    INDEX `price_rules_price_group_id_idx`(`price_group_id`),
    INDEX `price_rules_deleted_at_idx`(`deleted_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `price_rule_channels` (
    `price_rule_id` BIGINT UNSIGNED NOT NULL,
    `channel_code` VARCHAR(20) NOT NULL,

    INDEX `price_rule_channels_channel_code_idx`(`channel_code`),
    PRIMARY KEY (`price_rule_id`, `channel_code`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `regions` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(20) NOT NULL,
    `name` VARCHAR(100) NOT NULL,

    UNIQUE INDEX `regions_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `provinces` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name_th` VARCHAR(100) NOT NULL,
    `region_id` BIGINT UNSIGNED NOT NULL,

    UNIQUE INDEX `provinces_name_th_key`(`name_th`),
    INDEX `provinces_region_id_idx`(`region_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `shipping_rules` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(150) NOT NULL,
    `region_id` BIGINT UNSIGNED NULL,
    `sauce_only` BOOLEAN NOT NULL DEFAULT false,
    `fee` DECIMAL(12, 2) NOT NULL,
    `effective_from` DATE NOT NULL,
    `effective_to` DATE NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `created_by` BIGINT UNSIGNED NULL,
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_by` BIGINT UNSIGNED NULL,
    `deleted_at` DATETIME(3) NULL,
    `deleted_by` BIGINT UNSIGNED NULL,

    INDEX `shipping_rules_region_id_idx`(`region_id`),
    INDEX `shipping_rules_deleted_at_idx`(`deleted_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `shipping_rule_channels` (
    `shipping_rule_id` BIGINT UNSIGNED NOT NULL,
    `channel_code` VARCHAR(20) NOT NULL,

    INDEX `shipping_rule_channels_channel_code_idx`(`channel_code`),
    PRIMARY KEY (`shipping_rule_id`, `channel_code`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `carriers` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(20) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `branch_name` VARCHAR(100) NULL,
    `has_api` BOOLEAN NOT NULL DEFAULT false,
    `api_config_enc` TEXT NULL,
    `tracking_url_template` VARCHAR(255) NULL,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `created_by` BIGINT UNSIGNED NULL,
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_by` BIGINT UNSIGNED NULL,

    UNIQUE INDEX `carriers_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cancel_reasons` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(150) NOT NULL,
    `requires_note` BOOLEAN NOT NULL DEFAULT false,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `is_active` BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `bank_accounts` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `bank_name` VARCHAR(100) NOT NULL,
    `account_name` VARCHAR(150) NOT NULL,
    `account_no` VARCHAR(30) NOT NULL,
    `billing` ENUM('VAT', 'NOVAT') NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `created_by` BIGINT UNSIGNED NULL,
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_by` BIGINT UNSIGNED NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `settings` (
    `key` VARCHAR(100) NOT NULL,
    `value` JSON NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `created_by` BIGINT UNSIGNED NULL,
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_by` BIGINT UNSIGNED NULL,

    PRIMARY KEY (`key`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `document_sequences` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `doc_type` VARCHAR(10) NOT NULL,
    `period` VARCHAR(6) NOT NULL DEFAULT '',
    `last_no` INTEGER NOT NULL DEFAULT 0,

    UNIQUE INDEX `document_sequences_doc_type_period_key`(`doc_type`, `period`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `customers` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(20) NOT NULL,
    `name` VARCHAR(200) NOT NULL,
    `customer_type` ENUM('person', 'company') NOT NULL DEFAULT 'person',
    `default_billing` ENUM('VAT', 'NOVAT') NOT NULL DEFAULT 'NOVAT',
    `price_group_id` BIGINT UNSIGNED NULL,
    `first_channel_code` VARCHAR(20) NULL,
    `line_id` VARCHAR(100) NULL,
    `facebook_name` VARCHAR(150) NULL,
    `note` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `created_by` BIGINT UNSIGNED NULL,
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_by` BIGINT UNSIGNED NULL,
    `deleted_at` DATETIME(3) NULL,
    `deleted_by` BIGINT UNSIGNED NULL,

    UNIQUE INDEX `customers_code_key`(`code`),
    INDEX `customers_name_idx`(`name`),
    INDEX `customers_price_group_id_idx`(`price_group_id`),
    INDEX `customers_deleted_at_idx`(`deleted_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `customer_phones` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `customer_id` BIGINT UNSIGNED NOT NULL,
    `phone` VARCHAR(20) NOT NULL,
    `label` VARCHAR(50) NULL,
    `is_primary` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `created_by` BIGINT UNSIGNED NULL,
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_by` BIGINT UNSIGNED NULL,

    INDEX `customer_phones_customer_id_idx`(`customer_id`),
    INDEX `customer_phones_phone_idx`(`phone`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `customer_addresses` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `customer_id` BIGINT UNSIGNED NOT NULL,
    `label` VARCHAR(50) NULL,
    `recipient_name` VARCHAR(200) NOT NULL,
    `recipient_phone` VARCHAR(20) NOT NULL,
    `address_line` TEXT NOT NULL,
    `province_id` BIGINT UNSIGNED NULL,
    `postcode` VARCHAR(5) NULL,
    `is_default` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `created_by` BIGINT UNSIGNED NULL,
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_by` BIGINT UNSIGNED NULL,
    `deleted_at` DATETIME(3) NULL,
    `deleted_by` BIGINT UNSIGNED NULL,

    INDEX `customer_addresses_customer_id_idx`(`customer_id`),
    INDEX `customer_addresses_province_id_idx`(`province_id`),
    INDEX `customer_addresses_deleted_at_idx`(`deleted_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `customer_tax_profiles` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `customer_id` BIGINT UNSIGNED NOT NULL,
    `tax_name` VARCHAR(255) NOT NULL,
    `tax_id` VARCHAR(13) NOT NULL,
    `branch_code` VARCHAR(5) NOT NULL DEFAULT '00000',
    `address` TEXT NOT NULL,
    `is_default` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `created_by` BIGINT UNSIGNED NULL,
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_by` BIGINT UNSIGNED NULL,
    `deleted_at` DATETIME(3) NULL,
    `deleted_by` BIGINT UNSIGNED NULL,

    INDEX `customer_tax_profiles_customer_id_idx`(`customer_id`),
    INDEX `customer_tax_profiles_tax_id_idx`(`tax_id`),
    INDEX `customer_tax_profiles_deleted_at_idx`(`deleted_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `customer_platform_accounts` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `customer_id` BIGINT UNSIGNED NOT NULL,
    `platform_shop_id` BIGINT UNSIGNED NOT NULL,
    `buyer_id` VARCHAR(100) NOT NULL,
    `buyer_username` VARCHAR(150) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `created_by` BIGINT UNSIGNED NULL,

    INDEX `customer_platform_accounts_customer_id_idx`(`customer_id`),
    UNIQUE INDEX `customer_platform_accounts_platform_shop_id_buyer_id_key`(`platform_shop_id`, `buyer_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `delivery_rounds` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `round_date` DATE NOT NULL,
    `opens_at` DATETIME(3) NOT NULL,
    `edit_lock_at` DATETIME(3) NOT NULL,
    `ship_at` DATETIME(3) NOT NULL,
    `status` ENUM('open', 'locked', 'shipped') NOT NULL DEFAULT 'open',
    `locked_at` DATETIME(3) NULL,
    `locked_by` BIGINT UNSIGNED NULL,
    `note` VARCHAR(255) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `created_by` BIGINT UNSIGNED NULL,
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_by` BIGINT UNSIGNED NULL,

    UNIQUE INDEX `delivery_rounds_round_date_key`(`round_date`),
    INDEX `delivery_rounds_locked_by_idx`(`locked_by`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `orders` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `order_no` VARCHAR(20) NOT NULL,
    `channel_code` VARCHAR(20) NOT NULL,
    `platform_shop_id` BIGINT UNSIGNED NULL,
    `platform_order_no` VARCHAR(50) NULL,
    `source` ENUM('manual', 'upload', 'api') NOT NULL,
    `import_batch_id` BIGINT UNSIGNED NULL,
    `customer_id` BIGINT UNSIGNED NOT NULL,
    `contact_name` VARCHAR(200) NOT NULL,
    `contact_phone` VARCHAR(20) NULL,
    `ordered_at` DATETIME(3) NOT NULL,
    `delivery_round_id` BIGINT UNSIGNED NULL,
    `is_advance` BOOLEAN NOT NULL DEFAULT false,
    `added_after_cutoff` BOOLEAN NOT NULL DEFAULT false,
    `status` ENUM('received', 'awaiting_confirm', 'in_production', 'ready_to_ship', 'in_transit', 'delivered', 'cancelled') NOT NULL DEFAULT 'received',
    `has_issue` BOOLEAN NOT NULL DEFAULT false,
    `issue_note` VARCHAR(500) NULL,
    `billing` ENUM('VAT', 'NOVAT') NOT NULL,
    `vat_mode` ENUM('none', 'included', 'excluded') NOT NULL DEFAULT 'none',
    `tax_profile_id` BIGINT UNSIGNED NULL,
    `subtotal` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    `discount` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    `shipping_fee` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    `shipping_rule_id` BIGINT UNSIGNED NULL,
    `vat_amount` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    `total` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    `payment_status` ENUM('platform', 'unpaid', 'partial', 'paid', 'overpaid') NOT NULL DEFAULT 'unpaid',
    `paid_amount` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    `paid_at` DATETIME(3) NULL,
    `carrier_id` BIGINT UNSIGNED NULL,
    `is_pickup` BOOLEAN NOT NULL DEFAULT false,
    `recipient_name` VARCHAR(200) NOT NULL,
    `recipient_phone` VARCHAR(20) NOT NULL,
    `ship_address` TEXT NULL,
    `province_id` BIGINT UNSIGNED NULL,
    `postcode` VARCHAR(5) NULL,
    `shipping_note` TEXT NULL,
    `internal_note` TEXT NULL,
    `confirmed_at` DATETIME(3) NULL,
    `confirmed_by` BIGINT UNSIGNED NULL,
    `production_accepted_at` DATETIME(3) NULL,
    `production_accepted_by` BIGINT UNSIGNED NULL,
    `delivered_at` DATETIME(3) NULL,
    `cancelled_at` DATETIME(3) NULL,
    `cancelled_by` BIGINT UNSIGNED NULL,
    `cancel_reason_id` BIGINT UNSIGNED NULL,
    `cancel_note` VARCHAR(500) NULL,
    `platform_sync_status` ENUM('none', 'pending', 'ok', 'error') NOT NULL DEFAULT 'none',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `created_by` BIGINT UNSIGNED NULL,
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_by` BIGINT UNSIGNED NULL,

    UNIQUE INDEX `orders_order_no_key`(`order_no`),
    INDEX `orders_channel_code_idx`(`channel_code`),
    INDEX `orders_customer_id_idx`(`customer_id`),
    INDEX `orders_ordered_at_idx`(`ordered_at`),
    INDEX `orders_delivery_round_id_status_idx`(`delivery_round_id`, `status`),
    INDEX `orders_status_idx`(`status`),
    INDEX `orders_payment_status_idx`(`payment_status`),
    INDEX `orders_carrier_id_idx`(`carrier_id`),
    INDEX `orders_created_at_idx`(`created_at`),
    UNIQUE INDEX `orders_platform_shop_id_platform_order_no_key`(`platform_shop_id`, `platform_order_no`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `order_items` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `order_id` BIGINT UNSIGNED NOT NULL,
    `line_no` INTEGER NOT NULL DEFAULT 1,
    `product_id` BIGINT UNSIGNED NULL,
    `product_name` VARCHAR(150) NOT NULL,
    `unit` VARCHAR(20) NOT NULL,
    `qty` INTEGER NOT NULL,
    `unit_price` DECIMAL(12, 2) NOT NULL,
    `price_rule_id` BIGINT UNSIGNED NULL,
    `discount` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    `line_total` DECIMAL(12, 2) NOT NULL,
    `platform_item_id` VARCHAR(50) NULL,
    `platform_sku` VARCHAR(100) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `created_by` BIGINT UNSIGNED NULL,
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_by` BIGINT UNSIGNED NULL,

    INDEX `order_items_order_id_idx`(`order_id`),
    INDEX `order_items_product_id_idx`(`product_id`),
    INDEX `order_items_price_rule_id_idx`(`price_rule_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `order_events` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `order_id` BIGINT UNSIGNED NOT NULL,
    `event_type` VARCHAR(30) NOT NULL,
    `from_status` VARCHAR(30) NULL,
    `to_status` VARCHAR(30) NULL,
    `message` VARCHAR(500) NOT NULL,
    `data` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `created_by` BIGINT UNSIGNED NULL,

    INDEX `order_events_order_id_idx`(`order_id`),
    INDEX `order_events_event_type_idx`(`event_type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `shipments` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `order_id` BIGINT UNSIGNED NOT NULL,
    `seq` INTEGER NOT NULL DEFAULT 1,
    `kind` ENUM('normal', 'resend_short', 'resend_claim') NOT NULL DEFAULT 'normal',
    `carrier_id` BIGINT UNSIGNED NOT NULL,
    `tracking_no` VARCHAR(50) NULL,
    `tracking_source` ENUM('api', 'manual') NOT NULL DEFAULT 'manual',
    `recipient_name` VARCHAR(200) NOT NULL,
    `recipient_phone` VARCHAR(20) NOT NULL,
    `address` TEXT NOT NULL,
    `province_id` BIGINT UNSIGNED NULL,
    `postcode` VARCHAR(5) NULL,
    `status` ENUM('pending', 'label_printed', 'shipped', 'in_transit', 'delivered', 'failed', 'returned') NOT NULL DEFAULT 'pending',
    `shipped_at` DATETIME(3) NULL,
    `delivered_at` DATETIME(3) NULL,
    `receiver_name` VARCHAR(200) NULL,
    `note` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `created_by` BIGINT UNSIGNED NULL,
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_by` BIGINT UNSIGNED NULL,

    INDEX `shipments_order_id_idx`(`order_id`),
    INDEX `shipments_tracking_no_idx`(`tracking_no`),
    INDEX `shipments_status_idx`(`status`),
    INDEX `shipments_province_id_idx`(`province_id`),
    UNIQUE INDEX `shipments_carrier_id_tracking_no_key`(`carrier_id`, `tracking_no`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `shipment_items` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `shipment_id` BIGINT UNSIGNED NOT NULL,
    `order_item_id` BIGINT UNSIGNED NOT NULL,
    `qty` INTEGER NOT NULL,

    INDEX `shipment_items_shipment_id_idx`(`shipment_id`),
    INDEX `shipment_items_order_item_id_idx`(`order_item_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `shipment_events` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `shipment_id` BIGINT UNSIGNED NOT NULL,
    `status` VARCHAR(30) NOT NULL,
    `description` VARCHAR(255) NULL,
    `location` VARCHAR(150) NULL,
    `occurred_at` DATETIME(3) NOT NULL,
    `source` ENUM('api', 'manual') NOT NULL,
    `raw` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `created_by` BIGINT UNSIGNED NULL,

    INDEX `shipment_events_shipment_id_idx`(`shipment_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `print_logs` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `doc_type` ENUM('pick_list', 'label', 'tax_invoice', 'receipt', 'credit_note') NOT NULL,
    `order_id` BIGINT UNSIGNED NULL,
    `shipment_id` BIGINT UNSIGNED NULL,
    `delivery_round_id` BIGINT UNSIGNED NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `created_by` BIGINT UNSIGNED NULL,

    INDEX `print_logs_order_id_idx`(`order_id`),
    INDEX `print_logs_shipment_id_idx`(`shipment_id`),
    INDEX `print_logs_delivery_round_id_idx`(`delivery_round_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `payments` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `method` ENUM('transfer', 'cash', 'platform') NOT NULL,
    `bank_account_id` BIGINT UNSIGNED NULL,
    `amount` DECIMAL(12, 2) NOT NULL,
    `paid_at` DATETIME(3) NOT NULL,
    `payer_name` VARCHAR(200) NULL,
    `reference` VARCHAR(100) NULL,
    `status` ENUM('pending', 'verified', 'rejected') NOT NULL DEFAULT 'pending',
    `verified_at` DATETIME(3) NULL,
    `verified_by` BIGINT UNSIGNED NULL,
    `note` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `created_by` BIGINT UNSIGNED NULL,
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_by` BIGINT UNSIGNED NULL,

    INDEX `payments_bank_account_id_idx`(`bank_account_id`),
    INDEX `payments_paid_at_idx`(`paid_at`),
    INDEX `payments_status_idx`(`status`),
    INDEX `payments_verified_by_idx`(`verified_by`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `payment_allocations` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `payment_id` BIGINT UNSIGNED NOT NULL,
    `order_id` BIGINT UNSIGNED NOT NULL,
    `amount` DECIMAL(12, 2) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `created_by` BIGINT UNSIGNED NULL,

    INDEX `payment_allocations_order_id_idx`(`order_id`),
    UNIQUE INDEX `payment_allocations_payment_id_order_id_key`(`payment_id`, `order_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `payment_slips` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `payment_id` BIGINT UNSIGNED NOT NULL,
    `file_path` VARCHAR(255) NOT NULL,
    `file_name` VARCHAR(255) NOT NULL,
    `mime_type` VARCHAR(50) NOT NULL,
    `size_bytes` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `created_by` BIGINT UNSIGNED NULL,

    INDEX `payment_slips_payment_id_idx`(`payment_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `documents` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `doc_no` VARCHAR(30) NOT NULL,
    `doc_type` ENUM('tax_invoice_full', 'tax_invoice_abb', 'receipt', 'credit_note') NOT NULL,
    `order_id` BIGINT UNSIGNED NOT NULL,
    `ref_document_id` BIGINT UNSIGNED NULL,
    `customer_id` BIGINT UNSIGNED NOT NULL,
    `buyer_name` VARCHAR(255) NOT NULL,
    `buyer_tax_id` VARCHAR(13) NULL,
    `buyer_branch` VARCHAR(5) NULL,
    `buyer_address` TEXT NULL,
    `issue_date` DATE NOT NULL,
    `subtotal` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    `vat_rate` DECIMAL(5, 2) NOT NULL DEFAULT 7.00,
    `vat_amount` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    `total` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    `reason` VARCHAR(255) NULL,
    `status` ENUM('issued', 'voided') NOT NULL DEFAULT 'issued',
    `voided_at` DATETIME(3) NULL,
    `voided_by` BIGINT UNSIGNED NULL,
    `accounting_export_id` BIGINT UNSIGNED NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `created_by` BIGINT UNSIGNED NULL,
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_by` BIGINT UNSIGNED NULL,

    UNIQUE INDEX `documents_doc_no_key`(`doc_no`),
    INDEX `documents_order_id_idx`(`order_id`),
    INDEX `documents_ref_document_id_idx`(`ref_document_id`),
    INDEX `documents_customer_id_idx`(`customer_id`),
    INDEX `documents_issue_date_idx`(`issue_date`),
    INDEX `documents_voided_by_idx`(`voided_by`),
    INDEX `documents_accounting_export_id_idx`(`accounting_export_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `document_items` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `document_id` BIGINT UNSIGNED NOT NULL,
    `line_no` INTEGER NOT NULL DEFAULT 1,
    `description` VARCHAR(255) NOT NULL,
    `qty` DECIMAL(12, 2) NOT NULL,
    `unit_price` DECIMAL(12, 2) NOT NULL,
    `amount` DECIMAL(12, 2) NOT NULL,

    INDEX `document_items_document_id_idx`(`document_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `accounting_exports` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `target` VARCHAR(30) NOT NULL DEFAULT 'flowaccount',
    `period_from` DATE NOT NULL,
    `period_to` DATE NOT NULL,
    `file_path` VARCHAR(255) NULL,
    `row_count` INTEGER NOT NULL DEFAULT 0,
    `status` ENUM('done', 'error') NOT NULL,
    `error` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `created_by` BIGINT UNSIGNED NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `platform_credentials` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `platform_shop_id` BIGINT UNSIGNED NOT NULL,
    `partner_id` VARCHAR(50) NULL,
    `partner_key_enc` TEXT NULL,
    `access_token_enc` TEXT NULL,
    `refresh_token_enc` TEXT NULL,
    `access_expires_at` DATETIME(3) NULL,
    `refresh_expires_at` DATETIME(3) NULL,
    `status` ENUM('connected', 'expired', 'error', 'disconnected') NOT NULL DEFAULT 'disconnected',
    `last_synced_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `created_by` BIGINT UNSIGNED NULL,
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_by` BIGINT UNSIGNED NULL,

    UNIQUE INDEX `platform_credentials_platform_shop_id_key`(`platform_shop_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sku_mappings` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `platform_shop_id` BIGINT UNSIGNED NOT NULL,
    `platform_sku` VARCHAR(100) NOT NULL,
    `platform_item_id` VARCHAR(50) NULL,
    `platform_item_name` VARCHAR(255) NULL,
    `product_id` BIGINT UNSIGNED NULL,
    `units_per_sku` INTEGER NOT NULL DEFAULT 1,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `created_by` BIGINT UNSIGNED NULL,
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_by` BIGINT UNSIGNED NULL,

    INDEX `sku_mappings_product_id_idx`(`product_id`),
    UNIQUE INDEX `sku_mappings_platform_shop_id_platform_sku_key`(`platform_shop_id`, `platform_sku`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `import_batches` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `source` ENUM('file', 'api', 'webhook') NOT NULL,
    `file_type` ENUM('order_template', 'shopee_orders', 'shopee_income', 'lazada_orders', 'lazada_transactions', 'tiktok_orders', 'appsheet_migration', 'api_pull') NOT NULL,
    `platform_shop_id` BIGINT UNSIGNED NULL,
    `file_name` VARCHAR(255) NULL,
    `file_hash` CHAR(64) NULL,
    `total_rows` INTEGER NOT NULL DEFAULT 0,
    `created_rows` INTEGER NOT NULL DEFAULT 0,
    `updated_rows` INTEGER NOT NULL DEFAULT 0,
    `skipped_rows` INTEGER NOT NULL DEFAULT 0,
    `error_rows` INTEGER NOT NULL DEFAULT 0,
    `status` ENUM('processing', 'done', 'failed') NOT NULL DEFAULT 'processing',
    `finished_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `created_by` BIGINT UNSIGNED NULL,

    INDEX `import_batches_platform_shop_id_idx`(`platform_shop_id`),
    INDEX `import_batches_file_hash_idx`(`file_hash`),
    INDEX `import_batches_created_at_idx`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `platform_raw_records` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `import_batch_id` BIGINT UNSIGNED NOT NULL,
    `record_type` VARCHAR(30) NOT NULL,
    `external_id` VARCHAR(100) NULL,
    `row_no` INTEGER NULL,
    `payload` JSON NOT NULL,
    `result` ENUM('pending', 'created', 'updated', 'skipped', 'error') NOT NULL DEFAULT 'pending',
    `error` TEXT NULL,
    `order_id` BIGINT UNSIGNED NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `created_by` BIGINT UNSIGNED NULL,

    INDEX `platform_raw_records_import_batch_id_idx`(`import_batch_id`),
    INDEX `platform_raw_records_record_type_external_id_idx`(`record_type`, `external_id`),
    INDEX `platform_raw_records_order_id_idx`(`order_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `payouts` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `platform_shop_id` BIGINT UNSIGNED NOT NULL,
    `payout_ref` VARCHAR(100) NULL,
    `payout_date` DATE NOT NULL,
    `gross` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    `fees` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    `adjustments` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    `net` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    `bank_account_id` BIGINT UNSIGNED NULL,
    `import_batch_id` BIGINT UNSIGNED NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `created_by` BIGINT UNSIGNED NULL,
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_by` BIGINT UNSIGNED NULL,

    INDEX `payouts_platform_shop_id_idx`(`platform_shop_id`),
    INDEX `payouts_payout_date_idx`(`payout_date`),
    INDEX `payouts_bank_account_id_idx`(`bank_account_id`),
    INDEX `payouts_import_batch_id_idx`(`import_batch_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `payout_lines` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `payout_id` BIGINT UNSIGNED NULL,
    `platform_shop_id` BIGINT UNSIGNED NOT NULL,
    `order_id` BIGINT UNSIGNED NULL,
    `platform_order_no` VARCHAR(50) NOT NULL,
    `line_type` VARCHAR(30) NOT NULL,
    `amount` DECIMAL(12, 2) NOT NULL,
    `occurred_at` DATETIME(3) NULL,
    `is_reconciled` BOOLEAN NOT NULL DEFAULT false,
    `import_batch_id` BIGINT UNSIGNED NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `created_by` BIGINT UNSIGNED NULL,

    INDEX `payout_lines_payout_id_idx`(`payout_id`),
    INDEX `payout_lines_platform_shop_id_idx`(`platform_shop_id`),
    INDEX `payout_lines_order_id_idx`(`order_id`),
    INDEX `payout_lines_platform_order_no_idx`(`platform_order_no`),
    INDEX `payout_lines_import_batch_id_idx`(`import_batch_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `jobs` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `type` VARCHAR(50) NOT NULL,
    `payload` JSON NULL,
    `status` ENUM('pending', 'running', 'done', 'failed', 'dead') NOT NULL DEFAULT 'pending',
    `priority` INTEGER NOT NULL DEFAULT 0,
    `auto_attempts` TINYINT NOT NULL DEFAULT 0,
    `manual_attempts` TINYINT NOT NULL DEFAULT 0,
    `next_run_at` DATETIME(3) NOT NULL,
    `locked_at` DATETIME(3) NULL,
    `last_error` TEXT NULL,
    `finished_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `created_by` BIGINT UNSIGNED NULL,
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_by` BIGINT UNSIGNED NULL,

    INDEX `jobs_type_idx`(`type`),
    INDEX `jobs_status_next_run_at_idx`(`status`, `next_run_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `webhook_events` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `source` VARCHAR(30) NOT NULL,
    `event_type` VARCHAR(50) NULL,
    `external_id` VARCHAR(100) NULL,
    `signature_valid` BOOLEAN NOT NULL DEFAULT false,
    `payload` JSON NOT NULL,
    `job_id` BIGINT UNSIGNED NULL,
    `processed_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `created_by` BIGINT UNSIGNED NULL,

    INDEX `webhook_events_external_id_idx`(`external_id`),
    INDEX `webhook_events_job_id_idx`(`job_id`),
    INDEX `webhook_events_created_at_idx`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sync_logs` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `platform_shop_id` BIGINT UNSIGNED NULL,
    `carrier_id` BIGINT UNSIGNED NULL,
    `job_id` BIGINT UNSIGNED NULL,
    `action` VARCHAR(50) NOT NULL,
    `ok` BOOLEAN NOT NULL DEFAULT false,
    `record_count` INTEGER NOT NULL DEFAULT 0,
    `duration_ms` INTEGER NOT NULL DEFAULT 0,
    `message` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `created_by` BIGINT UNSIGNED NULL,

    INDEX `sync_logs_platform_shop_id_idx`(`platform_shop_id`),
    INDEX `sync_logs_carrier_id_idx`(`carrier_id`),
    INDEX `sync_logs_job_id_idx`(`job_id`),
    INDEX `sync_logs_created_at_idx`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `users_role_id_fkey` FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `auth_accounts` ADD CONSTRAINT `auth_accounts_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `auth_sessions` ADD CONSTRAINT `auth_sessions_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `menus` ADD CONSTRAINT `menus_parent_id_fkey` FOREIGN KEY (`parent_id`) REFERENCES `menus`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `role_permissions` ADD CONSTRAINT `role_permissions_role_id_fkey` FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `role_permissions` ADD CONSTRAINT `role_permissions_menu_id_fkey` FOREIGN KEY (`menu_id`) REFERENCES `menus`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_role_id_fkey` FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `audit_logs` ADD CONSTRAINT `audit_logs_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `platform_shops` ADD CONSTRAINT `platform_shops_channel_code_fkey` FOREIGN KEY (`channel_code`) REFERENCES `channels`(`code`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `price_rules` ADD CONSTRAINT `price_rules_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `price_rules` ADD CONSTRAINT `price_rules_price_group_id_fkey` FOREIGN KEY (`price_group_id`) REFERENCES `price_groups`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `price_rule_channels` ADD CONSTRAINT `price_rule_channels_price_rule_id_fkey` FOREIGN KEY (`price_rule_id`) REFERENCES `price_rules`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `price_rule_channels` ADD CONSTRAINT `price_rule_channels_channel_code_fkey` FOREIGN KEY (`channel_code`) REFERENCES `channels`(`code`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `provinces` ADD CONSTRAINT `provinces_region_id_fkey` FOREIGN KEY (`region_id`) REFERENCES `regions`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `shipping_rules` ADD CONSTRAINT `shipping_rules_region_id_fkey` FOREIGN KEY (`region_id`) REFERENCES `regions`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `shipping_rule_channels` ADD CONSTRAINT `shipping_rule_channels_shipping_rule_id_fkey` FOREIGN KEY (`shipping_rule_id`) REFERENCES `shipping_rules`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `shipping_rule_channels` ADD CONSTRAINT `shipping_rule_channels_channel_code_fkey` FOREIGN KEY (`channel_code`) REFERENCES `channels`(`code`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `customers` ADD CONSTRAINT `customers_price_group_id_fkey` FOREIGN KEY (`price_group_id`) REFERENCES `price_groups`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `customers` ADD CONSTRAINT `customers_first_channel_code_fkey` FOREIGN KEY (`first_channel_code`) REFERENCES `channels`(`code`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `customer_phones` ADD CONSTRAINT `customer_phones_customer_id_fkey` FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `customer_addresses` ADD CONSTRAINT `customer_addresses_customer_id_fkey` FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `customer_addresses` ADD CONSTRAINT `customer_addresses_province_id_fkey` FOREIGN KEY (`province_id`) REFERENCES `provinces`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `customer_tax_profiles` ADD CONSTRAINT `customer_tax_profiles_customer_id_fkey` FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `customer_platform_accounts` ADD CONSTRAINT `customer_platform_accounts_customer_id_fkey` FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `customer_platform_accounts` ADD CONSTRAINT `customer_platform_accounts_platform_shop_id_fkey` FOREIGN KEY (`platform_shop_id`) REFERENCES `platform_shops`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `delivery_rounds` ADD CONSTRAINT `delivery_rounds_locked_by_fkey` FOREIGN KEY (`locked_by`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orders` ADD CONSTRAINT `orders_channel_code_fkey` FOREIGN KEY (`channel_code`) REFERENCES `channels`(`code`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orders` ADD CONSTRAINT `orders_platform_shop_id_fkey` FOREIGN KEY (`platform_shop_id`) REFERENCES `platform_shops`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orders` ADD CONSTRAINT `orders_import_batch_id_fkey` FOREIGN KEY (`import_batch_id`) REFERENCES `import_batches`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orders` ADD CONSTRAINT `orders_customer_id_fkey` FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orders` ADD CONSTRAINT `orders_delivery_round_id_fkey` FOREIGN KEY (`delivery_round_id`) REFERENCES `delivery_rounds`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orders` ADD CONSTRAINT `orders_tax_profile_id_fkey` FOREIGN KEY (`tax_profile_id`) REFERENCES `customer_tax_profiles`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orders` ADD CONSTRAINT `orders_shipping_rule_id_fkey` FOREIGN KEY (`shipping_rule_id`) REFERENCES `shipping_rules`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orders` ADD CONSTRAINT `orders_carrier_id_fkey` FOREIGN KEY (`carrier_id`) REFERENCES `carriers`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orders` ADD CONSTRAINT `orders_province_id_fkey` FOREIGN KEY (`province_id`) REFERENCES `provinces`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orders` ADD CONSTRAINT `orders_confirmed_by_fkey` FOREIGN KEY (`confirmed_by`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orders` ADD CONSTRAINT `orders_production_accepted_by_fkey` FOREIGN KEY (`production_accepted_by`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orders` ADD CONSTRAINT `orders_cancelled_by_fkey` FOREIGN KEY (`cancelled_by`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orders` ADD CONSTRAINT `orders_cancel_reason_id_fkey` FOREIGN KEY (`cancel_reason_id`) REFERENCES `cancel_reasons`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order_items` ADD CONSTRAINT `order_items_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order_items` ADD CONSTRAINT `order_items_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order_items` ADD CONSTRAINT `order_items_price_rule_id_fkey` FOREIGN KEY (`price_rule_id`) REFERENCES `price_rules`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order_events` ADD CONSTRAINT `order_events_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `shipments` ADD CONSTRAINT `shipments_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `shipments` ADD CONSTRAINT `shipments_carrier_id_fkey` FOREIGN KEY (`carrier_id`) REFERENCES `carriers`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `shipments` ADD CONSTRAINT `shipments_province_id_fkey` FOREIGN KEY (`province_id`) REFERENCES `provinces`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `shipment_items` ADD CONSTRAINT `shipment_items_shipment_id_fkey` FOREIGN KEY (`shipment_id`) REFERENCES `shipments`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `shipment_items` ADD CONSTRAINT `shipment_items_order_item_id_fkey` FOREIGN KEY (`order_item_id`) REFERENCES `order_items`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `shipment_events` ADD CONSTRAINT `shipment_events_shipment_id_fkey` FOREIGN KEY (`shipment_id`) REFERENCES `shipments`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `print_logs` ADD CONSTRAINT `print_logs_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `print_logs` ADD CONSTRAINT `print_logs_shipment_id_fkey` FOREIGN KEY (`shipment_id`) REFERENCES `shipments`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `print_logs` ADD CONSTRAINT `print_logs_delivery_round_id_fkey` FOREIGN KEY (`delivery_round_id`) REFERENCES `delivery_rounds`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payments` ADD CONSTRAINT `payments_bank_account_id_fkey` FOREIGN KEY (`bank_account_id`) REFERENCES `bank_accounts`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payments` ADD CONSTRAINT `payments_verified_by_fkey` FOREIGN KEY (`verified_by`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payment_allocations` ADD CONSTRAINT `payment_allocations_payment_id_fkey` FOREIGN KEY (`payment_id`) REFERENCES `payments`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payment_allocations` ADD CONSTRAINT `payment_allocations_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payment_slips` ADD CONSTRAINT `payment_slips_payment_id_fkey` FOREIGN KEY (`payment_id`) REFERENCES `payments`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `documents` ADD CONSTRAINT `documents_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `documents` ADD CONSTRAINT `documents_ref_document_id_fkey` FOREIGN KEY (`ref_document_id`) REFERENCES `documents`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `documents` ADD CONSTRAINT `documents_customer_id_fkey` FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `documents` ADD CONSTRAINT `documents_voided_by_fkey` FOREIGN KEY (`voided_by`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `documents` ADD CONSTRAINT `documents_accounting_export_id_fkey` FOREIGN KEY (`accounting_export_id`) REFERENCES `accounting_exports`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `document_items` ADD CONSTRAINT `document_items_document_id_fkey` FOREIGN KEY (`document_id`) REFERENCES `documents`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `platform_credentials` ADD CONSTRAINT `platform_credentials_platform_shop_id_fkey` FOREIGN KEY (`platform_shop_id`) REFERENCES `platform_shops`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sku_mappings` ADD CONSTRAINT `sku_mappings_platform_shop_id_fkey` FOREIGN KEY (`platform_shop_id`) REFERENCES `platform_shops`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sku_mappings` ADD CONSTRAINT `sku_mappings_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `import_batches` ADD CONSTRAINT `import_batches_platform_shop_id_fkey` FOREIGN KEY (`platform_shop_id`) REFERENCES `platform_shops`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `platform_raw_records` ADD CONSTRAINT `platform_raw_records_import_batch_id_fkey` FOREIGN KEY (`import_batch_id`) REFERENCES `import_batches`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `platform_raw_records` ADD CONSTRAINT `platform_raw_records_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payouts` ADD CONSTRAINT `payouts_platform_shop_id_fkey` FOREIGN KEY (`platform_shop_id`) REFERENCES `platform_shops`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payouts` ADD CONSTRAINT `payouts_bank_account_id_fkey` FOREIGN KEY (`bank_account_id`) REFERENCES `bank_accounts`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payouts` ADD CONSTRAINT `payouts_import_batch_id_fkey` FOREIGN KEY (`import_batch_id`) REFERENCES `import_batches`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payout_lines` ADD CONSTRAINT `payout_lines_payout_id_fkey` FOREIGN KEY (`payout_id`) REFERENCES `payouts`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payout_lines` ADD CONSTRAINT `payout_lines_platform_shop_id_fkey` FOREIGN KEY (`platform_shop_id`) REFERENCES `platform_shops`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payout_lines` ADD CONSTRAINT `payout_lines_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payout_lines` ADD CONSTRAINT `payout_lines_import_batch_id_fkey` FOREIGN KEY (`import_batch_id`) REFERENCES `import_batches`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `webhook_events` ADD CONSTRAINT `webhook_events_job_id_fkey` FOREIGN KEY (`job_id`) REFERENCES `jobs`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sync_logs` ADD CONSTRAINT `sync_logs_platform_shop_id_fkey` FOREIGN KEY (`platform_shop_id`) REFERENCES `platform_shops`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sync_logs` ADD CONSTRAINT `sync_logs_carrier_id_fkey` FOREIGN KEY (`carrier_id`) REFERENCES `carriers`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sync_logs` ADD CONSTRAINT `sync_logs_job_id_fkey` FOREIGN KEY (`job_id`) REFERENCES `jobs`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
